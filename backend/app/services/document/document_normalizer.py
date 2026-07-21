"""Document normalization service."""

from app.core.config import get_settings
from app.ingestion.dto import IngestionInput, NormalizedDocument
from app.interfaces.normalizer import IDocumentNormalizer
from app.models.enums import ProcessingStage, SourceType
from app.utils.text import normalize_text


class DocumentNormalizer(IDocumentNormalizer):
    """Normalizes validated input envelopes and extracted text content."""

    async def normalize_input(self, ingestion_input: IngestionInput) -> IngestionInput:
        """Clean and standardize the input envelope before text extraction."""
        settings = get_settings()
        updates: dict = {
            "source": ingestion_input.source.strip(),
            "metadata": {k: v for k, v in ingestion_input.metadata.items() if v is not None},
        }

        if ingestion_input.title:
            updates["title"] = normalize_text(ingestion_input.title)
        if ingestion_input.content:
            updates["content"] = (
                _normalize_url(ingestion_input.content)
                if ingestion_input.source_type == SourceType.NEWS_ARTICLE_URL
                else ingestion_input.content.strip()
            )
        if ingestion_input.url:
            updates["url"] = _normalize_url(ingestion_input.url)
        if ingestion_input.country:
            updates["country"] = ingestion_input.country.strip().upper()
        elif settings.default_country:
            updates["country"] = settings.default_country

        return ingestion_input.model_copy(update=updates)

    async def normalize(self, document: NormalizedDocument) -> NormalizedDocument:
        normalized_content = normalize_text(document.content)
        normalized_title = normalize_text(document.title) if document.title else "Untitled Threat Document"

        return document.model_copy(
            update={
                "title": normalized_title,
                "content": normalized_content,
                "processing_stage": ProcessingStage.NORMALIZATION,
            },
        )


def _normalize_url(value: str) -> str:
    cleaned = value.strip()
    if cleaned.lower().startswith(("http://", "https://")):
        return cleaned
    return f"https://{cleaned}"
