"""Repository interfaces for threat intelligence persistence."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.models.enums import DocumentStatus, SourceType
from app.models.threat_document import ThreatDocument


class IThreatDocumentRepository(ABC):
    """Persistence contract for ThreatDocument entities."""

    @abstractmethod
    async def create(self, document: ThreatDocument) -> ThreatDocument:
        """Persist a new threat document."""

    @abstractmethod
    async def get_by_id(self, document_id: UUID) -> ThreatDocument | None:
        """Retrieve a threat document by ID."""

    @abstractmethod
    async def list_documents(
        self,
        *,
        offset: int = 0,
        limit: int = 20,
        source_type: SourceType | None = None,
        status: DocumentStatus | None = None,
    ) -> tuple[list[ThreatDocument], int]:
        """List documents with optional filters; returns (items, total_count)."""

    @abstractmethod
    async def delete(self, document_id: UUID) -> bool:
        """Delete a threat document; returns True if deleted."""

    @abstractmethod
    async def update(self, document: ThreatDocument) -> ThreatDocument:
        """Update an existing threat document."""


class IProcessingLogRepository(ABC):
    """Persistence contract for pipeline processing logs."""

    @abstractmethod
    async def log_stage(
        self,
        document_id: UUID,
        stage: str,
        status: str,
        message: str,
        details: dict | None = None,
    ) -> None:
        """Record a pipeline stage execution log."""
