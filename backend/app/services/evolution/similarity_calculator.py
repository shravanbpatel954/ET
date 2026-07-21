"""Similarity Calculator using deterministic weighted comparisons."""

from app.services.evolution.configuration_manager import ConfigurationManager


class SimilarityCalculator:
    """Calculates Jaccard-like similarity between two behavioral fingerprints."""

    @staticmethod
    def _jaccard_similarity(list1: list[str], list2: list[str]) -> float:
        """Calculates Jaccard index between two lists of strings."""
        set1 = set([item.lower() for item in list1])
        set2 = set([item.lower() for item in list2])
        
        # Filter out 'unknown' from similarity if needed, but for now exact match.
        set1.discard("unknown")
        set2.discard("unknown")

        if not set1 and not set2:
            return 1.0  # Both empty is a perfect match (or ignore it, but 1.0 is standard)
        if not set1 or not set2:
            return 0.0

        intersection = len(set1.intersection(set2))
        union = len(set1.union(set2))
        
        return intersection / union

    @classmethod
    def calculate(cls, new_fingerprint: dict, historical_fingerprint: dict) -> dict:
        """
        Calculates the similarity score (0-100) and returns detailed breakdown.
        """
        weights = ConfigurationManager.get_weights()
        total_score = 0.0
        breakdown = {}

        for profile_key, weight in weights.items():
            l1 = new_fingerprint.get(profile_key, [])
            l2 = historical_fingerprint.get(profile_key, [])
            
            sim = cls._jaccard_similarity(l1, l2)
            breakdown[profile_key] = sim
            total_score += sim * weight

        # Scale to 0-100
        final_score = round(total_score * 100, 2)
        
        return {
            "score": final_score,
            "breakdown": breakdown
        }
