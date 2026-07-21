"""Service and repository interfaces for dependency inversion."""

from app.interfaces.extractor import (
    IArticleExtractor,
    ILanguageDetector,
    IMetadataExtractor,
    IOCRService,
    IPDFParser,
    ITextExtractor,
)
from app.interfaces.ingestion import IThreatDocumentFactory, IThreatIngestionService
from app.interfaces.normalizer import IDocumentNormalizer
from app.interfaces.repository import IProcessingLogRepository, IThreatDocumentRepository
from app.interfaces.validator import IDocumentValidator

__all__ = [
    "IArticleExtractor",
    "IDocumentNormalizer",
    "IDocumentValidator",
    "ILanguageDetector",
    "IMetadataExtractor",
    "IOCRService",
    "IPDFParser",
    "IProcessingLogRepository",
    "ITextExtractor",
    "IThreatDocumentFactory",
    "IThreatDocumentRepository",
    "IThreatIngestionService",
]
