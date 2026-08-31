"""Database connection and session dependencies for FastAPI."""

import os
import logging
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("StreamPulse.Database")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://streampulse:streampulse_secret@localhost:5432/streampulse_db",
)

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    # Quick probe
    with engine.connect() as conn:
        pass
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    logger.info("Connected to primary database: %s", DATABASE_URL.split("@")[-1])
except Exception as exc:
    logger.warning("Primary database unavailable (%s). Falling back to local SQLite database.", exc)
    Path("data").mkdir(parents=True, exist_ok=True)
    sqlite_url = "sqlite:///data/streampulse.db"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """Yield database session and safely close it after request completion."""
    if SessionLocal is None:
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


