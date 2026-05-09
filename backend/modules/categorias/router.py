from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import require_permission
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead, CategoriaList
from backend.modules.categorias.repository import CategoriaRepository
from backend.modules.categorias.service import CategoriaService

router = APIRouter(tags=["Categorias"])


@router.get("/", response_model=CategoriaList)
async def list_categorias(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    repo = CategoriaRepository(db)
    service = CategoriaService(repo)
    items, total = await service.paginate(page=page, size=size)
    return CategoriaList(items=list(items), total=total, page=page, size=size)


@router.get("/{categoria_id}", response_model=CategoriaRead)
async def get_categoria(categoria_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = CategoriaRepository(db)
    service = CategoriaService(repo)
    categoria = await service.get(categoria_id)
    if not categoria:
        raise NotFoundError(f"Category {categoria_id} not found")
    return categoria


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
async def create_categoria(
    data: CategoriaCreate,
    _: Annotated[dict, Depends(require_permission(Permission.CATEGORY_CREATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CategoriaRepository(db)
    service = CategoriaService(repo)
    return await service.create(**data.model_dump())


@router.patch("/{categoria_id}", response_model=CategoriaRead)
async def update_categoria(
    categoria_id: UUID,
    data: CategoriaUpdate,
    _: Annotated[dict, Depends(require_permission(Permission.CATEGORY_UPDATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CategoriaRepository(db)
    service = CategoriaService(repo)
    categoria = await service.update(categoria_id, **data.model_dump(exclude_unset=True))
    if not categoria:
        raise NotFoundError(f"Category {categoria_id} not found")
    return categoria


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_categoria(
    categoria_id: UUID,
    _: Annotated[dict, Depends(require_permission(Permission.CATEGORY_DELETE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = CategoriaRepository(db)
    service = CategoriaService(repo)
    await service.delete_categoria(categoria_id)
