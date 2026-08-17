"""Feature engineering module to aggregate subscriber engagement into ML features."""

import pandas as pd


def build_features(
    sessions_df: pd.DataFrame,
    engagement_df: pd.DataFrame,
    subscriptions_df: pd.DataFrame,
) -> pd.DataFrame:
    """Aggregate engagement and session data per user and join with subscription churn flag.

    Produced features per user_id:
      - avg_completion_rate: Mean completion rate across user sessions
      - avg_watch_duration: Mean session watch duration in minutes
      - session_count: Total number of sessions
      - days_since_last_session: Recency of the most recent session
      - binge_score: Count of multi-session days or sessions per week > threshold
      - pause_rate: Average pause count per minute watched
      - churn_flag: Target classification label (boolean / int)

    Args:
        sessions_df: Cleaned sessions DataFrame.
        engagement_df: Cleaned engagement events DataFrame.
        subscriptions_df: Cleaned subscriptions DataFrame.

    Returns:
        DataFrame with one row per user_id and engineered feature columns.
    """
    return pd.DataFrame()
