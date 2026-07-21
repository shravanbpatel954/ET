"""API schemas for threat intelligence extracted by LLM."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class ThreatIntelligenceBase(BaseModel):
    """Base fields for threat intelligence."""

    scam_name: str | None = Field(default=None, description="The specific name or identifier of the scam")
    scam_category: str | None = Field(default=None, description="The category of the scam (e.g., Phishing, Malware)")
    scam_summary: str | None = Field(default=None, description="A brief summary of how the scam operates")
    threat_actor: str | None = Field(default=None, description="Known or suspected threat actor/group")
    impersonated_authority: str | None = Field(default=None, description="Entity being impersonated (e.g., Bank, Government)")
    victim_type: str | None = Field(default=None, description="Demographic or type of victim targeted")
    attack_channel: str | None = Field(default=None, description="The medium through which the attack was delivered")
    communication_mode: str | None = Field(default=None, description="Mode of communication (e.g., Email, SMS, Call)")
    payment_method: str | None = Field(default=None, description="Requested payment method (e.g., Crypto, Wire Transfer)")
    money_flow: str | None = Field(default=None, description="How the money is moved or laundered")
    technologies_used: list[str] = Field(default_factory=list, description="Technologies leveraged in the attack")
    psychological_tactics: list[str] = Field(default_factory=list, description="Psychological manipulation techniques used")
    urgency_level: str | None = Field(default=None, description="Level of urgency created by the attacker (e.g., High, Medium, Low)")
    estimated_loss_type: str | None = Field(default=None, description="Type of loss incurred (e.g., Financial, Data)")
    target_sector: str | None = Field(default=None, description="Industry sector targeted")
    attack_steps: list[str] = Field(default_factory=list, description="Sequential steps of the attack pattern")
    prevention_steps: list[str] = Field(default_factory=list, description="Recommended steps to prevent this attack")
    confidence: float = Field(default=0.0, description="Confidence score of the extraction (0.0 to 1.0)")
    extracted_entities: dict[str, list[str]] = Field(default_factory=dict, description="Categorized entities extracted from the text")


class ThreatIntelligenceCreate(ThreatIntelligenceBase):
    """Schema for creating a ThreatIntelligence record."""
    pass


class ThreatIntelligenceResponse(ThreatIntelligenceBase):
    """Standard threat intelligence API response."""

    id: UUID
    document_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
