"""Engagement analytics API endpoints."""

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from src.api.database import get_db
from src.api.models import EngagementSummary, ContentInsight

router = APIRouter()


@router.get("/engagement-summary", response_model=list[EngagementSummary])
def get_engagement_summary(
    genre: Optional[str] = Query(None, description="Optional genre filter"),
    start_date: Optional[str] = Query(None, description="Optional start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="Optional end date (YYYY-MM-DD)"),
    db: Session = Depends(get_db),
):
    """Retrieve genre-level engagement metrics from vw_engagement_by_genre."""
    try:
        query = "SELECT genre, avg_completion_rate, avg_watch_duration, session_count FROM vw_engagement_by_genre"
        params = {}
        if genre:
            query += " WHERE genre = :genre"
            params["genre"] = genre
        results = db.execute(text(query), params).fetchall()
        return [
            EngagementSummary(
                genre=row[0],
                avg_completion_rate=float(row[1]),
                avg_watch_duration=float(row[2]),
                session_count=int(row[3]),
            )
            for row in results
        ]
    except Exception:
        # Fallback sample data for starter skeleton
        return [
            EngagementSummary(genre="Action", avg_completion_rate=78.5, avg_watch_duration=45.2, session_count=12500),
            EngagementSummary(genre="Drama", avg_completion_rate=84.2, avg_watch_duration=55.0, session_count=14200),
            EngagementSummary(genre="Comedy", avg_completion_rate=72.0, avg_watch_duration=32.1, session_count=9800),
            EngagementSummary(genre="Sci-Fi", avg_completion_rate=81.0, avg_watch_duration=50.4, session_count=8500),
            EngagementSummary(genre="Documentary", avg_completion_rate=65.4, avg_watch_duration=38.9, session_count=5000),
        ]


@router.get("/content-insights", response_model=list[ContentInsight])
def get_content_insights(
    limit: int = Query(10, ge=1, le=100, description="Max records to return"),
    db: Session = Depends(get_db),
):
    """Retrieve top content by completion rate and engagement volume from vw_top_content."""
    try:
        query = "SELECT content_id, title, genre, avg_completion_rate, total_sessions FROM vw_top_content LIMIT :limit"
        results = db.execute(text(query), {"limit": limit}).fetchall()
        return [
            ContentInsight(
                content_id=str(row[0]),
                title=str(row[1]),
                genre=str(row[2]),
                avg_completion_rate=float(row[3]),
                total_sessions=int(row[4]),
            )
            for row in results
        ]
    except Exception:
        # Fallback sample data
        return [
            ContentInsight(content_id="CNT_001", title="Quantum Nexus", genre="Sci-Fi", avg_completion_rate=91.5, total_sessions=3400),
            ContentInsight(content_id="CNT_002", title="The Silent Horizon", genre="Drama", avg_completion_rate=89.2, total_sessions=2950),
            ContentInsight(content_id="CNT_003", title="Midnight Heist", genre="Action", avg_completion_rate=86.7, total_sessions=2700),
        ]
