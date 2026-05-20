"""replace_unique_with_partial_index

Replace DB-level UNIQUE constraints with partial unique indexes
so soft-deleted items don't block creation of items with the same name.

Revision ID: f0a1b2c3d4e5
Revises: e8f9a0b1c2d3
Create Date: 2026-05-19 12:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f0a1b2c3d4e5'
down_revision: Union[str, None] = 'e8f9a0b1c2d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Categories ────────────────────────────────────────────────────
    # Drop existing UNIQUE constraint on categorias.nombre
    op.drop_constraint('categorias_nombre_key', 'categorias', type_='unique')
    # Create partial unique index: unique name only among active items
    op.create_index('idx_categorias_nombre_active', 'categorias', ['nombre'],
                    unique=True,
                    postgresql_where=sa.text('deleted_at IS NULL'))

    # ── Ingredients ───────────────────────────────────────────────────
    # Drop existing UNIQUE constraint on ingredientes.nombre
    op.drop_constraint('ingredientes_nombre_key', 'ingredientes', type_='unique')
    # Create partial unique index: unique name only among active items
    op.create_index('idx_ingredientes_nombre_active', 'ingredientes', ['nombre'],
                    unique=True,
                    postgresql_where=sa.text('deleted_at IS NULL'))

    # ── Products ──────────────────────────────────────────────────────
    # Drop existing composite UNIQUE constraint (nombre, category_id)
    op.drop_constraint('uq_product_category', 'productos', type_='unique')
    # Create partial unique index: unique (name, category_id) only among active items
    op.create_index('idx_productos_nombre_categoria_active', 'productos',
                    ['nombre', 'category_id'],
                    unique=True,
                    postgresql_where=sa.text('deleted_at IS NULL'))


def downgrade() -> None:
    # ── Products ──────────────────────────────────────────────────────
    op.drop_index('idx_productos_nombre_categoria_active', table_name='productos')
    op.create_unique_constraint('uq_product_category', 'productos', ['nombre', 'category_id'])

    # ── Ingredients ───────────────────────────────────────────────────
    op.drop_index('idx_ingredientes_nombre_active', table_name='ingredientes')
    op.create_unique_constraint('ingredientes_nombre_key', 'ingredientes', ['nombre'])

    # ── Categories ────────────────────────────────────────────────────
    op.drop_index('idx_categorias_nombre_active', table_name='categorias')
    op.create_unique_constraint('categorias_nombre_key', 'categorias', ['nombre'])
