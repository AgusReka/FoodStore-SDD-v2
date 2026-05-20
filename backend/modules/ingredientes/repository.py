"""Ingredient repository."""
from uuid import UUID

from sqlalchemy import func, select

from backend.core.repository import BaseRepository
from backend.modules.ingredientes.model import Ingredient


class IngredientRepository(BaseRepository[Ingredient]):
    def __init__(self, session):
        super().__init__(Ingredient, session)

    async def search_by_name(self, query: str, skip: int = 0, limit: int = 20, include_deleted: bool = False) -> list[Ingredient]:
        search = f"%{query}%"
        conditions = [Ingredient.name.ilike(search)]
        if not include_deleted:
            conditions.append(Ingredient.deleted_at.is_(None))
        stmt = select(Ingredient).where(*conditions).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def has_active_products(self, ingredient_id: UUID) -> bool:
        from backend.modules.ingredientes.model import ProductIngredient
        from backend.modules.productos.model import Product
        stmt = (
            select(func.count())
            .select_from(ProductIngredient)
            .join(Product, ProductIngredient.product_id == Product.id)
            .where(
                ProductIngredient.ingredient_id == ingredient_id,
                Product.deleted_at.is_(None)
            )
        )
        result = await self.session.execute(stmt)
        return result.scalar_one() > 0
