"""Ingredient repository."""
from uuid import UUID

from sqlalchemy import func, select

from backend.core.repository import BaseRepository
from backend.modules.ingredientes.model import Ingredient


class IngredientRepository(BaseRepository[Ingredient]):
    def __init__(self, session):
        super().__init__(Ingredient, session)

    async def search_by_name(self, query: str, skip: int = 0, limit: int = 20) -> list[Ingredient]:
        search = f"%{query}%"
        stmt = select(Ingredient).where(Ingredient.name.ilike(search)).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def has_products(self, ingredient_id: UUID) -> bool:
        from backend.modules.ingredientes.model import ProductIngredient
        stmt = select(func.count()).select_from(ProductIngredient).where(ProductIngredient.ingredient_id == ingredient_id)
        result = await self.session.execute(stmt)
        return result.scalar_one() > 0
