from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from backend.core.enums import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int


class PedidoCreate(BaseModel):
    items: list[OrderItemCreate]
    address_id: UUID | None = None


class PedidoUpdateStatus(BaseModel):
    status: OrderStatus


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    product_id: UUID
    quantity: int
    unit_price: float
    subtotal: float


class PedidoRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    address_id: UUID | None = None
    status: OrderStatus
    total: float
    currency: str
    items: list[OrderItemRead]
    created_at: datetime
    updated_at: datetime | None = None


class PedidoList(BaseModel):
    items: list[PedidoRead]
    total: int
    page: int
    size: int
