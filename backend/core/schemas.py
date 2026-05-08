"""Shared Pydantic v2 schemas."""
from typing import Generic, Sequence, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated list response wrapper."""

    items: Sequence[T]
    total: int
    page: int
    size: int


class ErrorResponse(BaseModel):
    """Standard error response."""

    detail: str
    code: str


class SuccessResponse(BaseModel):
    """Standard success response."""

    message: str
