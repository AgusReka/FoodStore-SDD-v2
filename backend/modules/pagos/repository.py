"""Payment repository."""
from uuid import UUID

from sqlalchemy import select

from backend.core.enums import PaymentStatus
from backend.core.repository import BaseRepository
from backend.modules.pagos.model import Payment


class PagoRepository(BaseRepository[Payment]):
    def __init__(self, session):
        super().__init__(Payment, session)

    async def get_by_order(self, order_id: UUID) -> Payment | None:
        stmt = select(Payment).where(Payment.order_id == order_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_status(self, estado: PaymentStatus, skip: int = 0, limit: int = 20) -> list[Payment]:
        stmt = select(Payment).where(Payment.status == estado).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_mp_payment_id(self, mp_payment_id: str) -> Payment | None:
        stmt = select(Payment).where(Payment.mp_payment_id == mp_payment_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_mp_preference(self, mp_preference_id: str) -> Payment | None:
        """Find payment by MP preference ID (for idempotency in checkout flow)."""
        stmt = select(Payment).where(Payment.mp_preference_id == mp_preference_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()
