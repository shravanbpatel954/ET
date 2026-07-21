"""Service for repairing and cleaning malformed JSON from LLM outputs."""

import json
import re
import logging

logger = logging.getLogger(__name__)


class JSONRepairService:
    """Repairs and extracts JSON from potentially malformed LLM responses."""

    @staticmethod
    def repair_json(raw_response: str) -> dict:
        """
        Attempts to extract and parse JSON from a raw string.
        Strips markdown blocks and tries to repair simple issues.
        """
        # Remove markdown code blocks if present
        cleaned_response = raw_response.strip()
        if cleaned_response.startswith("```"):
            # Try to match json block
            match = re.search(r"```(?:json)?(.*?)```", cleaned_response, re.DOTALL | re.IGNORECASE)
            if match:
                cleaned_response = match.group(1).strip()
            else:
                # If no closing tick, just remove the first line
                cleaned_response = re.sub(r"^```(?:json)?\s*", "", cleaned_response)
                cleaned_response = re.sub(r"\s*```$", "", cleaned_response)
        
        try:
            return json.loads(cleaned_response)
        except json.JSONDecodeError as e:
            logger.warning(f"Failed to parse JSON on first attempt: {e}")
            # Try a rudimentary repair (e.g., trailing commas)
            cleaned_response = re.sub(r",\s*([\]}])", r"\1", cleaned_response)
            try:
                return json.loads(cleaned_response)
            except json.JSONDecodeError as final_e:
                logger.error(f"Failed to repair JSON: {final_e}")
                raise ValueError("Invalid JSON returned by LLM") from final_e
