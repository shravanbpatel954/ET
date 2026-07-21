"""Configuration Manager for Scam Evolution engine."""

class ConfigurationManager:
    """Stores configurable weights and thresholds for deterministic analysis."""

    # Weights for different profile comparisons
    # Must sum up to 1.0 ideally, or close to it
    SIMILARITY_WEIGHTS = {
        "authority_profile": 0.15,
        "communication_profile": 0.10,
        "psychology_profile": 0.20,
        "victim_profile": 0.10,
        "financial_profile": 0.15,
        "technology_profile": 0.15,
        "execution_profile": 0.15,
    }

    # Thresholds for classification
    KNOWN_SCAM_THRESHOLD = 90.0
    SCAM_VARIANT_THRESHOLD = 60.0

    @classmethod
    def get_weights(cls) -> dict[str, float]:
        """Returns the dictionary of profile similarity weights."""
        return cls.SIMILARITY_WEIGHTS

    @classmethod
    def get_thresholds(cls) -> dict[str, float]:
        """Returns thresholds for categorization."""
        return {
            "known": cls.KNOWN_SCAM_THRESHOLD,
            "variant": cls.SCAM_VARIANT_THRESHOLD
        }
