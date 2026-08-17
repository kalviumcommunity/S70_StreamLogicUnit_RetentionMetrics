"""Synthetic data generator fallback for StreamPulse analytics pipeline.

Generates realistic streaming telemetry datasets with deliberate data imperfections
(nulls, duplicates, mixed casing) and clear statistical retention signals.
"""

import logging
from pathlib import Path
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)


def generate_synthetic_data(
    dest_dir: str = "data/raw",
    n_users: int = 5000,
    n_content: int = 200,
    n_sessions: int = 50000,
    seed: int = 42,
) -> dict[str, Path]:
    """Generate 4 synthetic CSV files matching the StreamPulse schema contracts.

    Datasets generated:
      - subscriptions.csv
      - content_metadata.csv
      - sessions.csv
      - engagement_events.csv

    Args:
        dest_dir: Target directory where CSVs will be saved.
        n_users: Number of unique subscriber accounts.
        n_content: Number of unique catalog titles.
        n_sessions: Total viewing sessions to simulate.
        seed: Random state seed.

    Returns:
        Dict mapping dataset name to generated file Path.
    """
    logger.warning(
        "[DATA NOTICE] Kaggle credentials unavailable. Generating synthetic dataset "
        "(n_users=%d, n_content=%d, n_sessions=%d) for pipeline validation.",
        n_users,
        n_content,
        n_sessions,
    )
    rng = np.random.default_rng(seed)
    out_path = Path(dest_dir)
    out_path.mkdir(parents=True, exist_ok=True)

    # 1. Content Metadata
    content_ids = [f"CNT_{i:04d}" for i in range(1, n_content + 1)]
    genres_standard = ["Action", "Drama", "Comedy", "Sci-Fi", "Documentary", "Thriller", "Horror", "Animation"]
    genres_messy = ["Action", "action", "Drama", "drama", "DRAMA", "Comedy", "comedy ", "Sci-Fi", "SCI-FI",
                    "Documentary", "documentary", "Thriller", "Horror", "Animation"]

    content_titles = [f"StreamTitle {i} - {rng.choice(genres_standard)}" for i in range(1, n_content + 1)]
    content_genres = rng.choice(genres_messy, size=n_content)
    runtimes = rng.integers(22, 160, size=n_content).astype(float)
    # Inject ~3% nulls in runtime
    runtimes[rng.random(n_content) < 0.03] = np.nan

    # Dates between 2020 and 2024
    start_ts = pd.Timestamp("2020-01-01").value // 10**9
    end_ts = pd.Timestamp("2024-06-01").value // 10**9
    random_timestamps = rng.integers(start_ts, end_ts, size=n_content)
    release_dates = [pd.to_datetime(ts, unit="s").strftime("%Y-%m-%d") for ts in random_timestamps]

    df_content = pd.DataFrame({
        "content_id": content_ids,
        "title": content_titles,
        "genre": content_genres,
        "runtime_minutes": runtimes,
        "release_date": release_dates,
    })

    # 2. Subscriptions & Latent Engagement Scores
    user_ids = [f"USR_{i:05d}" for i in range(1, n_users + 1)]
    latent_affinity = rng.beta(1.8, 1.8, size=n_users)

    # Clear logistic relationship
    churn_prob = 1.0 / (1.0 + np.exp(12.0 * (latent_affinity - 0.48)))
    churn_flags = rng.random(n_users) < churn_prob
    tenure_days = (latent_affinity * 600 + rng.integers(10, 100, size=n_users)).astype(float)
    # Inject nulls into tenure (~3%)
    tenure_days[rng.random(n_users) < 0.03] = np.nan

    subscription_statuses = np.where(churn_flags, "churned", "active")
    paused_mask = (~churn_flags) & (rng.random(n_users) < 0.08)
    subscription_statuses[paused_mask] = "paused"

    df_subscriptions = pd.DataFrame({
        "user_id": user_ids,
        "subscription_status": subscription_statuses,
        "churn_flag": churn_flags,
        "tenure_days": tenure_days,
    })

    # 3. Sessions
    user_affinity_map = dict(zip(user_ids, latent_affinity))
    session_user_weights = (latent_affinity + 0.02) / (latent_affinity + 0.02).sum()
    session_users = rng.choice(user_ids, size=n_sessions, p=session_user_weights)

    s_start_ts = pd.Timestamp("2024-01-01").value // 10**9
    s_end_ts = pd.Timestamp("2024-06-30").value // 10**9
    session_dates = [
        pd.to_datetime(ts, unit="s").strftime("%Y-%m-%d")
        for ts in rng.integers(s_start_ts, s_end_ts, size=n_sessions)
    ]

    session_ids = [f"SES_{i:07d}" for i in range(1, n_sessions + 1)]
    session_affinities = np.array([user_affinity_map[u] for u in session_users])

    watch_durations = np.clip(
        rng.normal(loc=session_affinities * 70 + 15, scale=6, size=n_sessions),
        5.0,
        180.0,
    ).round(2)
    # Inject ~3% nulls in watch duration
    watch_durations[rng.random(n_sessions) < 0.03] = np.nan

    # Pauses: higher affinity users experience fewer pauses
    pause_counts = np.clip(
        rng.poisson(lam=(1.1 - session_affinities) * 2.5, size=n_sessions),
        0,
        15,
    ).astype(float)
    pause_counts[rng.random(n_sessions) < 0.03] = np.nan

    df_sessions = pd.DataFrame({
        "user_id": session_users,
        "session_id": session_ids,
        "watch_duration_min": watch_durations,
        "pause_count": pause_counts,
        "session_date": session_dates,
    })

    # 4. Engagement Events
    session_content = rng.choice(content_ids, size=n_sessions)
    completion_rates = np.clip(
        rng.normal(loc=session_affinities * 70 + 25, scale=6, size=n_sessions),
        5.0,
        100.0,
    ).round(2)
    rewatch_flags = rng.random(n_sessions) < (session_affinities * 0.4)
    devices = rng.choice(
        ["Smart TV", "Mobile", "Web", "Tablet", None],
        p=[0.45, 0.28, 0.16, 0.08, 0.03],
        size=n_sessions,
    )

    df_events = pd.DataFrame({
        "event_id": np.arange(1, n_sessions + 1),
        "content_id": session_content,
        "completion_rate": completion_rates,
        "rewatch_flag": rewatch_flags,
        "device_type": devices,
    })

    # Inject ~1% duplicate rows
    def inject_duplicates(df: pd.DataFrame, pct: float = 0.01) -> pd.DataFrame:
        n_dup = int(len(df) * pct)
        if n_dup > 0:
            dup_indices = rng.choice(df.index, size=n_dup, replace=False)
            dups = df.loc[dup_indices].copy()
            return pd.concat([df, dups], ignore_index=True)
        return df

    df_sessions = inject_duplicates(df_sessions, 0.01)
    df_content = inject_duplicates(df_content, 0.01)
    df_events = inject_duplicates(df_events, 0.01)
    df_subscriptions = inject_duplicates(df_subscriptions, 0.01)

    # Save CSVs
    files = {
        "sessions": out_path / "sessions.csv",
        "content_metadata": out_path / "content_metadata.csv",
        "engagement_events": out_path / "engagement_events.csv",
        "subscriptions": out_path / "subscriptions.csv",
    }

    df_sessions.to_csv(files["sessions"], index=False)
    df_content.to_csv(files["content_metadata"], index=False)
    df_events.to_csv(files["engagement_events"], index=False)
    df_subscriptions.to_csv(files["subscriptions"], index=False)

    logger.info("Successfully generated %d raw synthetic records across 4 datasets.", len(df_sessions))
    return files
