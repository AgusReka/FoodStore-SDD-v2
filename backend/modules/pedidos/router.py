from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user, require_permission
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.modules.pedidos.schemas import PedidoCreate, PedidoUpdateStatus, PedidoRead, PedidoList
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.service import OrderService
from backend.modules.productos.repository import ProductRepository

router = APIRouter(tags=["Pedidos"])


@router.get("/", response_model=PedidoList)
async def list_my_orders(
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    user_id = UUID(current_user["user_id"])
    repo = PedidoRepository(db)
    product_repo = ProductRepository(db)
    service = OrderService(repo, product_repo)
    items = await service.list_by_user(user_id, skip=(page - 1) * size, limit=size)
    total = len(items)
    return PedidoList(items=list(items), total=total, page=page, size=size)


@router.get("/{order_id}", response_model=PedidoRead)
async def get_order(
    order_id: UUID,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = PedidoRepository(db)
    order = await repo.get_with_items(order_id)
    if not order:
        raise NotFoundError(f"Order {order_id} not found")
    user_id = UUID(current_user["user_id"])
    if order.user_id != user_id:
        from backend.core.exceptions import ForbiddenError
        raise ForbiddenError("Access denied")
    return order


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: PedidoCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_id = UUID(current_user["user_id"])
    repo = PedidoRepository(db)
    product_repo = ProductRepository(db)
    service = OrderService(repo, product_repo)
    items_data = [item.model_dump() for item in data.items]
    return await service.create_order(
        user_id=user_id,
        items=items_data,
        address_id=data.address_id,
    )


@router.patch("/{order_id}/status", response_model=PedidoRead)
async def update_order_status(
    order_id: UUID,
    data: PedidoUpdateStatus,
    _: Annotated[dict, Depends(require_permission(Permission.ORDER_UPDATE_STATUS))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = PedidoRepository(db)
    product_repo = ProductRepository(db)
    service = OrderService(repo, product_repo)
    return await service.update_status(order_id, data.status)
