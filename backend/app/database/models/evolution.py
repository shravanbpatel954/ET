"""Beanie ODM model for Adaptive Scam Evolution Results."""

import uuid
from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field

from app.schemas.evolution import ScamClassification


class EvolutionResultModel(Document):
    """Database model for storing scam evolution analysis results."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    fingerprint_id: uuid.UUID
    classification: ScamClassification
    
    # ID of the closest historical match, if any
    existing_scam_id: uuid.UUID | None = None
    
    variant_score: float = 0.0
    novelty_score: float = 0.0
    similarity_score: float = 0.0
    
    explanation: str
    confidence: float = 0.0
    recommendation: str | None = None

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "evolution_results"
