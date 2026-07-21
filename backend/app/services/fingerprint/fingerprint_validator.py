"""Validates the generated ScamFingerprint before persistence."""

import logging
from pydantic import ValidationError

from app.schemas.fingerprint import ScamFingerprintCreate

logger = logging.getLogger(__name__)


class FingerprintValidator:
    """Ensures the integrity of the generated fingerprint."""

    @staticmethod
    def validate(fingerprint_data: dict) -> ScamFingerprintCreate:
        """
        Validates the combined dictionary into the ScamFingerprintCreate schema.
        Raises ValueError if validation fails.
        """
        try:
            return ScamFingerprintCreate(**fingerprint_data)
        except ValidationError as e:
            logger.error(f"Fingerprint validation failed: {e.errors()}")
            raise ValueError(f"Generated fingerprint does not conform to schema: {e.json()}") from e
