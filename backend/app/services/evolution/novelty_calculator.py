"""Calculates Novelty Score based on maximum similarity."""

class NoveltyCalculator:
    """Derives a novelty score."""

    @staticmethod
    def calculate(max_similarity_score: float) -> float:
        """
        Calculates novelty. 
        If max similarity is 85%, novelty is 15%.
        If max similarity is 0%, novelty is 100%.
        """
        novelty = 100.0 - max_similarity_score
        return round(max(0.0, min(100.0, novelty)), 2)
