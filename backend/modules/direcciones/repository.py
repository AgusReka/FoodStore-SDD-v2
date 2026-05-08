"""Address repository."""
from uuid import UUID

from sqlalchemy import select, update

from backend.core.repository import BaseRepository
from backend.modules.direcciones.model import Address


class DireccionRepository(BaseRepository[Address]):
    def __init__(self, session):
        super().__init__(Address, session)

    async def get_by_user(self, user_id: UUID) -> list[Address]:
        stmt = select(Address).where(Address.user_id == user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_primary(self, user_id: UUID) -> Address | None:
        stmt = select(Address).where(Address.user_id == user_id, Address.is_primary == True)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def unset_primary(self, user_id: UUID) -> None:
        stmt = update(Address).where(Address.user_id == user_id).values(is_primary=False)
        await self.session.execute(stmt)
        await self.session.commit()
