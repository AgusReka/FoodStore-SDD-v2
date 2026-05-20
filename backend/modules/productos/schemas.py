from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class ProductIngredientCreate(BaseModel):
    ingredient_id: UUID
    quantity: float


class ProductIngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    ingredient_id: UUID
    name: str
    quantity: float


class ProductCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    currency: str = "ARS"
    image_url: str | None = None
    is_available: bool = True
    stock_cantidad: int | None = None
    category_id: UUID
    ingredientes: list[ProductIngredientCreate] | None = None


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    currency: str | None = None
    image_url: str | None = None
    is_available: bool | None = None
    stock_cantidad: int | None = None
    category_id: UUID | None = None
    ingredientes: list[ProductIngredientCreate] | None = None


class ProductRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    price: float
    currency: str
    image_url: str | None = None
    is_available: bool
    stock_cantidad: int | None = None
    stock_disponible: int | None = None
    category_id: UUID
    ingredientes: list[ProductIngredientRead] | None = None
    created_at: datetime
    updated_at: datetime | None = None
    deleted_at: datetime | None = None


class ProductList(BaseModel):
    items: list[ProductRead]
    total: int
    page: int
    size: int


class StockDetail(BaseModel):
    product_id: UUID
    product_name: str
    stock_disponible: int | None
    stock_cantidad: int | None
    tipo: str  # "simple" or "compuesto"
    ingredientes: list[dict] | None = None
