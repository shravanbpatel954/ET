"""Tests for the Scam Behavior Fingerprint Engine."""

import pytest

from app.schemas.fingerprint import (
    AuthorityProfile,
    CommunicationProfile,
    FinancialProfile,
    PsychologyProfile,
    TechnologyProfile
)
from app.services.fingerprint.behavior_analyzer import BehaviorAnalyzer
from app.services.fingerprint.behavior_vector_generator import BehaviorVectorGenerator


def test_behavior_analyzer():
    """Test mapping of raw string to enum profile."""
    intelligence_data = {
        "impersonated_authority": "Fake Police Officer",
        "communication_mode": "WhatsApp Call",
        "payment_method": "UPI Transfer",
        "psychological_tactics": ["Created Extreme Fear", "Demanded Urgency"],
        "technologies_used": ["AnyDesk App", "Deepfake Video"]
    }

    analyzed = BehaviorAnalyzer.analyze(intelligence_data)

    assert AuthorityProfile.POLICE in analyzed["authority_profile"]
    assert CommunicationProfile.WHATSAPP in analyzed["communication_profile"]
    assert FinancialProfile.UPI in analyzed["financial_profile"]
    assert PsychologyProfile.FEAR in analyzed["psychology_profile"]
    assert PsychologyProfile.URGENCY in analyzed["psychology_profile"]
    assert TechnologyProfile.ANYDESK in analyzed["technology_profile"]
    assert TechnologyProfile.DEEPFAKE_VIDEO in analyzed["technology_profile"]


def test_behavior_vector_generator():
    """Test normalized vector generation."""
    analyzed_profiles = {
        "authority_profile": [AuthorityProfile.POLICE],
        "psychology_profile": [PsychologyProfile.FEAR, PsychologyProfile.URGENCY],
        "financial_profile": [FinancialProfile.UPI],
        "technology_profile": [TechnologyProfile.ANYDESK]
    }

    # confidence = 0.9 => baseline intensity (0.85) * 0.9 = 0.765 (rounded to 0.765)
    # psychology gets +0.1 => 0.865
    vector = BehaviorVectorGenerator.generate(analyzed_profiles, confidence=0.9)

    assert "auth_police" in vector
    assert vector["auth_police"] == 0.765
    assert "fear" in vector
    assert vector["fear"] == 0.865
    assert "urgency" in vector
    assert vector["urgency"] == 0.865
    assert "upi" in vector
    assert vector["upi"] == 0.765
    assert "anydesk" in vector
    assert vector["anydesk"] == 0.765
