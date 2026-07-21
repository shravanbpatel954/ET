"""Generates the Normalized Behavior Vector for the ScamFingerprint."""

from typing import Dict, Any


class BehaviorVectorGenerator:
    """Generates a continuous normalized behavior vector (dict of floats)."""

    # Static baseline weights for features when they are present.
    # In a real system, these might be dynamically determined or learned,
    # but since ML is forbidden here, we use rule-based intensities.
    BASELINE_INTENSITY = 0.85
    
    @classmethod
    def generate(cls, analyzed_profiles: Dict[str, Any], confidence: float = 0.9) -> Dict[str, float]:
        """
        Creates a behavior vector representing the 'intensity' of each behavioral trait.
        The vector maps string keys to floats between 0.0 and 1.0.
        """
        vector = {}

        # 1. Map Authority Profile
        for authority in analyzed_profiles.get("authority_profile", []):
            if authority.value != "Unknown":
                # E.g. "cbi", "police"
                key = authority.value.lower().replace(" ", "_")
                vector[f"auth_{key}"] = cls.BASELINE_INTENSITY * confidence

        # 2. Map Communication Profile
        for comm in analyzed_profiles.get("communication_profile", []):
            key = comm.value.lower().replace(" ", "_")
            vector[f"comm_{key}"] = cls.BASELINE_INTENSITY * confidence

        # 3. Map Psychology Profile
        for psych in analyzed_profiles.get("psychology_profile", []):
            key = psych.value.lower().replace(" ", "_")
            # Psychology tactics usually have high behavior impact
            vector[key] = min(0.95, cls.BASELINE_INTENSITY * confidence + 0.1)

        # 4. Map Victim Profile
        for victim in analyzed_profiles.get("victim_profile", []):
            if victim.value != "Unknown":
                key = victim.value.lower().replace(" ", "_")
                vector[f"target_{key}"] = cls.BASELINE_INTENSITY * confidence

        # 5. Map Financial Profile
        for fin in analyzed_profiles.get("financial_profile", []):
            if fin.value != "Unknown":
                key = fin.value.lower().replace(" ", "_")
                vector[key] = cls.BASELINE_INTENSITY * confidence

        # 6. Map Technology Profile
        for tech in analyzed_profiles.get("technology_profile", []):
            key = tech.value.lower().replace(" ", "_")
            vector[key] = cls.BASELINE_INTENSITY * confidence

        # 7. Map Execution Profile
        for exec_step in analyzed_profiles.get("execution_profile", []):
            key = exec_step.value.lower().replace(" ", "_")
            vector[f"step_{key}"] = cls.BASELINE_INTENSITY * confidence

        # Ensure all values are clamped between 0.0 and 1.0
        clamped_vector = {k: max(0.0, min(1.0, round(v, 4))) for k, v in vector.items()}
        
        return clamped_vector
