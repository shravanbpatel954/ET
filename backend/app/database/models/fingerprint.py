"""Beanie ODM model for Scam Behavior Fingerprints."""

import uuid
from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field


class ScamFingerprintModel(Document):
    """Database model for Scam Behavior Fingerprints."""

    fingerprint_id: uuid.UUID = Field(default_factory=uuid.uuid4)
    document_id: uuid.UUID
    
    scam_name: str | None = None
    scam_category: str | None = None

    authority_profile: list[str] = Field(default_factory=list)
    communication_profile: list[str] = Field(default_factory=list)
    psychology_profile: list[str] = Field(default_factory=list)
    victim_profile: list[str] = Field(default_factory=list)
    financial_profile: list[str] = Field(default_factory=list)
    technology_profile: list[str] = Field(default_factory=list)
    execution_profile: list[str] = Field(default_factory=list)
    
    language_profile: list[str] = Field(default_factory=list)
    geographical_profile: list[str] = Field(default_factory=list)
    
    behavior_vector: dict[str, float] = Field(default_factory=dict)
    confidence_score: float = 0.0

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "scam_fingerprints"
