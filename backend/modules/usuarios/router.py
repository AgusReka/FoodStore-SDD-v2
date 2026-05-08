from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.modules.usuarios.schemas import UserCreate, UserUpdate, UserRead, UserList
from backend.modules.usuarios.repository import UserRepository
from backend.modules.usuarios.service import UserService

router = APIRouter(tags=["Usuarios"])


@router.get("/", response_model=UserList)
async def list_users(
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    search: str | None = Query(None),
):
    repo = UserRepository(db)
    service = UserService(repo)
    if search:
        items = await service.search_users(search, skip=(page - 1) * size, limit=size)
        total = len(items)
    else:
        items, total = await service.paginate_users(page=page, size=size)
    return UserList(items=list(items), total=total, page=page, size=size)


@router.get("/{user_id}", response_model=UserRead)
async def get_user(user_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = UserRepository(db)
    service = UserService(repo)
    user = await service.get(user_id)
    if not user:
        raise NotFoundError(f"User {user_id} not found")
    return user


@router.post("/", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def create_user(data: UserCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = UserRepository(db)
    service = UserService(repo)
    return await service.create_user(**data.model_dump())


@router.patch("/{user_id}", response_model=UserRead)
async def update_user(user_id: UUID, data: UserUpdate, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = UserRepository(db)
    service = UserService(repo)
    return await service.update_user(user_id, **data.model_dump(exclude_unset=True))


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    repo = UserRepository(db)
    service = UserService(repo)
    deleted = await service.delete(user_id)
    if not deleted:
        raise NotFoundError(f"User {user_id} not found")
