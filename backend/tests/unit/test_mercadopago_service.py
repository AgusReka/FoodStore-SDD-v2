"""Unit tests for MercadoPagoService — pure logic, mocked SDK."""
from unittest.mock import AsyncMock, MagicMock, patch
from uuid import uuid4

import pytest

from backend.core.enums import PaymentMethod, PaymentStatus
from backend.modules.pagos.mercadopago.mp_service import (
    MercadoPagoService,
    map_mp_status,
)


@pytest.fixture
def mock_repo():
    repo = MagicMock()
    repo.get = AsyncMock()
    repo.update = AsyncMock()
    repo.get_by_mp_payment_id = AsyncMock()
    return repo


@pytest.fixture
def mock_pago_service(mock_repo):
    svc = MagicMock()
    svc.repository = mock_repo
    svc.process_status_update = AsyncMock()
    return svc


@pytest.fixture
def mp_service(mock_pago_service):
    svc = MercadoPagoService(mock_pago_service)
    svc._sdk = MagicMock()  # Prevent lazy-init from checking config
    return svc


class TestMapMpStatus:
    """All MP → internal status mappings."""

    def test_approved(self):
        assert map_mp_status("approved") == PaymentStatus.APROBADO

    def test_rejected(self):
        assert map_mp_status("rejected") == PaymentStatus.RECHAZADO

    def test_cancelled(self):
        assert map_mp_status("cancelled") == PaymentStatus.RECHAZADO

    def test_charged_back(self):
        assert map_mp_status("charged_back") == PaymentStatus.RECHAZADO

    def test_in_process(self):
        assert map_mp_status("in_process") == PaymentStatus.PENDIENTE

    def test_in_mediation(self):
        assert map_mp_status("in_mediation") == PaymentStatus.PENDIENTE

    def test_pending(self):
        assert map_mp_status("pending") == PaymentStatus.PENDIENTE

    def test_refunded(self):
        assert map_mp_status("refunded") == PaymentStatus.REEMBOLSADO

    def test_nulled(self):
        assert map_mp_status("nulled") == PaymentStatus.RECHAZADO

    def test_unknown_status_defaults_to_pendiente(self):
        assert map_mp_status("unknown_random_status") == PaymentStatus.PENDIENTE


class TestCreatePreference:
    pytestmark = pytest.mark.asyncio
    async def test_success(self, mp_service, mock_repo):
        """Happy path: creates preference and stores metadata."""
        payment_id = uuid4()
        mock_payment = MagicMock()
        mock_payment.id = payment_id
        mock_payment.payment_method = PaymentMethod.MERCADOPAGO
        mock_payment.status = PaymentStatus.PENDIENTE
        mock_payment.amount = 2500.00
        mock_payment.currency = "ARS"
        mock_payment.order_id = uuid4()
        mock_repo.get.return_value = mock_payment

        # Mock SDK response
        mp_pref_response = MagicMock()
        mp_pref_response.get.return_value = {
            "id": "pref_12345",
            "init_point": "https://www.mercadopago.com.ar/checkout?pref_id=12345",
        }
        mp_service.sdk.preference.return_value.create.return_value = mp_pref_response

        result = await mp_service.create_preference(payment_id)

        assert result["init_point"] == "https://www.mercadopago.com.ar/checkout?pref_id=12345"
        assert result["preference_id"] == "pref_12345"
        mock_repo.update.assert_awaited_once_with(
            payment_id,
            mp_preference_id="pref_12345",
            mp_init_point="https://www.mercadopago.com.ar/checkout?pref_id=12345",
        )

    async def test_raises_not_found(self, mp_service, mock_repo):
        """Non-existent payment raises NotFoundError."""
        mock_repo.get.return_value = None
        with pytest.raises(Exception, match="not found"):
            await mp_service.create_preference(uuid4())

    async def test_raises_bad_request_for_non_mp_payment(self, mp_service, mock_repo):
        """Payment with method != MERCADOPAGO raises BadRequestError."""
        payment_id = uuid4()
        mock_payment = MagicMock()
        mock_payment.id = payment_id
        mock_payment.payment_method = PaymentMethod.EFECTIVO
        mock_payment.status = PaymentStatus.PENDIENTE
        mock_repo.get.return_value = mock_payment

        with pytest.raises(Exception, match="not mercadopago"):
            await mp_service.create_preference(payment_id)

    async def test_raises_conflict_for_approved_payment(self, mp_service, mock_repo):
        """Payment already approved raises ConflictError."""
        payment_id = uuid4()
        mock_payment = MagicMock()
        mock_payment.id = payment_id
        mock_payment.payment_method = PaymentMethod.MERCADOPAGO
        mock_payment.status = PaymentStatus.APROBADO
        mock_repo.get.return_value = mock_payment

        with pytest.raises(Exception, match="already approved"):
            await mp_service.create_preference(payment_id)


class TestHandleWebhook:
    pytestmark = pytest.mark.asyncio

    async def test_ignores_non_payment_notifications(self, mp_service):
        """Non-payment topic/action should be ignored."""
        result = await mp_service.handle_webhook(
            {"topic": "merchant_order", "data": {"id": "123"}}, None
        )
        assert result["status"] == "ignored"

    async def test_ignores_missing_payment_id(self, mp_service):
        """Webhook payload without payment ID should be ignored."""
        result = await mp_service.handle_webhook(
            {"topic": "payment", "data": {}}, None
        )
        assert result["status"] == "ignored"

    async def test_ignores_unmatched_payment(self, mp_service, mock_repo, mock_pago_service):
        """Webhook for unknown payment ID should be ignored gracefully."""
        with patch.object(mp_service, "get_payment_status", new=AsyncMock(return_value={"status": "approved"})):
            mock_repo.get_by_mp_payment_id.return_value = None
            result = await mp_service.handle_webhook(
                {"type": "payment", "data": {"id": "999999"}}, None
            )
            assert result["status"] == "ignored"

    async def test_updates_payment_on_approved(self, mp_service, mock_repo, mock_pago_service):
        """Approved payment webhook updates status and triggers order transition."""
        payment_id = uuid4()
        mock_payment = MagicMock()
        mock_payment.id = payment_id
        mock_payment.status = PaymentStatus.PENDIENTE
        mock_payment.order_id = uuid4()

        with patch.object(mp_service, "get_payment_status", new=AsyncMock(return_value={"status": "approved"})):
            mock_repo.get_by_mp_payment_id.return_value = mock_payment
            result = await mp_service.handle_webhook(
                {"type": "payment", "data": {"id": "12345"}}, None
            )

            assert result["status"] == "updated"
            mock_pago_service.process_status_update.assert_awaited_once_with(
                payment_id,
                PaymentStatus.APROBADO,
                mp_payment_id="12345",
            )

    async def test_webhook_no_longer_uses_external_reference(self, mp_service, mock_repo, mock_pago_service):
        """Simplified webhook only uses mp_payment_id lookup, no external_reference fallback."""
        mock_repo.get_by_mp_payment_id.return_value = None
        with patch.object(mp_service, "get_payment_status", new=AsyncMock(return_value={"status": "approved"})):
            result = await mp_service.handle_webhook(
                {"type": "payment", "data": {"id": "999999"}}, None
            )
            assert result["status"] == "ignored"
            mock_pago_service.process_status_update.assert_not_called()
