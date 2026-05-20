from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import require_permission
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.modules.ingredientes.schemas import IngredientCreate, IngredientUpdate, IngredientRead, IngredientList
from backend.modules.ingredientes.repository import IngredientRepository
from backend.modules.ingredientes.service import IngredientService

router = APIRouter(tags=["Ingredientes"])


@router.get("/", response_model=IngredientList)
async def list_ingredients(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
    include_deleted: bool = Query(False),
):
    repo = IngredientRepository(db)
    service = IngredientService(repo)
    if search:
        items = await service.search_ingredients(search, skip=(page - 1) * size, limit=size, include_deleted=include_deleted)
        total = len(items)
    else:
        items, total = await service.paginate_ingredients(page=page, size=size, include_deleted=include_deleted)
    return IngredientList(items=list(items), total=total, page=page, size=size)


@router.get("/{ingredient_id}", response_model=IngredientRead)
async def get_ingredient(ingredient_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = IngredientRepository(db)
    service = IngredientService(repo)
    ingredient = await service.get(ingredient_id)
    if not ingredient:
        raise NotFoundError(f"Ingredient {ingredient_id} not found")
    return ingredient


@router.post("/", response_model=IngredientRead, status_code=status.HTTP_201_CREATED)
async def create_ingredient(
    data: IngredientCreate,
    _: Annotated[dict, Depends(require_permission(Permission.INGREDIENT_CREATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = IngredientRepository(db)
    service = IngredientService(repo)
    return await service.create_ingredient(**data.model_dump())


@router.patch("/{ingredient_id}", response_model=IngredientRead)
async def update_ingredient(
    ingredient_id: UUID,
    data: IngredientUpdate,
    _: Annotated[dict, Depends(require_permission(Permission.INGREDIENT_UPDATE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = IngredientRepository(db)
    service = IngredientService(repo)
    return await service.update_ingredient(ingredient_id, **data.model_dump(exclude_unset=True))


@router.delete("/{ingredient_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_ingredient(
    ingredient_id: UUID,
    _: Annotated[dict, Depends(require_permission(Permission.INGREDIENT_DELETE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = IngredientRepository(db)
    service = IngredientService(repo)
    await service.delete_ingredient(ingredient_id)
