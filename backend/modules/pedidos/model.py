"""Order, OrderItem and OrderHistory models."""
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, Index, Numeric, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.core.base import Base
from backend.core.enums import OrderStatus


class Order(Base):
    __tablename__ = "pedidos"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False)
    address_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("direcciones.id", ondelete="SET NULL"), nullable=True)
    status: Mapped[OrderStatus] = mapped_column("estado", Enum(OrderStatus), default=OrderStatus.PENDIENTE, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column("moneda", String(3), default="ARS", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), onupdate=func.now(), nullable=True)

    __table_args__ = (
        Index("ix_pedidos_estado", "estado"),
        Index("ix_pedidos_user_id", "user_id"),
    )

    user: Mapped["User"] = relationship("User", back_populates="orders")
    address: Mapped["Address | None"] = relationship("Address")
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", lazy="selectin", cascade="all, delete-orphan")
    payment: Mapped["Payment | None"] = relationship("Payment", back_populates="order", uselist=False, lazy="selectin")
    history: Mapped[list["OrderHistory"]] = relationship("OrderHistory", back_populates="order", lazy="selectin", cascade="all, delete-orphan")


class OrderHistory(Base):
    __tablename__ = "order_history"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    from_status: Mapped[OrderStatus] = mapped_column("from_status", Enum(OrderStatus), nullable=False)
    to_status: Mapped[OrderStatus] = mapped_column("to_status", Enum(OrderStatus), nullable=False)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True)
    reason: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    __table_args__ = (
        Index("ix_order_history_order_id", "order_id"),
        Index("ix_order_history_created_at", "created_at"),
    )

    order: Mapped["Order"] = relationship("Order", back_populates="history")


class OrderItem(Base):
    __tablename__ = "pedidos_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("productos.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column("cantidad", Integer, nullable=False)
    unit_price: Mapped[float] = mapped_column("precio_unitario", Numeric(10, 2), nullable=False)
    subtotal: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product")
