"""FastAPI dependency injection providers."""

from collections.abc import Generator

from fastapi import Request
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.database.neo4j import Neo4jConnectionManager, get_neo4j_manager
from app.database.session import get_db_session


def get_settings_dependency(request: Request) -> Settings:
    """Inject application settings from the app instance."""
    return request.app.state.settings


def get_db_dependency() -> Generator[Session, None, None]:
    """Inject a SQLAlchemy database session."""
    yield from get_db_session()


def get_neo4j_dependency() -> Neo4jConnectionManager:
    """Inject the Neo4j connection manager."""
    return get_neo4j_manager()
