"""Database connection and session dependencies for FastAPI."""

import os
import logging
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
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as exc:
    logger.warning("Could not initialize database engine with URL '%s': %s", DATABASE_URL, exc)
    engine = None
    SessionLocal = None

Base = declarative_base()


def get_db():
    """Yield database session and safely close it after request completion."""
    if SessionLocal is None:
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    except Exception as exc:
        logger.error("Database session error: %s", exc)
        yield None
    finally:
        db.close()
