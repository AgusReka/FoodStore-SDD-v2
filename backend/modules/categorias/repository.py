"""Category repository."""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from backend.core.repository import BaseRepository
from backend.modules.categorias.model import Category


class CategoriaRepository(BaseRepository[Category]):
    def __init__(self, session):
        super().__init__(Category, session)

    async def paginate(
        self,
        page: int = 1,
        size: int = 20,
        order_by: str | None = None,
        descending: bool = False,
        filters: list | None = None,
        include_deleted: bool = False,
    ) -> tuple[list[Category], int]:
        count_conditions = []
        if not include_deleted:
            count_conditions.append(Category.deleted_at.is_(None))
        count_stmt = select(func.count()).select_from(Category)
        if count_conditions:
            count_stmt = count_stmt.where(*count_conditions)
        if filters:
            count_stmt = count_stmt.where(*filters)
        total_result = await self.session.execute(count_stmt)
        total = total_result.scalar_one()

        stmt_conditions = []
        if not include_deleted:
            stmt_conditions.append(Category.deleted_at.is_(None))
        stmt = select(Category).offset((page - 1) * size).limit(size)
        if stmt_conditions:
            stmt = stmt.where(*stmt_conditions)
        if order_by:
            column = getattr(self.model, order_by, None)
            if column is not None:
                order_expr = column.desc() if descending else column.asc()
                stmt = stmt.order_by(order_expr)
        if filters:
            stmt = stmt.where(*filters)

        result = await self.session.execute(stmt)
        items = list(result.scalars().all())
        return items, total

    async def get_with_products(self, category_id: UUID) -> Category | None:
        stmt = (
            select(Category)
            .where(Category.id == category_id)
            .options(selectinload(Category.products))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def has_active_products(self, category_id: UUID) -> bool:
        from backend.modules.productos.model import Product
        stmt = select(func.count()).select_from(Product).where(
            Product.category_id == category_id,
            Product.deleted_at.is_(None)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one() > 0
