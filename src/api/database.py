"""Database connection and session dependencies for FastAPI."""

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://streampulse:streampulse_secret@localhost:5432/streampulse_db",
)

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Dependency that yields database session and closes upon completion."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
