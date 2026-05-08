"""Authentication service."""
from uuid import UUID

from backend.core.exceptions import ConflictError, UnauthorizedError
from backend.core.security import create_access_token, verify_password
from backend.modules.refreshtokens.service import RefreshTokenService
from backend.modules.usuarios.service import UserService


class AuthService:
    def __init__(
        self,
        user_service: UserService,
        refresh_token_service: RefreshTokenService,
    ):
        self.user_service = user_service
        self.refresh_token_service = refresh_token_service

    async def register(self, email: str, username: str, password: str, first_name: str, last_name: str, **kwargs):
        user = await self.user_service.create_user(
            email=email,
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            **kwargs,
        )
        return user

    async def login(self, email: str, password: str):
        user = await self.user_service.get_by_email(email)
        if not user:
            raise UnauthorizedError("Invalid email or password")

        if not verify_password(password, user.hashed_password):
            raise UnauthorizedError("Invalid email or password")

        access_token = create_access_token({"sub": str(user.id), "role": user.role.value})
        raw_refresh, refresh_obj = await self.refresh_token_service.create_token(user.id)

        return {
            "access_token": access_token,
            "refresh_token": raw_refresh,
            "user": user,
        }

    async def get_current_user(self, user_id: str):
        return await self.user_service.get(UUID(user_id))
