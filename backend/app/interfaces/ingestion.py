"""Threat ingestion service interfaces."""

from abc import ABC, abstractmethod

from app.ingestion.dto import IngestionInput
from app.models.threat_document import ThreatDocument


class IThreatDocumentFactory(ABC):
    """Builds canonical ThreatDocument objects from pipeline output."""

    @abstractmethod
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
        """Create a new ThreatDocument domain object."""


class IThreatIngestionService(ABC):
    """Orchestrates the full threat document ingestion pipeline."""

    @abstractmethod
    async def ingest(self, ingestion_input: IngestionInput) -> ThreatDocument:
        """Run validation → normalization → extraction → storage pipeline."""
