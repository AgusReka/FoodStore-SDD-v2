"""Pydantic schemas for the Kitchen Display System (cocina module)."""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from backend.core.enums import OrderStatus


class CocinaPedidoItem(BaseModel):
    """A single item in a kitchen order."""
    nombre: str
    cantidad: int
    personalizacion: list[str] | None = None
    subtotal: float


class CocinaPedidoRead(BaseModel):
    """Order as seen by the kitchen display."""
    id: UUID
    numero: int | None = None
    items: list[CocinaPedidoItem]
    notas: str | None = None
    estado: OrderStatus
    confirmed_at: datetime  # When order entered CONFIRMADO status
    tiempo_espera_minutos: int = 0

    model_config = ConfigDict(from_attributes=True)


class CocinaPedidoList(BaseModel):
    """List of kitchen orders."""
    items: list[CocinaPedidoRead]
    por_preparar: int
    en_preparacion: int


class CocinaUpdateStatus(BaseModel):
    """Request to update an order status from the kitchen."""
    nuevo_estado: OrderStatus


class SSEEvent(BaseModel):
    """SSE event payload."""
    event: str
    data: dict
    timestamp: str
