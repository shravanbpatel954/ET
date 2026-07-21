"""Analyzes threat intelligence to map into structured categorical profiles."""

import re
from typing import Any

from app.schemas.fingerprint import (
    AuthorityProfile,
    CommunicationProfile,
    ExecutionProfile,
    FinancialProfile,
    PsychologyProfile,
    TechnologyProfile,
    VictimProfile,
)


class BehaviorAnalyzer:
    """Maps free-text fields or LLM outputs to standardized Fingerprint Enum profiles."""

    @staticmethod
    def _map_to_enum(text: str | list[str] | None, enum_class: type, default: Any) -> list[Any]:
        if not text:
            return [default]

        if isinstance(text, str):
            texts = [text.lower()]
        else:
            texts = [t.lower() for t in text]

        matched = set()
        for t in texts:
            for enum_item in enum_class:
                if enum_item == default:
                    continue
                # Simple substring match for mapping
                if enum_item.value.lower() in t:
                    matched.add(enum_item)

        if not matched:
            return [default]
        return list(matched)

    @staticmethod
    def analyze_authority(impersonated_authority: str | None) -> list[AuthorityProfile]:
        return BehaviorAnalyzer._map_to_enum(impersonated_authority, AuthorityProfile, AuthorityProfile.UNKNOWN)

    @staticmethod
    def analyze_communication(communication_mode: str | None, attack_channel: str | None) -> list[CommunicationProfile]:
        combined = []
        if communication_mode:
            combined.append(communication_mode)
        if attack_channel:
            combined.append(attack_channel)
        
        # Default fallback is not strictly "Unknown" in the enum, so we return empty if none match
        if not combined:
            return []
        
        # Wait, CommunicationProfile doesn't have UNKNOWN in our schema. Let's just return what matches.
        matched = set()
        for text in combined:
            t = text.lower()
            for enum_item in CommunicationProfile:
                if enum_item.value.lower() in t:
                    matched.add(enum_item)
        return list(matched)

    @staticmethod
    def analyze_psychology(tactics: list[str]) -> list[PsychologyProfile]:
        matched = set()
        for t in tactics:
            t_lower = t.lower()
            for enum_item in PsychologyProfile:
                if enum_item.value.lower() in t_lower:
                    matched.add(enum_item)
        return list(matched)

    @staticmethod
    def analyze_victim(victim_type: str | None) -> list[VictimProfile]:
        return BehaviorAnalyzer._map_to_enum(victim_type, VictimProfile, VictimProfile.UNKNOWN)

    @staticmethod
    def analyze_financial(payment_method: str | None, money_flow: str | None) -> list[FinancialProfile]:
        combined = []
        if payment_method: combined.append(payment_method)
        if money_flow: combined.append(money_flow)
        return BehaviorAnalyzer._map_to_enum(combined, FinancialProfile, FinancialProfile.UNKNOWN)

    @staticmethod
    def analyze_technology(techs: list[str]) -> list[TechnologyProfile]:
        matched = set()
        for t in techs:
            t_lower = t.lower()
            for enum_item in TechnologyProfile:
                # Need to handle 'qr code' vs 'QR Code' etc., .lower() handles it
                if enum_item.value.lower() in t_lower:
                    matched.add(enum_item)
        return list(matched)

    @staticmethod
    def analyze_execution(steps: list[str]) -> list[ExecutionProfile]:
        matched = set()
        for t in steps:
            t_lower = t.lower()
            for enum_item in ExecutionProfile:
                if enum_item.value.lower() in t_lower:
                    matched.add(enum_item)
        return list(matched)

    @classmethod
    def analyze(cls, intelligence_data: dict) -> dict:
        """Runs all analyzers on the raw intelligence dictionary."""
        return {
            "authority_profile": cls.analyze_authority(intelligence_data.get("impersonated_authority")),
            "communication_profile": cls.analyze_communication(
                intelligence_data.get("communication_mode"), 
                intelligence_data.get("attack_channel")
            ),
            "psychology_profile": cls.analyze_psychology(intelligence_data.get("psychological_tactics", [])),
            "victim_profile": cls.analyze_victim(intelligence_data.get("victim_type")),
            "financial_profile": cls.analyze_financial(
                intelligence_data.get("payment_method"),
                intelligence_data.get("money_flow")
            ),
            "technology_profile": cls.analyze_technology(intelligence_data.get("technologies_used", [])),
            "execution_profile": cls.analyze_execution(intelligence_data.get("attack_steps", [])),
            
            # Simple pass-through for arrays/strings
            "language_profile": [intelligence_data.get("language", "unknown")], # Extracted from ThreatDocument originally
            "geographical_profile": [intelligence_data.get("country", "unknown")],
            
            "scam_name": intelligence_data.get("scam_name"),
            "scam_category": intelligence_data.get("scam_category"),
        }
