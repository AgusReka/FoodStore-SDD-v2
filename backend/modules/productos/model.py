"""Product model."""
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.base import Base


class Product(Base):
    __tablename__ = "productos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column("nombre", String(200), nullable=False)
    description: Mapped[str | None] = mapped_column("descripcion", Text, nullable=True)
    price: Mapped[float] = mapped_column("precio", Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column("moneda", String(3), default="ARS", nullable=False)
    image_url: Mapped[str | None] = mapped_column("imagen_url", String(500), nullable=True)
    is_available: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    category_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("categorias.id", ondelete="CASCADE"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    __table_args__ = (
        UniqueConstraint("nombre", "category_id", name="uq_product_category"),
    )

    category: Mapped["Category"] = relationship("Category", back_populates="products")
