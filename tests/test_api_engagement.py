"""Integration tests for FastAPI health, engagement, retention, and content insights endpoints."""

from fastapi.testclient import TestClient
from src.api.main import app
from src.api.database import get_db

client = TestClient(app)


def test_health_check():
    """Verify GET /api/health returns status 200 and ok payload."""
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_engagement_summary_endpoint():
    """Verify GET /api/engagement-summary returns valid schema structure without filters."""
    response = client.get("/api/engagement-summary")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "genre" in first
    assert "avg_completion_rate" in first
    assert "avg_watch_duration" in first
    assert "session_count" in first


def test_engagement_summary_with_genre_filter():
    """Verify GET /api/engagement-summary with specific genre query parameter."""
    response = client.get("/api/engagement-summary?genre=Action")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for item in data:
        assert item["genre"].lower() == "action"


def test_retention_drivers_endpoint():
    """Verify GET /api/retention-drivers returns ranked drivers with interpretations."""
    response = client.get("/api/retention-drivers")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    first = data[0]
    assert "feature" in first
    assert "importance" in first
    assert "interpretation" in first
    assert 0.0 <= first["importance"] <= 1.0


def test_content_insights_endpoint():
    """Verify GET /api/content-insights returns top content limited by query param."""
    response = client.get("/api/content-insights?limit=3")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) <= 3
    if data:
        first = data[0]
        assert "content_id" in first
        assert "title" in first
        assert "avg_completion_rate" in first
        assert "total_sessions" in first


def test_retention_summary_endpoint():
    """Verify GET /api/retention-summary returns retention and churn KPIs."""
    response = client.get("/api/retention-summary")
    assert response.status_code == 200
    data = response.json()
    assert "total_subscribers" in data
    assert "active_subscribers" in data
    assert "churned_subscribers" in data
    assert "retention_rate_pct" in data
    assert "churn_rate_pct" in data
    assert "avg_tenure_days" in data
    assert data["total_subscribers"] > 0


def test_database_dependency_override():
    """Verify endpoint behavior when database session is mock-overridden."""
    def mock_db():
        yield None

    app.dependency_overrides[get_db] = mock_db
    try:
        response = client.get("/api/engagement-summary")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    finally:
        app.dependency_overrides.clear()

