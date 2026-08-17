"""Kaggle dataset downloader module with authentication validation and unzip utilities."""

import os
import subprocess
import zipfile
import logging
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def download_dataset(
    dataset_slug: str = "kalviumcommunity/streampulse-streaming-telemetry",
    dest_dir: str = "data/raw",
) -> Path:
    """Download and unzip a dataset from Kaggle into dest_dir.

    Args:
        dataset_slug: Kaggle dataset identifier (e.g. 'owner/dataset-name').
        dest_dir: Destination directory path for raw datasets.

    Returns:
        Path to destination directory containing unzipped raw data.

    Raises:
        RuntimeError: If Kaggle credentials are not set or the download fails.
    """
    kaggle_username = os.getenv("KAGGLE_USERNAME")
    kaggle_key = os.getenv("KAGGLE_KEY")

    if not kaggle_username or not kaggle_key:
        raise RuntimeError(
            "Kaggle credentials not found in environment. "
            "Please ensure KAGGLE_USERNAME and KAGGLE_KEY are set in your .env file."
        )

    out_path = Path(dest_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    logger.info("Initiating Kaggle download for dataset: %s", dataset_slug)
    try:
        # Download via Kaggle CLI
        cmd = [
            "kaggle",
            "datasets",
            "download",
            "-d",
            dataset_slug,
            "-p",
            str(out_path),
            "--unzip",
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        logger.info("Kaggle dataset download complete: %s", result.stdout.strip())

        # If any zip files remain, unzip them
        for zip_file in out_path.glob("*.zip"):
            with zipfile.ZipFile(zip_file, "r") as zf:
                zf.extractall(out_path)
            zip_file.unlink()

        return out_path
    except subprocess.CalledProcessError as exc:
        logger.error("Kaggle CLI download failed: %s", exc.stderr)
        raise RuntimeError(f"Failed to download Kaggle dataset: {exc.stderr}") from exc
    except FileNotFoundError as exc:
        logger.error("Kaggle CLI binary not found in system PATH.")
        raise RuntimeError("Kaggle CLI not installed or not found in system PATH.") from exc
