"""Document validation service."""

from urllib.parse import urlparse

from app.core.config import Settings
from app.core.exceptions import ValidationException
from app.core.ingestion_exceptions import UnsupportedSourceException
from app.ingestion.dto import IngestionInput
from app.interfaces.validator import IDocumentValidator
from app.models.enums import SourceType

MVP_SOURCE_TYPES = {
    SourceType.NEWS_ARTICLE_URL,
    SourceType.PDF_ADVISORY,
    SourceType.CITIZEN_COMPLAINT,
    SourceType.POLICE_REPORT,
    SourceType.SCREENSHOT,
    SourceType.RAW_TEXT,
}

FUTURE_SOURCE_TYPES = {
    SourceType.AUDIO_TRANSCRIPT,
    SourceType.VOICE_CALL,
    SourceType.WHATSAPP_EXPORT,
    SourceType.EMAIL,
    SourceType.SMS,
    SourceType.API_INTEGRATION,
}


class DocumentValidator(IDocumentValidator):
    """Validates ingestion input against source-type rules."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def validate(self, ingestion_input: IngestionInput) -> None:
        if ingestion_input.source_type in FUTURE_SOURCE_TYPES:
            raise UnsupportedSourceException(
                message=f"Source type '{ingestion_input.source_type}' is reserved for future release",
                details={"source_type": ingestion_input.source_type},
            )

        if ingestion_input.source_type not in MVP_SOURCE_TYPES:
            raise ValidationException(
                message=f"Unknown source type: {ingestion_input.source_type}",
                details={"source_type": ingestion_input.source_type},
            )

        if not ingestion_input.source.strip():
            raise ValidationException(message="Source identifier is required")

        await self._validate_by_source_type(ingestion_input)

    async def _validate_by_source_type(self, ingestion_input: IngestionInput) -> None:
        source_type = ingestion_input.source_type

        if source_type == SourceType.NEWS_ARTICLE_URL:
            self._validate_url(ingestion_input.url or ingestion_input.source)

        elif source_type == SourceType.PDF_ADVISORY:
            self._validate_file(ingestion_input.file_bytes, allowed_extensions={".pdf"})

        elif source_type == SourceType.SCREENSHOT:
            self._validate_file(
                ingestion_input.file_bytes,
                allowed_extensions={".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff"},
            )

        elif source_type in {
            SourceType.CITIZEN_COMPLAINT,
            SourceType.POLICE_REPORT,
            SourceType.RAW_TEXT,
        }:
            self._validate_text(ingestion_input.content)

    def _validate_url(self, url: str | None) -> None:
        if not url:
            raise ValidationException(message="URL is required for article ingestion")
        url = self._normalize_url(url)
        parsed = urlparse(url)
        if parsed.scheme not in {"http", "https"} or not parsed.netloc or "." not in parsed.netloc:
            raise ValidationException(message="Invalid URL format", details={"url": url})

    def _normalize_url(self, url: str) -> str:
        cleaned = url.strip()
        if cleaned.lower().startswith(("http://", "https://")):
            return cleaned
        return f"https://{cleaned}"

    def _validate_file(
        self,
        file_bytes: bytes | None,
        *,
        allowed_extensions: set[str],
    ) -> None:
        if not file_bytes:
            raise ValidationException(message="File content is required")
        if len(file_bytes) > self._settings.max_upload_bytes:
            raise ValidationException(
                message=f"File exceeds maximum size of {self._settings.max_upload_size_mb} MB",
            )
        if len(file_bytes) < 16:
            raise ValidationException(message="File content is too small to be valid")

    def _validate_text(self, content: str | None) -> None:
        if not content or not content.strip():
            raise ValidationException(message="Text content is required")
        if len(content.strip()) < self._settings.min_text_length:
            raise ValidationException(
                message=f"Text must be at least {self._settings.min_text_length} characters",
            )
