"""Composite text extraction router."""

from app.core.ingestion_exceptions import ExtractionException
from app.ingestion.dto import ExtractionResult, IngestionInput
from app.interfaces.extractor import IArticleExtractor, IOCRService, IPDFParser, ITextExtractor
from app.models.enums import SourceType


class TextExtractorRouter:
    """Routes extraction to the appropriate handler based on source type."""

    def __init__(
        self,
        pdf_parser: IPDFParser,
        ocr_service: IOCRService,
        article_extractor: IArticleExtractor,
    ) -> None:
        self._pdf_parser = pdf_parser
        self._ocr_service = ocr_service
        self._article_extractor = article_extractor

    async def extract(self, ingestion_input: IngestionInput) -> ExtractionResult:
        source_type = ingestion_input.source_type

        if source_type == SourceType.NEWS_ARTICLE_URL:
            url = ingestion_input.url or ingestion_input.source
            return await self._article_extractor.extract(url)

        if source_type == SourceType.PDF_ADVISORY:
            assert ingestion_input.file_bytes is not None
            text = await self._pdf_parser.extract_text(
                ingestion_input.file_bytes,
                ingestion_input.filename,
            )
            return ExtractionResult(
                content=text,
                title=ingestion_input.title,
                source=ingestion_input.source,
                publish_date=ingestion_input.publish_date,
                metadata=ingestion_input.metadata,
            )

        if source_type == SourceType.SCREENSHOT:
            assert ingestion_input.file_bytes is not None
            text = await self._ocr_service.extract_text(
                ingestion_input.file_bytes,
                ingestion_input.filename,
            )
            return ExtractionResult(
                content=text,
                title=ingestion_input.title or "Screenshot Document",
                source=ingestion_input.source,
                metadata={**ingestion_input.metadata, "extraction_method": "ocr"},
            )

        if source_type in {
            SourceType.CITIZEN_COMPLAINT,
            SourceType.POLICE_REPORT,
            SourceType.RAW_TEXT,
        }:
            assert ingestion_input.content is not None
            return ExtractionResult(
                content=ingestion_input.content,
                title=ingestion_input.title,
                source=ingestion_input.source,
                publish_date=ingestion_input.publish_date,
                metadata=ingestion_input.metadata,
            )

        raise ExtractionException(
            message=f"No extractor available for source type: {source_type}",
            details={"source_type": source_type},
        )


class RawTextExtractor(ITextExtractor):
    """Text extractor adapter for interface compliance."""

    def __init__(self, router: TextExtractorRouter) -> None:
        self._router = router

    def supports(self, source_type: str) -> bool:
        return True

    async def extract(self, ingestion_input: IngestionInput) -> ExtractionResult:
        return await self._router.extract(ingestion_input)
