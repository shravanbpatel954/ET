"""Tests for the Adaptive Scam Evolution Engine."""

import pytest

from app.schemas.evolution import ScamClassification
from app.services.evolution.similarity_calculator import SimilarityCalculator
from app.services.evolution.novelty_calculator import NoveltyCalculator
from app.services.evolution.variant_classifier import VariantClassifier
from app.services.evolution.explanation_generator import ExplanationGenerator


def test_similarity_calculator_identical():
    """Identical fingerprints should yield 100% similarity."""
    fp1 = {
        "authority_profile": ["Police"],
        "financial_profile": ["UPI"],
        "technology_profile": ["AnyDesk"]
    }
    result = SimilarityCalculator.calculate(fp1, fp1)
    assert result["score"] == 100.0


def test_similarity_calculator_different():
    """Different fingerprints should yield lower similarity."""
    fp1 = {
        "authority_profile": ["Police"],
        "financial_profile": ["UPI"]
    }
    fp2 = {
        "authority_profile": ["Customs"],
        "financial_profile": ["Crypto"]
    }
    result = SimilarityCalculator.calculate(fp1, fp2)
    # Both authority and financial have 0 Jaccard overlap
    assert result["score"] < 100.0
    assert result["breakdown"]["authority_profile"] == 0.0


def test_novelty_calculator():
    """Novelty is inverse of max similarity."""
    assert NoveltyCalculator.calculate(85.0) == 15.0
    assert NoveltyCalculator.calculate(0.0) == 100.0


def test_variant_classifier():
    """Tests the threshold rules."""
    assert VariantClassifier.classify(95.0) == ScamClassification.KNOWN_SCAM
    assert VariantClassifier.classify(75.0) == ScamClassification.SCAM_VARIANT
    assert VariantClassifier.classify(55.0) == ScamClassification.NEW_SCAM


def test_explanation_generator_variant():
    """Tests explanation text for variants."""
    fp1_new = {
        "authority_profile": ["Income Tax"],
        "financial_profile": ["Crypto"]
    }
    fp2_hist = {
        "authority_profile": ["CBI"],
        "financial_profile": ["UPI"]
    }
    explanation = ExplanationGenerator.generate(ScamClassification.SCAM_VARIANT, fp1_new, fp2_hist)
    
    assert "Authority impersonation changed" in explanation
    assert "Income Tax" in explanation
    assert "Crypto" in explanation
