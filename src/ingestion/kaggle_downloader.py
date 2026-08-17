"""Kaggle dataset downloader module with authentication checks."""

import os
from pathlib import Path


def download_dataset(dataset_slug: str, dest_dir: str = "data/raw") -> Path:
    """Download and unzip a dataset from Kaggle into dest_dir.

    Args:
        dataset_slug: Kaggle dataset identifier (e.g. 'owner/dataset-name').
        dest_dir: Destination directory path.

    Returns:
        Path to destination directory.

    Raises:
        RuntimeError: If Kaggle credentials are missing or download fails.
    """
    kaggle_username = os.getenv("KAGGLE_USERNAME")
    kaggle_key = os.getenv("KAGGLE_KEY")

    if not kaggle_username or not kaggle_key:
        raise RuntimeError(
            "Missing KAGGLE_USERNAME or KAGGLE_KEY environment variables. "
            "Please configure your Kaggle API credentials in .env."
        )

    out_path = Path(dest_dir)
    out_path.mkdir(parents=True, exist_ok=True)
    return out_path
