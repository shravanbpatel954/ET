"""
Geospatial Intelligence Domain Models & Repository Interface
-------------------------------------------------------------
Defines abstract data access layer for loose coupling.
Swap data providers (e.g. In-Memory Demo -> MongoDB / Postgres) seamlessly.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class HotspotDomain:
    """Core domain model representing a Cyber Crime Hotspot."""
    id: str
    city: str
    state: str
    latitude: float
    longitude: float
    threat_category: str
    threat_level: str  # HIGH, MEDIUM, LOW
    incident_count: int
    trend_percentage: float
    description: str


class AbstractHotspotRepository(ABC):
    """
    Abstract Interface for Hotspot Data Access.
    Implementations can read from Static Memory, MongoDB, PostgreSQL, or External REST APIs.
    """

    @abstractmethod
    async def get_all_hotspots(
        self,
        category: Optional[str] = None,
        threat_level: Optional[str] = None
    ) -> List[HotspotDomain]:
        """Retrieve all hotspots with optional filtering."""
        pass

    @abstractmethod
    async def get_hotspot_by_id(self, hotspot_id: str) -> Optional[HotspotDomain]:
        """Retrieve a specific hotspot by its unique ID."""
        pass
