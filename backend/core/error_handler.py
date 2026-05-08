"""Global exception handler for consistent error responses."""
from fastapi import Request
from fastapi.responses import JSONResponse

from backend.core.exceptions import (
    ConflictError,
    ForbiddenError,
    NotFoundError,
    UnauthorizedError,
    ValidationError,
)
from backend.core.logging import get_logger

logger = get_logger(__name__)

EXCEPTION_STATUS_MAP = {
    NotFoundError: 404,
    ConflictError: 409,
    ForbiddenError: 403,
    UnauthorizedError: 401,
    ValidationError: 400,
}


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle custom domain exceptions and return consistent JSON."""
    for exc_type, status_code in EXCEPTION_STATUS_MAP.items():
        if isinstance(exc, exc_type):
            logger.warning(f"{exc.code}: {exc.detail} ({request.method} {request.url.path})")
            return JSONResponse(
                status_code=status_code,
                content={"detail": exc.detail, "code": exc.code},
            )

    raise exc
