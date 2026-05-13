from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.auth import get_current_user, require_permission
from backend.core.database import get_db
from backend.core.enums import PaymentMethod
from backend.core.exceptions import NotFoundError
from backend.core.permissions import Permission
from backend.modules.pagos.schemas import PagoCreate, PagoUpdateStatus, PagoRead
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pagos.service import PagoService
from backend.modules.pedidos.repository import PedidoRepository

router = APIRouter(tags=["Pagos"])


@router.post("/", response_model=PagoRead, status_code=status.HTTP_201_CREATED)
async def create_payment(
    data: PagoCreate,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    service = PagoService(pago_repo, pedido_repo)
    user_id = UUID(current_user["user_id"])
    return await service.create_payment(
        order_id=data.pedido_id,
        metodo=data.payment_method,
        monto=data.amount,
        user_id=user_id,
    )


@router.get("/{payment_id}", response_model=PagoRead)
async def get_payment(
    payment_id: UUID,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    service = PagoService(pago_repo, pedido_repo)
    payment = await service.get(payment_id)
    if not payment:
        raise NotFoundError(f"Payment {payment_id} not found")
    # Verify ownership
    user_id = UUID(current_user["user_id"])
    await service._verify_order_ownership(payment.order_id, user_id)
    return payment


@router.patch("/{payment_id}/status", response_model=PagoRead)
async def update_payment_status(
    payment_id: UUID,
    data: PagoUpdateStatus,
    _: Annotated[dict, Depends(require_permission(Permission.PAYMENT_UPDATE_STATUS))],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    service = PagoService(pago_repo, pedido_repo)
    return await service.update_status(payment_id, data.status)
