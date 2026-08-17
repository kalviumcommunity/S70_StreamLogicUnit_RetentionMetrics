"""Inference and risk scoring functions for StreamPulse retention predictions."""

from pathlib import Path
from typing import Any
import joblib
import pandas as pd

_MODEL = None


def load_model(model_path: str = "models/retention_model.pkl"):
    """Load serialized model artifact from disk or return cached instance.

    Args:
        model_path: Path to model file.

    Returns:
        Loaded scikit-learn model pipeline or estimator.
    """
    global _MODEL
    if _MODEL is None and Path(model_path).exists():
        _MODEL = joblib.load(model_path)
    return _MODEL


def predict_risk(features: dict[str, Any], model_path: str = "models/retention_model.pkl") -> float:
    """Compute churn risk probability score between 0.0 and 1.0.

    Args:
        features: Dictionary of engineered subscriber metrics.
        model_path: Path to serialized model artifact.

    Returns:
        Churn probability as float between 0.0 and 1.0.
    """
    model = load_model(model_path)
    if model is None:
        return 0.5
    df = pd.DataFrame([features])
    proba = model.predict_proba(df)[0][1]
    return float(proba)
