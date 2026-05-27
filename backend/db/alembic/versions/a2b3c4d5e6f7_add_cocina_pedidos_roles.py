"""add_cocina_pedidos_roles

Add COCINA and PEDIDOS to the userrole enum.

Revision ID: a2b3c4d5e6f7
Revises: f0a1b2c3d4e5
Create Date: 2026-05-21 08:40:00.000000
"""
from typing import Sequence, Union

from alembic import op

# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, None] = 'f0a1b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add 'COCINA' and 'PEDIDOS' to the userrole enum.
    
    ALTER TYPE ... ADD VALUE runs outside the current transaction
    (PostgreSQL auto-commits before the statement completes).
    """
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'COCINA'")
    op.execute("ALTER TYPE userrole ADD VALUE IF NOT EXISTS 'PEDIDOS'")


def downgrade() -> None:
    """Cannot remove enum values in PostgreSQL.
    
    To downgrade, we would need to recreate the type without the removed values,
    which is destructive and not recommended.
    """
    pass
