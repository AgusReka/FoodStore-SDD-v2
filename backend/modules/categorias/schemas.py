from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class CategoriaCreate(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None


class CategoriaUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    image_url: str | None = None
    is_active: bool | None = None


class CategoriaRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None = None
    image_url: str | None = None
    is_active: bool
    created_at: datetime
    updated_at: datetime | None = None


class CategoriaList(BaseModel):
    items: list[CategoriaRead]
    total: int
    page: int
    size: int
