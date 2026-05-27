import logging
from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user, require_permission
from backend.core.database import get_db
from backend.core.enums import OrderStatus, UserRole
from backend.core.exceptions import ForbiddenError, NotFoundError
from backend.core.permissions import Permission
from backend.core.security import decode_access_token
from backend.modules.pedidos.connection_manager import order_subscription_manager
from backend.modules.pedidos.schemas import (
    OrderHistoryRead,
    PedidoCreate,
    PedidoList,
    PedidoRead,
    PedidoUpdateStatus,
)
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
    estado: OrderStatus | None = Query(None, description="Filter by order status"),
    periodo: str | None = Query(None, description="Period filter: last_week, last_month, last_3_months, all"),
):
    user_id = UUID(current_user["user_id"])
    repo = PedidoRepository(db)
    product_repo = ProductRepository(db)
    service = OrderService(repo, product_repo)
    items, total = await service.list_by_user(
        user_id, skip=(page - 1) * size, limit=size, status=estado, periodo=periodo
    )
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
        if UserRole(current_user["role"]) != UserRole.ADMIN:
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
    current_user: Annotated[dict, Depends(require_permission(Permission.ORDER_UPDATE_STATUS))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = PedidoRepository(db)
    product_repo = ProductRepository(db)
    service = OrderService(repo, product_repo)
    user_id = UUID(current_user["user_id"])
    actor_role = UserRole(current_user["role"])
    return await service.update_status(
        order_id, data.status, changed_by=user_id, reason=data.reason, actor_role=actor_role
    )


@router.get("/{order_id}/history", response_model=list[OrderHistoryRead])
async def get_order_history(
    order_id: UUID,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    repo = PedidoRepository(db)
    order = await repo.get(order_id)
    if not order:
        raise NotFoundError(f"Order {order_id} not found")
    user_id = UUID(current_user["user_id"])
    if order.user_id != user_id:
        if UserRole(current_user["role"]) != UserRole.ADMIN:
            raise ForbiddenError("Access denied")
    history = await repo.get_history(order_id)
    return history


@router.websocket("/{order_id}/events")
async def order_ws_events(
    websocket: WebSocket,
    order_id: UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
    token: str = Query(...),
):
    """WebSocket endpoint for real-time order status updates for a specific order.

    The client connects with a JWT ``token`` query param and receives
    ``ORDER_STATUS_CHANGED`` events as JSON text frames whenever the order's
    status changes.

    Incoming messages from the client are ignored — the client is read-only.
    """
    # Validate JWT manually (WebSocket doesn't support Depends auth via header)
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        await websocket.close(code=4001)
        return

    # Validate the user owns this order or is admin
    user_id = UUID(payload["sub"])
    role_str = payload.get("role")
    try:
        user_role = UserRole(role_str) if role_str else UserRole.CLIENTE
    except ValueError:
        await websocket.close(code=4003)
        return

    if user_role != UserRole.ADMIN:
        repo = PedidoRepository(db)
        order = await repo.get(order_id)
        if not order or order.user_id != user_id:
            await websocket.close(code=4003)
            return

    await websocket.accept()
    await order_subscription_manager.subscribe(str(order_id), websocket)

    try:
        while True:
            # Read and discard client messages to detect disconnection
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Unexpected WebSocket error on order %s", order_id)
    finally:
        await order_subscription_manager.unsubscribe(str(order_id), websocket)
