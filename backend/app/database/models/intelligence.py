"""Beanie ODM model for extracted threat intelligence."""

import uuid
from datetime import datetime, timezone

from beanie import Document, Indexed
from pydantic import Field


class ThreatIntelligenceModel(Document):
    """Structured threat intelligence extracted via LLM."""

    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    document_id: uuid.UUID
    
    scam_name: str | None = None
    scam_category: str | None = None
    scam_summary: str | None = None
    threat_actor: str | None = None
    impersonated_authority: str | None = None
    victim_type: str | None = None
    attack_channel: str | None = None
    communication_mode: str | None = None
    payment_method: str | None = None
    money_flow: str | None = None
    
    technologies_used: list[str] = Field(default_factory=list)
    psychological_tactics: list[str] = Field(default_factory=list)
    
    urgency_level: str | None = None
    estimated_loss_type: str | None = None
    target_sector: str | None = None
    
    attack_steps: list[str] = Field(default_factory=list)
    prevention_steps: list[str] = Field(default_factory=list)
    
    confidence: float = 0.0
    extracted_entities: dict[str, list[str]] = Field(default_factory=dict)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Settings:
        name = "threat_intelligence"
