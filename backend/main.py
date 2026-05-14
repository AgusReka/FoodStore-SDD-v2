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

# Module routers
import backend.modules.auth
import backend.modules.usuarios
import backend.modules.productos
import backend.modules.categorias
import backend.modules.pedidos
import backend.modules.pagos
import backend.modules.pagos.mercadopago
import backend.modules.direcciones
import backend.modules.ingredientes
import backend.modules.admin
import backend.modules.checkout
from backend.core.error_handler import global_exception_handler
from backend.core.logging import get_logger
from backend.core.middleware import RequestIDMiddleware
# Import all models so they're registered with Base.metadata
import backend.modules.usuarios.model  # noqa: F401
import backend.modules.auth.model  # noqa: F401
import backend.modules.refreshtokens.model  # noqa: F401
import backend.modules.categorias.model  # noqa: F401
import backend.modules.productos.model  # noqa: F401
import backend.modules.direcciones.model  # noqa: F401
import backend.modules.ingredientes.model  # noqa: F401
import backend.modules.pedidos.model  # noqa: F401
import backend.modules.pagos.model  # noqa: F401
import backend.modules.checkout.model  # noqa: F401
from backend.core.models import Base

logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager for startup/shutdown events.
    """
    # Startup
    logger.info("Starting Food Store API")

    # Tables are managed via Alembic migrations
    if settings.ENVIRONMENT == "development":
        logger.info("Development mode: use 'alembic upgrade head' to apply migrations")

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

# Register global exception handlers
app.add_exception_handler(Exception, global_exception_handler)

# Include routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(backend.modules.auth.router, prefix="/api/v1/auth")
app.include_router(backend.modules.usuarios.router, prefix="/api/v1/usuarios")
app.include_router(backend.modules.productos.router, prefix="/api/v1/productos")
app.include_router(backend.modules.categorias.router, prefix="/api/v1/categorias")
app.include_router(backend.modules.pedidos.router, prefix="/api/v1/pedidos")
app.include_router(backend.modules.pagos.router, prefix="/api/v1/pagos")
app.include_router(backend.modules.pagos.mercadopago.router, prefix="/api/v1/pagos/mercadopago")
app.include_router(backend.modules.direcciones.router, prefix="/api/v1/direcciones")
app.include_router(backend.modules.ingredientes.router, prefix="/api/v1/ingredientes")
app.include_router(backend.modules.admin.router, prefix="/api/v1/admin")
app.include_router(backend.modules.checkout.router, prefix="/api/v1/checkout")


@app.get("/")
async def root() -> dict:
    """Root endpoint."""
    return {
        "name": "Food Store API",
        "version": "1.0.0",
        "status": "running",
    }