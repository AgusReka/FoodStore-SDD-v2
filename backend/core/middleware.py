"""Request ID middleware for distributed tracing."""

import uuid
from typing import Callable

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

from backend.core.logging import get_logger

logger = get_logger(__name__)


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add request ID to each request for tracing."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        """
        Process request and add request ID header.

        Args:
            request: Incoming HTTP request
            call_next: Next middleware or route handler

        Returns:
            Response with request ID header
        """
        # Generate or extract request ID
        request_id = request.headers.get("x-request-id", str(uuid.uuid4()))

        # Attach request ID to request state for use in handlers
        request.state.request_id = request_id

        # Log incoming request
        logger.info(f"Incoming request: {request.method} {request.url.path}")

        # Process request
        response = await call_next(request)

        # Add request ID to response headers
        response.headers["x-request-id"] = request_id

        return response