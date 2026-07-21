"""Document validation interface."""

from abc import ABC, abstractmethod

from app.ingestion.dto import IngestionInput


class IDocumentValidator(ABC):
    """Validates raw ingestion input before pipeline processing."""

    @abstractmethod
    async def validate(self, ingestion_input: IngestionInput) -> None:
        """Validate input; raise ValidationException on failure."""
