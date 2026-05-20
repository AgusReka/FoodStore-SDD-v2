"""Ingredient service."""
from uuid import UUID

from backend.core.exceptions import ConflictError, NotFoundError
from backend.core.service import BaseService
from backend.modules.ingredientes.model import Ingredient
from backend.modules.ingredientes.repository import IngredientRepository


class IngredientService(BaseService[Ingredient]):
    def __init__(self, repository: IngredientRepository):
        super().__init__(repository)

    async def create_ingredient(self, **kwargs) -> Ingredient:
        name = kwargs.get("name")
        if name:
            existing = await self.repository.search_by_name(name, limit=1)
            if existing:
                raise ConflictError(f"Ingredient '{name}' already exists")
        return await self.repository.create(**kwargs)

    async def update_ingredient(self, ingredient_id: UUID, **kwargs) -> Ingredient:
        name = kwargs.get("name")
        if name:
            existing = await self.repository.search_by_name(name, limit=1)
            if existing and existing[0].id != ingredient_id:
                raise ConflictError(f"Ingredient '{name}' already exists")
        ingredient = await self.repository.update(ingredient_id, **kwargs)
        if not ingredient:
            raise NotFoundError(f"Ingredient {ingredient_id} not found")
        return ingredient

    async def delete_ingredient(self, ingredient_id: UUID) -> bool:
        ingredient = await self.repository.get(ingredient_id)
        if not ingredient:
            raise NotFoundError(f"Ingredient {ingredient_id} not found")
        has_active = await self.repository.has_active_products(ingredient_id)
        if has_active:
            raise ConflictError("Cannot delete ingredient used in active products")
        return await self.repository.delete(ingredient_id)

    async def search_ingredients(self, query: str, skip: int = 0, limit: int = 20, include_deleted: bool = False) -> list[Ingredient]:
        return await self.repository.search_by_name(query, skip, limit, include_deleted)

    async def paginate_ingredients(self, page: int = 1, size: int = 20, include_deleted: bool = False) -> tuple[list[Ingredient], int]:
        return await self.repository.paginate(page=page, size=size, include_deleted=include_deleted)
