from datetime import datetime, timezone, timedelta
from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import require_permission
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.modules.productos.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductRead,
    ProductList,
    ProductIngredientRead,
    StockDetail,
)
from backend.modules.productos.repository import ProductRepository
from backend.modules.productos.service import ProductService
from backend.modules.categorias.repository import CategoriaRepository
from backend.modules.ingredientes.model import ProductIngredient
from backend.modules.pedidos.model import Order, OrderItem
from backend.modules.productos.model import Product

router = APIRouter(tags=["Productos"])


def _build_product_read(product) -> ProductRead:
    """Convert a Product ORM object to ProductRead with ingredient data."""
    ingredientes = None
    if hasattr(product, "ingredients") and product.ingredients:
        ingredientes = [
            ProductIngredientRead(
                ingredient_id=pi.ingredient_id,
                name=pi.ingredient.name if pi.ingredient else "",
                quantity=float(pi.quantity),
            )
            for pi in product.ingredients
        ]
    return ProductRead(
        id=product.id,
        name=product.name,
        description=product.description,
        price=float(product.price),
        currency=product.currency,
        image_url=product.image_url,
        is_available=product.is_available,
        stock_cantidad=product.stock_cantidad,
        stock_disponible=product.stock_disponible,
        category_id=product.category_id,
        ingredientes=ingredientes,
        created_at=product.created_at,
        updated_at=product.updated_at,
        deleted_at=product.deleted_at,
    )


@router.get("/popular", response_model=ProductRead)
async def get_popular_product(
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get the most popular product based on today's order frequency.
    
    Counts occurrences of each product in today's orders (pedidos_items),
    returns the product with the highest count. Falls back to a random
    available product if there are no orders today.
    """
    today_start = datetime.now(timezone.utc).replace(
        hour=0, minute=0, second=0, microsecond=0
    )
    today_end = today_start + timedelta(days=1)

    product_repo = ProductRepository(db)

    # Query: count each product's occurrences in today's orders
    stmt = (
        select(
            OrderItem.product_id,
            func.count(OrderItem.id).label("order_count"),
        )
        .join(Order, OrderItem.order_id == Order.id)
        .where(Order.created_at >= today_start)
        .where(Order.created_at < today_end)
        .group_by(OrderItem.product_id)
        .order_by(func.count(OrderItem.id).desc())
        .limit(1)
    )
    result = await db.execute(stmt)
    row = result.first()

    if row:
        product = await product_repo.get_with_ingredients(row.product_id)
        if product:
            return _build_product_read(product)

    # Fallback: random available product
    stmt = (
        select(Product)
        .where(Product.is_available == True)
        .order_by(func.random())
        .limit(1)
    )
    result = await db.execute(stmt)
    product = result.scalars().first()
    if not product:
        raise NotFoundError("No hay productos disponibles")

    product = await product_repo.get_with_ingredients(product.id)
    return _build_product_read(product)


@router.get("/{product_id}/stock", response_model=StockDetail)
async def get_product_stock(
    product_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get detailed stock information for a product."""
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    product = await service.repository.get_with_ingredients(product_id)
    if not product:
        raise NotFoundError(f"Product {product_id} not found")

    stock_detail = StockDetail(
        product_id=product.id,
        product_name=product.name,
        stock_disponible=product.stock_disponible,
        stock_cantidad=product.stock_cantidad,
        tipo="compuesto" if product.ingredients else "simple",
    )

    if product.ingredients:
        ingredientes = []
        for pi in product.ingredients:
            ingredientes.append({
                "ingredient_id": str(pi.ingredient_id),
                "name": pi.ingredient.name if pi.ingredient else "",
                "cantidad_necesaria": float(pi.quantity),
                "stock_actual": float(pi.ingredient.stock_actual),
                "unidades_posibles": int(pi.ingredient.stock_actual / pi.quantity) if pi.quantity > 0 else 0,
            })
        stock_detail.ingredientes = ingredientes

    return stock_detail


@router.get("/", response_model=ProductList)
async def list_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categoria_id: UUID | None = Query(None),
    include_deleted: bool = Query(False),
):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    if search:
        items = await service.search_products(search, skip=(page - 1) * size, limit=size, include_deleted=include_deleted)
        total = len(items)
    elif categoria_id:
        items = await service.filter_by_category(categoria_id, skip=(page - 1) * size, limit=size, include_deleted=include_deleted)
        total = len(items)
    else:
        items, total = await service.paginate_products(page=page, size=size, include_deleted=include_deleted)
    return ProductList(items=[_build_product_read(p) for p in items], total=total, page=page, size=size)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    product = await service.repository.get_with_ingredients(product_id)
    if not product:
        raise NotFoundError(f"Product {product_id} not found")
    return _build_product_read(product)


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    _: Annotated[dict, Depends(require_permission(Permission.PRODUCT_CREATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    product = await service.create_product(**data.model_dump())
    # Re-fetch with ingredients loaded
    product = await service.repository.get_with_ingredients(product.id)
    return _build_product_read(product)


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: UUID,
    data: ProductUpdate,
    _: Annotated[dict, Depends(require_permission(Permission.PRODUCT_UPDATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    await service.update_product(product_id, **data.model_dump(exclude_unset=True))
    # Re-fetch with ingredients loaded
    product = await service.repository.get_with_ingredients(product_id)
    if not product:
        raise NotFoundError(f"Product {product_id} not found")
    return _build_product_read(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    _: Annotated[dict, Depends(require_permission(Permission.PRODUCT_DELETE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    deleted = await service.delete(product_id)
    if not deleted:
        raise NotFoundError(f"Product {product_id} not found")
