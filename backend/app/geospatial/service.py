"""
Geospatial Intelligence Service Layer
-------------------------------------
Encapsulates business logic, data filtering, sorting, and statistical aggregations.
"""

from collections import Counter
from typing import List, Optional
from app.geospatial.models import AbstractHotspotRepository
from app.geospatial.schemas import GeoSummarySchema, HotspotSchema, ThreatLevel


class GeoIntelligenceService:
    """Service containing core business logic for geospatial cyber threat operations."""

    def __init__(self, repository: AbstractHotspotRepository):
        self.repository = repository

    async def get_hotspots(
        self,
        category: Optional[str] = None,
        threat_level: Optional[str] = None
    ) -> List[HotspotSchema]:
        """
        Fetch hotspots, apply filters if provided, and sort by incident count (descending).
        """
        domain_items = await self.repository.get_all_hotspots(
            category=category,
            threat_level=threat_level
        )

        # Sort hotspots by incident_count descending
        sorted_items = sorted(domain_items, key=lambda x: x.incident_count, reverse=True)

        return [
            HotspotSchema(
                id=item.id,
                city=item.city,
                state=item.state,
                latitude=item.latitude,
                longitude=item.longitude,
                threat_category=item.threat_category,
                threat_level=ThreatLevel(item.threat_level.upper()),
                incident_count=item.incident_count,
                trend_percentage=item.trend_percentage,
                description=item.description
            )
            for item in sorted_items
        ]

    async def get_summary(self) -> GeoSummarySchema:
        """
        Compute high-level summary KPIs for National Cyber Threat Map.
        Returns:
            - total_hotspots: count of total hotspots
            - high_risk_locations: count of HIGH threat_level hotspots
            - most_common_scam: category occurring most frequently
            - total_demo_incidents: total aggregated incident count
        """
        all_items = await self.repository.get_all_hotspots()

        if not all_items:
            return GeoSummarySchema(
                total_hotspots=0,
                high_risk_locations=0,
                most_common_scam="N/A",
                total_demo_incidents=0
            )

        total_hotspots = len(all_items)
        high_risk_locations = sum(1 for h in all_items if h.threat_level.upper() == "HIGH")
        total_incidents = sum(h.incident_count for h in all_items)

        # Find most common scam by total incidents across categories
        category_incident_totals = Counter()
        for h in all_items:
            category_incident_totals[h.threat_category] += h.incident_count

        most_common_scam = category_incident_totals.most_common(1)[0][0] if category_incident_totals else "N/A"

        return GeoSummarySchema(
            total_hotspots=total_hotspots,
            high_risk_locations=high_risk_locations,
            most_common_scam=most_common_scam,
            total_demo_incidents=total_incidents
        )
