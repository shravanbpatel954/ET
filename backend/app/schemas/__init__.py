"""Pydantic request/response schemas."""

from app.schemas.common import (
    ErrorResponse,
    HealthResponse,
    MessageResponse,
    VersionResponse,
)

__all__ = [
    "ErrorResponse",
    "HealthResponse",
    "MessageResponse",
    "VersionResponse",
]
