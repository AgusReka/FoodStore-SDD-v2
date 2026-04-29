"""FastAPI application entry point."""
import sys
from pathlib import Path

# Add project root to path so 'backend' package can be found
# This file is in backend/, so parent is the project root
sys.path.append(str(Path(__file__).parent.parent))

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.v1.health import router as health_router
from backend.core.config import settings
from backend.core.database import engine
from backend.core.logging import get_logger
from backend.core.middleware import RequestIDMiddleware
from backend.core.models import Base

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager for startup/shutdown events.
    """
    # Startup
    logger.info("Starting Food Store API")

    # Create tables on startup (for development)
    if settings.ENVIRONMENT == "development":
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("Database tables created")

    yield

    # Shutdown
    logger.info("Shutting down Food Store API")
    await engine.dispose()


# Create FastAPI application
app = FastAPI(
    title="Food Store API",
    description="Backend API for Food Store e-commerce platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(RequestIDMiddleware)

# Include routers
app.include_router(health_router, prefix="/api/v1")


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "name": "Food Store API",
        "version": "1.0.0",
        "status": "running",
    }