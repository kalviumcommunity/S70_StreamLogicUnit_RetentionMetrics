"""Integration tests for FastAPI health and engagement endpoints."""

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_health_check():
    """Verify GET /api/health returns status 200 and ok payload."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_engagement_summary_endpoint():
    """Verify GET /api/engagement-summary returns valid schema structure."""
    response = client.get("/api/engagement-summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        first = data[0]
        assert "genre" in first
        assert "avg_completion_rate" in first
        assert "avg_watch_duration" in first
        assert "session_count" in first


def test_content_insights_endpoint():
    """Verify GET /api/content-insights returns top content list."""
    response = client.get("/api/content-insights?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if data:
        first = data[0]
        assert "content_id" in first
        assert "title" in first
        assert "avg_completion_rate" in first
