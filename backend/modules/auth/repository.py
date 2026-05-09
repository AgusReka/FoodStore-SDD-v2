"""Auth repositories: token repository + UserRepository re-export."""
from uuid import UUID

from sqlalchemy import func, select, update

from backend.core.repository import BaseRepository
from backend.modules.auth.model import AuthToken
from backend.modules.usuarios.repository import UserRepository


class AuthTokenRepository(BaseRepository[AuthToken]):
    def __init__(self, session):
        super().__init__(AuthToken, session)

    async def get_by_token_hash(self, token_hash: str) -> AuthToken | None:
        stmt = select(AuthToken).where(AuthToken.token_hash == token_hash)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def mark_as_used(self, token_id: UUID) -> None:
        stmt = update(AuthToken).where(AuthToken.id == token_id).values(used_at=func.now())
        await self.session.execute(stmt)
        await self.session.commit()

    async def revoke_all_for_user(self, user_id: UUID, purpose: str | None = None) -> None:
        stmt = update(AuthToken).where(
            AuthToken.user_id == user_id,
            AuthToken.used_at.is_(None),
            AuthToken.expires_at > func.now(),
        )
        if purpose:
            from backend.core.enums import AuthTokenPurpose
            stmt = stmt.where(AuthToken.purpose == AuthTokenPurpose(purpose))
        stmt = stmt.values(used_at=func.now())
        await self.session.execute(stmt)
        await self.session.commit()
