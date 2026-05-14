"""Mercado Pago checkout router — handles webhooks, return URLs, and retry payments."""
import logging
from uuid import UUID
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Request, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.auth import get_current_user
from backend.core.config import settings
from backend.core.database import get_db
from backend.core.exceptions import NotFoundError
from backend.modules.pagos.mercadopago.mp_service import MercadoPagoService
from backend.modules.pagos.repository import PagoRepository
from backend.modules.pagos.service import PagoService
from backend.modules.pedidos.repository import PedidoRepository

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Mercado Pago"])


# ---------- Retry preference for existing payments ----------


class RetryPreferenceRequest(BaseModel):
    payment_id: UUID


class RetryPreferenceResponse(BaseModel):
    init_point: str
    preference_id: str
    public_key: str


@router.post("/retry-preference", response_model=RetryPreferenceResponse)
async def retry_preference(
    data: RetryPreferenceRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Create a Mercado Pago Checkout Pro preference for an existing payment (retry).

    Used when a user wants to retry a failed/cancelled MP payment
    from the order detail page. The order + payment already exist.
    """
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    pago_service = PagoService(pago_repo, pedido_repo)
    mp_service = MercadoPagoService(pago_service)
    try:
        result = await mp_service.create_preference(data.payment_id)
    except RuntimeError as exc:
        logger.error("Failed to create retry MP preference: %s", exc)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=400,
            content={
                "detail": f"Error al crear preferencia de pago: {exc}",
                "code": "MP_PREFERENCE_ERROR",
            },
        )
    result["public_key"] = settings.MERCADOPAGO_PUBLIC_KEY
    return RetryPreferenceResponse(**result)


@router.post("/webhook", status_code=status.HTTP_200_OK)
async def webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    x_signature: Annotated[str | None, Header()] = None,
    x_request_id: Annotated[str | None, Header()] = None,
):
    """IPN (Instant Payment Notification) webhook from Mercado Pago.

    This endpoint is public — authentication is via X-Signature validation.
    Mercado Pago sends notifications here when payment status changes.
    """
    pago_repo = PagoRepository(db)
    pedido_repo = PedidoRepository(db)
    pago_service = PagoService(pago_repo, pedido_repo)
    service = MercadoPagoService(pago_service)

    try:
        data = await request.json()
    except Exception:
        data = {}

    # Extract data.id from URL query params (needed for X-Signature validation)
    data_id = request.query_params.get("data.id")

    try:
        result = await service.handle_webhook(
            data, x_signature, x_request_id, data_id=data_id
        )
        return result
    except PermissionError as exc:
        return {"status": "error", "detail": str(exc)}
    except NotFoundError as exc:
        return {"status": "ignored", "detail": str(exc)}


@router.get("/success")
async def payment_success():
    """Redirect to frontend success page."""
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/mp/return?status=success")


@router.get("/failure")
async def payment_failure():
    """Redirect to frontend failure page."""
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/mp/return?status=failure")


@router.get("/pending")
async def payment_pending():
    """Redirect to frontend pending page."""
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/mp/return?status=pending")
