"""Text and metadata extraction interfaces."""

from abc import ABC, abstractmethod
from typing import Any

from app.ingestion.dto import ExtractionResult, IngestionInput, NormalizedDocument


class ITextExtractor(ABC):
    """Extracts raw text from various input formats."""

    @abstractmethod
    def supports(self, source_type: str) -> bool:
        """Return True if this extractor handles the given source type."""

    @abstractmethod
    async def extract(self, ingestion_input: IngestionInput) -> ExtractionResult:
        """Extract text and optional metadata from input."""


class IMetadataExtractor(ABC):
    """Extracts structured metadata from normalized document content."""

    @abstractmethod
    async def extract(self, document: NormalizedDocument) -> dict[str, Any]:
        """Return extracted metadata dictionary."""


class IOCRService(ABC):
    """Optical character recognition for image-based inputs."""

    @abstractmethod
    async def extract_text(self, image_bytes: bytes, filename: str | None = None) -> str:
        """Extract text from image bytes."""


class IPDFParser(ABC):
    """PDF document text extraction."""

    @abstractmethod
    async def extract_text(self, pdf_bytes: bytes, filename: str | None = None) -> str:
        """Extract text from PDF bytes."""


class IArticleExtractor(ABC):
    """Web article content extraction."""

    @abstractmethod
    async def extract(self, url: str) -> ExtractionResult:
        """Fetch and extract article content from URL."""


class ILanguageDetector(ABC):
    """Language detection for document content."""

    @abstractmethod
    async def detect(self, text: str) -> str:
        """Return ISO 639-1 language code or 'unknown'."""
