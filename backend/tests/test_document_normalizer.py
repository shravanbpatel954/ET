"""Unit tests for document normalization."""

import pytest

from app.ingestion.dto import IngestionInput, NormalizedDocument
from app.models.enums import SourceType
from app.services.document.document_normalizer import DocumentNormalizer


@pytest.mark.asyncio
async def test_normalize_input_trims_and_uppercases_country() -> None:
    normalizer = DocumentNormalizer()
    ingestion_input = IngestionInput(
        source_type=SourceType.RAW_TEXT,
        source="  citizen-portal  ",
        content="Some complaint text here with enough length.",
        country="in",
        metadata={"channel": "web", "empty": None},
    )
    result = await normalizer.normalize_input(ingestion_input)
    assert result.source == "citizen-portal"
    assert result.country == "IN"
    assert "empty" not in result.metadata


@pytest.mark.asyncio
async def test_normalize_collapses_whitespace() -> None:
    normalizer = DocumentNormalizer()
    document = NormalizedDocument(
        title="  Test   Title  ",
        content="Line one.\n\n\n\nLine   two.",
        source="test",
        source_type=SourceType.RAW_TEXT,
    )
    result = await normalizer.normalize(document)
    assert result.title == "Test Title"
    assert "Line one." in result.content
    assert "Line two." in result.content
