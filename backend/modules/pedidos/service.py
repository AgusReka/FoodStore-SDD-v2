"""Order service."""
import logging
from datetime import datetime, timedelta
from uuid import UUID

from backend.core.enums import OrderStatus
from backend.core.exceptions import NotFoundError, ValidationError
from backend.core.service import BaseService
from backend.modules.pedidos.model import Order, OrderItem
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.state_machine import OrderStateMachine, SideEffect
from backend.modules.productos.repository import ProductRepository

logger = logging.getLogger(__name__)


class OrderService(BaseService[Order]):
    def __init__(self, pedido_repo: PedidoRepository, product_repo: ProductRepository):
        super().__init__(pedido_repo)
        self.product_repo = product_repo
        self.state_machine = OrderStateMachine()

    async def create_order(
        self, user_id: UUID, items: list[dict], address_id: UUID | None = None,
        status: OrderStatus | None = None,
    ) -> Order:
        total = 0.0
        order_items_data = []

        for item in items:
            product_id = item["product_id"]
            quantity = item["quantity"]

            product = await self.product_repo.get(product_id)
            if not product:
                raise NotFoundError(f"Product {product_id} not found")

            available, error_msg = await self.product_repo.check_stock(product_id, quantity)
            if not available:
                raise ValidationError(error_msg or f"Product '{product.name}' is not available")

            unit_price = float(product.price)
            subtotal = unit_price * quantity
            total += subtotal

            order_items_data.append({
                "product_id": product_id,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            })

        order_kwargs = {
            "user_id": user_id,
            "address_id": address_id,
            "total": total,
        }
        if status is not None:
            order_kwargs["status"] = status

        order = await self.repository.create(**order_kwargs)

        for item_data in order_items_data:
            self.repository.session.add(
                OrderItem(order_id=order.id, **item_data)
            )

        await self.repository.session.commit()
        await self.repository.session.refresh(order)
        return order

    async def _deduct_stock(self, order: Order) -> None:
        """Atomically deduct stock for all items in an order.

        Uses FOR UPDATE within the current transaction.
        Also re-validates stock before deducting (double-check).
        """
        for item in order.items:
            available, error_msg = await self.product_repo.check_stock(item.product_id, item.quantity)
            if not available:
                raise ValidationError(
                    error_msg or f"Stock changed for product {item.product_id} — cannot confirm"
                )
            await self.product_repo.deduct_product_stock(item.product_id, item.quantity)

    async def _restore_stock(self, order: Order) -> None:
        """Atomically restore stock for all items in a confirmed order being cancelled."""
        for item in order.items:
            await self.product_repo.restore_product_stock(item.product_id, item.quantity)

    async def update_status(
        self,
        order_id: UUID,
        new_status: OrderStatus,
        changed_by: UUID | None = None,
        reason: str | None = None,
    ) -> Order:
        order = await self.repository.get_with_items_for_update(order_id)
        if not order:
            raise NotFoundError(f"Order {order_id} not found")

        old_status = order.status
        result = self.state_machine.transition(old_status, new_status)
        if not result.allowed:
            raise ValidationError(result.error)

        for effect in result.side_effects:
            if effect == SideEffect.DEDUCT_STOCK:
                await self._deduct_stock(order)
            elif effect == SideEffect.RESTORE_STOCK:
                await self._restore_stock(order)

        order.status = new_status
        await self.repository.add_history(
            order_id=order_id,
            from_status=old_status,
            to_status=new_status,
            changed_by=changed_by,
            reason=reason,
        )
        await self.repository.session.commit()
        await self.repository.session.refresh(order)
        return order

    async def list_by_user(
        self, user_id: UUID, skip: int = 0, limit: int = 20, status: OrderStatus | None = None, periodo: str | None = None
    ) -> tuple[list[Order], int]:
        desde = None
        if periodo and periodo != "all":
            days_map = {"last_week": 7, "last_month": 30, "last_3_months": 90}
            if periodo in days_map:
                desde = datetime.utcnow() - timedelta(days=days_map[periodo])
        items = await self.repository.get_by_user(user_id, skip, limit, status, desde)
        total = await self.repository.count_by_user(user_id, status, desde)
        return items, total
