"""Main orchestration service for Threat Intelligence extraction."""

import logging
import uuid
from datetime import datetime, timezone
from typing import Any
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database.models.threat import ThreatDocumentModel
from app.database.models.intelligence import ThreatIntelligenceModel
from app.schemas.intelligence import ThreatIntelligenceCreate, ThreatIntelligenceResponse

from app.services.intelligence.gemini_service import GeminiService
from app.services.intelligence.prompt_manager import PromptManager
from app.services.intelligence.json_repair_service import JSONRepairService
from app.services.intelligence.response_validator import ResponseValidator

logger = logging.getLogger(__name__)


class ThreatIntelligenceService:
    """Orchestrates the LLM extraction pipeline for a Threat Document."""

    def __init__(self):
        self.gemini_service = GeminiService()
        self.prompt_manager = PromptManager()
        self.repair_service = JSONRepairService()
        self.validator = ResponseValidator()

    async def extract_intelligence(self, document_id: UUID, db: AsyncSession = None, document_obj: Any = None) -> ThreatIntelligenceResponse:
        """
        1. Fetches the document and features.
        2. Generates prompt and calls Gemini.
        3. Parses, cleans, validates the JSON.
        4. Saves to database and returns.
        """
        document = None
        try:
            document = await ThreatDocumentModel.find_one(ThreatDocumentModel.id == document_id)
        except Exception as db_ex:
            logger.warning(f"Could not fetch ThreatDocument from DB: {db_ex}")

        if not document and document_obj:
            document = document_obj

        if not document:
            raise ValueError(f"ThreatDocument with id {document_id} not found.")

        # Check if intelligence already exists in DB
        try:
            existing_intel = await ThreatIntelligenceModel.find_one(ThreatIntelligenceModel.document_id == document_id)
            if existing_intel:
                logger.info(f"Intelligence already extracted for document {document_id}")
                return ThreatIntelligenceResponse.model_validate(existing_intel)
        except Exception:
            pass

        extra_meta = getattr(document, "extra_metadata", None) or getattr(document, "metadata", None) or {}
        features = {
            "source": getattr(document, "source", "unknown"),
            "source_type": str(getattr(document, "source_type", "raw_text")),
            "title": getattr(document, "title", "Threat Document"),
            "metadata": extra_meta if isinstance(extra_meta, dict) else {},
        }

        # 2. Prepare Prompts & Call Gemini
        system_prompt = self.prompt_manager.get_system_prompt()
        user_prompt = self.prompt_manager.get_user_prompt(document.content, features)
        schema = self.prompt_manager.get_response_schema()

        logger.info(f"Calling Gemini API for document {document_id}")
        raw_response = self.gemini_service.extract_intelligence(system_prompt, user_prompt, schema)

        # 3. Parse, Repair, and Validate
        repaired_json = self.repair_service.repair_json(raw_response)
        validated_data: ThreatIntelligenceCreate = self.validator.validate(repaired_json)

        # 4. Save to Database
        try:
            db_intelligence = ThreatIntelligenceModel(
                document_id=document_id,
                **validated_data.model_dump()
            )
            await db_intelligence.insert()
            return ThreatIntelligenceResponse.model_validate(db_intelligence)
        except Exception as insert_ex:
            logger.warning(f"Could not persist ThreatIntelligenceModel to DB: {insert_ex}")
            now = datetime.now(timezone.utc)
            return ThreatIntelligenceResponse(
                id=uuid.uuid4(),
                document_id=document_id,
                created_at=now,
                updated_at=now,
                **validated_data.model_dump()
            )

    async def get_intelligence(self, document_id: UUID, db: AsyncSession = None) -> ThreatIntelligenceResponse | None:
        """Retrieves existing intelligence for a document."""
        intel = await ThreatIntelligenceModel.find_one(ThreatIntelligenceModel.document_id == document_id)
        if intel:
            return ThreatIntelligenceResponse.model_validate(intel)
        return None
