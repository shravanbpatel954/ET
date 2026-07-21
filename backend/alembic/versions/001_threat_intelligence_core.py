"""Initial threat intelligence core tables.

Revision ID: 001_threat_intelligence_core
Revises:
Create Date: 2026-07-10
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "001_threat_intelligence_core"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "threat_documents",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(length=512), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=True),
        sa.Column("source", sa.String(length=512), nullable=False),
        sa.Column(
            "source_type",
            sa.Enum(
                "news_article_url",
                "pdf_advisory",
                "citizen_complaint",
                "police_report",
                "screenshot",
                "raw_text",
                "audio_transcript",
                "voice_call",
                "whatsapp_export",
                "email",
                "sms",
                "api_integration",
                name="source_type_enum",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("language", sa.String(length=16), nullable=False),
        sa.Column("country", sa.String(length=64), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                "unknown",
                "phishing",
                "investment_fraud",
                "impersonation",
                "lottery_scam",
                "loan_fraud",
                "job_scam",
                "tech_support",
                "romance_scam",
                "upi_fraud",
                "other",
                name="threat_category_enum",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("publish_date", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                "received",
                "processing",
                "stored",
                "failed",
                "archived",
                name="document_status_enum",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "processing_stage",
            sa.Enum(
                "validation",
                "normalization",
                "text_extraction",
                "metadata_extraction",
                "complete",
                name="processing_stage_enum",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_threat_documents_source", "threat_documents", ["source"])
    op.create_index("ix_threat_documents_source_type", "threat_documents", ["source_type"])
    op.create_index("ix_threat_documents_status", "threat_documents", ["status"])

    op.create_table(
        "document_metadata",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("key", sa.String(length=128), nullable=False),
        sa.Column("value", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["document_id"], ["threat_documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_document_metadata_document_id", "document_metadata", ["document_id"])
    op.create_index("ix_document_metadata_key", "document_metadata", ["key"])

    op.create_table(
        "processing_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("document_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "stage",
            sa.Enum(
                "validation",
                "normalization",
                "text_extraction",
                "metadata_extraction",
                "complete",
                name="log_processing_stage_enum",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["document_id"], ["threat_documents.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_processing_logs_document_id", "processing_logs", ["document_id"])

    op.create_table(
        "source_registry",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("source_name", sa.String(length=256), nullable=False),
        sa.Column(
            "source_type",
            sa.Enum(
                "news_article_url",
                "pdf_advisory",
                "citizen_complaint",
                "police_report",
                "screenshot",
                "raw_text",
                "audio_transcript",
                "voice_call",
                "whatsapp_export",
                "email",
                "sms",
                "api_integration",
                name="registry_source_type_enum",
                native_enum=False,
            ),
            nullable=False,
        ),
        sa.Column("trust_level", sa.String(length=32), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("metadata", postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_name"),
    )
    op.create_index("ix_source_registry_source_name", "source_registry", ["source_name"])


def downgrade() -> None:
    op.drop_index("ix_source_registry_source_name", table_name="source_registry")
    op.drop_table("source_registry")
    op.drop_index("ix_processing_logs_document_id", table_name="processing_logs")
    op.drop_table("processing_logs")
    op.drop_index("ix_document_metadata_key", table_name="document_metadata")
    op.drop_index("ix_document_metadata_document_id", table_name="document_metadata")
    op.drop_table("document_metadata")
    op.drop_index("ix_threat_documents_status", table_name="threat_documents")
    op.drop_index("ix_threat_documents_source_type", table_name="threat_documents")
    op.drop_index("ix_threat_documents_source", table_name="threat_documents")
    op.drop_table("threat_documents")
