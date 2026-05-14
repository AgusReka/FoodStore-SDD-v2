"""add_pending_mp_status

Revision ID: d7e8f9a0b1c2
Revises: c92ea9ababf2
Create Date: 2026-05-14 14:00:00.000000
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'd7e8f9a0b1c2'
down_revision: Union[str, None] = 'c92ea9ababf2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add 'PENDING_MP' to the orderstatus enum.
    
    ALTER TYPE ... ADD VALUE runs outside the current transaction
    (PostgreSQL auto-commits before the statement completes).
    """
    op.execute("ALTER TYPE orderstatus ADD VALUE IF NOT EXISTS 'PENDING_MP'")


def downgrade() -> None:
    """Cannot remove enum values in PostgreSQL.
    
    To downgrade, we'd need to:
    1. ALTER TYPE orderstatus RENAME TO orderstatus_old
    2. CREATE TYPE orderstatus AS ENUM(...)
    3. ALTER TABLE pedidos ALTER COLUMN estado TYPE orderstatus USING estado::text::orderstatus
    4. DROP TYPE orderstatus_old
    This is destructive and not recommended for production.
    """
    pass
