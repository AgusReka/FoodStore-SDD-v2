"""Category repository."""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from backend.core.repository import BaseRepository
from backend.modules.categorias.model import Category


class CategoriaRepository(BaseRepository[Category]):
    def __init__(self, session):
        super().__init__(Category, session)

    async def get_with_products(self, category_id: UUID) -> Category | None:
        stmt = (
            select(Category)
            .where(Category.id == category_id)
            .options(selectinload(Category.products))
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def has_products(self, category_id: UUID) -> bool:
        from backend.modules.productos.model import Product
        stmt = select(func.count()).select_from(Product).where(Product.category_id == category_id)
        result = await self.session.execute(stmt)
        return result.scalar_one() > 0
