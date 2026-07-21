"""ThreatDocument factory service."""

from datetime import UTC, datetime
from uuid import uuid4

from app.interfaces.ingestion import IThreatDocumentFactory
from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory
from app.models.threat_document import ThreatDocument


class ThreatDocumentFactory(IThreatDocumentFactory):
    """Builds canonical ThreatDocument domain objects."""

    def create(
        self,
        *,
        title: str,
        content: str,
        source: str,
        source_type: str,
        language: str,
        country: str,
        category: str,
        publish_date,
        metadata: dict,
        status: str,
        processing_stage: str,
        summary: str | None = None,
    ) -> ThreatDocument:
        return ThreatDocument(
            id=uuid4(),
            title=title,
            content=content,
            summary=summary,
            source=source,
            source_type=SourceType(source_type),
            language=language,
            country=country,
            category=ThreatCategory(category),
            publish_date=publish_date,
            created_at=datetime.now(UTC),
            metadata=metadata,
            status=DocumentStatus(status),
            processing_stage=ProcessingStage(processing_stage),
        )
