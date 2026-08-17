"""Integration tests for churn prediction inference endpoint."""

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_predict_endpoint_valid_payload():
    """Verify POST /api/predict returns valid risk_score and risk_label."""
    payload = {
        "avg_completion_rate": 85.5,
        "avg_watch_duration": 45.0,
        "session_count": 12,
        "days_since_last_session": 2,
        "binge_score": 4.5,
        "pause_rate": 0.02,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_label" in data
    assert 0.0 <= data["risk_score"] <= 1.0
    assert data["risk_label"] in ["low", "medium", "high"]


def test_predict_endpoint_validation_error():
    """Verify POST /api/predict rejects invalid negative values."""
    payload = {
        "avg_completion_rate": -10.0,
        "avg_watch_duration": 45.0,
        "session_count": 12,
        "days_since_last_session": 2,
        "binge_score": 4.5,
        "pause_rate": 0.02,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 422
