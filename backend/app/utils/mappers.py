"""Mapping utilities between ORM entities and domain models."""

from app.database.models.threat import ThreatDocumentModel
from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory
from app.models.threat_document import ThreatDocument


def orm_to_domain(model: ThreatDocumentModel) -> ThreatDocument:
    """Convert a Beanie ThreatDocumentModel to a domain ThreatDocument."""
    metadata = dict(model.extra_metadata or {})
    for item in model.document_metadata or []:
        metadata[item.key] = item.value

    return ThreatDocument(
        id=model.id,
        title=model.title,
        content=model.content,
        summary=model.summary,
        source=model.source,
        source_type=SourceType(model.source_type),
        language=model.language,
        country=model.country,
        category=ThreatCategory(model.category),
        publish_date=model.publish_date,
        created_at=model.created_at,
        metadata=metadata,
        status=DocumentStatus(model.status),
        processing_stage=ProcessingStage(model.processing_stage),
    )


def domain_to_orm(document: ThreatDocument) -> ThreatDocumentModel:
    """Convert a domain ThreatDocument to a SQLAlchemy ThreatDocumentModel."""
    return ThreatDocumentModel(
        id=document.id,
        title=document.title,
        content=document.content,
        summary=document.summary,
        source=document.source,
        source_type=document.source_type,
        language=document.language,
        country=document.country,
        category=document.category,
        publish_date=document.publish_date,
        created_at=document.created_at,
        extra_metadata=document.metadata,
        status=document.status,
        processing_stage=document.processing_stage,
    )
