"""Address model."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.base import Base


class Address(Base):
    __tablename__ = "direcciones"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    street: Mapped[str] = mapped_column("calle", String(255), nullable=False)
    street_number: Mapped[str | None] = mapped_column("numero", String(20), nullable=True)
    city: Mapped[str] = mapped_column("ciudad", String(100), nullable=False)
    postal_code: Mapped[str] = mapped_column("codigo_postal", String(20), nullable=False)
    latitude: Mapped[float | None] = mapped_column("latitud", Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column("longitud", Float, nullable=True)
    is_primary: Mapped[bool] = mapped_column("es_principal", Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="addresses")
