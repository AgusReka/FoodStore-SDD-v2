"""Checkout session Pydantic schemas."""
from uuid import UUID

from pydantic import BaseModel, Field


class CheckoutItemRequest(BaseModel):
    product_id: UUID
    quantity: int = Field(gt=0, description="Must be at least 1")


class MpInitRequest(BaseModel):
    items: list[CheckoutItemRequest] = Field(min_length=1)
    direccion_id: UUID
    observaciones: str | None = None


class MpInitResponse(BaseModel):
    init_point: str
