from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.modules.productos.schemas import ProductCreate, ProductUpdate, ProductRead, ProductList
from backend.modules.productos.repository import ProductRepository
from backend.modules.productos.service import ProductService
from backend.modules.categorias.repository import CategoriaRepository

router = APIRouter(tags=["Productos"])


@router.get("/", response_model=ProductList)
async def list_products(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    categoria_id: UUID | None = Query(None),
):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    if search:
        items = await service.search_products(search, skip=(page - 1) * size, limit=size)
        total = len(items)
    elif categoria_id:
        items = await service.filter_by_category(categoria_id, skip=(page - 1) * size, limit=size)
        total = len(items)
    else:
        items, total = await service.paginate_products(page=page, size=size)
    return ProductList(items=list(items), total=total, page=page, size=size)


@router.get("/{product_id}", response_model=ProductRead)
async def get_product(product_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    product = await service.get(product_id)
    if not product:
        raise NotFoundError(f"Product {product_id} not found")
    return product


@router.post("/", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    return await service.create_product(**data.model_dump())


@router.patch("/{product_id}", response_model=ProductRead)
async def update_product(product_id: UUID, data: ProductUpdate, db: Annotated[AsyncSession, Depends(get_db)]):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    return await service.update_product(product_id, **data.model_dump(exclude_unset=True))


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    product_repo = ProductRepository(db)
    categoria_repo = CategoriaRepository(db)
    service = ProductService(product_repo, categoria_repo)
    deleted = await service.delete(product_id)
    if not deleted:
        raise NotFoundError(f"Product {product_id} not found")
