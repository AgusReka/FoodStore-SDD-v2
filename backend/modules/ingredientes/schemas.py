from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class IngredientCreate(BaseModel):
    name: str
    description: str | None = None
    unit: str
    stock_actual: float = 0
    stock_minimo: float = 0
    image_url: str | None = None


class IngredientUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    unit: str | None = None
    stock_actual: float | None = None
    stock_minimo: float | None = None
    image_url: str | None = None


class IngredientRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    unit: str
    stock_actual: float
    stock_minimo: float
    stock_suficiente: bool = False
    image_url: str | None = None
    created_at: datetime
    updated_at: datetime | None = None


class IngredientList(BaseModel):
    items: list[IngredientRead]
    total: int
    page: int
    size: int
