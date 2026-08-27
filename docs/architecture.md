# StreamPulse System Architecture & Folder Blueprint

## 1. Executive Summary
StreamPulse is an end-to-end streaming engagement and retention intelligence platform. It ingests granular viewer interaction telemetry, orchestrates data cleaning and feature engineering in PostgreSQL, serves analytical and predictive endpoints via FastAPI, and presents interactive insights through a Next.js dashboard.

## 2. Architecture & Data Flow

```
[Raw Ingestion Layer] (Kaggle API / Synthetic Fallback)
         │
         ▼
[Processing & Validation] (Pandas / Pydantic Schema Validation)
         │
         ▼
[Relational Data Store] (PostgreSQL + Analytical Views)
         ├──> [ML Feature Engineering & Model Store] (Scikit-Learn / Joblib)
         │           │
         ▼           ▼
[Application API Layer] (FastAPI REST Endpoints)
         │
         ▼
[Frontend Dashboard] (Next.js 14 + Tailwind CSS + Recharts)
```

## 3. Repository Folder Organization
* `data/`: Raw source dumps (`data/raw`) and validated feature stores (`data/processed`).
* `sql/`: DDL scripts, table schemas, seed verification, and analytical views.
* `src/ingestion/`: Pipeline orchestrator and dataset fetchers.
* `src/processing/`: Data quality checks, imputation, and database loaders.
* `src/ml/`: Feature engineering pipelines, baseline & Random Forest model training, evaluation.
* `src/api/`: FastAPI server, routers (`engagement`, `retention`, `content`, `predict`), and DB connection pooling.
* `frontend/`: Next.js application, reusable KPI cards, chart wrappers, and responsive views.
* `tests/`: Automated unit and integration test suites.

## 4. Gate 1 Exit Sign-Off
* **BRD & PRD Status**: Fully reviewed and signed off by Data & Backend Lead, Design & Frontend Lead, and Analytics Lead.
* **Scope Baseline**: Ingestion schemas, 30-day retention prediction objectives, and 4 core UI screens locked for MVP development.
