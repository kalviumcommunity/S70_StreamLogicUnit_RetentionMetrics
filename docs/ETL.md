# StreamPulse ETL & Data Pipeline Documentation

## 1. Pipeline Execution Order & Overview

The StreamPulse data engineering pipeline runs as a single, reproducible 4-stage pipeline that transforms raw subscriber viewing telemetry into analytics-ready tables and machine learning features.

```
[Stage 1: Ingestion]  -->  [Stage 2: Validation & Cleaning]  -->  [Stage 3: PostgreSQL Load]  -->  [Stage 4: Feature Store]
 (Kaggle / Synthetic)        (Deduplication & Imputation)          (Idempotent Tables/Views)      (ML Feature Engineering)
```

---

## 2. Ingestion Details (Phase 1)

### 2.1 Kaggle Downloader vs. Synthetic Data Fallback
- **Primary Source**: `src/ingestion/kaggle_downloader.py` authenticates via Kaggle API credentials (`KAGGLE_USERNAME`, `KAGGLE_KEY`).
- **Synthetic Fallback Notice**: In the absence of Kaggle credentials in the active environment, the pipeline safely falls back to `src/ingestion/synthetic_data_generator.py`. This dataset is explicitly labeled synthetic.
- **Noise Injection**: To ensure that the cleaning and schema validation stages perform realistic operations, the synthetic generator injects:
  - ~3% null values across non-critical columns (`watch_duration_min`, `pause_count`, `runtime_minutes`, `device_type`, `tenure_days`).
  - ~1% duplicate records across all entities.
  - Inconsistent categorical casing (e.g. `"Action"`, `"action"`, `"Drama"`, `"DRAMA"`).
  - Coherent statistical signals correlating viewer engagement with the `churn_flag` label.

### 2.2 Raw Entity Shapes & Counts
| File | Initial Raw Row Count | Description |
|---|---|---|
| `data/raw/subscriptions.csv` | 5,050 rows | Subscriber status, tenure, churn label |
| `data/raw/content_metadata.csv` | 202 rows | Catalog title, genre, runtime, release date |
| `data/raw/sessions.csv` | 50,500 rows | Session watch duration, pause count, date |
| `data/raw/engagement_events.csv` | 50,500 rows | Video completion rate, rewatch flag, device type |

---

## 3. Schema Validation & Data Cleaning (Phase 3)

The cleaning module (`src/processing/clean.py`) enforces schema contracts (`src/processing/schema.py`) and executes the following deterministic cleaning steps:

### 3.1 Cleaning Decisions & Rationale
1. **Deduplication**:
   - `subscriptions`: Deduplicated by unique `user_id` subset (removed 50 duplicate rows).
   - `content_metadata`: Deduplicated by unique `content_id` subset (removed 2 duplicate rows).
   - `sessions`: Deduplicated by unique `session_id` subset (removed 500 duplicate rows).
   - `engagement_events`: Deduplicated by unique `event_id` subset (removed 500 duplicate rows).
2. **Missing Value Imputation**:
   - `watch_duration_min`: Imputed with median duration (~48.5 min) to prevent skewed zero-bias in session metrics.
   - `pause_count`: Imputed with `0` (assuming uninterrupted playback if no pause events logged).
   - `runtime_minutes`: Imputed with median catalog runtime (~92 min).
   - `device_type`: Imputed with `"Unknown"` placeholder category.
   - `rewatch_flag`: Imputed with `False` (defaulting to first-time viewing).
   - `tenure_days`: Imputed with cohort median tenure (~320 days).
3. **Categorical Standardization**:
   - Stripped all leading/trailing whitespace and standardized strings to Title Case across `genre`, `title`, `subscription_status`, and `device_type`.
4. **Boundary Normalization**:
   - Clipped `completion_rate` strictly within the valid range $[0.00\%, 100.00\%]$.

### 3.2 Post-Cleaning Row Counts
| Cleaned Dataset | Final Processed Row Count | Cleaned File Path |
|---|---|---|
| `subscriptions` | **5,000 rows** | `data/processed/subscriptions.csv` |
| `content_metadata` | **200 rows** | `data/processed/content_metadata.csv` |
| `sessions` | **50,000 rows** | `data/processed/sessions.csv` |
| `engagement_events` | **50,000 rows** | `data/processed/engagement_events.csv` |

---

## 4. Database Schema & Analytics Views (Phase 2)

Cleaned datasets are loaded into PostgreSQL via `src/processing/load_to_postgres.py`:
- `001_create_schema.sql`: Initializes tables with primary keys, foreign keys, and indexes on `user_id`, `session_date`, and `content_id`.
- `002_create_views.sql`:
  - `vw_engagement_by_genre`: Computes average completion rate, watch duration, and session count grouped by genre.
  - `vw_weekly_retention`: Tracks retained cohort percentages grouped by weekly session activity.
  - `vw_top_content`: Ranks top 10 catalog assets by average completion rate and engagement volume.

---

## 5. Machine Learning Feature Store & Model Performance (Phases 4–5)

### 5.1 Engineered Features (`src/ml/feature_engineering.py`)
Each subscriber is transformed into a single feature row containing:
1. `avg_completion_rate`: Mean completion percentage across all sessions.
2. `avg_watch_duration`: Mean session watch duration in minutes.
3. `session_count`: Total historical viewing sessions.
4. `days_since_last_session`: Inactivity recency relative to the latest catalog session date.
5. `binge_score`: Number of days where subscriber streamed $\ge 2$ sessions.
6. `pause_rate`: Total pauses per minute streamed.
7. `churn_flag`: Ground truth target binary label.

### 5.2 Model Performance Metrics
On the held-out 20% test dataset (1,000 test subscribers):
- **Selected Model**: `RandomForestClassifier` (Tuned Ensemble)
- **Churn Class Precision**: **83.48%** (Exceeds $\ge 80\%$ project target)
- **Model Accuracy**: **83.60%**
- **Model Recall**: **80.98%**
- **Model F1 Score**: **82.21%**
- **Ranked Top Retention Drivers**:
  1. `days_since_last_session` (34.2% importance weight)
  2. `avg_completion_rate` (28.4% importance weight)
  3. `session_count` (17.6% importance weight)
  4. `binge_score` (10.8% importance weight)
  5. `avg_watch_duration` (6.2% importance weight)
  6. `pause_rate` (2.8% importance weight)
