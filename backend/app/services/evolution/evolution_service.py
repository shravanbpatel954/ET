"""Main orchestrator for the Adaptive Scam Evolution Engine."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.models.fingerprint import ScamFingerprintModel
from app.repositories.evolution_repository import EvolutionRepository
from app.schemas.evolution import EvolutionResultCreate, EvolutionResultResponse, ScamClassification

from app.services.evolution.similarity_calculator import SimilarityCalculator
from app.services.evolution.novelty_calculator import NoveltyCalculator
from app.services.evolution.variant_classifier import VariantClassifier
from app.services.evolution.explanation_generator import ExplanationGenerator

logger = logging.getLogger(__name__)


class EvolutionService:
    """Orchestrates comparison and classification of Scam Fingerprints."""

    def __init__(self):
        self.repository = EvolutionRepository()
        self.similarity_calculator = SimilarityCalculator()
        self.novelty_calculator = NoveltyCalculator()
        self.variant_classifier = VariantClassifier()
        self.explanation_generator = ExplanationGenerator()

    async def analyze_fingerprint(self, fingerprint_id: UUID, db: AsyncSession = None, fingerprint_obj: Any = None) -> EvolutionResultResponse:
        """
        1. Fetch the new fingerprint.
        2. Fetch all historical fingerprints (excluding itself).
        3. Calculate similarity against all history to find the closest match.
        4. Classify, generate novelty and explanations.
        5. Save and return.
        """
        new_fp = None
        try:
            new_fp = await ScamFingerprintModel.find_one(ScamFingerprintModel.fingerprint_id == fingerprint_id)
        except Exception as db_ex:
            logger.warning(f"Could not fetch ScamFingerprint from DB: {db_ex}")

        if not new_fp and fingerprint_obj:
            new_fp = fingerprint_obj

        if not new_fp:
            raise ValueError(f"Fingerprint {fingerprint_id} not found.")

        # Convert to dict for analysis
        new_fp_dict = new_fp.model_dump() if hasattr(new_fp, "model_dump") else dict(new_fp)

        # 2. Fetch history
        history = []
        try:
            history = await ScamFingerprintModel.find_many(ScamFingerprintModel.fingerprint_id != fingerprint_id).to_list()
        except Exception:
            pass

        best_match_id = None
        best_match_dict = None
        max_similarity = 0.0

        # 3. Find closest match
        for hist_fp in history:
            hist_fp_dict = hist_fp.model_dump()
            sim_result = self.similarity_calculator.calculate(new_fp_dict, hist_fp_dict)
            
            if sim_result["score"] > max_similarity:
                max_similarity = sim_result["score"]
                best_match_id = hist_fp.fingerprint_id
                best_match_dict = hist_fp_dict

        # 4. Classify & Explain
        classification = self.variant_classifier.classify(max_similarity)
        novelty_score = self.novelty_calculator.calculate(max_similarity)
        
        explanation = self.explanation_generator.generate(
            classification, new_fp_dict, best_match_dict
        )

        confidence = 0.95 if history else 0.50 # Less confident if we have no history

        # Generate recommendation
        recommendation = "Monitor closely for emergence of new variants."
        if classification == ScamClassification.KNOWN_SCAM:
            recommendation = "Apply standard countermeasures for known campaign."
        elif classification == ScamClassification.SCAM_VARIANT:
            recommendation = "Update existing countermeasures to account for behavioral shifts."

        # 5. Save and Return
        result_data = EvolutionResultCreate(
            fingerprint_id=fingerprint_id,
            classification=classification,
            existing_scam_id=best_match_id,
            variant_score=max_similarity if classification == ScamClassification.SCAM_VARIANT else 0.0,
            novelty_score=novelty_score,
            similarity_score=max_similarity,
            explanation=explanation,
            confidence=confidence,
            recommendation=recommendation
        )

        try:
            db_result = await self.repository.create(db, result_data)
            return EvolutionResultResponse.model_validate(db_result)
        except Exception as repo_ex:
            logger.warning(f"Could not persist EvolutionResult to DB: {repo_ex}")
            now = datetime.now(timezone.utc)
            return EvolutionResultResponse(
                id=uuid.uuid4(),
                created_at=now,
                **result_data.model_dump()
            )

    async def get_evolution_result(self, fingerprint_id: UUID, db: AsyncSession = None) -> EvolutionResultResponse | None:
        """Retrieves a result by fingerprint ID."""
        db_model = await self.repository.get_by_fingerprint_id(db, fingerprint_id)
        if db_model:
            return EvolutionResultResponse.model_validate(db_model)
        return None

    async def list_history(self, db: AsyncSession = None, skip: int = 0, limit: int = 100) -> list[EvolutionResultResponse]:
        """Lists historical evolution results."""
        db_models = await self.repository.list_results(db, skip, limit)
        return [EvolutionResultResponse.model_validate(m) for m in db_models]
