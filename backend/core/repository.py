"""Generic async CRUD repository."""
from typing import Any, Generic, Sequence, TypeVar
from uuid import UUID

from sqlalchemy import delete as sa_delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Base repository with standard CRUD operations."""

    def __init__(self, model: type[ModelT], session: AsyncSession):
        self.model = model
        self.session = session

    async def get(self, id: UUID) -> ModelT | None:
        """Get by primary key."""
        stmt = select(self.model).where(self.model.id == id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: str | None = None,
        descending: bool = False,
    ) -> Sequence[ModelT]:
        """Get all with pagination."""
        stmt = select(self.model).offset(skip).limit(limit)

        if order_by:
            column = getattr(self.model, order_by, None)
            if column is not None:
                order_expr = column.desc() if descending else column.asc()
                stmt = stmt.order_by(order_expr)

        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, **kwargs: Any) -> ModelT:
        """Create a new record."""
        instance = self.model(**kwargs)
        self.session.add(instance)
        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def update(self, id: UUID, **kwargs: Any) -> ModelT | None:
        """Update by primary key. Only update provided fields."""
        instance = await self.get(id)
        if not instance:
            return None

        for key, value in kwargs.items():
            setattr(instance, key, value)

        await self.session.commit()
        await self.session.refresh(instance)
        return instance

    async def delete(self, id: UUID) -> bool:
        """Delete by primary key. Returns True if deleted, False if not found."""
        instance = await self.get(id)
        if not instance:
            return False

        await self.session.delete(instance)
        await self.session.commit()
        return True

    async def count(self, filters: list | None = None) -> int:
        """Count records."""
        stmt = select(func.count()).select_from(self.model)

        if filters:
            stmt = stmt.where(*filters)

        result = await self.session.execute(stmt)
        return result.scalar_one()

    async def paginate(
        self,
        page: int = 1,
        size: int = 20,
        order_by: str | None = None,
        descending: bool = False,
        filters: list | None = None,
    ) -> tuple[Sequence[ModelT], int]:
        """Paginated read with total count. Returns (items, total)."""
        total = await self.count(filters=filters)

        stmt = select(self.model).offset((page - 1) * size).limit(size)

        if order_by:
            column = getattr(self.model, order_by, None)
            if column is not None:
                order_expr = column.desc() if descending else column.asc()
                stmt = stmt.order_by(order_expr)

        if filters:
            stmt = stmt.where(*filters)

        result = await self.session.execute(stmt)
        items = result.scalars().all()

        return items, total
