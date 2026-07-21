"""Neo4j graph database connection manager."""

from __future__ import annotations

from contextlib import contextmanager
from collections.abc import Generator
from typing import Any, TYPE_CHECKING

try:
    from neo4j import GraphDatabase
except ModuleNotFoundError:  # pragma: no cover - optional local service
    GraphDatabase = None

if TYPE_CHECKING:
    from neo4j import Driver, Session
else:
    Driver = Any
    Session = Any

from app.core.config import Settings, get_settings


class Neo4jConnectionManager:
    """Manages the Neo4j driver lifecycle and session access."""

    def __init__(self, settings: Settings | None = None) -> None:
        self._settings = settings or get_settings()
        self._driver: Driver | None = None

    def connect(self) -> Driver:
        """Establish connection to Neo4j if not already connected."""
        if GraphDatabase is None:
            raise RuntimeError("Neo4j Python driver is not installed. Install backend requirements to enable graph storage.")
        if self._driver is None:
            self._driver = GraphDatabase.driver(
                self._settings.neo4j_uri,
                auth=(self._settings.neo4j_username, self._settings.neo4j_password),
            )
            self._driver.verify_connectivity()
        return self._driver

    @property
    def driver(self) -> Driver:
        """Return the active Neo4j driver, connecting if necessary."""
        return self.connect()

    @contextmanager
    def session(self, **kwargs: Any) -> Generator[Session, None, None]:
        """Yield a Neo4j session within a context manager."""
        session = self.driver.session(**kwargs)
        try:
            yield session
        finally:
            session.close()

    def verify(self) -> bool:
        """Verify Neo4j connectivity."""
        try:
            self.driver.verify_connectivity()
            return True
        except Exception:
            return False

    def close(self) -> None:
        """Close the Neo4j driver connection."""
        if self._driver is not None:
            self._driver.close()
            self._driver = None


def get_neo4j_manager(settings: Settings | None = None) -> Neo4jConnectionManager:
    """Return the global Neo4j connection manager singleton."""
    global _manager
    if _manager is None:
        _manager = Neo4jConnectionManager(settings)
    return _manager


def close_neo4j() -> None:
    """Close the global Neo4j connection manager (used during shutdown)."""
    global _manager
    if _manager is not None:
        _manager.close()
        _manager = None


_manager: Neo4jConnectionManager | None = None
