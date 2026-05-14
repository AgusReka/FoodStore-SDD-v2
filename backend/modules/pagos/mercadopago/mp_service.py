"""Mercado Pago integration service."""

import hashlib
import hmac
import logging
from uuid import UUID

import mercadopago

from backend.core.config import settings
from backend.core.enums import PaymentMethod, PaymentStatus
from backend.core.exceptions import BadRequestError, ConflictError, NotFoundError
from backend.modules.pagos.model import Payment
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pagos.service import PagoService
from backend.modules.pedidos.repository import PedidoRepository

logger = logging.getLogger(__name__)

# Mapping from Mercado Pago payment statuses to internal PaymentStatus
_MP_STATUS_MAP: dict[str, PaymentStatus] = {
    "approved": PaymentStatus.APROBADO,
    "rejected": PaymentStatus.RECHAZADO,
    "cancelled": PaymentStatus.RECHAZADO,
    "charged_back": PaymentStatus.RECHAZADO,
    "in_process": PaymentStatus.PENDIENTE,
    "in_mediation": PaymentStatus.PENDIENTE,
    "pending": PaymentStatus.PENDIENTE,
    "refunded": PaymentStatus.REEMBOLSADO,
    "nulled": PaymentStatus.RECHAZADO,
}


def map_mp_status(mp_status: str) -> PaymentStatus:
    """Map a Mercado Pago payment status to internal PaymentStatus."""
    return _MP_STATUS_MAP.get(mp_status, PaymentStatus.PENDIENTE)


