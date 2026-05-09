"""Refresh token service."""
from datetime import datetime, timedelta, timezone
from uuid import UUID

from backend.core.exceptions import NotFoundError, UnauthorizedError
from backend.core.security import generate_safe_token, hash_token_deterministic
from backend.core.service import BaseService
from backend.modules.refreshtokens.model import RefreshToken
from backend.modules.refreshtokens.repository import RefreshTokenRepository


class RefreshTokenService(BaseService[RefreshToken]):
    def __init__(self, repository: RefreshTokenRepository):
        super().__init__(repository)

    async def create_token(self, user_id: UUID, expires_delta: timedelta | None = None) -> tuple[str, RefreshToken]:
        raw_token = generate_safe_token()
        hashed = hash_token_deterministic(raw_token)

        if expires_delta is None:
            expires_delta = timedelta(days=7)

        expires_at = datetime.now(timezone.utc) + expires_delta

        token = await self.repository.create(
            token=hashed,
            user_id=user_id,
            expires_at=expires_at,
        )

        return raw_token, token

    async def validate_and_rotate(self, token_str: str) -> tuple[str, RefreshToken]:
        hashed = hash_token_deterministic(token_str)
        stored = await self.repository.get_by_token(hashed)
        if not stored:
            raise UnauthorizedError("Invalid refresh token")

        if stored.revoked_at is not None:
            raise UnauthorizedError("Refresh token has been revoked")

        if datetime.now(timezone.utc) > stored.expires_at:
            raise UnauthorizedError("Refresh token has expired")

        await self.repository.revoke_token(stored.id)

        new_raw, new_token = await self.create_token(stored.user_id)
        return new_raw, new_token

    async def revoke_token(self, token_str: str) -> None:
        hashed = hash_token_deterministic(token_str)
        stored = await self.repository.get_by_token(hashed)
        if not stored:
            raise NotFoundError("Refresh token not found")
        await self.repository.revoke_token(stored.id)
