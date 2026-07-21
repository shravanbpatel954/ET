"""Text normalization utilities."""

import re
import unicodedata


def normalize_whitespace(text: str) -> str:
    """Collapse excessive whitespace while preserving paragraph breaks."""
    text = text.replace("\r\n", "\n").replace("\r", "\n")
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def normalize_unicode(text: str) -> str:
    """Normalize unicode to NFC form."""
    return unicodedata.normalize("NFC", text)


def normalize_text(text: str) -> str:
    """Apply full text normalization pipeline."""
    return normalize_whitespace(normalize_unicode(text))
