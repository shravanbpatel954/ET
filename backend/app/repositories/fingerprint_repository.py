"""Repository for DB operations related to ScamFingerprints using Beanie."""

from uuid import UUID
from typing import Sequence

from app.database.models.fingerprint import ScamFingerprintModel
from app.schemas.fingerprint import ScamFingerprintCreate


class FingerprintRepository:
    """Handles persistence and retrieval of ScamFingerprints."""

    @staticmethod
    async def create(db=None, fingerprint_data: ScamFingerprintCreate = None) -> ScamFingerprintModel:
        """Creates a new ScamFingerprint record."""
        # Check if one already exists
        existing = await FingerprintRepository.get_by_document_id(db, fingerprint_data.document_id)
        if existing:
            return existing

        db_model = ScamFingerprintModel(
            document_id=fingerprint_data.document_id,
            scam_name=fingerprint_data.scam_name,
            scam_category=fingerprint_data.scam_category,
            authority_profile=[e.value for e in fingerprint_data.authority_profile],
            communication_profile=[e.value for e in fingerprint_data.communication_profile],
            psychology_profile=[e.value for e in fingerprint_data.psychology_profile],
            victim_profile=[e.value for e in fingerprint_data.victim_profile],
            financial_profile=[e.value for e in fingerprint_data.financial_profile],
            technology_profile=[e.value for e in fingerprint_data.technology_profile],
            execution_profile=[e.value for e in fingerprint_data.execution_profile],
            language_profile=fingerprint_data.language_profile,
            geographical_profile=fingerprint_data.geographical_profile,
            behavior_vector=fingerprint_data.behavior_vector,
            confidence_score=fingerprint_data.confidence_score
        )
        await db_model.insert()
        return db_model

    @staticmethod
    async def get_by_document_id(db, document_id: UUID) -> ScamFingerprintModel | None:
        """Retrieves a fingerprint by its document_id."""
        return await ScamFingerprintModel.find_one(ScamFingerprintModel.document_id == document_id)

    @staticmethod
    async def list_fingerprints(db, skip: int = 0, limit: int = 100) -> Sequence[ScamFingerprintModel]:
        """Lists fingerprints with pagination."""
        return await ScamFingerprintModel.find_all().skip(skip).limit(limit).to_list()
