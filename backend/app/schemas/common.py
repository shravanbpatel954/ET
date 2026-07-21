"""Common Pydantic schemas shared across API endpoints."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    """Generic message response."""

    message: str


class VersionResponse(BaseModel):
    """Application version response."""

    name: str
    version: str
    environment: str


class HealthResponse(BaseModel):
    """Health check response with dependency status."""

    status: str
    timestamp: datetime
    version: str
    environment: str
    dependencies: dict[str, str] = Field(default_factory=dict)


class ErrorResponse(BaseModel):
    """Standardized API error response."""

    error_code: str
    message: str
    details: dict[str, Any] = Field(default_factory=dict)
    request_id: str | None = None
