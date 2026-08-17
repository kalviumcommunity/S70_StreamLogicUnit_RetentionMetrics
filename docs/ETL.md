# StreamPulse ETL Pipeline Documentation

## 1. Pipeline Architecture Overview

The StreamPulse ETL pipeline ingests, validates, transforms, and loads viewer telemetry into PostgreSQL:

```
[Raw Sources: Kaggle / Synthetic Fallback]
                   │
                   ▼ (src/ingestion/run_pipeline.py)
            data/raw/*.csv
                   │
                   ▼ (src/processing/schema.py + clean.py)
         Schema Validation & Cleaning
                   │
                   ▼
          data/processed/*.csv
                   │
                   ▼ (src/processing/load_to_postgres.py)
       PostgreSQL Database (Tables & Views)
                   │
                   ▼ (src/ml/feature_engineering.py)
         Engineered User Feature Store
                   │
                   ▼ (src/ml/train.py)
             Trained ML Models
```

---

## 2. Ingestion Phase

1. **Kaggle API Ingestion (`src/ingestion/kaggle_downloader.py`)**:
   - Authenticates using `KAGGLE_USERNAME` and `KAGGLE_KEY`.
   - Downloads and unzips raw datasets into `data/raw/`.

2. **Synthetic Data Generator Fallback (`src/ingestion/synthetic_data_generator.py`)**:
   - Used when Kaggle credentials are not provided.
   - Generates 5,000 synthetic subscribers, 200 catalog titles, and 50,000 session rows.
   - Intentionally introduces realistic data noise: ~3% nulls, ~1% duplicates, and mixed casing.
   - Embeds realistic statistical relationships between engagement signals and retention.

---

## 3. Cleaning & Validation Rules

| Dataset | Cleaning Action | Imputation Strategy |
|---|---|---|
| `sessions` | Deduplication on `session_id`; strip whitespace | `watch_duration_min`: median; `pause_count`: zero |
| `content_metadata` | Standardize `genre` to Title Case; remove duplicate IDs | `runtime_minutes`: median; `release_date`: mode |
| `engagement_events` | Clip `completion_rate` to [0.0, 100.0]; drop orphan content | `device_type`: 'Unknown'; `rewatch_flag`: False |
| `subscriptions` | Deduplicate on `user_id`; validate boolean churn flag | `tenure_days`: median |

---

## 4. PostgreSQL Schemas and Views

- Tables: `sessions`, `content_metadata`, `engagement_events`, `subscriptions`
- Analytics Views:
  - `vw_engagement_by_genre`: Averages completion rate, watch duration, and session count per genre.
  - `vw_weekly_retention`: Tracks active and retained cohorts grouped by weekly session activity.
  - `vw_top_content`: Identifies top 10 catalog assets by completion rate and session volume.
