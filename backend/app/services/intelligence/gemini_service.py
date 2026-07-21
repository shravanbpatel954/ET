"""Service for interacting with the Google Gemini API."""

import logging
import os
import time

from google import genai
from google.genai import types

from app.core.exceptions import ServiceUnavailableException
from google.genai.errors import ClientError, ServerError

logger = logging.getLogger(__name__)


class GeminiService:
    """Wrapper around the Google Gemini client for threat intelligence extraction."""

    def __init__(self):
        from app.core.config import get_settings
        settings = get_settings()
        
        # We pass the loaded API key from settings directly
        self.client = genai.Client(api_key=settings.gemini_api_key)
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-3.1-flash-lite")
        
        self.max_retries = 3
        self.base_delay = 2.0  # seconds

    def extract_intelligence(self, system_prompt: str, user_prompt: str, response_schema: dict) -> str:
        """
        Calls the Gemini model to extract structured intelligence based on prompts.
        Implements retry logic for ServerErrors/transient errors, and fails fast on ClientErrors.
        """
        config = types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.0,  # low temperature for deterministic extraction
            response_mime_type="application/json",
            response_schema=response_schema
        )
        
        attempt = 0
        while attempt < self.max_retries:
            try:
                # Prefer standard models.generate_content first as it is much faster and supports native JSON schema constraints
                if hasattr(self.client, "models") and hasattr(self.client.models, "generate_content"):
                    response = self.client.models.generate_content(
                        model=self.model_name,
                        contents=user_prompt,
                        config=config
                    )
                    return response.text
                elif hasattr(self.client, "interactions"):
                    # Fallback for custom clients that only support interactions.create
                    full_prompt = f"{system_prompt}\n\n{user_prompt}\n\nPlease format your response strictly according to this schema: {response_schema}"
                    interaction = self.client.interactions.create(
                        model=self.model_name,
                        input=full_prompt
                    )
                    return interaction.output_text
                else:
                    raise RuntimeError("Neither models.generate_content nor interactions.create is supported by the client.")
                
            except ClientError as e:
                # Non-transient client errors (auth, quota, bad request, model not found) - fail fast
                logger.error(f"Gemini API ClientError: {e}")
                raise ServiceUnavailableException(f"Gemini API client error: {e}") from e
            except ServerError as e:
                # Transient server errors - retry with exponential backoff
                attempt += 1
                logger.warning(f"Gemini API ServerError on attempt {attempt}: {e}")
                if attempt >= self.max_retries:
                    raise ServiceUnavailableException(f"Gemini API failed after {self.max_retries} attempts due to ServerError") from e
                time.sleep(self.base_delay * (2 ** (attempt - 1)))
            except Exception as e:
                # Unexpected errors - retry with exponential backoff
                attempt += 1
                logger.warning(f"Gemini API unexpected error on attempt {attempt}: {e}")
                if attempt >= self.max_retries:
                    raise ServiceUnavailableException(f"Gemini API failed after {self.max_retries} attempts: {e}") from e
                time.sleep(self.base_delay * (2 ** (attempt - 1)))
                
        raise ServiceUnavailableException("Unexpected error in GeminiService")

