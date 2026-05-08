"""User management service."""
from uuid import UUID

from backend.core.exceptions import ConflictError, NotFoundError
from backend.core.security import hash_password
from backend.core.service import BaseService
from backend.modules.usuarios.model import User
from backend.modules.usuarios.repository import UserRepository


class UserService(BaseService[User]):
    def __init__(self, repository: UserRepository):
        super().__init__(repository)

    async def create_user(self, **kwargs) -> User:
        email = kwargs.get("email", "")
        username = kwargs.get("username", "")

        existing = await self.repository.get_by_email(email)
        if existing:
            raise ConflictError(f"Email '{email}' is already registered")

        existing = await self.repository.get_by_username(username)
        if existing:
            raise ConflictError(f"Username '{username}' is already taken")

        password = kwargs.pop("password", "")
        kwargs["hashed_password"] = hash_password(password)

        return await self.repository.create(**kwargs)

    async def get_by_email(self, email: str) -> User | None:
        return await self.repository.get_by_email(email)

    async def update_user(self, user_id: UUID, **kwargs) -> User:
        kwargs.pop("password", None)
        kwargs.pop("hashed_password", None)

        user = await self.repository.update(user_id, **kwargs)
        if not user:
            raise NotFoundError(f"User {user_id} not found")
        return user

    async def search_users(self, query: str, skip: int = 0, limit: int = 20) -> list[User]:
        return await self.repository.search_by_name_or_email(query, skip, limit)

    async def paginate_users(self, page: int = 1, size: int = 20) -> tuple[list[User], int]:
        return await self.repository.paginate(page=page, size=size)
