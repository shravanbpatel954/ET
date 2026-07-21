"""Threat document ingestion and management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, File, Query, UploadFile

from app.core.exceptions import NotFoundException
from app.core.ingestion_exceptions import IngestionException
from app.dependencies.ingestion import (
    get_document_repository,
    get_ingestion_service,
)
from app.ingestion.dto import IngestionInput
from app.interfaces.ingestion import IThreatIngestionService
from app.models.enums import DocumentStatus, SourceType
from app.models.threat_document import ThreatDocument
from app.repositories.threat_document_repository import ThreatDocumentRepository
from app.schemas.documents import (
    DocumentDeleteResponse,
    TextDocumentCreateRequest,
    ThreatDocumentListResponse,
    ThreatDocumentResponse,
    URLDocumentCreateRequest,
)

router = APIRouter(prefix="/documents", tags=["Threat Intelligence"])


def _to_response(document: ThreatDocument) -> ThreatDocumentResponse:
    return ThreatDocumentResponse.model_validate(document.model_dump())


@router.post("/text", response_model=ThreatDocumentResponse, status_code=201)
async def ingest_text_document(
    payload: TextDocumentCreateRequest,
    ingestion_service: IThreatIngestionService = Depends(get_ingestion_service),
) -> ThreatDocumentResponse:
    """Ingest citizen complaints, police reports, or raw text."""
    ingestion_input = IngestionInput(
        source_type=payload.source_type,
        source=payload.source,
        content=payload.content,
        title=payload.title,
        country=payload.country,
        category=payload.category,
        publish_date=payload.publish_date,
        metadata=payload.metadata,
    )
    document = await ingestion_service.ingest(ingestion_input)
    return _to_response(document)


@router.post("/url", response_model=ThreatDocumentResponse, status_code=201)
async def ingest_url_document(
    payload: URLDocumentCreateRequest,
    ingestion_service: IThreatIngestionService = Depends(get_ingestion_service),
) -> ThreatDocumentResponse:
    """Ingest a news article from URL."""
    url = str(payload.url)
    ingestion_input = IngestionInput(
        source_type=SourceType.NEWS_ARTICLE_URL,
        source=payload.source or url,
        url=url,
        title=payload.title,
        country=payload.country,
        category=payload.category,
        metadata=payload.metadata,
    )
    document = await ingestion_service.ingest(ingestion_input)
    return _to_response(document)


@router.post("/pdf", response_model=ThreatDocumentResponse, status_code=201)
async def ingest_pdf_document(
    file: UploadFile = File(...),
    source: str | None = Query(default=None),
    title: str | None = Query(default=None),
    country: str | None = Query(default=None),
    ingestion_service: IThreatIngestionService = Depends(get_ingestion_service),
) -> ThreatDocumentResponse:
    """Ingest a PDF advisory document."""
    file_bytes = await file.read()
    if not file_bytes:
        raise IngestionException(message="Uploaded PDF file is empty")

    ingestion_input = IngestionInput(
        source_type=SourceType.PDF_ADVISORY,
        source=source or file.filename or "pdf_upload",
        file_bytes=file_bytes,
        filename=file.filename,
        title=title,
        country=country,
    )
    document = await ingestion_service.ingest(ingestion_input)
    return _to_response(document)


@router.post("/image", response_model=ThreatDocumentResponse, status_code=201)
async def ingest_image_document(
    file: UploadFile = File(...),
    source: str | None = Query(default=None),
    title: str | None = Query(default=None),
    country: str | None = Query(default=None),
    ingestion_service: IThreatIngestionService = Depends(get_ingestion_service),
) -> ThreatDocumentResponse:
    """Ingest a screenshot via OCR extraction."""
    file_bytes = await file.read()
    if not file_bytes:
        raise IngestionException(message="Uploaded image file is empty")

    ingestion_input = IngestionInput(
        source_type=SourceType.SCREENSHOT,
        source=source or file.filename or "screenshot_upload",
        file_bytes=file_bytes,
        filename=file.filename,
        title=title,
        country=country,
    )
    document = await ingestion_service.ingest(ingestion_input)
    return _to_response(document)


@router.get("", response_model=ThreatDocumentListResponse)
async def list_documents(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    source_type: SourceType | None = Query(default=None),
    status: DocumentStatus | None = Query(default=None),
    repository: ThreatDocumentRepository = Depends(get_document_repository),
) -> ThreatDocumentListResponse:
    """List ingested threat documents with optional filters."""
    items, total = await repository.list_documents(
        offset=offset,
        limit=limit,
        source_type=source_type,
        status=status,
    )
    return ThreatDocumentListResponse(
        items=[_to_response(item) for item in items],
        total=total,
        offset=offset,
        limit=limit,
    )


@router.get("/{document_id}", response_model=ThreatDocumentResponse)
async def get_document(
    document_id: UUID,
    repository: ThreatDocumentRepository = Depends(get_document_repository),
) -> ThreatDocumentResponse:
    """Retrieve a single threat document by ID."""
    document = await repository.get_by_id(document_id)
    if document is None:
        raise NotFoundException(
            message="Threat document not found",
            details={"id": str(document_id)},
        )
    return _to_response(document)


@router.delete("/{document_id}", response_model=DocumentDeleteResponse)
async def delete_document(
    document_id: UUID,
    repository: ThreatDocumentRepository = Depends(get_document_repository),
) -> DocumentDeleteResponse:
    """Delete a threat document by ID."""
    deleted = await repository.delete(document_id)
    if not deleted:
        raise NotFoundException(
            message="Threat document not found",
            details={"id": str(document_id)},
        )
    return DocumentDeleteResponse(deleted=True, id=document_id)
