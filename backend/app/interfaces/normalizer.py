"""Document normalization interface."""

from abc import ABC, abstractmethod

from app.ingestion.dto import IngestionInput, NormalizedDocument


class IDocumentNormalizer(ABC):
    """Normalizes validated input and extracted content into a consistent format."""

    @abstractmethod
    async def normalize_input(self, ingestion_input: IngestionInput) -> IngestionInput:
        """Normalize the input envelope before text extraction (source, metadata, hints)."""

    @abstractmethod
    async def normalize(self, document: NormalizedDocument) -> NormalizedDocument:
        """Normalize extracted text content after text extraction."""
