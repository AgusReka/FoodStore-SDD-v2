"""Product service."""
from uuid import UUID

from backend.core.exceptions import NotFoundError
from backend.core.service import BaseService
from backend.modules.categorias.repository import CategoriaRepository
from backend.modules.productos.model import Product
from backend.modules.productos.repository import ProductRepository


class ProductService(BaseService[Product]):
    def __init__(self, product_repo: ProductRepository, categoria_repo: CategoriaRepository):
        super().__init__(product_repo)
        self.categoria_repo = categoria_repo

    async def create_product(self, **kwargs) -> Product:
        category_id = kwargs.get("category_id")
        if category_id:
            categoria = await self.categoria_repo.get(category_id)
            if not categoria:
                raise NotFoundError(f"Category {category_id} not found")
        return await self.repository.create(**kwargs)

    async def update_product(self, product_id: UUID, **kwargs) -> Product:
        product = await self.repository.update(product_id, **kwargs)
        if not product:
            raise NotFoundError(f"Product {product_id} not found")
        return product

    async def search_products(self, query: str, skip: int = 0, limit: int = 20) -> list[Product]:
        return await self.repository.search_by_name(query, skip, limit)

    async def filter_by_category(self, category_id: UUID, skip: int = 0, limit: int = 20) -> list[Product]:
        return await self.repository.filter_by_categoria(category_id, skip, limit)

    async def paginate_products(self, page: int = 1, size: int = 20) -> tuple[list[Product], int]:
        return await self.repository.paginate(page=page, size=size)
