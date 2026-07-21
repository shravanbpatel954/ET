"""API endpoints for the Scam Behavior Fingerprint Engine."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_async_db_session
from app.schemas.fingerprint import ScamFingerprintResponse
from app.services.fingerprint.fingerprint_service import FingerprintService

router = APIRouter()


def get_fingerprint_service() -> FingerprintService:
    """Dependency provider for FingerprintService."""
    return FingerprintService()


@router.post(
    "/{document_id}",
    response_model=ScamFingerprintResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Generate Scam Fingerprint",
    description="Generates a behavioral fingerprint for a specific scam document."
)
async def generate_fingerprint(
    document_id: UUID,
    db: AsyncSession = Depends(get_async_db_session),
    service: FingerprintService = Depends(get_fingerprint_service),
):
    """Trigger the Fingerprint generation engine for a given document."""
    try:
        return await service.generate_fingerprint(document_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/{document_id}",
    response_model=ScamFingerprintResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Scam Fingerprint",
    description="Retrieves a previously generated behavioral fingerprint."
)
async def get_fingerprint(
    document_id: UUID,
    db: AsyncSession = Depends(get_async_db_session),
    service: FingerprintService = Depends(get_fingerprint_service),
):
    """Fetch fingerprint by document ID."""
    fingerprint = await service.get_fingerprint(document_id, db)
    if not fingerprint:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No fingerprint found for document {document_id}"
        )
    return fingerprint


@router.get(
    "/",
    response_model=List[ScamFingerprintResponse],
    status_code=status.HTTP_200_OK,
    summary="List Scam Fingerprints",
    description="Lists all scam fingerprints with pagination."
)
async def list_fingerprints(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db_session),
    service: FingerprintService = Depends(get_fingerprint_service),
):
    """Fetch a list of fingerprints."""
    return await service.list_fingerprints(db, skip=skip, limit=limit)
