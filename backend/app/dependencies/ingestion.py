"""Dependency injection wiring for the Threat Intelligence Core."""

from collections.abc import AsyncGenerator

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import Settings
from app.database.session import get_async_session_factory
from app.interfaces.ingestion import IThreatIngestionService
from app.repositories.processing_log_repository import ProcessingLogRepository
from app.repositories.threat_document_repository import ThreatDocumentRepository
from app.services.document.document_normalizer import DocumentNormalizer
from app.services.document.document_validator import DocumentValidator
from app.services.document.language_detector import LanguageDetector
from app.services.document.metadata_extractor import MetadataExtractor
from app.services.extraction.article_extractor import ArticleExtractor
from app.services.extraction.ocr_service import OCRService
from app.services.extraction.pdf_parser import PDFParser
from app.services.extraction.text_extractor import TextExtractorRouter
from app.services.ingestion.threat_document_factory import ThreatDocumentFactory
from app.services.ingestion.threat_ingestion_service import ThreatIngestionService


async def get_async_db(
    request: Request,
) -> AsyncGenerator[AsyncSession, None]:
    """Provide an async database session bound to the application settings."""
    yield None


def _build_ingestion_service(
    settings: Settings,
    session: AsyncSession,
) -> ThreatIngestionService:
    """Construct the ingestion service graph for a request."""
    language_detector = LanguageDetector()
    metadata_extractor = MetadataExtractor(settings, language_detector)
    text_extractor = TextExtractorRouter(
        pdf_parser=PDFParser(),
        ocr_service=OCRService(settings),
        article_extractor=ArticleExtractor(settings),
    )

    return ThreatIngestionService(
        validator=DocumentValidator(settings),
        normalizer=DocumentNormalizer(),
        text_extractor=text_extractor,
        metadata_extractor=metadata_extractor,
        document_factory=ThreatDocumentFactory(),
        document_repository=ThreatDocumentRepository(session),
        processing_log_repository=ProcessingLogRepository(session),
    )


async def get_ingestion_service(
    request: Request,
    session: AsyncSession = Depends(get_async_db),
) -> IThreatIngestionService:
    """Inject the threat ingestion service."""
    settings: Settings = request.app.state.settings
    return _build_ingestion_service(settings, session)


async def get_document_repository(
    session: AsyncSession = Depends(get_async_db),
) -> ThreatDocumentRepository:
    """Inject the threat document repository."""
    return ThreatDocumentRepository(session)
