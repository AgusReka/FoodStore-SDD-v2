"""add_numero_to_pedidos

Add sequential order number (numero) column to pedidos table.

Revision ID: b3c4d5e6f7a8
Revises: a2b3c4d5e6f7
Create Date: 2026-05-22 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add numero column with sequence for auto-generated order numbers."""
    # 1. Create sequence for numero generation
    op.execute("CREATE SEQUENCE IF NOT EXISTS pedidos_numero_seq START 1")
    
    # 2. Add nullable column first
    op.add_column("pedidos", sa.Column("numero", sa.Integer(), nullable=True))
    
    # 3. Backfill existing rows with sequential numbers
    op.execute("""
        UPDATE pedidos 
        SET numero = nextval('pedidos_numero_seq') 
        WHERE numero IS NULL
    """)
    
    # 4. Make non-nullable with sequence as default
    op.alter_column(
        "pedidos", "numero",
        nullable=False,
        server_default=sa.text("nextval('pedidos_numero_seq')"),
    )


def downgrade() -> None:
    """Remove numero column and sequence."""
    op.drop_column("pedidos", "numero")
    op.execute("DROP SEQUENCE IF EXISTS pedidos_numero_seq")
