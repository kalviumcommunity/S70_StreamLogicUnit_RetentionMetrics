"""Unit tests for data validation, cleaning, transformation, and database loading."""

from pathlib import Path
from unittest.mock import patch
import pandas as pd
from sqlalchemy import create_engine
from src.processing.schema import DATASET_CONTRACTS, validate_schema
from src.processing.clean import (
    remove_duplicates,
    handle_missing_values,
    standardize_categorical,
    clean_pipeline,
)
from src.processing.load_to_postgres import (
    execute_sql_file,
    load_processed_data_to_db,
)


def test_validate_schema_valid():
    """Verify that a valid DataFrame passes schema validation with zero violations."""
    df = pd.DataFrame({
        "user_id": ["USR_001", "USR_002"],
        "subscription_status": ["active", "churned"],
        "churn_flag": [False, True],
        "tenure_days": [120, 340],
    })
    violations = validate_schema(df, DATASET_CONTRACTS["subscriptions"])
    assert len(violations) == 0


def test_validate_schema_missing_and_null_violations():
    """Verify detection of missing required columns and unexpected nulls."""
    df = pd.DataFrame({
        "user_id": ["USR_001", None],
        "churn_flag": [False, True],
    })
    contract = DATASET_CONTRACTS["subscriptions"]
    violations = validate_schema(df, contract)
    assert any("Missing expected column 'subscription_status'" in v for v in violations)
    assert any("Non-nullable column 'user_id'" in v for v in violations)


def test_remove_duplicates():
    """Verify duplicate row removal based on full rows and subset columns."""
    df = pd.DataFrame({
        "user_id": ["u1", "u1", "u2"],
        "session_id": ["s1", "s1", "s2"],
        "duration": [10.0, 10.0, 20.0],
    })
    cleaned = remove_duplicates(df, subset=["session_id"])
    assert len(cleaned) == 2
    assert "u1" in cleaned["user_id"].values
    assert "u2" in cleaned["user_id"].values


def test_handle_missing_values_all_strategies():
    """Verify median, mean, mode, zero, false, unknown, and drop imputation strategies."""
    df = pd.DataFrame({
        "num_median": [10.0, 20.0, None, 30.0],
        "num_mean": [10.0, 20.0, None, 30.0],
        "cat_mode": ["Action", "Action", None, "Comedy"],
        "num_zero": [5.0, None, 15.0, None],
        "bool_false": [True, None, False, None],
        "cat_unknown": ["TV", None, "Web", None],
        "must_drop": [1.0, 2.0, None, 4.0],
    })

    strategy = {
        "num_median": "median",
        "num_mean": "mean",
        "cat_mode": "mode",
        "num_zero": "zero",
        "bool_false": "false",
        "cat_unknown": "unknown",
        "must_drop": "drop",
    }

    cleaned = handle_missing_values(df, strategy)
    assert len(cleaned) == 3  # row 2 dropped
    assert cleaned["num_median"].isnull().sum() == 0
    assert cleaned["num_mean"].isnull().sum() == 0
    assert cleaned["num_zero"].isnull().sum() == 0
    assert cleaned["bool_false"].isnull().sum() == 0
    assert cleaned["cat_unknown"].isnull().sum() == 0


def test_standardize_categorical():
    """Verify trimming and title casing across string columns."""
    df = pd.DataFrame({
        "genre": [" drama ", "ACTION", "sci-fi ", "Comedy"],
        "title": [" title one ", "TITLE TWO", "title three", "Title Four"],
    })
    cleaned = standardize_categorical(df, ["genre", "title"])
    assert cleaned["genre"].tolist() == ["Drama", "Action", "Sci-Fi", "Comedy"]
    assert cleaned["title"].iloc[0] == "Title One"


def test_clean_pipeline_execution(tmp_path: Path):
    """Verify end-to-end execution of clean_pipeline producing all 4 cleaned CSVs."""
    raw_dir = tmp_path / "raw"
    proc_dir = tmp_path / "processed"
    raw_dir.mkdir()

    # Create small dummy raw datasets
    pd.DataFrame({
        "content_id": ["c1", "c1", "c2"],
        "title": [" Movie A ", "Movie A", "Movie B"],
        "genre": ["action", "action", "Drama"],
        "runtime_minutes": [90.0, 90.0, None],
        "release_date": ["2023-01-01", "2023-01-01", None],
    }).to_csv(raw_dir / "content_metadata.csv", index=False)

    pd.DataFrame({
        "user_id": ["u1", "u2"],
        "subscription_status": ["active", "churned"],
        "churn_flag": [False, True],
        "tenure_days": [100.0, None],
    }).to_csv(raw_dir / "subscriptions.csv", index=False)

    pd.DataFrame({
        "user_id": ["u1", "u2"],
        "session_id": ["s1", "s2"],
        "watch_duration_min": [45.0, None],
        "pause_count": [1.0, None],
        "session_date": ["2024-01-01", "2024-01-02"],
    }).to_csv(raw_dir / "sessions.csv", index=False)

    pd.DataFrame({
        "event_id": [1, 2],
        "content_id": ["c1", "c2"],
        "completion_rate": [120.0, None],
        "rewatch_flag": [True, None],
        "device_type": ["tv", None],
    }).to_csv(raw_dir / "engagement_events.csv", index=False)

    out_files = clean_pipeline(raw_dir=str(raw_dir), processed_dir=str(proc_dir))
    assert len(out_files) == 4
    assert (proc_dir / "content_metadata.csv").exists()
    assert (proc_dir / "subscriptions.csv").exists()
    assert (proc_dir / "sessions.csv").exists()
    assert (proc_dir / "engagement_events.csv").exists()

    # Verify completion rate clipping
    e_clean = pd.read_csv(proc_dir / "engagement_events.csv")
    assert e_clean["completion_rate"].max() <= 100.0


def test_load_to_postgres_execution(tmp_path: Path):
    """Verify execution of load_to_postgres functions using SQLite in-memory engine."""
    sqlite_engine = create_engine("sqlite:///:memory:")

    # Create dummy sql file
    sql_file = tmp_path / "test.sql"
    sql_file.write_text("CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT);")

    execute_sql_file(sqlite_engine, sql_file)
    execute_sql_file(sqlite_engine, tmp_path / "non_existent.sql")

    with patch("src.processing.load_to_postgres.get_engine", return_value=sqlite_engine):
        with patch("src.processing.load_to_postgres.init_database_schema"):
            # Create a mock processed dir with 1 csv
            proc_dir = tmp_path / "processed_mock"
            proc_dir.mkdir()
            pd.DataFrame({"content_id": ["c1"], "title": ["Test"]}).to_csv(
                proc_dir / "content_metadata.csv", index=False
            )
            load_processed_data_to_db(processed_dir=str(proc_dir))
