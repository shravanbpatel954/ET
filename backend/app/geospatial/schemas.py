"""
Geospatial Intelligence Pydantic Schemas
---------------------------------------
API Request/Response data contracts.
"""

from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ThreatLevel(str, Enum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class HotspotSchema(BaseModel):
    id: str = Field(..., description="Unique identifier for the hotspot")
    city: str = Field(..., description="City name")
    state: str = Field(..., description="State or Union Territory name")
    latitude: float = Field(..., description="Geographic latitude coordinate")
    longitude: float = Field(..., description="Geographic longitude coordinate")
    threat_category: str = Field(..., description="Primary scam / threat category")
    threat_level: ThreatLevel = Field(..., description="Risk level (HIGH, MEDIUM, LOW)")
    incident_count: int = Field(..., description="Total reported incident count")
    trend_percentage: float = Field(..., description="Incident count trend percentage (+/-)")
    description: str = Field(..., description="Brief contextual intelligence summary")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "hotspot-01",
                "city": "New Delhi",
                "state": "Delhi",
                "latitude": 28.6139,
                "longitude": 77.2090,
                "threat_category": "Digital Arrest",
                "threat_level": "HIGH",
                "incident_count": 34,
                "trend_percentage": 18.5,
                "description": "High frequency of fake law enforcement digital arrest calls targeting elderly citizens."
            }
        }


class GeoSummarySchema(BaseModel):
    total_hotspots: int = Field(..., description="Total number of active threat hotspots")
    high_risk_locations: int = Field(..., description="Count of locations categorized as HIGH risk")
    most_common_scam: str = Field(..., description="Most prevalent threat category across all hotspots")
    total_demo_incidents: int = Field(..., description="Total aggregated incident count across all hotspots")

    class Config:
        json_schema_extra = {
            "example": {
                "total_hotspots": 20,
                "high_risk_locations": 7,
                "most_common_scam": "Digital Arrest",
                "total_demo_incidents": 384
            }
        }
