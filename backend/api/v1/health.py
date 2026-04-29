"""Health check endpoints for container orchestration."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.database import get_db

router = APIRouter(prefix="/health", tags=["health"])


@router.get("")
async def health_check(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Basic health check endpoint.

    Args:
        db: Database session

    Returns:
        dict: Health status
    """
    return {"status": "healthy"}


@router.get("/ready")
async def readiness_check(db: AsyncSession = Depends(get_db)) -> dict:
    """
    Readiness probe - checks if all dependencies are available.

    Args:
        db: Database session

    Returns:
        dict: Readiness status

    Raises:
        HTTPException: If database is not available (503)
    """
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "ready", "database": "connected"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"status": "not_ready", "database": "disconnected", "error": str(e)},
        )


@router.get("/live")
async def liveness_check() -> dict:
    """
    Liveness probe - checks if application is running.

    Returns:
        dict: Liveness status
    """
    return {"status": "alive"}