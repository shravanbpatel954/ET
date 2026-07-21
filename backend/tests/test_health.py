"""Tests for system endpoints."""

from fastapi.testclient import TestClient


def test_root_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/")
    assert response.status_code == 200
    data = response.json()
    assert "SentinelAI" in data["message"]


def test_version_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/version")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "SentinelAI-Test"
    assert data["version"] == "0.1.0-test"
    assert data["environment"] == "development"


def test_health_endpoint(client: TestClient) -> None:
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ("healthy", "degraded")
    assert "dependencies" in data
    assert "postgresql" in data["dependencies"]
    assert "neo4j" in data["dependencies"]


def test_request_id_header(client: TestClient) -> None:
    response = client.get("/api/v1/")
    assert response.status_code == 200
    assert "X-Request-ID" in response.headers
    assert len(response.headers["X-Request-ID"]) > 0


def test_openapi_docs_available(client: TestClient) -> None:
    response = client.get("/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "SentinelAI-Test"
