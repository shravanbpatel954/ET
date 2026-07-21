"""Beanie ODM model for threat documents."""

import uuid
from datetime import datetime, timezone
from typing import Any

from beanie import Document, Indexed
from pydantic import BaseModel, Field

from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory


class DocumentMetadata(BaseModel):
    """Structured key-value metadata attached to a threat document."""
    
    key: str
    value: Any
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProcessingLog(BaseModel):
    """Audit trail for pipeline stage execution."""
    
    stage: ProcessingStage
    status: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ThreatDocumentModel(Document):
    """Persistent storage for standardized threat documents."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    title: str
    content: str
    summary: str | None = None
    source: Indexed(str)
    source_type: SourceType
    language: str = "unknown"
    country: str = "unknown"
    category: ThreatCategory = ThreatCategory.UNKNOWN
    publish_date: datetime | None = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    extra_metadata: dict[str, Any] = Field(default_factory=dict, alias="metadata")
    status: DocumentStatus = DocumentStatus.RECEIVED
    processing_stage: ProcessingStage = ProcessingStage.VALIDATION

    # Embedded sub-documents for NoSQL architecture
    document_metadata: list[DocumentMetadata] = Field(default_factory=list)
    processing_logs: list[ProcessingLog] = Field(default_factory=list)

    class Settings:
        name = "threat_documents"


class SourceRegistryModel(Document):
    """Registry of known intelligence sources."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    source_name: Indexed(str, unique=True)
    source_type: SourceType
    trust_level: str = "unknown"
    is_active: bool = True
    extra_metadata: dict[str, Any] = Field(default_factory=dict, alias="metadata")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "source_registry"
