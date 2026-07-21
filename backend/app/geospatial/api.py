"""
Geospatial Intelligence API Router
-----------------------------------
FastAPI APIRouter exposing /geo endpoints.
Strictly handles HTTP request parsing and delegates all logic to GeoIntelligenceService.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from app.geospatial.data import DemoHotspotRepository
from app.geospatial.schemas import GeoSummarySchema, HotspotSchema
from app.geospatial.service import GeoIntelligenceService

# APIRouter instance with prefix '/geo'
router = APIRouter(prefix="/geo", tags=["Geospatial Intelligence"])


def get_geo_service() -> GeoIntelligenceService:
    """
    Dependency provider for GeoIntelligenceService.
    To use MongoDB in production, replace DemoHotspotRepository with MongoHotspotRepository here.
    """
    repo = DemoHotspotRepository()
    return GeoIntelligenceService(repository=repo)


@router.get(
    "/hotspots",
    response_model=List[HotspotSchema],
    status_code=status.HTTP_200_OK,
    summary="Get Cybercrime Hotspots",
    description="Returns list of national cybercrime hotspots sorted by incident count with optional category/threat filters."
)
async def get_hotspots(
    category: Optional[str] = Query(None, description="Filter by threat category e.g. 'Digital Arrest'"),
    threat_level: Optional[str] = Query(None, description="Filter by threat level ('HIGH', 'MEDIUM', 'LOW')"),
    service: GeoIntelligenceService = Depends(get_geo_service)
) -> List[HotspotSchema]:
    """Retrieve hotspots sorted by risk and incident density."""
    return await service.get_hotspots(category=category, threat_level=threat_level)


@router.get(
    "/summary",
    response_model=GeoSummarySchema,
    status_code=status.HTTP_200_OK,
    summary="Get Geospatial Intelligence KPI Summary",
    description="Returns top-level national summary statistics: total hotspots, high risk locations, top scam, total incidents."
)
async def get_summary(
    service: GeoIntelligenceService = Depends(get_geo_service)
) -> GeoSummarySchema:
    """Retrieve aggregate national intelligence metrics."""
    return await service.get_summary()
