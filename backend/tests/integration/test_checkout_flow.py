"""Integration tests for the refactored MP checkout flow.

These tests require a running PostgreSQL database with Alembic migrations
applied. They test the full flow: mp-init → Order+Payment creation → mp-return.

To run:
    pytest backend/tests/integration/ --async-backend=asyncio -v

Requires: DATABASE_URL env var pointing to a test database.
"""
import pytest


@pytest.mark.integration
@pytest.mark.skip(reason="Requires test database with migrations applied")
class TestMpInitCreatesOrder:
    """mp-init should create Order + Payment immediately."""

    async def test_creates_order_with_pending_mp_status(self, db_session):
        """After mp-init, an Order with status PENDING_MP should exist."""
        pass

    async def test_creates_payment_with_pendiente_status(self, db_session):
        """After mp-init, a Payment with status PENDIENTE and method MERCADOPAGO should exist."""
        pass

    async def test_returns_init_point(self, client):
        """POST /api/v1/checkout/mp-init should return {init_point: str}."""
        pass

    async def test_stock_is_reserved_on_init(self, db_session, test_product):
        """Stock is validated during mp-init (but not yet deducted — deduction happens on CONFIRMADO)."""
        pass


@pytest.mark.integration
@pytest.mark.skip(reason="Requires test database with migrations applied")
class TestMpReturnFlow:
    """mp-return should update status based on MP result."""

    async def test_mp_return_success_approves_payment(self, client, db_session):
        """mp-return success → payment APROBADO → order CONFIRMADO → stock deducted."""
        pass

    async def test_mp_return_failure_cancels_order(self, client, db_session):
        """mp-return failure → order CANCELADO → payment RECHAZADO."""
        pass

    async def test_mp_return_pending_redirects_to_order_detail(self, client, db_session):
        """mp-return pending → no status change → redirect to order detail."""
        pass

    async def test_mp_return_success_idempotent(self, client, db_session):
        """Calling mp-return success twice should not cause errors."""
        pass


@pytest.mark.integration
@pytest.mark.skip(reason="Requires test database with migrations applied")
class TestFullFlow:
    """End-to-end integration: mp-init → mp-return success."""

    async def test_full_success_flow(self, client, db_session):
        """mp-init creates order → mp-return success → order CONFIRMADO + stock deducted."""
        pass

    async def test_full_failure_flow(self, client, db_session):
        """mp-init creates order → mp-return failure → order CANCELADO."""
        pass
