"""Generic service layer base."""
from typing import Generic, Sequence, TypeVar
from uuid import UUID

from backend.core.base import Base
from backend.core.repository import BaseRepository

ModelT = TypeVar("ModelT", bound=Base)


class BaseService(Generic[ModelT]):
    """Base service with standard CRUD orchestration."""

    def __init__(self, repository: BaseRepository[ModelT]):
        self.repository = repository

    async def get(self, id: UUID) -> ModelT | None:
        return await self.repository.get(id)

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[ModelT]:
        return await self.repository.get_all(skip=skip, limit=limit)

    async def create(self, **kwargs) -> ModelT:
        return await self.repository.create(**kwargs)

    async def update(self, id: UUID, **kwargs) -> ModelT | None:
        return await self.repository.update(id, **kwargs)

    async def delete(self, id: UUID) -> bool:
        return await self.repository.delete(id)

    async def paginate(self, page: int = 1, size: int = 20) -> tuple[Sequence[ModelT], int]:
        return await self.repository.paginate(page=page, size=size)
