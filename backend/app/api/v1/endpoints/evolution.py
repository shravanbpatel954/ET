"""API endpoints for the Adaptive Scam Evolution Engine."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database.session import get_async_db_session
from app.schemas.evolution import EvolutionResultResponse
from app.services.evolution.evolution_service import EvolutionService

router = APIRouter()


def get_evolution_service() -> EvolutionService:
    """Dependency provider for EvolutionService."""
    return EvolutionService()


@router.post(
    "/analyze/{fingerprint_id}",
    response_model=EvolutionResultResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Analyze Scam Evolution",
    description="Compares a newly generated ScamFingerprint against historical data to determine if it is known, a variant, or novel."
)
async def analyze_evolution(
    fingerprint_id: UUID,
    db: AsyncSession = Depends(get_async_db_session),
    service: EvolutionService = Depends(get_evolution_service),
):
    """Trigger the Evolution analysis engine for a given fingerprint."""
    try:
        return await service.analyze_fingerprint(fingerprint_id, db)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get(
    "/{fingerprint_id}",
    response_model=EvolutionResultResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Evolution Result",
    description="Retrieves a previously generated evolution analysis result."
)
async def get_evolution_result(
    fingerprint_id: UUID,
    db: AsyncSession = Depends(get_async_db_session),
    service: EvolutionService = Depends(get_evolution_service),
):
    """Fetch result by fingerprint ID."""
    result = await service.get_evolution_result(fingerprint_id, db)
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No evolution result found for fingerprint {fingerprint_id}"
        )
    return result


@router.get(
    "/history",
    response_model=List[EvolutionResultResponse],
    status_code=status.HTTP_200_OK,
    summary="List Evolution History",
    description="Lists all historical scam evolution results with pagination."
)
async def list_evolution_history(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: AsyncSession = Depends(get_async_db_session),
    service: EvolutionService = Depends(get_evolution_service),
):
    """Fetch a list of evolution results."""
    # Note: Using /history to avoid collision with /{fingerprint_id} UUID parsing in FastAPI router
    return await service.list_history(db, skip=skip, limit=limit)
