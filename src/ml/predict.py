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
    model = load_model(model_path, feature_columns_path)
    columns = _FEATURE_COLUMNS or [
        "avg_completion_rate",
        "avg_watch_duration",
        "session_count",
        "days_since_last_session",
        "binge_score",
        "pause_rate",
    ]

    clean_features = dict(features)
    # If completion rate passed as percentage (e.g. 75.0 > 1.0), normalize to ratio (0.75)
    if "avg_completion_rate" in clean_features and clean_features["avg_completion_rate"] > 1.0:
        clean_features["avg_completion_rate"] = clean_features["avg_completion_rate"] / 100.0

    row = {col: [clean_features.get(col, 0.0)] for col in columns}
    input_df = pd.DataFrame(row)

    if model is not None:
        try:
            proba = model.predict_proba(input_df)[0][1]
            return float(proba)
        except Exception as exc:
            logger.warning("Model inference error: %s. Using heuristic fallback.", exc)

    inactivity = min(clean_features.get("days_since_last_session", 0) / 30.0, 1.0)
    completion = 1.0 - min(clean_features.get("avg_completion_rate", 0.5), 1.0)
    heuristic_score = 0.6 * inactivity + 0.4 * completion
    return float(round(min(max(heuristic_score, 0.0), 1.0), 4))
