"""Unit tests for document validation."""

import pytest

from app.core.config import Settings
from app.core.exceptions import ValidationException
from app.core.ingestion_exceptions import UnsupportedSourceException
from app.ingestion.dto import IngestionInput
from app.models.enums import SourceType
from app.services.document.document_validator import DocumentValidator


@pytest.fixture
def validator() -> DocumentValidator:
    return DocumentValidator(Settings(min_text_length=10, max_upload_size_mb=10))


@pytest.mark.asyncio
async def test_validate_raw_text_success(validator: DocumentValidator) -> None:
    ingestion_input = IngestionInput(
        source_type=SourceType.RAW_TEXT,
        source="citizen_portal",
        content="This is a valid citizen complaint about a UPI scam.",
    )
    await validator.validate(ingestion_input)


@pytest.mark.asyncio
async def test_validate_text_too_short(validator: DocumentValidator) -> None:
    ingestion_input = IngestionInput(
        source_type=SourceType.RAW_TEXT,
        source="citizen_portal",
        content="short",
    )
    with pytest.raises(ValidationException):
        await validator.validate(ingestion_input)


@pytest.mark.asyncio
async def test_validate_future_source_rejected(validator: DocumentValidator) -> None:
    ingestion_input = IngestionInput(
        source_type=SourceType.WHATSAPP_EXPORT,
        source="whatsapp",
        content="Some exported chat content that is long enough.",
    )
    with pytest.raises(UnsupportedSourceException):
        await validator.validate(ingestion_input)


@pytest.mark.asyncio
async def test_validate_invalid_url(validator: DocumentValidator) -> None:
    ingestion_input = IngestionInput(
        source_type=SourceType.NEWS_ARTICLE_URL,
        source="bad-url",
        url="not-a-valid-url",
    )
    with pytest.raises(ValidationException):
        await validator.validate(ingestion_input)


@pytest.mark.asyncio
async def test_validate_pdf_requires_bytes(validator: DocumentValidator) -> None:
    ingestion_input = IngestionInput(
        source_type=SourceType.PDF_ADVISORY,
        source="advisory.pdf",
    )
    with pytest.raises(ValidationException):
        await validator.validate(ingestion_input)
