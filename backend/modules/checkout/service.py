"""Checkout service — handles MP init and return flows with immediate Order+Payment creation."""
import logging
from uuid import UUID

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.config import settings
from backend.core.database import get_db
from backend.core.enums import OrderStatus, PaymentMethod, PaymentStatus
from backend.core.exceptions import BadRequestError

from backend.modules.checkout.repository import CheckoutSessionRepository
from backend.modules.productos.repository import ProductRepository
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.service import OrderService
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pagos.service import PagoService
from backend.modules.pagos.mercadopago.mp_service import MercadoPagoService

logger = logging.getLogger(__name__)

# Backend base URL for building MP return URLs
_BACKEND_URL = settings.API_BASE_URL


class CheckoutService:
    """Coordinates the MP checkout flow with immediate Order + Payment creation."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def init_mp_session(
        self,
        user_id: UUID,
        items_data: list[dict],
        direccion_id: UUID,
        observaciones: str | None = None,
    ) -> dict:
        """Create Order + Payment + MP preference in one step.

        1. Validates product existence and stock
        2. Calculates total from DB prices
        3. Creates Order (status pending_mp)
        4. Creates Payment (status pendiente, method mercadopago)
        5. Creates MP preference with external_reference = order.id
        6. Stores mp_preference_id + mp_init_point on the Payment

        Returns: {init_point}
        """
        # 1. Fetch products and validate stock
        product_repo = ProductRepository(self.session)
        product_ids = [item["product_id"] for item in items_data]

        products: dict[str, object] = {}
        for pid in product_ids:
            product = await product_repo.get_with_ingredients(pid)
            if not product:
                raise BadRequestError(f"Producto no encontrado: {pid}")
            products[str(pid)] = product

        # 2. Build order items with current DB prices
        order_items_data = []
        total = 0.0
        for item in items_data:
            product = products[str(item["product_id"])]
            available, error_msg = await product_repo.check_stock(
                item["product_id"], item["quantity"]
            )
            if not available:
                raise BadRequestError(
                    error_msg or f"Stock insuficiente para '{product.name}'"
                )
            unit_price = float(product.price)
            subtotal = unit_price * item["quantity"]
            order_items_data.append({
                "product_id": item["product_id"],
                "quantity": item["quantity"],
                "unit_price": unit_price,
                "subtotal": subtotal,
            })
            total += subtotal

        # 3. Create Order with pending_mp status
        pedido_repo = PedidoRepository(self.session)
        order_svc = OrderService(pedido_repo, product_repo)
        order = await order_svc.create_order(
            user_id=user_id,
            items=order_items_data,
            address_id=direccion_id,
            status=OrderStatus.PENDING_MP,
        )

        # 4. Create Payment (pendiente, mercadopago)
        pago_repo = PagoRepository(self.session)
        payment = await pago_repo.create(
            order_id=order.id,
            payment_method=PaymentMethod.MERCADOPAGO,
            amount=total,
        )

        # 5. Build back_urls pointing to our backend mp-return
        return_base = f"{_BACKEND_URL}/api/v1/checkout/mp-return"
        back_urls = {
            "success": f"{return_base}/success/{order.id}",
            "failure": f"{return_base}/failure/{order.id}",
            "pending": f"{return_base}/pending/{order.id}",
        }

        # 6. Create MP preference with external_reference = order.id
        mp_items = []
        for oi in order_items_data:
            product = products[str(oi["product_id"])]
            mp_items.append({
                "id": str(oi["product_id"]),
                "title": product.name,
                "quantity": oi["quantity"],
                "currency_id": "ARS",
                "unit_price": oi["unit_price"],
            })

        mp_service = MercadoPagoService(
            PagoService(pago_repo, pedido_repo)
        )
        mp_result = await mp_service.create_preference_from_session(
            external_reference=str(order.id),
            items=mp_items,
            back_urls=back_urls,
        )

        # 7. Store MP preference ID + init_point on the Payment
        await pago_repo.update(
            payment.id,
            mp_preference_id=mp_result["preference_id"],
            mp_init_point=mp_result["init_point"],
        )

        logger.info(
            "Created order %s + payment %s for user %s (MP pref %s)",
            order.id, payment.id, user_id, mp_result["preference_id"],
        )

        return {"init_point": mp_result["init_point"]}

    async def handle_mp_return(
        self,
        status: str,
        order_id: str,
        mp_payment_id: str | None = None,
    ) -> str:
        """Process MP redirect back to our server.

        * success → process payment approval → redirect to /orders/:id
        * failure → cancel order → redirect to /cart?mp-error=true
        * pending → no-op, redirect to /orders/:id

        Idempotent: if order is already CONFIRMADO/CANCELADO, just redirect.

        Returns a frontend redirect URL string.
        """
        # Validate order_id format
        try:
            order_uuid = UUID(order_id)
        except ValueError:
            logger.warning("Invalid order_id format: %s", order_id)
            return self._cart_redirect()

        pedido_repo = PedidoRepository(self.session)
        product_repo = ProductRepository(self.session)
        order_svc = OrderService(pedido_repo, product_repo)

        order = await pedido_repo.get(order_uuid)
        if not order:
            logger.warning("Order not found: %s", order_id)
            return self._cart_redirect()

        pago_repo = PagoRepository(self.session)

        # Idempotent: order already in terminal status
        if order.status in (OrderStatus.CONFIRMADO, OrderStatus.CANCELADO, OrderStatus.ENTREGADO):
            logger.info("Order %s already in status %s — redirecting", order_id, order.status.value)
            return f"{settings.FRONTEND_URL}/orders/{order_id}?new=true"

        # Pending → no-op, webhook will handle
        if status == "pending":
            logger.info("MP payment pending for order %s — redirecting to order detail", order_id)
            return f"{settings.FRONTEND_URL}/orders/{order_id}?new=true"

        # Failed/cancelled payment
        if status != "success":
            try:
                await order_svc.update_status(
                    order_uuid,
                    OrderStatus.CANCELADO,
                    reason=f"MP payment {status}",
                )
                # Also mark payment as RECHAZADO if it exists
                payment = await pago_repo.get_by_order(order_uuid)
                if payment:
                    await pago_repo.update(payment.id, status=PaymentStatus.RECHAZADO)
            except Exception as exc:
                logger.warning("Could not cancel order %s after MP %s: %s", order_id, status, exc)
            logger.info("Order %s cancelled (MP status=%s)", order_id, status)
            return self._cart_redirect()

        # === SUCCESS: approve payment → order CONFIRMADO + stock ===
        try:
            payment = await pago_repo.get_by_order(order_uuid)
            if not payment:
                logger.error("No payment found for order %s", order_id)
                return self._cart_redirect()

            pedido_repo = PedidoRepository(self.session)
            pago_svc = PagoService(pago_repo, pedido_repo)
            await pago_svc.process_status_update(
                payment.id,
                PaymentStatus.APROBADO,
                mp_payment_id=mp_payment_id or "",
            )
        except Exception as exc:
            logger.error("Failed to process MP return for order %s: %s", order_id, exc)
            return self._cart_redirect()

        logger.info("MP return success for order %s (payment %s)", order_id, payment.id)
        return f"{settings.FRONTEND_URL}/orders/{order_uuid}?new=true"

    def _cart_redirect(self) -> str:
        """Build redirect URL to frontend cart with error flag."""
        return f"{settings.FRONTEND_URL}/cart?mp-error=true"
