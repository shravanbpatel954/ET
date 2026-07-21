"""Security utilities — foundation for future authentication modules."""

import hashlib
import secrets
from datetime import UTC, datetime, timedelta

from app.core.config import get_settings


def generate_request_token(length: int = 32) -> str:
    """Generate a cryptographically secure random token."""
    return secrets.token_urlsafe(length)


def hash_value(value: str, salt: str | None = None) -> str:
    """Hash a value using SHA-256 with an optional salt."""
    settings = get_settings()
    effective_salt = salt or settings.secret_key
    payload = f"{effective_salt}{value}".encode()
    return hashlib.sha256(payload).hexdigest()


def is_token_expired(issued_at: datetime, ttl_seconds: int) -> bool:
    """Check whether a token has exceeded its time-to-live."""
    if issued_at.tzinfo is None:
        issued_at = issued_at.replace(tzinfo=UTC)
    expiry = issued_at + timedelta(seconds=ttl_seconds)
    return datetime.now(UTC) >= expiry
