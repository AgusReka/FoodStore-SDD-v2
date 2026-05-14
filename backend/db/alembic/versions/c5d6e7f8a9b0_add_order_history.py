"""add order_history table

Revision ID: c5d6e7f8a9b0
Revises: b4157fb57bd0
Create Date: 2026-05-13 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "c5d6e7f8a9b0"
down_revision: Union[str, None] = "b4157fb57bd0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "order_history",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("order_id", UUID(as_uuid=True), sa.ForeignKey("pedidos.id", ondelete="CASCADE"), nullable=False),
        sa.Column(
            "from_status",
            sa.Enum("PENDIENTE", "CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGADO", "CANCELADO", name="orderstatus", create_type=False),
            nullable=False,
        ),
        sa.Column(
            "to_status",
            sa.Enum("PENDIENTE", "CONFIRMADO", "PREPARANDO", "ENVIADO", "ENTREGADO", "CANCELADO", name="orderstatus", create_type=False),
            nullable=False,
        ),
        sa.Column("changed_by", UUID(as_uuid=True), sa.ForeignKey("usuarios.id", ondelete="SET NULL"), nullable=True),
        sa.Column("reason", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
    )
    op.create_index("ix_order_history_order_id", "order_history", ["order_id"])
    op.create_index("ix_order_history_created_at", "order_history", ["created_at"])


def downgrade() -> None:
    op.drop_index("ix_order_history_created_at", table_name="order_history")
    op.drop_index("ix_order_history_order_id", table_name="order_history")
    op.drop_table("order_history")
