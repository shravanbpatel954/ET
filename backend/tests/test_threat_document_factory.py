"""Unit tests for ThreatDocument factory."""

from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory
from app.services.ingestion.threat_document_factory import ThreatDocumentFactory


def test_factory_creates_valid_document() -> None:
    factory = ThreatDocumentFactory()
    document = factory.create(
        title="Test Scam Alert",
        content="Victim received fraudulent UPI request.",
        source="citizen_portal",
        source_type=SourceType.CITIZEN_COMPLAINT.value,
        language="en",
        country="IN",
        category=ThreatCategory.UPI_FRAUD.value,
        publish_date=None,
        metadata={"channel": "web"},
        status=DocumentStatus.STORED.value,
        processing_stage=ProcessingStage.COMPLETE.value,
    )

    assert document.title == "Test Scam Alert"
    assert document.source_type == SourceType.CITIZEN_COMPLAINT
    assert document.status == DocumentStatus.STORED
    assert document.processing_stage == ProcessingStage.COMPLETE
    assert document.id is not None
