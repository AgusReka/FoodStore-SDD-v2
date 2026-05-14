from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from backend.core.enums import PaymentMethod, PaymentStatus


class PagoCreate(BaseModel):
    pedido_id: UUID
    payment_method: PaymentMethod
    amount: float


class PagoUpdateStatus(BaseModel):
    status: PaymentStatus


class PagoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    order_id: UUID
    payment_method: PaymentMethod
    status: PaymentStatus
    amount: float
    currency: str
    mp_payment_id: str | None = None
    mp_preference_id: str | None = None
    mp_init_point: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class PagoList(BaseModel):
    items: list[PagoRead]
    total: int
    page: int
    size: int
