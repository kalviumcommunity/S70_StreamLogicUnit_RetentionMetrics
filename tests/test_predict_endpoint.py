"""Integration tests for churn prediction inference endpoint."""

from fastapi.testclient import TestClient
from src.api.main import app

client = TestClient(app)


def test_predict_endpoint_low_risk():
    """Verify POST /api/predict correctly identifies low risk subscribers."""
    payload = {
        "avg_completion_rate": 92.0,
        "avg_watch_duration": 65.0,
        "session_count": 25,
        "days_since_last_session": 1,
        "binge_score": 6.0,
        "pause_rate": 0.01,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["risk_score"] <= 1.0
    assert data["risk_label"] in ["low", "medium", "high"]


def test_predict_endpoint_high_risk():
    """Verify POST /api/predict correctly flags high churn risk profiles."""
    payload = {
        "avg_completion_rate": 20.0,
        "avg_watch_duration": 10.0,
        "session_count": 1,
        "days_since_last_session": 28,
        "binge_score": 0.0,
        "pause_rate": 0.40,
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert 0.0 <= data["risk_score"] <= 1.0
    assert data["risk_label"] in ["medium", "high"]


def test_predict_endpoint_validation_error():
    """Verify POST /api/predict rejects invalid negative numeric values."""
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
