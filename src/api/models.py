"""Pydantic data schemas for StreamPulse REST API requests and responses."""

from pydantic import BaseModel, Field


class EngagementSummary(BaseModel):
    """Aggregated engagement metrics by content genre."""

    genre: str
    avg_completion_rate: float
    avg_watch_duration: float
    session_count: int


class RetentionDriver(BaseModel):
    """Ranked retention feature importance with plain-language explanation."""

    feature: str
    importance: float
    interpretation: str


class RetentionSummary(BaseModel):
    """Overall subscriber retention and churn metrics summary."""

    total_subscribers: int
    active_subscribers: int
    churned_subscribers: int
    retention_rate_pct: float
    churn_rate_pct: float
    avg_tenure_days: float



class ContentInsight(BaseModel):
    """Content performance and retention ranking."""

    content_id: str
    title: str
    genre: str
    avg_completion_rate: float
    total_sessions: int


class PredictRequest(BaseModel):
    """Subscriber metrics payload for churn risk scoring."""

    avg_completion_rate: float = Field(..., ge=0.0, description="Average completion rate")
    avg_watch_duration: float = Field(..., ge=0.0, description="Average watch duration in minutes")
    session_count: int = Field(..., ge=0, description="Number of sessions")
    days_since_last_session: int = Field(..., ge=0, description="Days since last active session")
    binge_score: float = Field(..., ge=0.0, description="Binge watching frequency score")
    pause_rate: float = Field(..., ge=0.0, description="Pauses per minute watched")


class PredictResponse(BaseModel):
    """Predicted churn risk score and categorical tier."""

    risk_score: float
    risk_label: str  # "low" | "medium" | "high"


class HealthResponse(BaseModel):
    """Service health status check response."""

    status: str = "ok"
