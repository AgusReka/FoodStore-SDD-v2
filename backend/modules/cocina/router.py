"""Kitchen Display System router — WebSocket events + REST endpoints."""
import logging
from uuid import UUID
from typing import Annotated

from fastapi import APIRouter, Depends, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.auth import get_current_user, require_permission
from backend.core.database import get_db
from backend.core.enums import UserRole
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission, ROLE_PERMISSIONS
from backend.core.security import decode_access_token
from backend.modules.cocina.connection_manager import connection_manager
from backend.modules.cocina.schemas import CocinaPedidoList, CocinaPedidoRead, CocinaUpdateStatus
from backend.modules.cocina.service import CocinaService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Cocina (KDS)"])


@router.get("/pedidos", response_model=CocinaPedidoList)
async def list_kitchen_orders(
    current_user: Annotated[dict, Depends(require_permission(Permission.KITCHEN_VIEW))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all orders relevant to the kitchen (CONFIRMADO and PREPARANDO).

    Returns orders ordered by age (oldest first) so the cook
    knows what to prioritize.
    """
    service = CocinaService(db)
    items, por_preparar, en_preparacion = await service.list_pedidos()
    return CocinaPedidoList(
        items=items,
        por_preparar=por_preparar,
        en_preparacion=en_preparacion,
    )


@router.patch("/pedidos/{order_id}/estado", response_model=CocinaPedidoRead)
async def update_kitchen_order_status(
    order_id: UUID,
    data: CocinaUpdateStatus,
    current_user: Annotated[dict, Depends(require_permission(Permission.KITCHEN_UPDATE_STATUS))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Update the status of a kitchen order.

    Only transitions valid for the user's role are allowed:
    - COCINA: CONFIRMADO → PREPARANDO, PREPARANDO → ENVIADO
    - PEDIDOS/ADMIN: any kitchen transition
    """
    service = CocinaService(db)
    return await service.update_pedido_estado(order_id, data.nuevo_estado, current_user)


@router.websocket("/events")
async def kitchen_ws_events(websocket: WebSocket, token: str = Query(...)):
    """WebSocket endpoint for real-time kitchen updates.

    The client connects with a JWT ``token`` query param and receives
    JSON events as text frames:
    - PEDIDO_CONFIRMADO: new order ready to cook
    - PEDIDO_EN_PREPARACION: order moved to "en preparación"
    - PEDIDO_EN_CAMINO: order marked as done (removed from KDS)
    - PEDIDO_CANCELADO: order cancelled

    Incoming messages from the client are ignored — the KDS is
    read-only from the client's perspective.
    """
    # Validate JWT manually (WebSocket doesn't support Depends auth)
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        await websocket.close(code=4001)
        return

    # Check permission from the user's role
    role_str = payload.get("role")
    if role_str is None:
        await websocket.close(code=4003)
        return

    try:
        user_role = UserRole(role_str)
    except ValueError:
        await websocket.close(code=4003)
        return

    # Admin bypass
    if user_role != UserRole.ADMIN:
        permissions = ROLE_PERMISSIONS.get(user_role, set())
        if Permission.KITCHEN_VIEW not in permissions:
            await websocket.close(code=4003)
            return

    await websocket.accept()
    await connection_manager.connect(websocket)

    try:
        while True:
            # Read and discard any client messages. We don't expect any
            # from the KDS, but we must consume them to detect
            # disconnection.
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Unexpected WebSocket error")
    finally:
        await connection_manager.disconnect(websocket)


@router.get("/health")
async def kitchen_health():
    """Health check for the KDS module."""
    return {
        "status": "ok",
        "active_connections": connection_manager.active_count,
    }
