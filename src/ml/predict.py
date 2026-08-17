"""Inference and risk scoring functions for StreamPulse retention predictions."""

import json
import logging
from pathlib import Path
from typing import Any
import joblib
import pandas as pd

logger = logging.getLogger("StreamPulse.Predict")

_MODEL = None
_FEATURE_COLUMNS = None


def load_model(
    model_path: str = "models/retention_model.pkl",
    feature_columns_path: str = "models/feature_columns.json",
):
    """Load serialized model artifact and column ordering from disk or return cached objects.

    Args:
        model_path: Path to serialized model pipeline.
        feature_columns_path: Path to JSON file defining feature column order.

    Returns:
        Loaded scikit-learn model pipeline or None if artifact does not exist.
    """
    global _MODEL, _FEATURE_COLUMNS

    if _MODEL is None and Path(model_path).exists():
        try:
            _MODEL = joblib.load(model_path)
            logger.info("Successfully loaded ML model from %s", model_path)
        except Exception as exc:
            logger.error("Failed to load model artifact: %s", exc)
            _MODEL = None

    if _FEATURE_COLUMNS is None and Path(feature_columns_path).exists():
        try:
            with open(feature_columns_path, "r", encoding="utf-8") as f:
                _FEATURE_COLUMNS = json.load(f)
        except Exception:
            _FEATURE_COLUMNS = [
                "avg_completion_rate",
                "avg_watch_duration",
                "session_count",
                "days_since_last_session",
                "binge_score",
                "pause_rate",
            ]

    return _MODEL


def predict_risk(
    features: dict[str, Any],
    model_path: str = "models/retention_model.pkl",
    feature_columns_path: str = "models/feature_columns.json",
) -> float:
    """Compute churn risk probability score between 0.0 and 1.0.

    Args:
        features: Dictionary of subscriber metrics matching feature schema.
        model_path: Path to trained model pipeline artifact.
        feature_columns_path: Path to feature order configuration.

    Returns:
        Probability of churn as a float between 0.0 and 1.0.
    """
    model = load_model(model_path, feature_columns_path)
    columns = _FEATURE_COLUMNS or [
        "avg_completion_rate",
        "avg_watch_duration",
        "session_count",
        "days_since_last_session",
        "binge_score",
        "pause_rate",
    ]

    # Convert single dictionary payload to properly ordered DataFrame
    row = {col: [features.get(col, 0.0)] for col in columns}
    input_df = pd.DataFrame(row)

    if model is not None:
        try:
            # Return predicted probability of class 1 (churn)
            proba = model.predict_proba(input_df)[0][1]
            return float(proba)
        except Exception as exc:
            logger.warning("Model inference error: %s. Using heuristic fallback.", exc)

    # Heuristic fallback if model artifact is absent
    inactivity = min(features.get("days_since_last_session", 0) / 30.0, 1.0)
    completion = 1.0 - min(features.get("avg_completion_rate", 50.0) / 100.0, 1.0)
    heuristic_score = 0.6 * inactivity + 0.4 * completion
    return float(round(min(max(heuristic_score, 0.0), 1.0), 4))
