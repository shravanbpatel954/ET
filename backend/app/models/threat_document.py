"""Canonical ThreatDocument domain model consumed by all platform modules."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory


class ThreatDocument(BaseModel):
    """
    Standardized threat intelligence document.

    Every ingestion path must produce this object before persistence.
    All downstream modules (scoring, graph, adaptive learning) consume it.
    """

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    content: str
    summary: str | None = None
    source: str
    source_type: SourceType
    language: str = "unknown"
    country: str = "unknown"
    category: ThreatCategory = ThreatCategory.UNKNOWN
    publish_date: datetime | None = None
    created_at: datetime
    metadata: dict[str, Any] = Field(default_factory=dict)
    status: DocumentStatus = DocumentStatus.RECEIVED
    processing_stage: ProcessingStage = ProcessingStage.VALIDATION
