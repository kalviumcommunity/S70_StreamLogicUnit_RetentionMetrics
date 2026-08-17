"""Schema definitions and validation contracts for StreamPulse raw datasets."""

from typing import Any
import pandas as pd


DATASET_CONTRACTS: dict[str, dict[str, dict[str, Any]]] = {
    "sessions": {
        "user_id": {"dtype": "object", "nullable": False},
        "session_id": {"dtype": "object", "nullable": False},
        "watch_duration_min": {"dtype": "float64", "nullable": True},
        "pause_count": {"dtype": "int64", "nullable": True},
        "session_date": {"dtype": "object", "nullable": False},
    },
    "content_metadata": {
        "content_id": {"dtype": "object", "nullable": False},
        "title": {"dtype": "object", "nullable": False},
        "genre": {"dtype": "object", "nullable": False},
        "runtime_minutes": {"dtype": "int64", "nullable": True},
        "release_date": {"dtype": "object", "nullable": True},
    },
    "engagement_events": {
        "event_id": {"dtype": "int64", "nullable": False},
        "content_id": {"dtype": "object", "nullable": False},
        "completion_rate": {"dtype": "float64", "nullable": True},
        "rewatch_flag": {"dtype": "bool", "nullable": True},
        "device_type": {"dtype": "object", "nullable": True},
    },
    "subscriptions": {
        "user_id": {"dtype": "object", "nullable": False},
        "subscription_status": {"dtype": "object", "nullable": False},
        "churn_flag": {"dtype": "bool", "nullable": False},
        "tenure_days": {"dtype": "int64", "nullable": True},
    },
}


def validate_schema(df: pd.DataFrame, contract: dict[str, dict[str, Any]]) -> list[str]:
    """Validate DataFrame against a schema contract and return list of violations.

    Args:
        df: Input DataFrame to validate.
        contract: Schema contract specification.

    Returns:
        List of human-readable violation descriptions.
    """
    violations = []
    for col, specs in contract.items():
        if col not in df.columns:
            violations.append(f"Missing required column '{col}'")
        elif not specs["nullable"] and df[col].isnull().any():
            violations.append(f"Column '{col}' contains unexpected null values")
    return violations