class MercadoPagoService:
    """Service for Mercado Pago Checkout Pro integration.

    Handles preference creation, IPN webhook processing, and
    payment status queries via the Mercado Pago Python SDK.
    """

    def __init__(self, pago_service: PagoService) -> None:
        self.pago_service = pago_service
        self.pago_repo: PagoRepository = pago_service.repository  # type: ignore
        self._sdk: mercadopago.SDK | None = None

    @property
    def sdk(self) -> mercadopago.SDK:
        """Lazy-init the Mercado Pago SDK client."""
        if self._sdk is None:
            if not settings.mercadopago_configured:
                raise RuntimeError(
                    "Mercado Pago is not configured. Set MERCADOPAGO_ACCESS_TOKEN."
                )
            self._sdk = mercadopago.SDK(settings.MERCADOPAGO_ACCESS_TOKEN)
        return self._sdk

    async def create_preference(self, payment_id: UUID) -> dict:
        """Create a Mercado Pago Checkout Pro preference for a payment.

        Args:
            payment_id: The internal payment record ID.

        Returns:
            Dict with 'init_point' and 'preference_id'.

        Raises:
            NotFoundError: Payment not found.
            BadRequestError: Payment method is not mercadopago.
            ConflictError: Payment already approved.
        """
        payment = await self.pago_repo.get(payment_id)
        if not payment:
            raise NotFoundError(f"Payment {payment_id} not found")

        if payment.payment_method != PaymentMethod.MERCADOPAGO:
            raise BadRequestError(
                f"Payment {payment_id} method is {payment.payment_method.value}, "
                "not mercadopago"
            )

        if payment.status == PaymentStatus.APROBADO:
            raise ConflictError(f"Payment {payment_id} is already approved")

        # Build preference data for MP SDK
        order_id = payment.order_id
        preference_data: dict = {
            "items": [
                {
                    "id": str(payment.id),
                    "title": f"Pedido #{str(payment.order_id)[:8]}",
                    "description": f"Pago de pedido en Food Store",
                    "quantity": 1,
                    "currency_id": payment.currency or "ARS",
                    "unit_price": float(payment.amount),
                }
            ],
            "back_urls": {
                "success": f"{settings.FRONTEND_URL}/mp/return?status=success&order_id={order_id}",
                "failure": f"{settings.FRONTEND_URL}/mp/return?status=failure&order_id={order_id}",
                "pending": f"{settings.FRONTEND_URL}/mp/return?status=pending&order_id={order_id}",
            },
            # "auto_return": "approved",
            "external_reference": str(payment.id),
        }
        # Only include notification_url if configured — MP API rejects null
        if settings.MERCADOPAGO_WEBHOOK_URL:
            preference_data["notification_url"] = settings.MERCADOPAGO_WEBHOOK_URL

        try:
            result = self.sdk.preference().create(preference_data)
        except Exception as exc:
            logger.error("MP create_preference failed for %s: %s", payment_id, exc)
            raise RuntimeError(
                f"Failed to create Mercado Pago preference: {exc}"
            ) from exc

        response = result.get("response", {})
        init_point = response.get("init_point") or response.get(
            "sandbox_init_point", ""
        )
        preference_id = response.get("id", "")

        if not init_point:
            logger.error(
                "MP create_preference response missing init_point: %s", response
            )
            raise RuntimeError("Mercado Pago did not return a checkout URL")

        # Store MP reference on the payment record
        await self.pago_repo.update(
            payment_id,
            mp_preference_id=preference_id,
            mp_init_point=init_point,
        )

        logger.info(
            "Created MP preference %s for payment %s", preference_id, payment_id
        )
        return {"init_point": init_point, "preference_id": preference_id}

    async def create_preference_from_session(
        self, external_reference: str, items: list[dict], back_urls: dict
    ) -> dict:
        """Create a Mercado Pago preference for an order (Order already exists).

        Args:
            external_reference: The Order ID (used as external_reference).
            items: List of item dicts with id, title, quantity, currency_id, unit_price.
            back_urls: Dict with success, failure, pending URLs.

        Returns:
            Dict with 'init_point' and 'preference_id'.

        Raises:
            RuntimeError: MP API call failed or returned no init_point.
        """
        preference_data: dict = {
            "items": items,
            "back_urls": back_urls,
            "auto_return": "approved",
            "external_reference": external_reference,
        }
        # Only include notification_url if configured — MP API rejects null
        if settings.MERCADOPAGO_WEBHOOK_URL:
            preference_data["notification_url"] = settings.MERCADOPAGO_WEBHOOK_URL

        try:
            result = self.sdk.preference().create(preference_data)
        except Exception as exc:
            logger.error(
                "MP create_preference failed for order %s: %s", external_reference, exc
            )
            raise RuntimeError(
                f"Failed to create Mercado Pago preference: {exc}"
            ) from exc

        response = result.get("response", {})
        init_point = response.get("init_point") or response.get(
            "sandbox_init_point", ""
        )
        preference_id = response.get("id", "")

        if not init_point:
            logger.error(
                "MP create_preference response missing init_point: %s", response
            )
            raise RuntimeError("Mercado Pago did not return a checkout URL")

        logger.info(
            "Created MP preference %s for order %s", preference_id, external_reference
        )
        return {"init_point": init_point, "preference_id": preference_id}

    async def get_payment_status(self, mp_payment_id: str) -> dict | None:
        """Fetch payment status from Mercado Pago API.

        Args:
            mp_payment_id: The Mercado Pago payment/transaction ID.

        Returns:
            Dict with 'status' and 'status_detail' or None if not found.
        """
        try:
            result = self.sdk.payment().get(int(mp_payment_id))
        except Exception as exc:
            logger.error("MP get_payment failed for %s: %s", mp_payment_id, exc)
            return None

        response = result.get("response", {})
        return {
            "status": response.get("status"),
            "status_detail": response.get("status_detail"),
        }

    async def handle_webhook(
        self,
        data: dict,
        x_signature: str | None,
        x_request_id: str | None = None,
        data_id: str | None = None,
    ) -> dict:
        """Process an IPN webhook notification from Mercado Pago.

        The Payment already exists (created in mp-init). This handler just
        looks up the Payment by mp_payment_id and updates its status.

        Args:
            data: Parsed JSON body of the webhook request.
            x_signature: Value of the X-Signature header (for validation).
            x_request_id: Value of the X-Request-Id header (for validation).
            data_id: Value of the 'data.id' query param from the webhook URL
                     (used for X-Signature validation per MP docs).

        Returns:
            Dict with 'status' indicating the result.

        Raises:
            PermissionError: Signature validation failed.
        """
        # Extract payment ID from notification
        action = data.get("action")
        topic = data.get("topic") or data.get("type")

        if topic == "payment" or (action and "payment" in action):
            mp_payment_id = data.get("data", {}).get("id")
        else:
            logger.info("Ignoring non-payment webhook notification: topic=%s", topic)
            return {"status": "ignored", "reason": "non-payment notification"}

        if not mp_payment_id:
            logger.warning("Webhook missing payment ID in payload: %s", data)
            return {"status": "ignored", "reason": "missing payment id"}

        # Validate X-Signature if webhook secret is configured
        if settings.MERCADOPAGO_WEBHOOK_SECRET and x_signature:
            self._validate_signature(
                x_signature, x_request_id, data_id=data_id or str(mp_payment_id)
            )

        # Re-fetch payment status from MP API (don't trust webhook payload alone)
        mp_status_info = await self.get_payment_status(str(mp_payment_id))
        if not mp_status_info or not mp_status_info.get("status"):
            logger.warning("Could not fetch MP payment status for %s", mp_payment_id)
            return {"status": "ignored", "reason": "could not fetch mp status"}

        mp_status = mp_status_info["status"]
        new_status = map_mp_status(mp_status)

        # Look up Payment by mp_payment_id (created in mp-init)
        payment = await self.pago_repo.get_by_mp_payment_id(str(mp_payment_id))

        if not payment:
            logger.info(
                "No internal payment found for MP payment ID %s — "
                "webhook may have arrived before mp-init, will retry",
                mp_payment_id,
            )
            return {"status": "ignored", "reason": "payment not found"}

        # Update payment status via PagoService (handles order transition)
        await self.pago_service.process_status_update(
            payment.id,
            new_status,
            mp_payment_id=str(mp_payment_id),
        )

        logger.info(
            "Updated payment %s status from %s to %s (via MP webhook)",
            payment.id,
            payment.status.value,
            new_status.value,
        )
        return {
            "status": "updated",
            "payment_id": str(payment.id),
            "new_status": new_status.value,
        }

    def _validate_signature(
        self,
        x_signature: str,
        x_request_id: str | None,
        data_id: str | None = None,
    ) -> None:
        """Validate the X-Signature header from Mercado Pago.

        Uses HMAC-SHA256 with the configured webhook secret.
        Follows MP docs: manifest = "id:{data.id};request-id:{x-request-id};ts:{ts};"
        Missing fields are removed from the template.

        Args:
            x_signature: Value of the X-Signature header.
            x_request_id: Value of the X-Request-Id header.
            data_id: Value of 'data.id' from the webhook URL query params.

        Raises:
            PermissionError: If signature is invalid.
        """
        if not x_signature:
            logger.warning("Webhook missing X-Signature header")
            raise PermissionError("Missing X-Signature header")

        # Parse the signature header (format: "ts=...v1=...,ts=...v1=...")
        # MP sends: X-Signature: ts=1234567890,v1=abcdef1234
        parts = {}
        for pair in x_signature.split(","):
            if "=" in pair:
                key, value = pair.split("=", 1)
                parts[key.strip()] = value.strip()

        ts = parts.get("ts")
        received_sig = parts.get("v1")

        if not ts or not received_sig:
            raise PermissionError("Invalid X-Signature format")

        # Build the manifest string per MP docs:
        #   id:[data.id_url];request-id:[x-request-id_header];ts:[ts_header];
        # Per MP docs: if a value is not present, remove it from the template.
        manifest_parts = []
        if data_id:
            manifest_parts.append(f"id:{data_id}")
        if x_request_id:
            manifest_parts.append(f"request-id:{x_request_id}")
        manifest_parts.append(f"ts:{ts}")

        signing_string = ";".join(manifest_parts) + ";"

        secret = settings.MERCADOPAGO_WEBHOOK_SECRET.encode("utf-8")
        expected_sig = hmac.new(
            secret, signing_string.encode("utf-8"), hashlib.sha256
        ).hexdigest()

        if not hmac.compare_digest(expected_sig, received_sig):
            logger.warning(
                "Invalid X-Signature: expected %s, got %s",
                expected_sig,
                received_sig,
            )
            raise PermissionError("Invalid X-Signature")
