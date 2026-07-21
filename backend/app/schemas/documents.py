"""API schemas for threat document endpoints."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field, HttpUrl

from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory


class TextDocumentCreateRequest(BaseModel):
    """Request body for raw text document ingestion."""

    content: str = Field(..., min_length=1)
    source: str = Field(..., min_length=1, description="Origin identifier or channel")
    source_type: SourceType = Field(
        default=SourceType.RAW_TEXT,
        description="citizen_complaint | police_report | raw_text",
    )
    title: str | None = None
    country: str | None = None
    category: ThreatCategory | None = None
    publish_date: datetime | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class URLDocumentCreateRequest(BaseModel):
    """Request body for news article URL ingestion."""

    url: HttpUrl
    source: str | None = Field(default=None, description="Override source identifier")
    title: str | None = None
    country: str | None = None
    category: ThreatCategory | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class ThreatDocumentResponse(BaseModel):
    """Standard threat document API response."""

    id: UUID
    title: str
    content: str
    summary: str | None
    source: str
    source_type: SourceType
    language: str
    country: str
    category: ThreatCategory
    publish_date: datetime | None
    created_at: datetime
    metadata: dict[str, Any]
    status: DocumentStatus
    processing_stage: ProcessingStage

    model_config = {"from_attributes": True}


class ThreatDocumentListResponse(BaseModel):
    """Paginated list of threat documents."""

    items: list[ThreatDocumentResponse]
    total: int
    offset: int
    limit: int


class DocumentDeleteResponse(BaseModel):
    """Response after document deletion."""

    deleted: bool
    id: UUID
