"""Metadata extraction service."""

from datetime import UTC, datetime
from typing import Any
from urllib.parse import urlparse

from app.core.config import Settings
from app.ingestion.dto import NormalizedDocument
from app.interfaces.extractor import ILanguageDetector, IMetadataExtractor
from app.utils.text import normalize_text


class MetadataExtractor(IMetadataExtractor):
    """Extracts structured metadata from normalized document content."""

    def __init__(
        self,
        settings: Settings,
        language_detector: ILanguageDetector,
    ) -> None:
        self._settings = settings
        self._language_detector = language_detector

    async def extract(self, document: NormalizedDocument) -> dict[str, Any]:
        language = document.language
        if language == "unknown":
            language = await self._language_detector.detect(document.content)

        country = document.country or self._settings.default_country
        title = document.title or self._derive_title(document.content)
        publish_date = document.publish_date
        domain = self._extract_domain(document.source)

        metadata = {
            **document.metadata,
            "content_length": len(document.content),
            "word_count": len(document.content.split()),
            "source_domain": domain,
            "extracted_at": datetime.now(UTC).isoformat(),
        }

        return {
            "title": title,
            "language": language,
            "country": country,
            "publish_date": publish_date,
            "metadata": metadata,
        }

    def _derive_title(self, content: str) -> str:
        first_line = content.split("\n", 1)[0].strip()
        if len(first_line) >= 10:
            return normalize_text(first_line[:512])
        snippet = content[:512].strip()
        return snippet if snippet else "Untitled Threat Document"

    def _extract_domain(self, source: str) -> str | None:
        if source.startswith(("http://", "https://")):
            return urlparse(source).netloc
        return None
