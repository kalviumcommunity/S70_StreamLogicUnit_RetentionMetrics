"""Unit and integration tests for /content-insights API endpoint."""

import pytest
from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_get_content_insights_default():
    """Verify /content-insights returns 200 OK and a valid list of titles."""
    response = client.get("/api/content-insights")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        first = data[0]
        assert "content_id" in first
        assert "title" in first
        assert "genre" in first
        assert "avg_completion_rate" in first
        assert "total_sessions" in first


def test_get_content_insights_limit():
    """Verify limit parameter properly constrains output count."""
    response = client.get("/api/content-insights?limit=2")
    assert response.status_code == 200
    data = response.json()
    assert len(data) <= 2
