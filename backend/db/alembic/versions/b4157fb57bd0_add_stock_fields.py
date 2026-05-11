"""add_stock_fields

Revision ID: b4157fb57bd0
Revises: b2c3d4e5f6a1
Create Date: 2026-05-11 14:09:10.586163
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


# revision identifiers, used by Alembic.
revision: str = 'b4157fb57bd0'
down_revision: Union[str, None] = 'b2c3d4e5f6a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add stock fields to productos (nullable OK for existing rows)
    op.add_column('productos', sa.Column('stock_cantidad', sa.Integer(), nullable=True))
    op.add_column('productos', sa.Column('stock_minimo', sa.Integer(), nullable=True))

    # Add stock fields to ingredientes — add as nullable first, backfill, then set NOT NULL
    op.add_column('ingredientes', sa.Column('stock_actual', sa.Numeric(precision=10, scale=2), nullable=True))
    op.add_column('ingredientes', sa.Column('stock_minimo', sa.Numeric(precision=10, scale=2), nullable=True))

    # Backfill existing rows with default values
    op.execute("UPDATE ingredientes SET stock_actual = 0 WHERE stock_actual IS NULL")
    op.execute("UPDATE ingredientes SET stock_minimo = 0 WHERE stock_minimo IS NULL")

    # Now set NOT NULL
    op.alter_column('ingredientes', 'stock_actual', nullable=False)
    op.alter_column('ingredientes', 'stock_minimo', nullable=False)

    # Create index
    op.create_index('ix_ingredientes_stock_actual', 'ingredientes', ['stock_actual'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_ingredientes_stock_actual', table_name='ingredientes')
    op.drop_column('productos', 'stock_minimo')
    op.drop_column('productos', 'stock_cantidad')
    op.drop_column('ingredientes', 'stock_minimo')
    op.drop_column('ingredientes', 'stock_actual')
