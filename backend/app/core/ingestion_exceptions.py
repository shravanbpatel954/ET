"""Ingestion-specific exceptions."""

from typing import Any

from app.core.exceptions import SentinelAPIException, ValidationException


class IngestionException(SentinelAPIException):
    """Raised when the ingestion pipeline fails."""

    def __init__(
        self,
        message: str = "Ingestion failed",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=422,
            error_code="INGESTION_ERROR",
            details=details,
        )


class ExtractionException(SentinelAPIException):
    """Raised when text or metadata extraction fails."""

    def __init__(
        self,
        message: str = "Extraction failed",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=422,
            error_code="EXTRACTION_ERROR",
            details=details,
        )


class DocumentProcessingException(SentinelAPIException):
    """Raised when document processing encounters an unrecoverable error."""

    def __init__(
        self,
        message: str = "Document processing failed",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(
            message=message,
            status_code=500,
            error_code="PROCESSING_ERROR",
            details=details,
        )


class UnsupportedSourceException(ValidationException):
    """Raised when an unsupported or future-only source type is submitted."""

    def __init__(
        self,
        message: str = "Unsupported source type",
        details: dict[str, Any] | None = None,
    ) -> None:
        super().__init__(message=message, details=details)
        self.error_code = "UNSUPPORTED_SOURCE"
