"""OCR text extraction service for screenshot inputs."""

import asyncio
import io

from loguru import logger

from app.core.config import Settings
from app.core.ingestion_exceptions import ExtractionException
from app.interfaces.extractor import IOCRService


class OCRService(IOCRService):
    """Extracts text from images using Tesseract OCR."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings

    async def extract_text(self, image_bytes: bytes, filename: str | None = None) -> str:
        if not self._settings.ocr_enabled:
            raise ExtractionException(
                message="OCR is disabled in configuration",
                details={"filename": filename},
            )

        def _extract() -> str:
            try:
                from PIL import Image
                import pytesseract

                image = Image.open(io.BytesIO(image_bytes))
                text = pytesseract.image_to_string(image).strip()
                if not text:
                    raise ExtractionException(
                        message="No text detected in image",
                        details={"filename": filename},
                    )
                return text
            except ExtractionException:
                raise
            except ImportError as exc:
                logger.warning("OCR dependencies not available: {}", exc)
                raise ExtractionException(
                    message="OCR dependencies not installed (Pillow, pytesseract)",
                    details={"filename": filename},
                ) from exc
            except Exception as exc:
                logger.warning("OCR extraction failed: {}", exc)
                raise ExtractionException(
                    message="OCR text extraction failed",
                    details={"filename": filename, "error": str(exc)},
                ) from exc

        return await asyncio.to_thread(_extract)
