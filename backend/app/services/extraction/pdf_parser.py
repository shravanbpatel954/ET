"""PDF text extraction service."""

import asyncio
import io

from app.core.ingestion_exceptions import ExtractionException
from app.interfaces.extractor import IPDFParser


class PDFParser(IPDFParser):
    """Extracts text from PDF documents using pypdf."""

    async def extract_text(self, pdf_bytes: bytes, filename: str | None = None) -> str:
        def _extract() -> str:
            try:
                from pypdf import PdfReader

                reader = PdfReader(io.BytesIO(pdf_bytes))
                pages = [page.extract_text() or "" for page in reader.pages]
                text = "\n\n".join(pages).strip()
                if not text:
                    raise ExtractionException(
                        message="No extractable text found in PDF",
                        details={"filename": filename},
                    )
                return text
            except ExtractionException:
                raise
            except Exception as exc:
                raise ExtractionException(
                    message="Failed to parse PDF document",
                    details={"filename": filename, "error": str(exc)},
                ) from exc

        return await asyncio.to_thread(_extract)
