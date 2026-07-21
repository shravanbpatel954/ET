"""Determines the classification of a scam based on similarity scores."""

from app.schemas.evolution import ScamClassification
from app.services.evolution.configuration_manager import ConfigurationManager


class VariantClassifier:
    """Classifies a fingerprint into KNOWN_SCAM, SCAM_VARIANT, or NEW_SCAM."""

    @classmethod
    def classify(cls, similarity_score: float) -> ScamClassification:
        """Applies thresholds to determine classification."""
        thresholds = ConfigurationManager.get_thresholds()

        if similarity_score >= thresholds["known"]:
            return ScamClassification.KNOWN_SCAM
        elif similarity_score >= thresholds["variant"]:
            return ScamClassification.SCAM_VARIANT
        else:
            return ScamClassification.NEW_SCAM
