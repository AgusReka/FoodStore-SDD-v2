import logging
from datetime import datetime
from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import require_permission
from backend.core.database import get_db
from backend.core.enums import OrderStatus, UserRole
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.core.security import decode_access_token
from backend.modules.admin.schemas import StockAlertItem, StockAlertList, UserRoleUpdate
from backend.modules.admin.service import AdminService
from backend.modules.ingredientes.model import Ingredient, ProductIngredient
from backend.modules.pedidos.connection_manager import admin_manager
from backend.modules.productos.model import Product
from backend.modules.productos.repository import ProductRepository
from backend.modules.usuarios.repository import UserRepository
from backend.modules.usuarios.schemas import UserRead, UserList
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.schemas import PedidoList

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Admin"])


@router.get("/usuarios", response_model=UserList)
async def list_all_users(
    _: Annotated[dict, Depends(require_permission(Permission.USER_LIST))],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    items, total = await service.list_all_users(page=page, size=size)
    return UserList(items=list(items), total=total, page=page, size=size)


@router.patch("/usuarios/{user_id}/role", response_model=UserRead)
async def update_user_role(
    user_id: UUID,
    data: UserRoleUpdate,
    _: Annotated[dict, Depends(require_permission(Permission.USER_CHANGE_ROLE))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    return await service.update_user_role(user_id, role=data.role)


@router.get("/stock-alerts", response_model=StockAlertList)
async def get_stock_alerts(
    _: Annotated[dict, Depends(require_permission(Permission.ORDER_LIST_ALL))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """List all ingredients with stock below their minimum threshold."""
    from sqlalchemy import select

    product_repo = ProductRepository(db)
    ingredients = await product_repo.get_low_stock_ingredients()

    items = []
    for ing in ingredients:
        # Find products that use this ingredient
        stmt = select(ProductIngredient).where(
            ProductIngredient.ingredient_id == ing.id
        )
        result = await db.execute(stmt)
        product_links = result.scalars().all()

        products_affected = []
        for pl in product_links:
            prod_stmt = select(Product).where(Product.id == pl.product_id)
            prod_result = await db.execute(prod_stmt)
            prod = prod_result.scalar_one_or_none()
            if prod:
                products_affected.append(prod.name)

        deficit = ing.stock_minimo - ing.stock_actual
        severity = deficit / ing.stock_minimo if ing.stock_minimo > 0 else 1.0

        items.append(StockAlertItem(
            ingredient_id=str(ing.id),
            name=ing.name,
            unit=ing.unit,
            stock_actual=float(ing.stock_actual),
            stock_minimo=float(ing.stock_minimo),
            deficit=float(deficit),
            severity=float(severity),
            products_affected=products_affected,
        ))

    return StockAlertList(items=items, total=len(items))


@router.get("/pedidos", response_model=PedidoList)
async def list_all_orders(
    _: Annotated[dict, Depends(require_permission(Permission.ORDER_LIST_ALL))],
    db: Annotated[AsyncSession, Depends(get_db)],
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=500),
    estado: OrderStatus | None = Query(None, description="Filter by order status"),
    desde: datetime | None = Query(None, description="Filter orders created after this date (ISO 8601)"),
    hasta: datetime | None = Query(None, description="Filter orders created before this date (ISO 8601)"),
):
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    items, total = await service.list_all_orders(page=page, size=size, estado=estado, desde=desde, hasta=hasta)
    return PedidoList(items=list(items), total=total, page=page, size=size)


@router.websocket("/pedidos/events")
async def admin_orders_ws(websocket: WebSocket, token: str = Query(...)):
    """WebSocket endpoint for real-time admin order updates.

    The admin connects with a JWT ``token`` query param and receives
    JSON events as text frames:
    - ORDER_STATUS_CHANGED: any order's status changed
    - NUEVO_PEDIDO: a new order was created

    Requires admin role.
    """
    # Validate JWT manually
    payload = decode_access_token(token)
    if payload is None or "sub" not in payload:
        await websocket.close(code=4001)
        return

    # Validate admin role
    role_str = payload.get("role")
    try:
        user_role = UserRole(role_str) if role_str else UserRole.CLIENTE
    except ValueError:
        await websocket.close(code=4003)
        return

    if user_role != UserRole.ADMIN:
        await websocket.close(code=4003)
        return

    await websocket.accept()
    await admin_manager.connect(websocket)

    try:
        while True:
            # Read and discard client messages to detect disconnection
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    except Exception:
        logger.exception("Unexpected WebSocket error on admin events")
    finally:
        await admin_manager.disconnect(websocket)
