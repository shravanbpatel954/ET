"""Language detection service."""

import asyncio

from app.interfaces.extractor import ILanguageDetector


class LanguageDetector(ILanguageDetector):
    """Detects document language using langdetect."""

    async def detect(self, text: str) -> str:
        if not text or len(text.strip()) < 20:
            return "unknown"

        def _detect() -> str:
            try:
                from langdetect import detect

                return detect(text[:5000])
            except Exception:
                return "unknown"

        return await asyncio.to_thread(_detect)
