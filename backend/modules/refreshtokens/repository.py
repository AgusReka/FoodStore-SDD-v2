"""RefreshToken repository."""
from uuid import UUID

from sqlalchemy import func, select, update

from backend.core.repository import BaseRepository
from backend.modules.refreshtokens.model import RefreshToken


class RefreshTokenRepository(BaseRepository[RefreshToken]):
    def __init__(self, session):
        super().__init__(RefreshToken, session)

    async def get_by_token(self, token: str) -> RefreshToken | None:
        stmt = select(RefreshToken).where(RefreshToken.token == token)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def revoke_token(self, token_id: UUID) -> None:
        stmt = update(RefreshToken).where(RefreshToken.id == token_id).values(revoked_at=func.now())
        await self.session.execute(stmt)
        await self.session.commit()

    async def revoke_all_for_user(self, user_id: UUID) -> None:
        stmt = update(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        ).values(revoked_at=func.now())
        await self.session.execute(stmt)
        await self.session.commit()
