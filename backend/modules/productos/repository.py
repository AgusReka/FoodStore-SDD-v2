"""Product repository."""
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from backend.core.repository import BaseRepository
from backend.modules.productos.model import Product
from backend.modules.ingredientes.model import Ingredient, ProductIngredient


class ProductRepository(BaseRepository[Product]):
    def __init__(self, session):
        super().__init__(Product, session)

    def _load_ingredients(self):
        """Return eager-loading option that fetches ingredients + nested ingredient data."""
        return selectinload(Product.ingredients).selectinload(ProductIngredient.ingredient)

    async def search_by_name(self, query: str, skip: int = 0, limit: int = 20) -> list[Product]:
        search = f"%{query}%"
        stmt = (
            select(Product)
            .where(Product.name.ilike(search))
            .offset(skip).limit(limit)
            .options(self._load_ingredients())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def filter_by_categoria(self, category_id: UUID, skip: int = 0, limit: int = 20) -> list[Product]:
        stmt = (
            select(Product)
            .where(Product.category_id == category_id)
            .offset(skip).limit(limit)
            .options(self._load_ingredients())
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def check_stock(self, product_id: UUID, quantity: int) -> tuple[bool, str | None]:
        """Check if product is available and has sufficient stock.

        Returns (is_available, error_message).
        For compound products (with ingredients), validates ingredient stock.
        For simple products, validates stock_cantidad.
        """
        product = await self.get_with_ingredients(product_id)
        if not product:
            return False, "Product not found"
        if not product.is_available:
            return False, f"Product '{product.name}' is not available"

        if product.ingredients:
            for pi in product.ingredients:
                needed = float(pi.quantity) * quantity
                if pi.ingredient.stock_actual < needed:
                    return False, f"Insufficient stock of '{pi.ingredient.name}': need {needed:.2f}, have {pi.ingredient.stock_actual:.2f}"
            return True, None
        else:
            if product.stock_cantidad is None:
                return False, f"Product '{product.name}' has no stock configured"
            if product.stock_cantidad < quantity:
                return False, f"Insufficient stock for '{product.name}': need {quantity}, have {product.stock_cantidad}"
            return True, None

    async def calculate_available_stock(self, product_id: UUID) -> int | None:
        """Calculate available stock units for a product.

        For compound products: min(ingredient.stock_actual / pi.cantidad) across all ingredients.
        For simple products: stock_cantidad.
        Returns None if product not found.
        """
        product = await self.get_with_ingredients(product_id)
        if not product:
            return None
        if not product.ingredients:
            return product.stock_cantidad
        min_units = None
        for pi in product.ingredients:
            if pi.cantidad > 0:
                units = int(pi.ingredient.stock_actual / pi.cantidad)
                if min_units is None or units < min_units:
                    min_units = units
        return min_units or 0

    async def deduct_product_stock(self, product_id: UUID, quantity: int) -> None:
        """Atomically deduct stock for a single product.

        Simple product: decrements stock_cantidad.
        Compound product: decrements stock_actual of each ingredient.
        Uses SELECT FOR UPDATE for atomicity.
        """
        from sqlalchemy import select as sa_select

        product = await self.get_with_ingredients(product_id)
        if not product:
            return

        if product.ingredients:
            # Deduct from each ingredient with FOR UPDATE
            for pi in product.ingredients:
                needed = float(pi.quantity) * quantity
                stmt = (
                    sa_select(Ingredient)
                    .where(Ingredient.id == pi.ingredient_id)
                    .with_for_update()
                )
                result = await self.session.execute(stmt)
                ingredient = result.scalar_one_or_none()
                if ingredient:
                    ingredient.stock_actual -= needed
        else:
            # Deduct from product stock_cantidad with FOR UPDATE
            stmt = (
                sa_select(Product)
                .where(Product.id == product_id)
                .with_for_update()
            )
            result = await self.session.execute(stmt)
            prod = result.scalar_one_or_none()
            if prod and prod.stock_cantidad is not None:
                prod.stock_cantidad -= quantity

    async def restore_product_stock(self, product_id: UUID, quantity: int) -> None:
        """Atomically restore stock for a single product (for cancellations).

        Inverse of deduct_product_stock.
        """
        from sqlalchemy import select as sa_select

        product = await self.get_with_ingredients(product_id)
        if not product:
            return

        if product.ingredients:
            for pi in product.ingredients:
                needed = float(pi.quantity) * quantity
                stmt = (
                    sa_select(Ingredient)
                    .where(Ingredient.id == pi.ingredient_id)
                    .with_for_update()
                )
                result = await self.session.execute(stmt)
                ingredient = result.scalar_one_or_none()
                if ingredient:
                    ingredient.stock_actual += needed
        else:
            stmt = (
                sa_select(Product)
                .where(Product.id == product_id)
                .with_for_update()
            )
            result = await self.session.execute(stmt)
            prod = result.scalar_one_or_none()
            if prod and prod.stock_cantidad is not None:
                prod.stock_cantidad += quantity

    async def get_low_stock_ingredients(self) -> list[Ingredient]:
        """Get all ingredients where stock_actual < stock_minimo, ordered by severity."""
        from sqlalchemy import select as sa_select, text

        stmt = (
            sa_select(Ingredient)
            .where(Ingredient.stock_actual < Ingredient.stock_minimo)
            .order_by(
                (Ingredient.stock_minimo - Ingredient.stock_actual) / 
                func.nullif(Ingredient.stock_minimo, 0)
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def paginate(
        self,
        page: int = 1,
        size: int = 20,
        order_by: str | None = None,
        descending: bool = False,
        filters: list | None = None,
    ) -> tuple[list[Product], int]:
        """Paginated read with ingredients eagerly loaded."""
        total = await self.count(filters=filters)

        stmt = (
            select(Product)
            .offset((page - 1) * size).limit(size)
            .options(self._load_ingredients())
        )
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

    async def get_with_ingredients(self, product_id: UUID) -> Product | None:
        stmt = (
            select(Product)
            .where(Product.id == product_id)
            .options(self._load_ingredients())
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()
