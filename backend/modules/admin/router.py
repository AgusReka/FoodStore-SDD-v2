from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user
from backend.core.database import get_db
from backend.core.enums import UserRole
from backend.core.exceptions import ForbiddenError, NotFoundError
from backend.modules.admin.schemas import UserRoleUpdate
from backend.modules.admin.service import AdminService
from backend.modules.usuarios.repository import UserRepository
from backend.modules.usuarios.schemas import UserRead, UserList
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.schemas import PedidoList

router = APIRouter(tags=["Admin"])


async def get_admin_user(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> tuple:
    user_id = UUID(current_user["user_id"])
    repo = UserRepository(db)
    user = await repo.get(user_id)
    if not user or user.role != UserRole.ADMIN:
        raise ForbiddenError("Admin access required")
    return user, db


@router.get("/usuarios", response_model=UserList)
async def list_all_users(
    admin: Annotated[tuple, Depends(get_admin_user)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    _, db = admin
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    items, total = await service.list_all_users(page=page, size=size)
    return UserList(items=list(items), total=total, page=page, size=size)


@router.patch("/usuarios/{user_id}/role", response_model=UserRead)
async def update_user_role(
    user_id: UUID,
    data: UserRoleUpdate,
    admin: Annotated[tuple, Depends(get_admin_user)],
):
    _, db = admin
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    return await service.update_user_role(user_id, role=data.role)


@router.get("/pedidos", response_model=PedidoList)
async def list_all_orders(
    admin: Annotated[tuple, Depends(get_admin_user)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    _, db = admin
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    items, total = await service.list_all_orders(page=page, size=size)
    return PedidoList(items=list(items), total=total, page=page, size=size)
