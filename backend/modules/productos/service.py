"""Product service."""
from uuid import UUID

from sqlalchemy import delete as sa_delete, select

from backend.core.exceptions import NotFoundError
from backend.core.service import BaseService
from backend.modules.categorias.repository import CategoriaRepository
from backend.modules.ingredientes.model import Ingredient, ProductIngredient
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

        ingredientes = kwargs.pop("ingredientes", None) or kwargs.pop("ingredients", None)
        product = await self.repository.create(**kwargs)

        if ingredientes:
            await self._set_product_ingredients(product.id, ingredientes)

        return product

    async def update_product(self, product_id: UUID, **kwargs) -> Product:
        category_id = kwargs.get("category_id")
        if category_id:
            categoria = await self.categoria_repo.get(category_id)
            if not categoria:
                raise NotFoundError(f"Category {category_id} not found")

        ingredientes = kwargs.pop("ingredientes", None) or kwargs.pop("ingredients", None)
        product = await self.repository.update(product_id, **kwargs)
        if not product:
            raise NotFoundError(f"Product {product_id} not found")

        if ingredientes is not None:
            await self._set_product_ingredients(product_id, ingredientes)

        return product

    async def _set_product_ingredients(self, product_id: UUID, ingredientes: list[dict]) -> None:
        """Replace all ingredient associations for a product."""
        session = self.repository.session
        # Delete existing associations
        await session.execute(
            sa_delete(ProductIngredient).where(ProductIngredient.product_id == product_id)
        )
        # Insert new associations
        for item in ingredientes:
            ingredient_id = item.get("ingredient_id") or item["ingredientId"]
            quantity = item.get("cantidad") or item["quantity"]
            session.add(ProductIngredient(
                product_id=product_id,
                ingredient_id=ingredient_id,
                quantity=quantity,
            ))
        await session.commit()

    async def search_products(self, query: str, skip: int = 0, limit: int = 20, include_deleted: bool = False) -> list[Product]:
        return await self.repository.search_by_name(query, skip, limit, include_deleted)

    async def filter_by_category(self, category_id: UUID, skip: int = 0, limit: int = 20, include_deleted: bool = False) -> list[Product]:
        return await self.repository.filter_by_categoria(category_id, skip, limit, include_deleted)

    async def paginate_products(self, page: int = 1, size: int = 20, include_deleted: bool = False) -> tuple[list[Product], int]:
        return await self.repository.paginate(page=page, size=size, include_deleted=include_deleted)
