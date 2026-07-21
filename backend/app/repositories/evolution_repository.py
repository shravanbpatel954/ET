"""Repository for DB operations related to Scam Evolution Results using Beanie."""

from uuid import UUID
from typing import Sequence

from app.database.models.evolution import EvolutionResultModel
from app.schemas.evolution import EvolutionResultCreate


class EvolutionRepository:
    """Handles persistence and retrieval of EvolutionResults."""

    @staticmethod
    async def create(db=None, evolution_data: EvolutionResultCreate = None) -> EvolutionResultModel:
        """Creates a new EvolutionResult record."""
        # Check if one already exists
        existing = await EvolutionRepository.get_by_fingerprint_id(db, evolution_data.fingerprint_id)
        if existing:
            return existing

        db_model = EvolutionResultModel(
            fingerprint_id=evolution_data.fingerprint_id,
            classification=evolution_data.classification,
            existing_scam_id=evolution_data.existing_scam_id,
            variant_score=evolution_data.variant_score,
            novelty_score=evolution_data.novelty_score,
            similarity_score=evolution_data.similarity_score,
            explanation=evolution_data.explanation,
            confidence=evolution_data.confidence,
            recommendation=evolution_data.recommendation
        )
        await db_model.insert()
        return db_model

    @staticmethod
    async def get_by_fingerprint_id(db, fingerprint_id: UUID) -> EvolutionResultModel | None:
        """Retrieves a result by its fingerprint_id."""
        return await EvolutionResultModel.find_one(EvolutionResultModel.fingerprint_id == fingerprint_id)

    @staticmethod
    async def list_results(db, skip: int = 0, limit: int = 100) -> Sequence[EvolutionResultModel]:
        """Lists evolution results with pagination."""
        return await EvolutionResultModel.find_all().sort("-created_at").skip(skip).limit(limit).to_list()
