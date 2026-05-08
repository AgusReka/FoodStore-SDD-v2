"""Order service."""
from uuid import UUID

from backend.core.enums import OrderStatus
from backend.core.exceptions import NotFoundError, ValidationError
from backend.core.service import BaseService
from backend.modules.pedidos.model import Order, OrderItem
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.productos.repository import ProductRepository


class OrderService(BaseService[Order]):
    def __init__(self, pedido_repo: PedidoRepository, product_repo: ProductRepository):
        super().__init__(pedido_repo)
        self.product_repo = product_repo

    async def create_order(
        self, user_id: UUID, items: list[dict], address_id: UUID | None = None
    ) -> Order:
        total = 0.0
        order_items_data = []

        for item in items:
            product_id = item["product_id"]
            quantity = item["quantity"]

            product = await self.product_repo.get(product_id)
            if not product:
                raise NotFoundError(f"Product {product_id} not found")

            available = await self.product_repo.check_stock(product_id, quantity)
            if not available:
                raise ValidationError(f"Product '{product.name}' is not available")

            unit_price = float(product.price)
            subtotal = unit_price * quantity
            total += subtotal

            order_items_data.append({
                "product_id": product_id,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal,
            })

        order = await self.repository.create(
            user_id=user_id,
            address_id=address_id,
            total=total,
        )

        for item_data in order_items_data:
            self.repository.session.add(
                OrderItem(order_id=order.id, **item_data)
            )

        await self.repository.session.commit()
        await self.repository.session.refresh(order)
        return order

    async def update_status(self, order_id: UUID, new_status: OrderStatus) -> Order:
        order = await self.repository.get(order_id)
        if not order:
            raise NotFoundError(f"Order {order_id} not found")

        valid_transitions = {
            OrderStatus.PENDIENTE: [OrderStatus.CONFIRMADO, OrderStatus.CANCELADO],
            OrderStatus.CONFIRMADO: [OrderStatus.PREPARANDO, OrderStatus.CANCELADO],
            OrderStatus.PREPARANDO: [OrderStatus.ENVIADO],
            OrderStatus.ENVIADO: [OrderStatus.ENTREGADO],
        }

        allowed = valid_transitions.get(order.status, [])
        if new_status not in allowed:
            raise ValidationError(
                f"Invalid status transition from '{order.status.value}' to '{new_status.value}'"
            )

        updated = await self.repository.update(order_id, status=new_status)
        return updated

    async def list_by_user(self, user_id: UUID, skip: int = 0, limit: int = 20) -> list[Order]:
        return await self.repository.get_by_user(user_id, skip, limit)
