"""Admin service."""
from datetime import datetime
from uuid import UUID

from sqlalchemy import and_
from backend.core.enums import OrderStatus, UserRole
from backend.core.exceptions import NotFoundError
from backend.modules.pedidos.model import Order
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.usuarios.repository import UserRepository


class AdminService:
    def __init__(self, user_repo: UserRepository, pedido_repo: PedidoRepository):
        self.user_repo = user_repo
        self.pedido_repo = pedido_repo

    async def list_all_users(self, page: int = 1, size: int = 20):
        return await self.user_repo.paginate(page=page, size=size)

    async def update_user_role(self, user_id: UUID, role: UserRole):
        user = await self.user_repo.get(user_id)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return await self.user_repo.update(user_id, role=role)

    async def list_all_orders(
        self,
        page: int = 1,
        size: int = 20,
        estado: OrderStatus | None = None,
        desde: datetime | None = None,
        hasta: datetime | None = None,
    ):
        filters: list = []
        if estado:
            filters.append(Order.status == estado)
        if desde:
            filters.append(Order.created_at >= desde)
        if hasta:
            filters.append(Order.created_at <= hasta)

        return await self.pedido_repo.paginate(
            page=page, size=size, filters=filters or None,
            order_by="created_at", descending=True,
        )
