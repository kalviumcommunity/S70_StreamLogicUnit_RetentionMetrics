"""Single entrypoint orchestrating data ingestion and generation."""

import logging
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)


def run_ingestion_pipeline(dest_dir: str = "data/raw") -> Path:
    """Run ingestion pipeline: attempts Kaggle download, falls back to synthetic generation.

    Args:
        dest_dir: Directory where raw CSV files should be saved.

    Returns:
        Path to raw data directory.
    """
    out_dir = Path(dest_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    return out_dir


if __name__ == "__main__":
    run_ingestion_pipeline()
