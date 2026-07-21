"""Schemas and Enums for the Scam Behavior Fingerprint Engine."""

from datetime import datetime
from enum import Enum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class AuthorityProfile(str, Enum):
    CBI = "CBI"
    RBI = "RBI"
    INCOME_TAX = "Income Tax"
    POLICE = "Police"
    COURIER = "Courier"
    BANK = "Bank"
    CUSTOMS = "Customs"
    UNKNOWN = "Unknown"


class CommunicationProfile(str, Enum):
    PHONE_CALL = "Phone Call"
    WHATSAPP = "WhatsApp"
    SMS = "SMS"
    EMAIL = "Email"
    TELEGRAM = "Telegram"
    WEBSITE = "Website"
    VIDEO_CALL = "Video Call"
    SOCIAL_MEDIA = "Social Media"


class PsychologyProfile(str, Enum):
    FEAR = "Fear"
    URGENCY = "Urgency"
    TRUST = "Trust"
    GREED = "Greed"
    CURIOSITY = "Curiosity"
    AUTHORITY = "Authority"
    ISOLATION = "Isolation"
    REWARD = "Reward"
    THREAT = "Threat"


class VictimProfile(str, Enum):
    STUDENT = "Student"
    SENIOR_CITIZEN = "Senior Citizen"
    BUSINESS_OWNER = "Business Owner"
    EMPLOYEE = "Employee"
    GENERAL_PUBLIC = "General Public"
    UNKNOWN = "Unknown"


class FinancialProfile(str, Enum):
    UPI = "UPI"
    BANK_TRANSFER = "Bank Transfer"
    GIFT_CARD = "Gift Card"
    CRYPTO = "Crypto"
    WALLET = "Wallet"
    CASH = "Cash"
    UNKNOWN = "Unknown"


class TechnologyProfile(str, Enum):
    ANYDESK = "AnyDesk"
    TEAMVIEWER = "TeamViewer"
    APK = "APK"
    QR_CODE = "QR Code"
    SPOOFED_NUMBER = "Spoofed Number"
    FAKE_WEBSITE = "Fake Website"
    DEEPFAKE_VOICE = "Deepfake Voice"
    DEEPFAKE_VIDEO = "Deepfake Video"


class ExecutionProfile(str, Enum):
    CONTACT = "Contact"
    TRUST_BUILDING = "Trust Building"
    FEAR_ESCALATION = "Fear Escalation"
    ISOLATION = "Isolation"
    PAYMENT = "Payment"
    EVIDENCE_DELETION = "Evidence Deletion"


class ScamFingerprintBase(BaseModel):
    """Base fields for a Scam Behavior Fingerprint."""
    scam_name: str | None = None
    scam_category: str | None = None
    
    authority_profile: list[AuthorityProfile] = Field(default_factory=list)
    communication_profile: list[CommunicationProfile] = Field(default_factory=list)
    psychology_profile: list[PsychologyProfile] = Field(default_factory=list)
    victim_profile: list[VictimProfile] = Field(default_factory=list)
    financial_profile: list[FinancialProfile] = Field(default_factory=list)
    technology_profile: list[TechnologyProfile] = Field(default_factory=list)
    execution_profile: list[ExecutionProfile] = Field(default_factory=list)
    
    # We omit language and geographic profile in the schema to keep it aligned with the specific components prompt
    # Wait, the prompt states: language_profile, geographical_profile.
    language_profile: list[str] = Field(default_factory=list)
    geographical_profile: list[str] = Field(default_factory=list)
    
    behavior_vector: dict[str, float] = Field(default_factory=dict, description="Normalized behavioral intensities (0.0 - 1.0)")
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class ScamFingerprintCreate(ScamFingerprintBase):
    """Schema for creating a ScamFingerprint."""
    document_id: UUID


class ScamFingerprintResponse(ScamFingerprintBase):
    """API Response for ScamFingerprint."""
    fingerprint_id: UUID
    created_at: datetime

    model_config = {"from_attributes": True}
