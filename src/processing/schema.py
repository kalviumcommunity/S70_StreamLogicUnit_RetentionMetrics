"""Schema definitions and validation contracts for StreamPulse raw telemetry datasets."""

from typing import Any
import pandas as pd

# Schema contract definitions for each entity: column -> expected dtypes -> nullable
DATASET_CONTRACTS: dict[str, dict[str, dict[str, Any]]] = {
    "sessions": {
        "user_id": {"dtype": ["object", "string"], "nullable": False},
        "session_id": {"dtype": ["object", "string"], "nullable": False},
        "watch_duration_min": {"dtype": ["float64", "int64", "float32"], "nullable": True},
        "pause_count": {"dtype": ["float64", "int64", "int32"], "nullable": True},
        "session_date": {"dtype": ["object", "string", "datetime64[ns]"], "nullable": False},
    },
    "content_metadata": {
        "content_id": {"dtype": ["object", "string"], "nullable": False},
        "title": {"dtype": ["object", "string"], "nullable": False},
        "genre": {"dtype": ["object", "string"], "nullable": False},
        "runtime_minutes": {"dtype": ["float64", "int64", "int32"], "nullable": True},
        "release_date": {"dtype": ["object", "string", "datetime64[ns]"], "nullable": True},
    },
    "engagement_events": {
        "event_id": {"dtype": ["int64", "int32", "float64"], "nullable": False},
        "content_id": {"dtype": ["object", "string"], "nullable": False},
        "completion_rate": {"dtype": ["float64", "int64", "float32"], "nullable": True},
        "rewatch_flag": {"dtype": ["bool", "boolean", "object"], "nullable": True},
        "device_type": {"dtype": ["object", "string"], "nullable": True},
    },
    "subscriptions": {
        "user_id": {"dtype": ["object", "string"], "nullable": False},
        "subscription_status": {"dtype": ["object", "string"], "nullable": False},
        "churn_flag": {"dtype": ["bool", "boolean", "int64", "object"], "nullable": False},
        "tenure_days": {"dtype": ["float64", "int64", "int32"], "nullable": True},
    },
}


def validate_schema(df: pd.DataFrame, contract: dict[str, dict[str, Any]]) -> list[str]:
    """Validate DataFrame against a schema contract and return a list of violations.

    Does not raise exceptions, enabling the pipeline to log issues and proceed gracefully.

    Args:
        df: Input DataFrame to inspect.
        contract: Dict specifying expected columns, dtypes, and nullability.

    Returns:
        List of human-readable violation descriptions.
    """
    violations = []
    for col, spec in contract.items():
        if col not in df.columns:
            violations.append(f"Missing expected column '{col}'")
            continue

        if not spec["nullable"] and df[col].isnull().any():
            null_count = df[col].isnull().sum()
            violations.append(f"Non-nullable column '{col}' contains {null_count} null value(s)")

    return violations
