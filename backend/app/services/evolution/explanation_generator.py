"""Generates deterministic explanations for the classification."""

from app.schemas.evolution import ScamClassification


class ExplanationGenerator:
    """Provides human-readable reasoning based on the similarity breakdown."""

    @staticmethod
    def _find_differences(new_fingerprint: dict, historical_fingerprint: dict) -> dict[str, list[str]]:
        """Identifies which profiles have changed significantly."""
        changes = {}
        profiles_to_check = [
            "authority_profile", "communication_profile", "psychology_profile",
            "victim_profile", "financial_profile", "technology_profile", "execution_profile"
        ]

        for profile in profiles_to_check:
            l1 = set(new_fingerprint.get(profile, []))
            l2 = set(historical_fingerprint.get(profile, []))
            l1.discard("Unknown")
            l2.discard("Unknown")

            added = list(l1 - l2)
            removed = list(l2 - l1)

            if added or removed:
                changes[profile] = {"added": added, "removed": removed}

        return changes

    @classmethod
    def generate(cls, classification: ScamClassification, new_fingerprint: dict, historical_fingerprint: dict | None) -> str:
        """Generates the explanation string."""
        if classification == ScamClassification.NEW_SCAM or not historical_fingerprint:
            return "This scam introduces entirely novel behavioral patterns not seen in historical data, suggesting a new campaign."

        if classification == ScamClassification.KNOWN_SCAM:
            return "This scam's behavior strictly matches an existing known campaign. Execution flow and tactics remain unchanged."

        # It's a SCAM_VARIANT
        differences = cls._find_differences(new_fingerprint, historical_fingerprint)
        
        reasons = []
        if not differences:
            return "This scam shares overwhelming behavioral characteristics with an existing campaign, with slight parameter shifts."

        # Map internal keys to readable names
        name_map = {
            "authority_profile": "Authority impersonation",
            "communication_profile": "Communication mode",
            "psychology_profile": "Psychological tactics",
            "victim_profile": "Target demographic",
            "financial_profile": "Payment method",
            "technology_profile": "Technology usage",
            "execution_profile": "Execution flow"
        }

        for profile, diffs in differences.items():
            readable_name = name_map.get(profile, profile)
            if diffs["added"]:
                reasons.append(f"{readable_name} changed to include {', '.join(diffs['added'])}")
            if diffs["removed"]:
                reasons.append(f"{readable_name} dropped {', '.join(diffs['removed'])}")

        explanation = "This scam shares core behavioral characteristics with an existing campaign but introduces variations: "
        explanation += "; ".join(reasons) + ", suggesting an evolved variant."
        return explanation
