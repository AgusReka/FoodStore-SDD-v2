"""add_checkout_sessions

Revision ID: c92ea9ababf2
Revises: f6e7d8c9b0a1
Create Date: 2026-05-14 02:32:31.940086
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'c92ea9ababf2'
down_revision: Union[str, None] = 'f6e7d8c9b0a1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create checkout_sessions table for MP redirect flow."""
    op.create_table('checkout_sessions',
        sa.Column('id', sa.UUID(), nullable=False),
        sa.Column('user_id', sa.UUID(), nullable=False),
        sa.Column('items', postgresql.JSONB(astext_type=sa.Text()), nullable=False,
                  comment='[{"product_id", "quantity", "unit_price", "subtotal", "product_name"}, ...]'),
        sa.Column('direccion_id', sa.UUID(), nullable=False),
        sa.Column('observaciones', sa.Text(), nullable=True),
        sa.Column('total', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('status',
                  sa.Enum('PENDING', 'COMPLETED', 'EXPIRED', name='checkoutsessionstatus'),
                  nullable=False),
        sa.Column('mp_preference_id', sa.String(length=255), nullable=True),
        sa.Column('mp_payment_id', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'),
                  nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['direccion_id'], ['direcciones.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['usuarios.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_checkout_sessions_status'), 'checkout_sessions', ['status'],
                    unique=False)
    op.create_index(op.f('ix_checkout_sessions_user_id'), 'checkout_sessions', ['user_id'],
                    unique=False)


def downgrade() -> None:
    """Drop checkout_sessions table."""
    op.drop_index(op.f('ix_checkout_sessions_user_id'), table_name='checkout_sessions')
    op.drop_index(op.f('ix_checkout_sessions_status'), table_name='checkout_sessions')
    op.drop_table('checkout_sessions')
