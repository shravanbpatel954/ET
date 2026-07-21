"""Pytest configuration and shared fixtures."""

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings, get_settings
from app.factory import create_app


@pytest.fixture
def test_settings() -> Settings:
    """Return settings configured for the test environment."""
    return Settings(
        app_name="SentinelAI-Test",
        app_version="0.1.0-test",
        environment="development",
        debug=True,
        host="127.0.0.1",
        port=8000,
        postgres_url="postgresql://sentinel:sentinel_secret@localhost:5432/sentinelai_test",
        neo4j_uri="bolt://localhost:7687",
        neo4j_username="neo4j",
        neo4j_password="neo4j_secret",
        secret_key="test-secret-key",
        log_level="DEBUG",
    )


@pytest.fixture
def client(test_settings: Settings) -> TestClient:
    """Return a FastAPI test client with overridden settings."""
    app = create_app(test_settings)
    return TestClient(app)
