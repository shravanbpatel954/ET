"""Data transfer objects for the ingestion pipeline."""

from datetime import datetime
from typing import Any
from uuid import UUID, uuid4

from pydantic import BaseModel, Field

from app.models.enums import ProcessingStage, SourceType, ThreatCategory


class IngestionInput(BaseModel):
    """Raw input received by the ingestion pipeline."""

    source_type: SourceType
    source: str = Field(description="Origin identifier: URL, filename, or channel name")
    content: str | None = Field(default=None, description="Raw text content if available")
    file_bytes: bytes | None = Field(default=None, exclude=True)
    filename: str | None = None
    url: str | None = None
    title: str | None = None
    country: str | None = None
    category: ThreatCategory | None = None
    publish_date: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)

    model_config = {"arbitrary_types_allowed": True}


class ExtractionResult(BaseModel):
    """Output from a text extraction service."""

    content: str
    title: str | None = None
    source: str | None = None
    publish_date: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class NormalizedDocument(BaseModel):
    """Intermediate representation after validation and normalization."""

    id: UUID = Field(default_factory=uuid4)
    title: str
    content: str
    source: str
    source_type: SourceType
    language: str = "unknown"
    country: str = "unknown"
    category: ThreatCategory = ThreatCategory.UNKNOWN
    publish_date: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)
    processing_stage: ProcessingStage = ProcessingStage.NORMALIZATION

    model_config = {"arbitrary_types_allowed": True}
