"""Integration tests for KDS REST API endpoints (cocina router).

Uses FastAPI TestClient with mocked DB and overridden auth dependencies.
Tests permission enforcement, valid/invalid transitions, and health check.
"""
import pytest
from unittest.mock import AsyncMock, patch, PropertyMock
from uuid import uuid4
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.testclient import TestClient

from backend.core.enums import OrderStatus
from backend.core.exceptions import ForbiddenError, NotFoundError, ValidationError
from backend.modules.cocina.router import router
from backend.modules.cocina.schemas import CocinaPedidoRead, CocinaPedidoItem


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_pedido_read(estado: OrderStatus = OrderStatus.CONFIRMADO) -> CocinaPedidoRead:
    return CocinaPedidoRead(
        id=uuid4(),
        items=[CocinaPedidoItem(nombre="Pizza", cantidad=1, subtotal=120.0)],
        estado=estado,
        confirmed_at=datetime.now(timezone.utc),
    )


COCINA_USER = {"user_id": str(uuid4()), "email": "cocina@test.com", "role": "cocina"}
ADMIN_USER = {"user_id": str(uuid4()), "email": "admin@test.com", "role": "admin"}
CLIENTE_USER = {"user_id": str(uuid4()), "email": "cliente@test.com", "role": "cliente"}


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def app():
    _app = FastAPI()
    _app.include_router(router, prefix="/api/v1/cocina")

    _app.add_exception_handler(ForbiddenError, lambda r, e: JSONResponse(
        status_code=403, content={"detail": e.detail, "code": e.code},
    ))
    _app.add_exception_handler(NotFoundError, lambda r, e: JSONResponse(
        status_code=404, content={"detail": e.detail, "code": e.code},
    ))
    _app.add_exception_handler(ValidationError, lambda r, e: JSONResponse(
        status_code=422, content={"detail": e.detail, "code": e.code},
    ))
    return _app


@pytest.fixture
def client(app):
    return TestClient(app)


def override_auth(user: dict):
    async def _override():
        return user
    return _override


async def mock_db():
    """Return a generic AsyncMock usable where the session is never actually called
    (service methods are patched)."""
    return AsyncMock()


# ---------------------------------------------------------------------------
# GET /api/v1/cocina/pedidos
# ---------------------------------------------------------------------------

