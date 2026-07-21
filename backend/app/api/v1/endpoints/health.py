"""API v1 health and system endpoints."""

from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from loguru import logger
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.database.neo4j import Neo4jConnectionManager
from app.dependencies import get_db_dependency, get_neo4j_dependency, get_settings_dependency
from app.schemas.common import HealthResponse, MessageResponse, VersionResponse

router = APIRouter(tags=["System"])


@router.get("/", response_model=MessageResponse, summary="API root")
def root(settings: Settings = Depends(get_settings_dependency)) -> MessageResponse:
    """Return a welcome message for the API."""
    return MessageResponse(
        message=f"Welcome to {settings.app_name} — Adaptive Fraud Intelligence Platform",
    )


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health_check(
    settings: Settings = Depends(get_settings_dependency),
    db: Session = Depends(get_db_dependency),
    neo4j: Neo4jConnectionManager = Depends(get_neo4j_dependency),
) -> HealthResponse:
    """Verify application and dependency health."""
    dependencies: dict[str, str] = {}

    try:
        db.execute(text("SELECT 1"))
        dependencies["postgresql"] = "healthy"
    except Exception as exc:
        logger.warning("PostgreSQL health check failed: {}", exc)
        dependencies["postgresql"] = "unhealthy"

    try:
        dependencies["neo4j"] = "healthy" if neo4j.verify() else "unhealthy"
    except Exception as exc:
        logger.warning("Neo4j health check failed: {}", exc)
        dependencies["neo4j"] = "unhealthy"

    overall_status = (
        "healthy"
        if all(status == "healthy" for status in dependencies.values())
        else "degraded"
    )

    return HealthResponse(
        status=overall_status,
        timestamp=datetime.now(UTC),
        version=settings.app_version,
        environment=settings.environment,
        dependencies=dependencies,
    )


@router.get("/version", response_model=VersionResponse, summary="Version info")
def version_info(settings: Settings = Depends(get_settings_dependency)) -> VersionResponse:
    """Return application version metadata."""
    return VersionResponse(
        name=settings.app_name,
        version=settings.app_version,
        environment=settings.environment,
    )
