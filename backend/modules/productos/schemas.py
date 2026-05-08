from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    currency: str = "ARS"
    image_url: str | None = None
    is_available: bool = True
    category_id: UUID


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    currency: str | None = None
    image_url: str | None = None
    is_available: bool | None = None
    category_id: UUID | None = None


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    price: float
    currency: str
    image_url: str | None = None
    is_available: bool
    category_id: UUID
    created_at: datetime
    updated_at: datetime | None = None


class ProductList(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    size: int
