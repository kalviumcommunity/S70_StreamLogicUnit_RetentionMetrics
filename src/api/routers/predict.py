"""Predictive inference endpoint for subscriber churn risk."""

from fastapi import APIRouter
from src.api.models import PredictRequest, PredictResponse
from src.ml.predict import predict_risk

router = APIRouter()


@router.post("/predict", response_model=PredictResponse)
def predict_churn(payload: PredictRequest):
    """Predict subscriber churn risk probability and risk tier from engagement metrics."""
    features = payload.model_dump()
    risk_score = predict_risk(features)

    if risk_score >= 0.65:
        risk_label = "high"
    elif risk_score >= 0.35:
        risk_label = "medium"
    else:
        risk_label = "low"

    return PredictResponse(
        risk_score=round(risk_score, 4),
        risk_label=risk_label,
    )
