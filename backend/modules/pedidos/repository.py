"""Order repository."""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from backend.core.enums import OrderStatus
from backend.core.repository import BaseRepository
from backend.modules.pedidos.model import Order


class PedidoRepository(BaseRepository[Order]):
    def __init__(self, session):
        super().__init__(Order, session)

    async def get_by_user(self, user_id: UUID, skip: int = 0, limit: int = 20) -> list[Order]:
        stmt = select(Order).where(Order.user_id == user_id).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_status(self, estado: OrderStatus, skip: int = 0, limit: int = 20) -> list[Order]:
        stmt = select(Order).where(Order.status == estado).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_items(self, order_id: UUID) -> Order | None:
        stmt = select(Order).where(Order.id == order_id).options(selectinload(Order.items))
        result = await self.session.execute(stmt)
        return result.scalars().first()
