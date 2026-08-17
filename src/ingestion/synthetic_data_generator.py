"""Synthetic data generator fallback for StreamPulse analytics pipeline."""

from pathlib import Path
import pandas as pd


def generate_synthetic_data(
    dest_dir: str = "data/raw",
    n_users: int = 5000,
    n_content: int = 200,
    n_sessions: int = 50000,
    seed: int = 42,
) -> dict[str, Path]:
    """Generate 4 synthetic CSV files matching StreamPulse schema.

    Args:
        dest_dir: Target output directory for raw CSVs.
        n_users: Number of synthetic subscribers.
        n_content: Number of content titles.
        n_sessions: Number of session records.
        seed: Random seed for reproducibility.

    Returns:
        Dictionary of dataset name to file Path.
    """
    out_dir = Path(dest_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    return {}