class TestListPedidos:
    """Tests for the kitchen orders listing endpoint."""

    def test_returns_orders_for_cocina_role(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        mock_read = make_pedido_read()
        mock_svc = AsyncMock()
        mock_svc.list_pedidos = AsyncMock(return_value=([mock_read], 1, 0))

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.get("/api/v1/cocina/pedidos")

        assert resp.status_code == 200
        data = resp.json()
        assert data["por_preparar"] == 1
        assert data["en_preparacion"] == 0
        assert len(data["items"]) == 1
        assert data["items"][0]["estado"] == "confirmado"

    def test_returns_orders_for_admin_role(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        mock_read = make_pedido_read(estado=OrderStatus.PREPARANDO)
        mock_svc = AsyncMock()
        mock_svc.list_pedidos = AsyncMock(return_value=([mock_read], 0, 1))

        app.dependency_overrides[get_current_user] = override_auth(ADMIN_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.get("/api/v1/cocina/pedidos")

        assert resp.status_code == 200
        data = resp.json()
        assert data["por_preparar"] == 0
        assert data["en_preparacion"] == 1

    def test_returns_403_for_cliente_role(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        app.dependency_overrides[get_current_user] = override_auth(CLIENTE_USER)
        app.dependency_overrides[get_db] = mock_db

        resp = client.get("/api/v1/cocina/pedidos")
        assert resp.status_code == 403
        assert resp.json()["detail"] == "Permission 'kitchen:view' required"

    def test_returns_401_without_token(self, app, client):
        """No Authorization header → OAuth2 scheme raises 401."""
        resp = client.get("/api/v1/cocina/pedidos")
        assert resp.status_code == 401

    def test_empty_list_when_no_kitchen_orders(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        mock_svc = AsyncMock()
        mock_svc.list_pedidos = AsyncMock(return_value=([], 0, 0))

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.get("/api/v1/cocina/pedidos")

        assert resp.status_code == 200
        data = resp.json()
        assert data["items"] == []
        assert data["por_preparar"] == 0
        assert data["en_preparacion"] == 0


# ---------------------------------------------------------------------------
# PATCH /api/v1/cocina/pedidos/{id}/estado
# ---------------------------------------------------------------------------

class TestUpdatePedidoEstado:
    """Tests for the kitchen order status update endpoint."""

    def test_valid_transition_confirmado_to_preparando(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        mock_read = make_pedido_read(estado=OrderStatus.PREPARANDO)
        mock_svc = AsyncMock()
        mock_svc.update_pedido_estado = AsyncMock(return_value=mock_read)

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.patch(
                f"/api/v1/cocina/pedidos/{uuid4()}/estado",
                json={"nuevo_estado": "preparando"},
            )

        assert resp.status_code == 200
        assert resp.json()["estado"] == "preparando"

    def test_valid_transition_preparando_to_enviado(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        mock_read = make_pedido_read(estado=OrderStatus.ENVIADO)
        mock_svc = AsyncMock()
        mock_svc.update_pedido_estado = AsyncMock(return_value=mock_read)

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.patch(
                f"/api/v1/cocina/pedidos/{uuid4()}/estado",
                json={"nuevo_estado": "enviado"},
            )

        assert resp.status_code == 200
        assert resp.json()["estado"] == "enviado"

    def test_invalid_transition_returns_422(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db
        from backend.core.exceptions import ValidationError

        mock_svc = AsyncMock()
        mock_svc.update_pedido_estado = AsyncMock(
            side_effect=ValidationError("Invalid transition from 'preparando' to 'confirmado'"),
        )

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.patch(
                f"/api/v1/cocina/pedidos/{uuid4()}/estado",
                json={"nuevo_estado": "confirmado"},
            )

        assert resp.status_code == 422
        assert "Invalid transition" in resp.json()["detail"]

    def test_unauthorized_role_returns_403(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        app.dependency_overrides[get_current_user] = override_auth(CLIENTE_USER)
        app.dependency_overrides[get_db] = mock_db

        resp = client.patch(
            f"/api/v1/cocina/pedidos/{uuid4()}/estado",
            json={"nuevo_estado": "preparando"},
        )
        assert resp.status_code == 403
        assert resp.json()["detail"] == "Permission 'kitchen:update_status' required"

    def test_returns_401_without_token(self, app, client):
        resp = client.patch(
            f"/api/v1/cocina/pedidos/{uuid4()}/estado",
            json={"nuevo_estado": "preparando"},
        )
        assert resp.status_code == 401

    def test_not_found_returns_404(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db
        from backend.core.exceptions import NotFoundError

        mock_svc = AsyncMock()
        mock_svc.update_pedido_estado = AsyncMock(
            side_effect=NotFoundError("Order not found"),
        )

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        with patch("backend.modules.cocina.router.CocinaService", return_value=mock_svc):
            resp = client.patch(
                f"/api/v1/cocina/pedidos/{uuid4()}/estado",
                json={"nuevo_estado": "preparando"},
            )

        assert resp.status_code == 404

    def test_invalid_status_value_returns_422(self, app, client):
        from backend.core.auth import get_current_user
        from backend.core.database import get_db

        app.dependency_overrides[get_current_user] = override_auth(COCINA_USER)
        app.dependency_overrides[get_db] = mock_db

        resp = client.patch(
            f"/api/v1/cocina/pedidos/{uuid4()}/estado",
            json={"nuevo_estado": "invalid_status"},
        )
        assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /api/v1/cocina/health
# ---------------------------------------------------------------------------

class TestHealth:
    """Health check endpoint — no auth required."""

    def test_health_returns_active_connection_count(self, app, client):
        from backend.modules.cocina.connection_manager import WebSocketManager, connection_manager

        with patch.object(WebSocketManager, "active_count", PropertyMock(return_value=5)):
            resp = client.get("/api/v1/cocina/health")

        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"
        assert data["active_connections"] == 5

    def test_health_returns_zero_when_no_connections(self, client):
        resp = client.get("/api/v1/cocina/health")
        assert resp.status_code == 200
        assert resp.json()["active_connections"] >= 0
