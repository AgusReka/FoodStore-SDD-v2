"""Category service."""
from uuid import UUID

from backend.core.exceptions import ConflictError
from backend.core.service import BaseService
from backend.modules.categorias.model import Category
from backend.modules.categorias.repository import CategoriaRepository


class CategoriaService(BaseService[Category]):
    def __init__(self, repository: CategoriaRepository):
        super().__init__(repository)

    async def delete_categoria(self, categoria_id: UUID) -> bool:
        has_active = await self.repository.has_active_products(categoria_id)
        if has_active:
            raise ConflictError("Cannot delete category with active products")
        return await self.repository.delete(categoria_id)

    async def get_with_products(self, categoria_id: UUID) -> Category | None:
        return await self.repository.get_with_products(categoria_id)
