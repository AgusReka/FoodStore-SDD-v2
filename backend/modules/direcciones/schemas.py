from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict


class DireccionCreate(BaseModel):
    street: str
    street_number: str | None = None
    city: str
    postal_code: str
    latitude: float | None = None
    longitude: float | None = None
    is_primary: bool = False


class DireccionUpdate(BaseModel):
    street: str | None = None
    street_number: str | None = None
    city: str | None = None
    postal_code: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    is_primary: bool | None = None


class DireccionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    street: str
    street_number: str | None = None
    city: str
    postal_code: str
    latitude: float | None = None
    longitude: float | None = None
    is_primary: bool
    created_at: datetime
    updated_at: datetime | None = None


class DireccionList(BaseModel):
    items: list[DireccionRead]
    total: int
    page: int
    size: int
