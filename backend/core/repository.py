"""Generic async CRUD repository."""
from datetime import datetime, timezone
from typing import Any, Generic, Sequence, TypeVar
from uuid import UUID

from sqlalchemy import Select, delete as sa_delete, func, select
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
        stmt = self._active_filter(stmt)

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
        """Soft delete by setting deleted_at, or hard delete if model lacks the field."""
        instance = await self.get(id)
        if not instance:
            return False

        if hasattr(instance, "deleted_at"):
            if instance.deleted_at is not None:
                # Already soft-deleted — prevent double delete
                return False
            instance.deleted_at = datetime.now(timezone.utc)
            await self.session.commit()
        else:
            await self.session.delete(instance)
            await self.session.commit()
        return True

    def _active_filter(self, stmt: Select) -> Select:
        """Add WHERE deleted_at IS NULL if the model supports soft delete."""
        if hasattr(self.model, "deleted_at"):
            return stmt.where(self.model.deleted_at.is_(None))
        return stmt

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
        include_deleted: bool = False,
    ) -> tuple[Sequence[ModelT], int]:
        """Paginated read with total count. Returns (items, total)."""
        count_stmt = select(func.count()).select_from(self.model)
        if not include_deleted:
            count_stmt = self._active_filter(count_stmt)
        if filters:
            count_stmt = count_stmt.where(*filters)
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        stmt = select(self.model).offset((page - 1) * size).limit(size)
        if not include_deleted:
            stmt = self._active_filter(stmt)

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
