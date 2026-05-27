"""Payment service."""
import logging
from uuid import UUID

from backend.core.enums import OrderStatus, PaymentMethod, PaymentStatus
from backend.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from backend.core.service import BaseService
from backend.modules.pagos.model import Payment
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.service import OrderService
from backend.modules.productos.repository import ProductRepository

logger = logging.getLogger(__name__)


class PagoService(BaseService[Payment]):
    def __init__(self, pago_repo: PagoRepository, pedido_repo: PedidoRepository):
        super().__init__(pago_repo)
        self.pedido_repo = pedido_repo

    async def _verify_order_ownership(self, order_id: UUID, user_id: UUID) -> None:
        order = await self.pedido_repo.get(order_id)
        if not order:
            raise NotFoundError(f"Order {order_id} not found")
        if order.user_id != user_id:
            raise ForbiddenError("Access denied — you do not own this order")

    async def create_payment(self, order_id: UUID, metodo: PaymentMethod, monto: float, user_id: UUID | None = None) -> Payment:
        if user_id:
            await self._verify_order_ownership(order_id, user_id)

        existing = await self.repository.get_by_order(order_id)
        if existing:
            raise ConflictError(f"Order {order_id} already has a payment")

        payment = await self.repository.create(
            order_id=order_id,
            payment_method=metodo,
            amount=monto,
        )

        # Auto-confirm orders for non-MP payment methods.
        # MP payments are confirmed asynchronously via mp-return/webhook.
        if metodo in (PaymentMethod.EFECTIVO, PaymentMethod.TRANSFERENCIA):
            await self._advance_order_to_confirmed(order_id)

        return payment

    async def update_status(self, payment_id: UUID, new_status: PaymentStatus) -> Payment:
        payment = await self.repository.get(payment_id)
        if not payment:
            raise NotFoundError(f"Payment {payment_id} not found")

        updated = await self.repository.update(payment_id, status=new_status)

        if new_status == PaymentStatus.APROBADO:
            await self._advance_order_to_confirmed(payment.order_id)

        return updated

    async def process_status_update(
        self, payment_id: UUID, new_status: PaymentStatus, **extra_fields
    ) -> Payment:
        """Update payment status with optional extra fields (used by webhook flow).

        This is a public method callable from the MP webhook handler.
        When status becomes APROBADO, the associated order is transitioned
        to CONFIRMADO automatically.
        """
        payment = await self.repository.get(payment_id)
        if not payment:
            raise NotFoundError(f"Payment {payment_id} not found")

        updated = await self.repository.update(payment_id, status=new_status, **extra_fields)

        if new_status == PaymentStatus.APROBADO:
            await self._advance_order_to_confirmed(payment.order_id)

        return updated

    async def _advance_order_to_confirmed(self, order_id: UUID) -> None:
        """Advance an order to CONFIRMADO status after payment approval."""
        try:
            product_repo = ProductRepository(self.pedido_repo.session)
            order_service = OrderService(self.pedido_repo, product_repo)
            await order_service.update_status(
                order_id,
                OrderStatus.CONFIRMADO,
                reason="Payment approved",
            )
        except Exception:
            logger.warning(
                "Could not transition order %s to CONFIRMADO after payment approval",
                order_id,
            )
