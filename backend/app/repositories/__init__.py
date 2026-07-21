"""Repository layer for the Threat Intelligence Core."""

from app.repositories.processing_log_repository import ProcessingLogRepository
from app.repositories.threat_document_repository import ThreatDocumentRepository

__all__ = ["ProcessingLogRepository", "ThreatDocumentRepository"]
