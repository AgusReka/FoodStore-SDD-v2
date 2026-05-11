"""Ingredient model."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.base import Base


class Ingredient(Base):
    __tablename__ = "ingredientes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column("nombre", String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column("descripcion", Text, nullable=True)
    unit: Mapped[str] = mapped_column("unidad_medida", String(50), nullable=False)
    stock_actual: Mapped[float] = mapped_column("stock_actual", Numeric(10, 2), default=0, nullable=False)
    stock_minimo: Mapped[float] = mapped_column("stock_minimo", Numeric(10, 2), default=0, nullable=False)
    image_url: Mapped[str | None] = mapped_column("imagen_url", String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    products: Mapped[list["ProductIngredient"]] = relationship("ProductIngredient", back_populates="ingredient")

    @property
    def stock_suficiente(self) -> bool:
        """Check if current stock meets the minimum threshold."""
        return self.stock_actual >= self.stock_minimo

    __table_args__ = (
        Index("ix_ingredientes_stock_actual", "stock_actual"),
    )


class ProductIngredient(Base):
    __tablename__ = "producto_ingredientes"

    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("productos.id", ondelete="CASCADE"), primary_key=True)
    ingredient_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("ingredientes.id", ondelete="RESTRICT"), primary_key=True)
    quantity: Mapped[float] = mapped_column("cantidad", Numeric(10, 2), nullable=False)

    ingredient: Mapped["Ingredient"] = relationship("Ingredient", back_populates="products", lazy="joined")
    product: Mapped["Product"] = relationship("Product", back_populates="ingredients")

    __table_args__ = (
        UniqueConstraint("product_id", "ingredient_id", name="uq_product_ingredient"),
    )
