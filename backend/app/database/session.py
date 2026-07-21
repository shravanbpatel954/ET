"""MongoDB database session and engine management using Beanie."""

from collections.abc import AsyncGenerator
import logging
from typing import Any

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

try:
    from pymongo import AsyncMongoClient
except ImportError:  # pragma: no cover - depends on installed pymongo version
    AsyncMongoClient = None

from app.core.config import Settings, get_settings
from app.database.models import (
    ThreatDocumentModel,
    SourceRegistryModel,
    ThreatIntelligenceModel,
    ScamFingerprintModel,
    EvolutionResultModel,
)

logger = logging.getLogger(__name__)

_client: Any | None = None


async def init_db(settings: Settings | None = None) -> None:
    """Initialize MongoDB connection and Beanie ODM."""
    global _client
    if _client is None:
        settings = settings or get_settings()
        
        # Verify URI exists
        if not settings.mongo_uri:
            logger.error("MONGO_URI not configured in .env")
            return
            
        logger.info("Connecting to MongoDB: %s", settings.mongo_db)
        _client = await _initialize_beanie_client(settings)
        logger.info("Beanie ODM initialized successfully")


async def get_async_db_session() -> AsyncGenerator[None, None]:
    """
    Dummy dependency to replace the SQLAlchemy session.
    Beanie manages its own global state, so we don't need to pass a session.
    Yielding None allows us to keep the `Depends(get_async_db_session)` in endpoints
    without breaking them, until we refactor all signatures.
    """
    yield None

def get_db_session():
    """Dummy sync session"""
    yield None

def get_async_session_factory(settings=None):
    """Dummy async session factory"""
    return lambda: None

def get_session_factory(settings=None):
    """Dummy sync session factory"""
    return lambda: None


async def dispose_async_engine() -> None:
    """Close the MongoDB connection during shutdown."""
    global _client
    if _client is not None:
        _client.close()
        _client = None


async def _initialize_beanie_client(settings: Settings) -> Any:
    """Initialize Beanie with a Mongo async client compatible with the installed Beanie version."""
    errors: list[str] = []
    factories = []
    if AsyncMongoClient is not None:
        factories.append(("pymongo_async", AsyncMongoClient))
    factories.append(("motor", AsyncIOMotorClient))

    for name, factory in factories:
        client = factory(settings.mongo_uri)
        try:
            await init_beanie(
                database=client[settings.mongo_db],
                document_models=[
                    ThreatDocumentModel,
                    SourceRegistryModel,
                    ThreatIntelligenceModel,
                    ScamFingerprintModel,
                    EvolutionResultModel,
                ],
            )
            logger.info("MongoDB initialized with %s client", name)
            return client
        except Exception as exc:
            errors.append(f"{name}: {exc}")
            close = getattr(client, "close", None)
            if close:
                close()

    raise RuntimeError("Could not initialize Beanie MongoDB client. " + " | ".join(errors))
