"""Threat ingestion orchestration service."""

from uuid import uuid4

from loguru import logger

from app.core.exceptions import ValidationException
from app.core.ingestion_exceptions import DocumentProcessingException
from app.ingestion.dto import IngestionInput, NormalizedDocument
from app.interfaces.ingestion import IThreatDocumentFactory, IThreatIngestionService
from app.interfaces.normalizer import IDocumentNormalizer
from app.interfaces.repository import IProcessingLogRepository, IThreatDocumentRepository
from app.interfaces.validator import IDocumentValidator
from app.models.enums import DocumentStatus, ProcessingLogStatus, ProcessingStage, ThreatCategory
from app.models.threat_document import ThreatDocument
from app.services.document.metadata_extractor import MetadataExtractor
from app.services.extraction.text_extractor import TextExtractorRouter


class ThreatIngestionService(IThreatIngestionService):
    """
    Orchestrates the Threat Intelligence Core ingestion pipeline.

    Pipeline:
        Input → Validation → Normalization → Text Extraction
              → Content Normalization → Metadata Extraction → ThreatDocument → Database

    For text-based sources, content is available before extraction (pass-through).
    For binary/URL sources, text normalization runs after extraction.
    """

    def __init__(
        self,
        validator: IDocumentValidator,
        normalizer: IDocumentNormalizer,
        text_extractor: TextExtractorRouter,
        metadata_extractor: MetadataExtractor,
        document_factory: IThreatDocumentFactory,
        document_repository: IThreatDocumentRepository,
        processing_log_repository: IProcessingLogRepository,
    ) -> None:
        self._validator = validator
        self._normalizer = normalizer
        self._text_extractor = text_extractor
        self._metadata_extractor = metadata_extractor
        self._document_factory = document_factory
        self._document_repository = document_repository
        self._processing_log_repository = processing_log_repository

    async def ingest(self, ingestion_input: IngestionInput) -> ThreatDocument:
        trace_id = uuid4()

        try:
            # Stage 1: Validation
            await self._validator.validate(ingestion_input)
            logger.info(
                "Validation passed | trace={} | source_type={} | source={}",
                trace_id,
                ingestion_input.source_type,
                ingestion_input.source,
            )

            # Stage 2: Input Normalization
            normalized_input = await self._normalizer.normalize_input(ingestion_input)

            # Stage 3: Text Extraction
            extraction = await self._text_extractor.extract(normalized_input)
            document = NormalizedDocument(
                title=extraction.title or normalized_input.title or "Untitled Threat Document",
                content=extraction.content,
                source=extraction.source or normalized_input.source,
                source_type=normalized_input.source_type,
                country=normalized_input.country or "unknown",
                category=normalized_input.category or ThreatCategory.UNKNOWN,
                publish_date=extraction.publish_date or normalized_input.publish_date,
                metadata={**normalized_input.metadata, **extraction.metadata},
                processing_stage=ProcessingStage.TEXT_EXTRACTION,
            )

            # Stage 4: Content Normalization
            document = await self._normalizer.normalize(document)

            # Stage 5: Metadata Extraction
            document.processing_stage = ProcessingStage.METADATA_EXTRACTION
            extracted_meta = await self._metadata_extractor.extract(document)

            # Stage 6: Build ThreatDocument
            threat_document = self._document_factory.create(
                title=extracted_meta["title"],
                content=document.content,
                source=document.source,
                source_type=document.source_type.value,
                language=extracted_meta["language"],
                country=extracted_meta["country"],
                category=(normalized_input.category or ThreatCategory.UNKNOWN).value,
                publish_date=extracted_meta["publish_date"],
                metadata=extracted_meta["metadata"],
                status=DocumentStatus.STORED,
                processing_stage=ProcessingStage.COMPLETE,
                summary=None,
            )

            # Stage 7: Persist
            stored = await self._document_repository.create(threat_document)

            await self._processing_log_repository.log_stage(
                document_id=stored.id,
                stage=ProcessingStage.COMPLETE,
                status=ProcessingLogStatus.SUCCESS,
                message="Document ingested and stored successfully",
                details={
                    "source_type": stored.source_type,
                    "trace_id": str(trace_id),
                },
            )

            logger.info(
                "Document ingested | id={} | source_type={} | title={}",
                stored.id,
                stored.source_type,
                stored.title,
            )
            return stored

        except ValidationException:
            raise
        except Exception as exc:
            logger.exception("Ingestion pipeline failed | trace={}: {}", trace_id, exc)
            raise DocumentProcessingException(
                message="Threat document ingestion failed",
                details={
                    "error": str(exc),
                    "source_type": ingestion_input.source_type,
                    "trace_id": str(trace_id),
                },
            ) from exc
