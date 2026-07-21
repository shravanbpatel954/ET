"""Main orchestrator for the Scam Behavior Fingerprint Engine."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.models.intelligence import ThreatIntelligenceModel
from app.repositories.fingerprint_repository import FingerprintRepository
from app.schemas.fingerprint import ScamFingerprintResponse

from app.services.fingerprint.behavior_analyzer import BehaviorAnalyzer
from app.services.fingerprint.behavior_vector_generator import BehaviorVectorGenerator
from app.services.fingerprint.fingerprint_validator import FingerprintValidator

logger = logging.getLogger(__name__)


class FingerprintService:
    """Orchestrates the generation of Scam Fingerprints from Intelligence."""

    def __init__(self):
        self.repository = FingerprintRepository()
        self.analyzer = BehaviorAnalyzer()
        self.vector_generator = BehaviorVectorGenerator()
        self.validator = FingerprintValidator()

    async def generate_fingerprint(self, document_id: UUID, db: AsyncSession = None, intelligence_obj: Any = None) -> ScamFingerprintResponse:
        """
        Generates and saves a behavior fingerprint based on existing intelligence.
        """
        intelligence = None
        try:
            intelligence = await ThreatIntelligenceModel.find_one(ThreatIntelligenceModel.document_id == document_id)
        except Exception as db_ex:
            logger.warning(f"Could not fetch ThreatIntelligence from DB: {db_ex}")

        if not intelligence and intelligence_obj:
            intelligence = intelligence_obj

        if not intelligence:
            raise ValueError(f"No ThreatIntelligence found for document {document_id}. Cannot generate fingerprint.")

        # Convert model to dictionary for analysis
        intel_dict = intelligence.model_dump() if hasattr(intelligence, "model_dump") else dict(intelligence)

        # 2. Analyze behaviors and map to profiles
        analyzed_profiles = self.analyzer.analyze(intel_dict)

        # 3. Generate behavior vector
        confidence = intel_dict.get("confidence", 0.9)
        behavior_vector = self.vector_generator.generate(analyzed_profiles, confidence=confidence)

        # 4. Construct complete fingerprint data
        fingerprint_data = {
            "document_id": document_id,
            "confidence_score": confidence,
            "behavior_vector": behavior_vector,
            **analyzed_profiles
        }

        # 5. Validate structure
        validated_data = self.validator.validate(fingerprint_data)

        # 6. Save to Database
        try:
            db_fingerprint = await self.repository.create(db, validated_data)
            return ScamFingerprintResponse.model_validate(db_fingerprint)
        except Exception as repo_ex:
            logger.warning(f"Could not persist ScamFingerprint to DB: {repo_ex}")
            now = datetime.now(timezone.utc)
            return ScamFingerprintResponse(
                fingerprint_id=uuid.uuid4(),
                created_at=now,
                **validated_data.model_dump()
            )

    async def get_fingerprint(self, document_id: UUID, db: AsyncSession = None) -> ScamFingerprintResponse | None:
        """Retrieves an existing fingerprint."""
        db_model = await self.repository.get_by_document_id(db, document_id)
        if db_model:
            return ScamFingerprintResponse.model_validate(db_model)
        return None

    async def list_fingerprints(self, db: AsyncSession = None, skip: int = 0, limit: int = 100) -> list[ScamFingerprintResponse]:
        """Lists multiple fingerprints."""
        db_models = await self.repository.list_fingerprints(db, skip, limit)
        return [ScamFingerprintResponse.model_validate(m) for m in db_models]
