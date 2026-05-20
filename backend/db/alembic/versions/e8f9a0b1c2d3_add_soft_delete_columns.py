"""add_soft_delete_columns

Revision ID: e8f9a0b1c2d3
Revises: d7e8f9a0b1c2
Create Date: 2026-05-18 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8f9a0b1c2d3'
down_revision: Union[str, None] = 'd7e8f9a0b1c2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add deleted_at columns
    op.add_column('productos', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True, server_default=None))
    op.add_column('categorias', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True, server_default=None))
    op.add_column('ingredientes', sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=True, server_default=None))

    # Create partial indexes for active items
    op.create_index('idx_productos_active', 'productos', ['id'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_index('idx_categorias_active', 'categorias', ['id'], postgresql_where=sa.text('deleted_at IS NULL'))
    op.create_index('idx_ingredientes_active', 'ingredientes', ['id'], postgresql_where=sa.text('deleted_at IS NULL'))

    # Change pedidos_items.product_id FK from CASCADE to NO ACTION
    op.drop_constraint('pedidos_items_product_id_fkey', 'pedidos_items', type_='foreignkey')
    op.create_foreign_key('pedidos_items_product_id_fkey', 'pedidos_items', 'productos', ['product_id'], ['id'], ondelete='NO ACTION')


def downgrade() -> None:
    # Restore FK to CASCADE
    op.drop_constraint('pedidos_items_product_id_fkey', 'pedidos_items', type_='foreignkey')
    op.create_foreign_key('pedidos_items_product_id_fkey', 'pedidos_items', 'productos', ['product_id'], ['id'], ondelete='CASCADE')

    # Drop partial indexes
    op.drop_index('idx_ingredientes_active', table_name='ingredientes')
    op.drop_index('idx_categorias_active', table_name='categorias')
    op.drop_index('idx_productos_active', table_name='productos')

    # Drop deleted_at columns
    op.drop_column('ingredientes', 'deleted_at')
    op.drop_column('categorias', 'deleted_at')
    op.drop_column('productos', 'deleted_at')
