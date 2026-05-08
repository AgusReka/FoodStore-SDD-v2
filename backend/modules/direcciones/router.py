from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.modules.direcciones.schemas import DireccionCreate, DireccionUpdate, DireccionRead, DireccionList
from backend.modules.direcciones.repository import DireccionRepository
from backend.modules.direcciones.service import DireccionService

router = APIRouter(tags=["Direcciones"])


@router.get("/", response_model=DireccionList)
async def list_my_addresses(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(current_user["user_id"])
    repo = DireccionRepository(db)
    service = DireccionService(repo)
    items = await service.list_by_user(user_id)
    total = len(items)
    return DireccionList(items=list(items), total=total, page=1, size=total or 20)


@router.post("/", response_model=DireccionRead, status_code=status.HTTP_201_CREATED)
async def create_address(
    data: DireccionCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(current_user["user_id"])
    repo = DireccionRepository(db)
    service = DireccionService(repo)
    return await service.create_address(user_id=user_id, **data.model_dump())


@router.patch("/{address_id}", response_model=DireccionRead)
async def update_address(
    address_id: UUID,
    data: DireccionUpdate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(current_user["user_id"])
    repo = DireccionRepository(db)
    service = DireccionService(repo)
    address = await service.update_address(address_id, user_id=user_id, **data.model_dump(exclude_unset=True))
    if not address:
        raise NotFoundError(f"Address {address_id} not found")
    return address


@router.delete("/{address_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_address(
    address_id: UUID,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = DireccionRepository(db)
    service = DireccionService(repo)
    deleted = await service.delete(address_id)
    if not deleted:
        raise NotFoundError(f"Address {address_id} not found")
