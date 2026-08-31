"""Data cleaning and transformation pipeline for StreamPulse datasets.

Provides modular, individually testable functions to deduplicate, impute missing values,
and standardize categorical attributes across all 4 telemetry datasets.
"""

import sys
import logging
from pathlib import Path
import pandas as pd
pd.set_option('future.no_silent_downcasting', True)
from src.processing.schema import DATASET_CONTRACTS, validate_schema

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("StreamPulse.Clean")


def remove_duplicates(df: pd.DataFrame, subset: list[str] | None = None) -> pd.DataFrame:
    """Remove duplicate records from DataFrame and log the count of dropped rows.

    Args:
        df: Input pandas DataFrame.
        subset: Optional list of columns to consider when identifying duplicate rows.

    Returns:
        Cleaned DataFrame with duplicate records removed.
    """
    initial_count = len(df)
    cleaned_df = df.drop_duplicates(subset=subset).copy()
    dropped_count = initial_count - len(cleaned_df)
    if dropped_count > 0:
        logger.info("Deduplication: removed %d duplicate rows (subset=%s).", dropped_count, subset)
    return cleaned_df


def handle_missing_values(df: pd.DataFrame, strategy: dict[str, str]) -> pd.DataFrame:
    """Impute or resolve missing values according to explicit per-column strategies.

    Imputation Strategies:
      - 'median': Replaces numeric NaNs with the column median (e.g. watch_duration_min, runtime_minutes).
      - 'mean': Replaces numeric NaNs with the column mean.
      - 'mode': Replaces NaNs with the most frequent value (e.g. release_date).
      - 'zero': Replaces numeric NaNs with 0 (e.g. pause_count).
      - 'false': Replaces boolean/nullable NaNs with False (e.g. rewatch_flag).
      - 'unknown': Replaces categorical NaNs with 'Unknown' (e.g. device_type).
      - 'drop': Drops any rows where this specific column is null.

    Args:
        df: Input pandas DataFrame.
        strategy: Dictionary mapping column names to imputation strategy strings.

    Returns:
        DataFrame with missing values resolved.
    """
    cleaned = df.copy()
    for col, strat in strategy.items():
        if col not in cleaned.columns:
            continue

        null_count = cleaned[col].isnull().sum()
        if null_count == 0:
            continue

        logger.info("Imputing column '%s' (%d nulls) using strategy '%s'.", col, null_count, strat)
        if strat == "median":
            median_val = cleaned[col].median()
            cleaned[col] = cleaned[col].fillna(median_val)
        elif strat == "mean":
            mean_val = cleaned[col].mean()
            cleaned[col] = cleaned[col].fillna(mean_val)
        elif strat == "mode":
            mode_series = cleaned[col].mode()
            mode_val = mode_series.iloc[0] if not mode_series.empty else "Unknown"
            cleaned[col] = cleaned[col].fillna(mode_val)
        elif strat == "zero":
            cleaned[col] = cleaned[col].fillna(0)
        elif strat == "false":
            cleaned[col] = cleaned[col].fillna(False)
        elif strat == "unknown":
            cleaned[col] = cleaned[col].fillna("Unknown")
        elif strat == "drop":
            cleaned = cleaned.dropna(subset=[col])

    return cleaned


def standardize_categorical(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    """Standardize categorical string fields by stripping whitespace and formatting in Title Case.

    Args:
        df: Input pandas DataFrame.
        columns: List of column names to standardize.

    Returns:
        DataFrame with standardized string values.
    """
    cleaned = df.copy()
    for col in columns:
        if col in cleaned.columns:
            cleaned[col] = cleaned[col].astype(str).str.strip().str.title()
    return cleaned


def clean_pipeline(
    raw_dir: str = "data/raw",
    processed_dir: str = "data/processed",
) -> dict[str, Path]:
    """Execute end-to-end data cleaning pipeline across all 4 StreamPulse datasets.

    Loads raw CSV files from raw_dir, performs schema validation, removes duplicates,
    applies column-level missing value imputation strategies, standardizes casing,
    and writes cleaned datasets to processed_dir.

    Args:
        raw_dir: Path to directory containing raw CSV datasets.
        processed_dir: Path to destination directory for cleaned CSV datasets.

    Returns:
        Dict mapping dataset entity name to output cleaned file Path.
    """
    r_path = Path(raw_dir)
    p_path = Path(processed_dir)
    p_path.mkdir(parents=True, exist_ok=True)

    dataset_configs = {
        "content_metadata": {
            "file": "content_metadata.csv",
            "dedup_subset": ["content_id"],
            "impute_strategy": {"runtime_minutes": "median", "release_date": "mode"},
            "standardize_cols": ["genre", "title"],
        },
        "subscriptions": {
            "file": "subscriptions.csv",
            "dedup_subset": ["user_id"],
            "impute_strategy": {"tenure_days": "median", "subscription_status": "mode"},
            "standardize_cols": ["subscription_status"],
        },
        "sessions": {
            "file": "sessions.csv",
            "dedup_subset": ["session_id"],
            "impute_strategy": {"watch_duration_min": "median", "pause_count": "zero"},
            "standardize_cols": [],
        },
        "engagement_events": {
            "file": "engagement_events.csv",
            "dedup_subset": ["event_id"],
            "impute_strategy": {
                "completion_rate": "median",
                "rewatch_flag": "false",
                "device_type": "unknown",
            },
            "standardize_cols": ["device_type"],
        },
    }

    output_files = {}

    for name, config in dataset_configs.items():
        raw_file = r_path / config["file"]
        if not raw_file.exists():
            logger.warning("Raw dataset file not found: %s. Skipping.", raw_file)
            continue

        df_raw = pd.read_csv(raw_file)
        logger.info("Processing '%s': %d initial raw rows.", name, len(df_raw))

        # 1. Validate Schema
        if name in DATASET_CONTRACTS:
            violations = validate_schema(df_raw, DATASET_CONTRACTS[name])
            if violations:
                for v in violations:
                    logger.warning("Schema Notice [%s]: %s", name, v)

        # 2. Remove Duplicates
        df_clean = remove_duplicates(df_raw, subset=config["dedup_subset"])

        # 3. Impute Missing Values
        df_clean = handle_missing_values(df_clean, strategy=config["impute_strategy"])

        # 4. Standardize Categorical Formatting
        if config["standardize_cols"]:
            df_clean = standardize_categorical(df_clean, columns=config["standardize_cols"])

        # 5. Domain specific normalization (e.g. clip completion rate to 0-100)
        if name == "engagement_events" and "completion_rate" in df_clean.columns:
            df_clean["completion_rate"] = df_clean["completion_rate"].clip(0.0, 100.0)

        # Save cleaned file
        out_file = p_path / config["file"]
        df_clean.to_csv(out_file, index=False)
        output_files[name] = out_file
        logger.info("Saved cleaned '%s' to %s (%d rows).", name, out_file, len(df_clean))

    return output_files


if __name__ == "__main__":
    clean_pipeline()
