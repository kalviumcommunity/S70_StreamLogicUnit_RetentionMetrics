"""Load cleaned data into PostgreSQL database and apply SQL views.

Idempotently executes table definitions, creates analytics views, and loads
processed CSV datasets into their respective PostgreSQL tables.
"""

import os
import sys
import logging
from pathlib import Path
import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("StreamPulse.DBLoader")


def get_engine():
    """Create and return a SQLAlchemy database engine using DATABASE_URL.

    Returns:
        SQLAlchemy Engine instance.
    """
    db_url = os.getenv(
        "DATABASE_URL",
        "postgresql://streampulse:streampulse_secret@localhost:5432/streampulse_db",
    )
    return create_engine(db_url)


def execute_sql_file(engine, sql_file_path: Path) -> None:
    """Execute a raw SQL script file using the provided SQLAlchemy engine.

    Args:
        engine: SQLAlchemy database engine.
        sql_file_path: Path to the .sql file to execute.
    """
    if not sql_file_path.exists():
        logger.warning("SQL file not found: %s", sql_file_path)
        return

    logger.info("Executing SQL script: %s", sql_file_path.name)
    with engine.connect() as conn:
        with open(sql_file_path, "r", encoding="utf-8") as f:
            sql_content = f.read()

        # Split statements by semicolon to execute safely
        statements = [stmt.strip() for stmt in sql_content.split(";") if stmt.strip()]
        for stmt in statements:
            conn.execute(text(stmt))
        conn.commit()


def init_database_schema(engine, sql_dir: str = "sql") -> None:
    """Run schema creation and view migration scripts idempotently.

    Args:
        engine: SQLAlchemy database engine.
        sql_dir: Directory containing ordered SQL migration scripts.
    """
    sql_path = Path(sql_dir)
    schema_file = sql_path / "001_create_schema.sql"
    views_file = sql_path / "002_create_views.sql"

    execute_sql_file(engine, schema_file)
    execute_sql_file(engine, views_file)
    logger.info("Database schema and views initialized successfully.")


def load_processed_data_to_db(
    processed_dir: str = "data/processed",
    sql_dir: str = "sql",
) -> None:
    """Load cleaned CSV datasets into their corresponding PostgreSQL tables.

    Args:
        processed_dir: Path to directory with cleaned CSV files.
        sql_dir: Path to directory with SQL migration scripts.
    """
    engine = get_engine()

    try:
        # Initialize schema & views
        init_database_schema(engine, sql_dir)

        p_path = Path(processed_dir)
        table_order = [
            ("content_metadata", "content_metadata.csv"),
            ("subscriptions", "subscriptions.csv"),
            ("sessions", "sessions.csv"),
            ("engagement_events", "engagement_events.csv"),
        ]

        for table_name, csv_filename in table_order:
            csv_path = p_path / csv_filename
            if not csv_path.exists():
                logger.warning("Cleaned CSV not found: %s. Skipping table %s.", csv_path, table_name)
                continue

            df = pd.read_csv(csv_path)
            logger.info("Loading %d rows into PostgreSQL table '%s'...", len(df), table_name)

            # Idempotent write: replace or append
            df.to_sql(
                name=table_name,
                con=engine,
                if_exists="replace",
                index=False,
                chunksize=5000,
            )
            logger.info("Successfully loaded table '%s'.", table_name)

        logger.info("All processed datasets successfully loaded into PostgreSQL.")
    except Exception as exc:
        logger.warning(
            "Could not connect or load into PostgreSQL database: %s. "
            "Ensure PostgreSQL is running locally or via docker-compose.",
            exc,
        )


if __name__ == "__main__":
    load_processed_data_to_db()
