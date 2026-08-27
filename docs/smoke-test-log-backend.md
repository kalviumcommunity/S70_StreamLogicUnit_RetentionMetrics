# End-to-End Backend & Data Pipeline Smoke Test Log

## 1. Test Overview
* **Scope**: Full pipeline smoke test validating data ingestion from raw files/Kaggle, PostgreSQL table staging, view creation, feature transformation, and live FastAPI response payloads.
* **Test Environment**: Local environment (`Python 3.13`, `PostgreSQL 16`, `FastAPI 0.115`).
* **Result**: PASSED (All stages verified end-to-end).

## 2. Pipeline Stage Execution Log

| Pipeline Stage | Executed Command / Trigger | Status | Latency / Records |
| :--- | :--- | :--- | :--- |
| **Ingestion** | `python -m src.ingestion.run_pipeline` | PASS | 4 CSVs generated / 50k sessions |
| **Cleaning** | `python -m src.processing.clean` | PASS | 0 schema violations, 100% type-checked |
| **DB Loader** | `python -m src.processing.load_to_postgres`| PASS | Loaded 10k users, 50k sessions into PostgreSQL |
| **API Health** | `GET /api/health` | PASS (200 OK) | 2.1 ms |
| **Engagement** | `GET /api/engagement-summary` | PASS (200 OK) | 5 genre rows returned |
| **Retention** | `GET /api/retention-drivers` | PASS (200 OK) | 6 ranked features with interpretations |
| **Content** | `GET /api/content-insights?limit=5` | PASS (200 OK) | 5 top titles returned |
| **Prediction** | `POST /api/predict` (sample user JSON) | PASS (200 OK) | `risk_score: 0.7421`, `risk_label: "high"` |

## 3. Bugs Identified & Remediations Applied

1. **DB Port Fallback**: In Docker bridge networks, DB host needed automatic fallback from `localhost` to `postgres` service DNS. Handled in `database.py`.
2. **Missing Feature Imputation in API Payload**: Predict payload without `binge_score` threw Pydantic validation error; added default optional baseline in schema.
