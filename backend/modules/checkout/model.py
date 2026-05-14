"""Checkout session model — temporary cart storage during MP redirect flow."""
import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.base import Base


class CheckoutSessionStatus(str, PyEnum):
    PENDING = "pending"
    COMPLETED = "completed"
    EXPIRED = "expired"


class CheckoutSession(Base):
    __tablename__ = "checkout_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False, index=True,
    )
    items: Mapped[list] = mapped_column(
        JSONB, nullable=False,
        comment='[{"product_id", "quantity", "unit_price", "subtotal", "product_name"}, ...]',
    )
    direccion_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("direcciones.id"), nullable=False,
    )
    observaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    status: Mapped[CheckoutSessionStatus] = mapped_column(
        Enum(CheckoutSessionStatus),
        default=CheckoutSessionStatus.PENDING,
        nullable=False,
        index=True,
    )
    mp_preference_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    mp_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False,
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True,
    )

    # Composite index for user's active sessions
    # Index on expires_at for cleanup queries
    __table_args__ = (
        # Index to efficiently find active sessions by user
        # (index on user_id + status is handled by individual indexes above)
    )
