"""Unit tests for data cleaning functions in src/processing/clean.py."""

import pandas as pd
from src.processing.clean import (
    remove_duplicates,
    handle_missing_values,
    standardize_categorical,
)


def test_remove_duplicates():
    """Verify duplicate row identification and removal."""
    df = pd.DataFrame({
        "user_id": ["u1", "u1", "u2"],
        "session_id": ["s1", "s1", "s2"],
        "duration": [10.0, 10.0, 20.0],
    })
    cleaned = remove_duplicates(df)
    assert len(cleaned) == 2
    assert "u1" in cleaned["user_id"].values
    assert "u2" in cleaned["user_id"].values


def test_handle_missing_values():
    """Verify numeric median imputation and categorical unknown imputation."""
    df = pd.DataFrame({
        "watch_duration": [10.0, 20.0, None, 30.0],
        "genre": ["Action", None, "Drama", "Comedy"],
    })
    strategy = {
        "watch_duration": "median",
        "genre": "unknown",
    }
    cleaned = handle_missing_values(df, strategy)
    assert cleaned["watch_duration"].isnull().sum() == 0
    assert cleaned["watch_duration"].iloc[2] == 20.0
    assert cleaned["genre"].isnull().sum() == 0
    assert cleaned["genre"].iloc[1] == "Unknown"


def test_standardize_categorical():
    """Verify categorical trimming and title casing."""
    df = pd.DataFrame({
        "genre": [" drama ", "ACTION", "sci-fi ", "Comedy"],
    })
    cleaned = standardize_categorical(df, ["genre"])
    assert cleaned["genre"].tolist() == ["Drama", "Action", "Sci-Fi", "Comedy"]
