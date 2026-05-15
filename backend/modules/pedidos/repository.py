"""Order repository."""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from backend.core.enums import OrderStatus
from backend.core.repository import BaseRepository
from backend.modules.pedidos.model import Order, OrderHistory


class PedidoRepository(BaseRepository[Order]):
    def __init__(self, session):
        super().__init__(Order, session)

    async def get_by_user(self, user_id: UUID, skip: int = 0, limit: int = 20, status: OrderStatus | None = None) -> list[Order]:
        stmt = select(Order).where(Order.user_id == user_id)
        if status:
            stmt = stmt.where(Order.status == status)
        stmt = stmt.offset(skip).limit(limit).order_by(Order.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def count_by_user(self, user_id: UUID, status: OrderStatus | None = None) -> int:
        stmt = select(func.count()).select_from(Order).where(Order.user_id == user_id)
        if status:
            stmt = stmt.where(Order.status == status)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def get_by_status(self, estado: OrderStatus, skip: int = 0, limit: int = 20) -> list[Order]:
        stmt = select(Order).where(Order.status == estado).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_items(self, order_id: UUID) -> Order | None:
        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.items), selectinload(Order.payment))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_with_items_for_update(self, order_id: UUID) -> Order | None:
        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.items), selectinload(Order.payment))
            .with_for_update()
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def add_history(
        self,
        order_id: UUID,
        from_status: OrderStatus,
        to_status: OrderStatus,
        changed_by: UUID | None = None,
        reason: str | None = None,
    ) -> OrderHistory:
        record = OrderHistory(
            order_id=order_id,
            from_status=from_status,
            to_status=to_status,
            changed_by=changed_by,
            reason=reason,
        )
        self.session.add(record)
        return record

    async def get_history(self, order_id: UUID) -> list[OrderHistory]:
        stmt = (
            select(OrderHistory)
            .where(OrderHistory.order_id == order_id)
            .order_by(OrderHistory.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_with_history(self, order_id: UUID) -> Order | None:
        stmt = (
            select(Order)
            .where(Order.id == order_id)
            .options(selectinload(Order.history))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
