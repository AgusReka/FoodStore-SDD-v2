"""Payment model."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.base import Base
from backend.core.enums import PaymentMethod, PaymentStatus


class Payment(Base):
    __tablename__ = "pagos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pedidos.id", ondelete="CASCADE"), unique=True, nullable=False)
    payment_method: Mapped[PaymentMethod] = mapped_column("metodo", Enum(PaymentMethod), nullable=False)
    status: Mapped[PaymentStatus] = mapped_column("estado", Enum(PaymentStatus), default=PaymentStatus.PENDIENTE, nullable=False)
    amount: Mapped[float] = mapped_column("monto", Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column("moneda", String(3), default="ARS", nullable=False)
    mp_payment_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    order: Mapped["Order"] = relationship("Order", back_populates="payment")
