"""User repository."""
from uuid import UUID

from sqlalchemy import or_, select

from backend.core.repository import BaseRepository
from backend.modules.usuarios.model import User


class UserRepository(BaseRepository[User]):
    def __init__(self, session):
        super().__init__(User, session)

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(User).where(User.email == email)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_username(self, username: str) -> User | None:
        stmt = select(User).where(User.username == username)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def search_by_name_or_email(self, query: str, skip: int = 0, limit: int = 20) -> list[User]:
        search = f"%{query}%"
        stmt = select(User).where(
            or_(User.first_name.ilike(search), User.email.ilike(search), User.last_name.ilike(search))
        ).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
