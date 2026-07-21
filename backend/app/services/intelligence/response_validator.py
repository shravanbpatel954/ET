"""Validator for the extracted LLM response."""

import logging
from pydantic import ValidationError
from app.schemas.intelligence import ThreatIntelligenceCreate

logger = logging.getLogger(__name__)


class ResponseValidator:
    """Validates the extracted JSON into the expected Pydantic schema."""

    @staticmethod
    def validate(response_data: dict) -> ThreatIntelligenceCreate:
        """
        Validates a dictionary against the ThreatIntelligenceCreate schema.
        Raises ValueError if validation fails.
        """
        try:
            return ThreatIntelligenceCreate(**response_data)
        except ValidationError as e:
            logger.error(f"Validation failed for LLM extraction: {e.errors()}")
            raise ValueError(f"Extracted data does not conform to schema: {e.json()}") from e
