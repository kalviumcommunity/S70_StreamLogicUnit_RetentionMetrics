"""Load cleaned data into PostgreSQL database and apply SQL views."""

import os
from pathlib import Path
import logging
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)


def get_engine():
    """Create SQLAlchemy engine using DATABASE_URL from environment."""
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://streampulse:streampulse_secret@localhost:5432/streampulse_db",
    )
    return create_engine(db_url)


def run_sql_file(engine, file_path: Path):
    """Execute SQL script idempotently."""
    with engine.connect() as conn:
        with open(file_path, "r", encoding="utf-8") as f:
            statements = f.read()
        conn.execute(text(statements))
        conn.commit()


def load_processed_data_to_db(processed_dir: str = "data/processed") -> None:
    """Execute SQL schemas and bulk load cleaned datasets into PostgreSQL.

    Args:
        processed_dir: Directory containing cleaned CSV files.
    """
    logger.info("Connecting to database and initializing schema.")
