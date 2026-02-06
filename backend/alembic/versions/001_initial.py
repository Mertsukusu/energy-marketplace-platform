"""Initial migration

Revision ID: 001
Revises:
Create Date: 2026-02-06
"""

from typing import Sequence, Union

import sqlalchemy as sa

from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "contracts",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("energy_type", sa.String(50), nullable=False),
        sa.Column("quantity_mwh", sa.Numeric(12, 2), nullable=False),
        sa.Column("price_per_mwh", sa.Numeric(10, 2), nullable=False),
        sa.Column("delivery_start", sa.Date(), nullable=False),
        sa.Column("delivery_end", sa.Date(), nullable=False),
        sa.Column("location", sa.String(100), nullable=False),
        sa.Column(
            "status",
            sa.Enum("AVAILABLE", "RESERVED", "SOLD", name="contractstatus"),
            nullable=False,
        ),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_contracts_energy_type", "contracts", ["energy_type"])
    op.create_index("ix_contracts_location", "contracts", ["location"])
    op.create_index("ix_contracts_delivery_start", "contracts", ["delivery_start"])
    op.create_index("ix_contracts_status", "contracts", ["status"])

    op.create_table(
        "portfolio_items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("contract_id", sa.Integer(), nullable=False),
        sa.Column("added_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["contract_id"], ["contracts.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("contract_id"),
    )


def downgrade() -> None:
    op.drop_table("portfolio_items")
    op.drop_index("ix_contracts_status", "contracts")
    op.drop_index("ix_contracts_delivery_start", "contracts")
    op.drop_index("ix_contracts_location", "contracts")
    op.drop_index("ix_contracts_energy_type", "contracts")
    op.drop_table("contracts")
    op.execute("DROP TYPE IF EXISTS contractstatus")
