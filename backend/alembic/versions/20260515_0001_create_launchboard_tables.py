"""create launchboard tables

Revision ID: 20260515_0001
Revises:
Create Date: 2026-05-15
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "20260515_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "services",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=80), nullable=False, unique=True),
        sa.Column("owner", sa.String(length=80), nullable=False),
        sa.Column("tier", sa.String(length=40), nullable=False),
        sa.Column("runtime", sa.String(length=80), nullable=False),
        sa.Column("repository_url", sa.String(length=255), nullable=False),
        sa.Column("health_endpoint", sa.String(length=120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_table(
        "deployments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("service_id", sa.Integer(), sa.ForeignKey("services.id", ondelete="CASCADE"), nullable=False),
        sa.Column("environment", sa.String(length=40), nullable=False),
        sa.Column("version", sa.String(length=40), nullable=False),
        sa.Column("status", sa.String(length=30), nullable=False),
        sa.Column("replicas", sa.Integer(), nullable=False),
        sa.Column("cpu_request", sa.String(length=20), nullable=False),
        sa.Column("memory_request", sa.String(length=20), nullable=False),
        sa.Column("latency_ms", sa.Integer(), nullable=False),
        sa.Column("error_rate", sa.Float(), nullable=False),
        sa.Column("deployed_by", sa.String(length=80), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_deployments_environment", "deployments", ["environment"])
    op.create_index("ix_deployments_status", "deployments", ["status"])


def downgrade() -> None:
    op.drop_index("ix_deployments_status", table_name="deployments")
    op.drop_index("ix_deployments_environment", table_name="deployments")
    op.drop_table("deployments")
    op.drop_table("services")

