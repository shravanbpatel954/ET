"""Schemas and Enums for the Adaptive Scam Evolution Engine."""

from datetime import datetime
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field


class ScamClassification(str, Enum):
    KNOWN_SCAM = "KNOWN_SCAM"
    SCAM_VARIANT = "SCAM_VARIANT"
    NEW_SCAM = "NEW_SCAM"


class EvolutionResultBase(BaseModel):
    """Base schema for an EvolutionResult."""
    fingerprint_id: UUID
    classification: ScamClassification
    existing_scam_id: UUID | None = None
    variant_score: float = Field(default=0.0, ge=0.0, le=100.0)
    novelty_score: float = Field(default=0.0, ge=0.0, le=100.0)
    similarity_score: float = Field(default=0.0, ge=0.0, le=100.0)
    explanation: str
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    recommendation: str | None = None


class EvolutionResultCreate(EvolutionResultBase):
    """Schema for saving a new EvolutionResult."""
    pass


class EvolutionResultResponse(EvolutionResultBase):
    """API response for EvolutionResult."""
    id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
