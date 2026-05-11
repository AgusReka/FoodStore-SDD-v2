from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import require_permission
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.modules.admin.schemas import StockAlertItem, StockAlertList, UserRoleUpdate
from backend.modules.admin.service import AdminService
from backend.modules.ingredientes.model import Ingredient, ProductIngredient
from backend.modules.productos.model import Product
from backend.modules.productos.repository import ProductRepository
from backend.modules.usuarios.repository import UserRepository
from backend.modules.usuarios.schemas import UserRead, UserList
from backend.modules.pedidos.repository import PedidoRepository
from backend.modules.pedidos.schemas import PedidoList

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
    size: int = Query(20, ge=1, le=100),
):
    user_repo = UserRepository(db)
    pedido_repo = PedidoRepository(db)
    service = AdminService(user_repo, pedido_repo)
    items, total = await service.list_all_orders(page=page, size=size)
    return PedidoList(items=list(items), total=total, page=page, size=size)
