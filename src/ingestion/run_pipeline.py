"""Single entrypoint orchestrating data ingestion from Kaggle with synthetic fallback."""

import os
import sys
import logging
from pathlib import Path
from dotenv import load_dotenv

from src.ingestion.kaggle_downloader import download_dataset
from src.ingestion.synthetic_data_generator import generate_synthetic_data

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("StreamPulse.Ingestion")


def run_ingestion_pipeline(dest_dir: str = "data/raw") -> Path:
    """Run ingestion pipeline: attempts Kaggle download, falls back to synthetic generation.

    Args:
        dest_dir: Directory where raw CSV files should be saved.

    Returns:
        Path to raw data directory containing the 4 datasets.
    """
    raw_path = Path(dest_dir)
    raw_path.mkdir(parents=True, exist_ok=True)

    kaggle_user = os.getenv("KAGGLE_USERNAME")
    kaggle_key = os.getenv("KAGGLE_KEY")

    if kaggle_user and kaggle_key:
        logger.info("Found Kaggle credentials in environment. Attempting remote dataset download...")
        try:
            download_dataset(dest_dir=dest_dir)
            logger.info("Successfully ingested real Kaggle dataset into %s", dest_dir)
            return raw_path
        except Exception as exc:
            logger.warning(
                "Kaggle download attempt encountered an issue: %s. Falling back to synthetic generator.",
                exc,
            )

    # Fallback to clearly labeled synthetic data generator
    logger.info("Running synthetic data generation fallback...")
    generate_synthetic_data(dest_dir=dest_dir)
    logger.info("Synthetic ingestion completed successfully. Raw files written to %s", dest_dir)
    return raw_path


if __name__ == "__main__":
    run_ingestion_pipeline()
