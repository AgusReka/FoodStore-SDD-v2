"""add mp_preference_id and mp_init_point to pagos

Revision ID: f6e7d8c9b0a1
Revises: c5d6e7f8a9b0
Create Date: 2026-05-13 22:45:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "f6e7d8c9b0a1"
down_revision: Union[str, None] = "c5d6e7f8a9b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("pagos", sa.Column("mp_preference_id", sa.String(255), nullable=True))
    op.add_column("pagos", sa.Column("mp_init_point", sa.String(512), nullable=True))
    op.create_index("ix_pagos_mp_preference_id", "pagos", ["mp_preference_id"])
    op.create_index("ix_pagos_mp_payment_id", "pagos", ["mp_payment_id"])


def downgrade() -> None:
    op.drop_index("ix_pagos_mp_payment_id", table_name="pagos")
    op.drop_index("ix_pagos_mp_preference_id", table_name="pagos")
    op.drop_column("pagos", "mp_init_point")
    op.drop_column("pagos", "mp_preference_id")
