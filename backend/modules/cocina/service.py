"""Cocina (Kitchen Display System) service."""
import logging
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.core.database import AsyncSession
from backend.core.enums import OrderStatus, UserRole
from backend.core.exceptions import NotFoundError, ForbiddenError
from backend.modules.cocina.schemas import CocinaPedidoItem, CocinaPedidoRead
from backend.modules.pedidos.model import Order, OrderHistory, OrderItem
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.service import OrderService
from backend.modules.productos.repository import ProductRepository

logger = logging.getLogger(__name__)


class CocinaService:
    """Service for Kitchen Display System operations."""

    # Kitchen-relevant statuses
    KITCHEN_STATUSES = {OrderStatus.CONFIRMADO, OrderStatus.PREPARANDO}

    def __init__(self, db: AsyncSession):
        self.db = db
        self.pedido_repo = PedidoRepository(db)

    async def list_pedidos(self) -> tuple[list[CocinaPedidoRead], int, int]:
        """Return all orders relevant to the kitchen, ordered by age.

        Returns:
            Tuple of (items, count_por_preparar, count_en_preparacion)
        """
        # Fetch orders in CONFIRMADO or PREPARANDO with items + product names
        stmt = (
            select(Order)
            .where(Order.status.in_(self.KITCHEN_STATUSES))
            .options(
                selectinload(Order.items).selectinload(OrderItem.product),
                selectinload(Order.history),
            )
            .order_by(Order.created_at.asc())
        )
        result = await self.db.execute(stmt)
        orders = result.scalars().all()

        items = []
        por_preparar = 0
        en_preparacion = 0

        for order in orders:
            cocina_items = [
                CocinaPedidoItem(
                    nombre=item.product.name if item.product else "Producto",
                    cantidad=item.quantity,
                    subtotal=float(item.subtotal),
                )
                for item in order.items
            ]

            # Find confirmed_at from history
            confirmed_at = order.created_at
            for entry in order.history:
                if entry.to_status == OrderStatus.CONFIRMADO:
                    confirmed_at = entry.created_at
                    break

            if order.status == OrderStatus.CONFIRMADO:
                por_preparar += 1
            else:
                en_preparacion += 1

            items.append(CocinaPedidoRead(
                id=order.id,
                items=cocina_items,
                notas=getattr(order, "notas", None),
                estado=order.status,
                confirmed_at=confirmed_at,
                tiempo_espera_minutos=0,  # Calculated client-side
            ))

        return items, por_preparar, en_preparacion

    async def update_pedido_estado(
        self,
        order_id: UUID,
        nuevo_estado: OrderStatus,
        current_user: dict,
    ) -> CocinaPedidoRead:
        """Update order status from the kitchen."""
        user_role = UserRole(current_user["role"])
        user_id = UUID(current_user["user_id"])

        # Verify role is authorized for kitchen operations
        if user_role not in (UserRole.COCINA, UserRole.PEDIDOS, UserRole.ADMIN):
            raise ForbiddenError("Only kitchen, pedidos, and admin roles can update kitchen orders")

        product_repo = ProductRepository(self.db)
        order_service = OrderService(self.pedido_repo, product_repo)

        order = await order_service.update_status(
            order_id,
            nuevo_estado,
            changed_by=user_id,
            actor_role=user_role,
        )

        # Build response
        cocina_items = [
            CocinaPedidoItem(
                nombre=item.product.name if item.product else "Producto",
                cantidad=item.quantity,
                subtotal=float(item.subtotal),
            )
            for item in order.items
        ]

        confirmed_at = order.created_at
        for entry in order.history:
            if entry.to_status == OrderStatus.CONFIRMADO:
                confirmed_at = entry.created_at
                break

        return CocinaPedidoRead(
            id=order.id,
            items=cocina_items,
            notas=getattr(order, "notas", None),
            estado=order.status,
            confirmed_at=confirmed_at,
        )
