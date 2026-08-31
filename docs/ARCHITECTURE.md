# System Architecture Specification — StreamPulse

```
[ Raw Telemetry & Catalog ]
             │
             ▼ (src/ingestion/run_pipeline.py)
      data/raw/*.csv (4 Raw Entities)
             │
             ▼ (src/processing/clean.py & schema.py)
   data/processed/*.csv (Cleaned, Deduplicated, Imputed)
             │
             ▼ (src/processing/load_to_postgres.py)
 PostgreSQL Database (streaming_engagement)
   ├── subscriptions
   ├── content_metadata
   ├── sessions
   └── engagement_events
   └── Views: vw_engagement_by_genre, vw_top_content, vw_retention_by_cohort
             │
             ▼ (src/ml/feature_engineering.py & train.py)
 Machine Learning Engine (Random Forest Churn Classifier)
             │
             ▼ (src/api/main.py — FastAPI)
 REST API Endpoints (/api/engagement-summary, /api/retention-drivers, /api/predict)
             │
             ▼ (frontend/ — Next.js 14 + Tailwind + Recharts)
 4-Screen Executive & Operational Analytics Dashboard
```
