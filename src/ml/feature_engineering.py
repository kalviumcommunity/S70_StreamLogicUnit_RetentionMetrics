"""Feature engineering module to aggregate subscriber engagement telemetry into ML features.

Computes behavioral and engagement features per subscriber:
  - avg_completion_rate: Average video completion percentage
  - avg_watch_duration: Average minutes watched per session
  - session_count: Total session volume
  - days_since_last_session: Recency of viewing activity relative to reference date
  - binge_score: Count of multi-session days (>1 session/day) or weekly clusters
  - pause_rate: Average pause frequency per minute watched
"""

import sys
import logging
import pandas as pd
import numpy as np

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger("StreamPulse.FeatureEngineering")


def build_features(
    sessions_df: pd.DataFrame,
    engagement_df: pd.DataFrame,
    subscriptions_df: pd.DataFrame,
) -> pd.DataFrame:
    """Aggregate engagement and session events per subscriber and join with churn_flag.

    Args:
        sessions_df: Cleaned sessions DataFrame.
        engagement_df: Cleaned engagement events DataFrame.
        subscriptions_df: Cleaned subscriptions DataFrame.

    Returns:
        DataFrame with one row per user_id and engineered features:
        ['user_id', 'avg_completion_rate', 'avg_watch_duration', 'session_count',
         'days_since_last_session', 'binge_score', 'pause_rate', 'churn_flag']
    """
    logger.info("Starting feature engineering for %d subscribers...", len(subscriptions_df))

    # 1. Parse dates and determine max reference date
    sessions = sessions_df.copy()
    sessions["session_date"] = pd.to_datetime(sessions["session_date"])
    ref_date = sessions["session_date"].max()

    # 2. Session level aggregations per user
    # Days since last session
    last_session_dates = sessions.groupby("user_id")["session_date"].max()
    days_since_last = (ref_date - last_session_dates).dt.days

    # Session counts and average duration
    session_metrics = sessions.groupby("user_id").agg(
        session_count=("session_id", "count"),
        avg_watch_duration=("watch_duration_min", "mean"),
        total_watch_duration=("watch_duration_min", "sum"),
        total_pauses=("pause_count", "sum"),
    )

    # Calculate pause_rate: pauses per minute watched
    session_metrics["pause_rate"] = np.where(
        session_metrics["total_watch_duration"] > 0,
        session_metrics["total_pauses"] / session_metrics["total_watch_duration"],
        0.0,
    )

    # 3. Binge Score: count of days where user logged >= 2 sessions
    sessions_per_user_day = sessions.groupby(["user_id", "session_date"])["session_id"].count()
    binge_days = (sessions_per_user_day >= 2).groupby("user_id").sum()

    # 4. Completion rate from engagement_events (mapped via session row order or user lookup)
    # If engagement has no user_id, align by matching session sequence / content
    if "user_id" in engagement_df.columns:
        user_completion = engagement_df.groupby("user_id")["completion_rate"].mean()
    else:
        # Cross join / index alignment between sessions and engagement
        merged_ses_eng = pd.concat(
            [sessions[["user_id"]].reset_index(drop=True),
             engagement_df[["completion_rate"]].reset_index(drop=True)],
            axis=1,
        )
        user_completion = merged_ses_eng.groupby("user_id")["completion_rate"].mean()

    # 5. Assemble master feature set per subscriber
    features = subscriptions_df[["user_id", "churn_flag"]].copy()

    # Merge all aggregated signals
    features["avg_completion_rate"] = features["user_id"].map(user_completion)
    features["avg_watch_duration"] = features["user_id"].map(session_metrics["avg_watch_duration"])
    features["session_count"] = features["user_id"].map(session_metrics["session_count"])
    features["days_since_last_session"] = features["user_id"].map(days_since_last)
    features["binge_score"] = features["user_id"].map(binge_days)
    features["pause_rate"] = features["user_id"].map(session_metrics["pause_rate"])

    # 6. Impute any users with zero sessions
    features["session_count"] = features["session_count"].fillna(0).astype(int)
    features["avg_completion_rate"] = features["avg_completion_rate"].fillna(
        features["avg_completion_rate"].median()
    ).round(2)
    features["avg_watch_duration"] = features["avg_watch_duration"].fillna(
        features["avg_watch_duration"].median()
    ).round(2)
    features["days_since_last_session"] = features["days_since_last_session"].fillna(
        features["days_since_last_session"].max() + 14
    ).astype(int)
    features["binge_score"] = features["binge_score"].fillna(0).astype(float)
    features["pause_rate"] = features["pause_rate"].fillna(0.0).round(4)

    # Format churn_flag as integer 0/1
    features["churn_flag"] = features["churn_flag"].astype(int)

    feature_order = [
        "user_id",
        "avg_completion_rate",
        "avg_watch_duration",
        "session_count",
        "days_since_last_session",
        "binge_score",
        "pause_rate",
        "churn_flag",
    ]

    result_df = features[feature_order].copy()
    logger.info("Engineered features built successfully. Output shape: %s", result_df.shape)
    return result_df


if __name__ == "__main__":
    s_df = pd.read_csv("data/processed/sessions.csv")
    e_df = pd.read_csv("data/processed/engagement_events.csv")
    sub_df = pd.read_csv("data/processed/subscriptions.csv")
    feat_df = build_features(s_df, e_df, sub_df)
    feat_df.to_csv("data/processed/engineered_features.csv", index=False)
    print("Engineered features sample:")
    print(feat_df.head())
