"""Pydantic data schemas for StreamPulse REST API requests and responses."""

from pydantic import BaseModel, Field


class EngagementSummary(BaseModel):
    """Aggregated engagement metrics by content genre."""

    genre: str
    avg_completion_rate: float = Field(..., description="Average completion percentage (0.0 to 100.0 or 0 to 1)")
    avg_watch_duration: float = Field(..., description="Average watch duration in minutes")
    session_count: int = Field(..., description="Total number of logged sessions")


class RetentionDriver(BaseModel):
    """Ranked retention feature importance with plain-language explanation."""

    feature: str
    importance: float = Field(..., description="Feature importance weight/score")
    interpretation: str = Field(..., description="Actionable business interpretation")


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

    risk_score: float = Field(..., ge=0.0, le=1.0, description="Probability of churn (0.0 - 1.0)")
    risk_label: str = Field(..., description="Risk tier: 'low', 'medium', or 'high'")


class HealthResponse(BaseModel):
    """Service health status check response."""

    status: str = "ok"
