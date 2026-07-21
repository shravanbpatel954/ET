"""API tests for threat document endpoints with mocked dependencies."""

from datetime import UTC, datetime
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi.testclient import TestClient

from app.dependencies.ingestion import get_document_repository, get_ingestion_service
from app.models.enums import DocumentStatus, ProcessingStage, SourceType, ThreatCategory
from app.models.threat_document import ThreatDocument


@pytest.fixture
def sample_document() -> ThreatDocument:
    return ThreatDocument(
        id=uuid4(),
        title="UPI Fraud Complaint",
        content="A citizen reported receiving a fraudulent UPI collect request.",
        summary=None,
        source="citizen_portal",
        source_type=SourceType.CITIZEN_COMPLAINT,
        language="en",
        country="IN",
        category=ThreatCategory.UPI_FRAUD,
        publish_date=None,
        created_at=datetime.now(UTC),
        metadata={"channel": "web"},
        status=DocumentStatus.STORED,
        processing_stage=ProcessingStage.COMPLETE,
    )


@pytest.fixture
def client_with_mocks(test_settings, sample_document: ThreatDocument) -> TestClient:
    from app.factory import create_app

    app = create_app(test_settings)

    mock_ingestion = AsyncMock()
    mock_ingestion.ingest.return_value = sample_document

    mock_repository = AsyncMock()
    mock_repository.list_documents.return_value = ([sample_document], 1)
    mock_repository.get_by_id.return_value = sample_document
    mock_repository.delete.return_value = True

    app.dependency_overrides[get_ingestion_service] = lambda: mock_ingestion
    app.dependency_overrides[get_document_repository] = lambda: mock_repository

    return TestClient(app)


def test_ingest_text_document(client_with_mocks: TestClient) -> None:
    response = client_with_mocks.post(
        "/api/v1/documents/text",
        json={
            "content": "A citizen reported a fraudulent UPI collect request yesterday.",
            "source": "citizen_portal",
            "source_type": "citizen_complaint",
            "title": "UPI Fraud Complaint",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "UPI Fraud Complaint"
    assert data["source_type"] == "citizen_complaint"


def test_list_documents(client_with_mocks: TestClient) -> None:
    response = client_with_mocks.get("/api/v1/documents")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1


def test_get_document(client_with_mocks: TestClient, sample_document: ThreatDocument) -> None:
    response = client_with_mocks.get(f"/api/v1/documents/{sample_document.id}")
    assert response.status_code == 200
    assert response.json()["id"] == str(sample_document.id)


def test_delete_document(client_with_mocks: TestClient, sample_document: ThreatDocument) -> None:
    response = client_with_mocks.delete(f"/api/v1/documents/{sample_document.id}")
    assert response.status_code == 200
    assert response.json()["deleted"] is True
