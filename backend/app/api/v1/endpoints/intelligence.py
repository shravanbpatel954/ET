"""API endpoints for LLM Threat Intelligence Extraction."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_async_db_session
from app.schemas.intelligence import ThreatIntelligenceResponse
from app.services.intelligence.threat_intelligence_service import ThreatIntelligenceService

router = APIRouter()


def get_intelligence_service() -> ThreatIntelligenceService:
    """Dependency provider for ThreatIntelligenceService."""
    return ThreatIntelligenceService()


@router.post(
    "/{document_id}",
    response_model=ThreatIntelligenceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Extract Threat Intelligence",
    description="Uses Gemini LLM to extract structured cyber threat intelligence from a document."
)
async def extract_intelligence(
    document_id: UUID,
    db: AsyncSession = Depends(get_async_db_session),
    service: ThreatIntelligenceService = Depends(get_intelligence_service),
):
    """Trigger the LLM extraction engine for a given document."""
    try:
        return await service.extract_intelligence(document_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/{document_id}",
    response_model=ThreatIntelligenceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Threat Intelligence",
    description="Retrieves previously extracted threat intelligence for a document."
)
async def get_intelligence(
    document_id: UUID,
    db: AsyncSession = Depends(get_async_db_session),
    service: ThreatIntelligenceService = Depends(get_intelligence_service),
):
    """Fetch extracted intelligence from the database."""
    intel = await service.get_intelligence(document_id, db)
    if not intel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No intelligence found for document {document_id}"
        )
    return intel
