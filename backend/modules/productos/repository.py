"""Product repository."""
from uuid import UUID

from sqlalchemy import select

from backend.core.repository import BaseRepository
from backend.modules.productos.model import Product


class ProductRepository(BaseRepository[Product]):
    def __init__(self, session):
        super().__init__(Product, session)

    async def search_by_name(self, query: str, skip: int = 0, limit: int = 20) -> list[Product]:
        search = f"%{query}%"
        stmt = select(Product).where(Product.name.ilike(search)).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def filter_by_categoria(self, category_id: UUID, skip: int = 0, limit: int = 20) -> list[Product]:
        stmt = select(Product).where(Product.category_id == category_id).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def check_stock(self, product_id: UUID, quantity: int) -> bool:
        """Check if product is available and has sufficient stock."""
        product = await self.get(product_id)
        return product is not None and product.is_available
