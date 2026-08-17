"""Data cleaning and transformation pipeline for StreamPulse datasets."""

import logging
from pathlib import Path
import pandas as pd

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def remove_duplicates(df: pd.DataFrame, subset: list[str] | None = None) -> pd.DataFrame:
    """Remove duplicate rows from a DataFrame, logging row counts.

    Args:
        df: Input DataFrame.
        subset: Optional list of columns to consider for identifying duplicates.

    Returns:
        Deduplicated DataFrame.
    """
    initial_count = len(df)
    cleaned_df = df.drop_duplicates(subset=subset).copy()
    dropped = initial_count - len(cleaned_df)
    if dropped > 0:
        logger.info("Removed %d duplicate rows (subset=%s)", dropped, subset)
    return cleaned_df


def handle_missing_values(df: pd.DataFrame, strategy: dict[str, str]) -> pd.DataFrame:
    """Impute or handle missing values according to column strategies.

    Strategies:
      - 'median': replace NaNs with column median (numeric).
      - 'mean': replace NaNs with column mean (numeric).
      - 'mode': replace NaNs with most frequent value.
      - 'unknown': replace NaNs with string 'Unknown' (categorical).
      - 'zero': replace NaNs with 0.
      - 'drop': drop rows where this column is NaN.

    Args:
        df: Input DataFrame.
        strategy: Dict mapping column name to imputation strategy.

    Returns:
        DataFrame with imputed/cleaned values.
    """
    cleaned = df.copy()
    for col, strat in strategy.items():
        if col not in cleaned.columns:
            continue
        if strat == "median" and pd.api.types.is_numeric_dtype(cleaned[col]):
            cleaned[col] = cleaned[col].fillna(cleaned[col].median())
        elif strat == "mean" and pd.api.types.is_numeric_dtype(cleaned[col]):
            cleaned[col] = cleaned[col].fillna(cleaned[col].mean())
        elif strat == "mode":
            mode_val = cleaned[col].mode()
            if not mode_val.empty:
                cleaned[col] = cleaned[col].fillna(mode_val.iloc[0])
        elif strat == "unknown":
            cleaned[col] = cleaned[col].fillna("Unknown")
        elif strat == "zero":
            cleaned[col] = cleaned[col].fillna(0)
        elif strat == "drop":
            cleaned = cleaned.dropna(subset=[col])
    return cleaned


def standardize_categorical(df: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    """Standardize categorical string columns to title case with whitespace stripped.

    Args:
        df: Input DataFrame.
        columns: List of column names to standardize.

    Returns:
        Standardized DataFrame.
    """
    cleaned = df.copy()
    for col in columns:
        if col in cleaned.columns and cleaned[col].dtype == "object":
            cleaned[col] = cleaned[col].astype(str).str.strip().str.title()
    return cleaned


def clean_pipeline(raw_dir: str = "data/raw", processed_dir: str = "data/processed") -> dict[str, Path]:
    """Orchestrate data cleaning across all 4 raw datasets and output to processed_dir.

    Args:
        raw_dir: Directory containing raw CSV files.
        processed_dir: Directory to save cleaned CSV files.

    Returns:
        Dict mapping dataset name to cleaned file Path.
    """
    p_dir = Path(processed_dir)
    p_dir.mkdir(parents=True, exist_ok=True)
    return {}
