"""Global exception handler for consistent error responses."""
from fastapi import Request
from fastapi.responses import JSONResponse

from backend.core.exceptions import (
    BadRequestError,
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
    BadRequestError: 400,
    ValidationError: 422,
}


async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Handle custom domain exceptions and return consistent JSON.

    Always returns a JSONResponse (never re-raises) so that middleware
    such as CORSMiddleware can add proper headers even on errors.
    """
    for exc_type, status_code in EXCEPTION_STATUS_MAP.items():
        if isinstance(exc, exc_type):
            logger.warning(f"{exc.code}: {exc.detail} ({request.method} {request.url.path})")
            return JSONResponse(
                status_code=status_code,
                content={"detail": exc.detail, "code": exc.code},
            )

    # Unknown/unhandled exception: return 500 with traceback logged
    logger.exception("Unhandled exception: %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "code": "INTERNAL_ERROR",
        },
    )
