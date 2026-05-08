from uuid import UUID
from typing import Annotated
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.modules.pagos.schemas import PagoCreate, PagoUpdateStatus, PagoRead
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pagos.service import PagoService
from backend.modules.pedidos.repository import PedidoRepository

router = APIRouter(tags=["Pagos"])


@router.post("/", response_model=PagoRead, status_code=status.HTTP_201_CREATED)
async def create_payment(data: PagoCreate, db: Annotated[AsyncSession, Depends(get_db)]):
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    service = PagoService(pago_repo, pedido_repo)
    return await service.create_payment(
        order_id=data.pedido_id,
        metodo=data.payment_method,
        monto=data.amount,
    )


@router.get("/{payment_id}", response_model=PagoRead)
async def get_payment(payment_id: UUID, db: Annotated[AsyncSession, Depends(get_db)]):
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    service = PagoService(pago_repo, pedido_repo)
    payment = await service.get(payment_id)
    if not payment:
        raise NotFoundError(f"Payment {payment_id} not found")
    return payment


@router.patch("/{payment_id}/status", response_model=PagoRead)
async def update_payment_status(
    payment_id: UUID,
    data: PagoUpdateStatus,
    db: Annotated[AsyncSession, Depends(get_db)],
):
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    service = PagoService(pago_repo, pedido_repo)
    return await service.update_status(payment_id, data.status)
