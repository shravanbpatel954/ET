"""
Geospatial Intelligence Module
--------------------------------
A plug-and-play FastAPI module for National Cyber Threat Intelligence mapping.
Exposes APIRouter 'router' and service dependency providers.
"""

from app.geospatial.api import router as geo_router
from app.geospatial.service import GeoIntelligenceService
from app.geospatial.data import DemoHotspotRepository

__all__ = ["geo_router", "GeoIntelligenceService", "DemoHotspotRepository"]
