"""Checkout router — mp-init and mp-return endpoints."""
import logging
from uuid import UUID
from typing import Annotated

from fastapi import APIRouter, Depends, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession

from backend.core.auth import get_current_user
from backend.core.database import get_db
from backend.core.exceptions import BadRequestError
from backend.modules.checkout.schemas import MpInitRequest, MpInitResponse
from backend.modules.checkout.service import CheckoutService

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Checkout"])


@router.post("/mp-init", response_model=MpInitResponse)
async def mp_init(
    data: MpInitRequest,
    current_user: Annotated[dict, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Initialize a Mercado Pago checkout.

    Creates Order (pending_mp) + Payment (pendiente) + MP preference
    in a single call. Returns the MP init_point for redirect.
    """
    user_id = UUID(current_user["user_id"])
    service = CheckoutService(db)

    items_data = [
        {"product_id": item.product_id, "quantity": item.quantity}
        for item in data.items
    ]

    try:
        result = await service.init_mp_session(
            user_id=user_id,
            items_data=items_data,
            direccion_id=data.direccion_id,
            observaciones=data.observaciones,
        )
    except BadRequestError:
        raise
    except Exception as exc:
        logger.error("mp-init failed: %s", exc)
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Error al iniciar el pago. Intentá de nuevo más tarde.",
                "code": "MP_INIT_ERROR",
            },
        )

    return MpInitResponse(**result)


# ---------- Path-based mp-return with order_id ----------


@router.get("/mp-return/{status}/{order_id}")
async def mp_return(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    status: str,
    order_id: str,
):
    """Handle Mercado Pago redirect back to the application.

    This endpoint is public (no auth) — MP redirects don't carry Bearer tokens.

    On success: updates payment to APROBADO → order CONFIRMADO + stock deducted.
    On failure: marks order as CANCELADO, payment as RECHAZADO.
    On pending: no-op, redirect to order detail.
    """
    service = CheckoutService(db)

    # MP may send payment_id as 'payment_id' or 'collection_id' in query params
    mp_payment_id = request.query_params.get("payment_id") or request.query_params.get("collection_id")

    redirect_url = await service.handle_mp_return(
        status=status,
        order_id=order_id,
        mp_payment_id=mp_payment_id,
    )

    return RedirectResponse(url=redirect_url)
