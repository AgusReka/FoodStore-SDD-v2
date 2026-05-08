from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, ConfigDict

from backend.core.enums import UserRole


class UserCreate(BaseModel):
    email: str
    username: str
    password: str
    first_name: str
    last_name: str
    phone: str | None = None
    avatar_url: str | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    username: str | None = None
    first_name: str | None = None
    last_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None
    is_active: bool | None = None
    is_verified: bool | None = None


class UserRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    username: str
    first_name: str
    last_name: str
    phone: str | None = None
    avatar_url: str | None = None
    is_active: bool
    is_verified: bool
    role: UserRole
    created_at: datetime
    updated_at: datetime | None = None


class UserList(BaseModel):
    items: list[UserRead]
    total: int
    page: int
    size: int
