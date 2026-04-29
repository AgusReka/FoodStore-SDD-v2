"""Logging configuration and utilities."""

import logging
import sys
from typing import Any

from backend.core.config import settings


def setup_logging() -> None:
    """
    Configure application logging based on environment.
    """
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO

    # Configure root logger
    logging.basicConfig(
        level=log_level,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[logging.StreamHandler(sys.stdout)],
    )

    # Set third-party loggers to WARNING to reduce noise
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance for the given name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        logging.Logger: Configured logger instance
    """
    return logging.getLogger(name)


class StructuredLogger:
    """Logger wrapper for structured JSON logging in production."""

    def __init__(self, name: str):
        self.logger = logging.getLogger(name)

    def _log(self, level: int, message: str, **kwargs: Any) -> None:
        """Log a structured message."""
        extra = {"extra": kwargs} if kwargs else {}
        self.logger.log(level, message, **extra)

    def info(self, message: str, **kwargs: Any) -> None:
        """Log info level message."""
        self._log(logging.INFO, message, **kwargs)

    def error(self, message: str, **kwargs: Any) -> None:
        """Log error level message."""
        self._log(logging.ERROR, message, **kwargs)

    def warning(self, message: str, **kwargs: Any) -> None:
        """Log warning level message."""
        self._log(logging.WARNING, message, **kwargs)

    def debug(self, message: str, **kwargs: Any) -> None:
        """Log debug level message."""
        self._log(logging.DEBUG, message, **kwargs)


# Initialize logging on module import
setup_logging()