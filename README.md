# StreamPulse — Viewer Engagement Analytics for Subscriber Retention

> A full-lifecycle production data platform connecting streaming subscriber engagement behavior (watch duration, pause frequency, completion rate, session activity) to subscriber retention, empowering content acquisition and growth teams to make evidence-based decisions.

---

## 1. Overview & Business Impact

A subscription-based streaming platform captures fine-grained playback telemetry — watch durations, pause events, episode completion rates, and login sessions. StreamPulse bridges telemetry with subscriber lifetime value by answering:
1. **Which engagement behaviors predict whether a subscriber stays or churns?**
2. **Which content/genres drive the strongest completion and retention patterns?**
3. **What actionable interventions should acquisition and growth teams execute?**

Full product specifications, persona matrices, and requirements live in [`docs/PRD.md`](docs/PRD.md). Detailed data pipeline decisions live in [`docs/ETL.md`](docs/ETL.md).

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| **Language** | Python 3.11+, TypeScript |
| **Data Processing** | pandas, numpy |
| **Database** | PostgreSQL 15+ |
| **Database Access** | SQLAlchemy 2.x, psycopg2-binary |
| **Machine Learning** | scikit-learn (Random Forest, Logistic Regression), joblib |
| **Notebooks & EDA** | Jupyter (`notebooks/01_eda.ipynb`) |
| **Backend API** | FastAPI, uvicorn, Pydantic v2 |
| **Frontend Dashboard** | Next.js 14 (App Router), React, Tailwind CSS |
| **Data Visualization** | Recharts, Lucide Icons |
| **Testing** | pytest, pytest-cov (backend) / Vitest, React Testing Library (frontend) |
| **Code Quality** | flake8, black (Python) / ESLint (TypeScript) |
| **Containerization** | Docker, docker-compose |
| **CI/CD** | GitHub Actions (`backend-ci.yml`, `frontend-ci.yml`) |

---

## 3. Architecture & Data Flow

```
Kaggle API / Synthetic Fallback
            │
            ▼ (src/ingestion/run_pipeline.py)
   data/raw/*.csv (4 Raw Entities)
            │
            ▼ (src/processing/clean.py & schema.py)
   data/processed/*.csv (Cleaned & Validated)
            │
            ▼ (src/processing/load_to_postgres.py)
 PostgreSQL Database (Schema & Analytics Views)
            │
            ▼ (src/ml/feature_engineering.py & train.py)
 Machine Learning Engine (Precision >= 80% on Churn)
            │
            ▼ (src/api/main.py)
 FastAPI REST Endpoints (/api/engagement-summary, /api/predict, etc.)
            │
            ▼ (frontend/lib/api.ts)
 Next.js 4-Screen Analytical Dashboard
```

---

## 4. Repository Structure

```
S70_StreamLogicUnit_RetentionMetrics/
├── README.md                          # Main project overview and setup
├── .gitignore                         # Git exclusion rules
├── .env.example                       # Environment variables template
├── requirements.txt                   # Pinned Python dependencies
├── docker-compose.yml                 # Local multi-service orchestration
├── Dockerfile                         # Backend API Dockerfile
├── data/
│   ├── raw/                           # Raw CSV files (.gitkeep)
│   └── processed/                     # Cleaned CSV files (.gitkeep)
├── src/
│   ├── __init__.py
│   ├── ingestion/
│   │   ├── __init__.py
│   │   ├── kaggle_downloader.py       # Kaggle API downloader
│   │   ├── synthetic_data_generator.py# Synthetic fallback generator
│   │   └── run_pipeline.py            # Ingestion orchestration entrypoint
│   ├── processing/
│   │   ├── __init__.py
│   │   ├── schema.py                  # Schema validation contracts
│   │   ├── clean.py                   # Data cleaning & imputation
│   │   └── load_to_postgres.py        # Database schema init & CSV loader
│   ├── ml/
│   │   ├── __init__.py
│   │   ├── feature_engineering.py     # Aggregated subscriber features
│   │   ├── train.py                   # Model training (RF + LR)
│   │   ├── evaluate.py                # Model evaluation & importance export
│   │   └── predict.py                 # Live inference risk scoring
│   └── api/
│       ├── __init__.py
│       ├── main.py                    # FastAPI application & CORS
│       ├── database.py                # SQLAlchemy session dependencies
│       ├── models.py                  # Pydantic v2 schemas
│       └── routers/
│           ├── __init__.py
│           ├── engagement.py          # /api/engagement-summary & /api/content-insights
│           ├── retention.py           # /api/retention-drivers
│           └── predict.py             # /api/predict
├── sql/
│   ├── 001_create_schema.sql          # Table definitions
│   ├── 002_create_views.sql           # Analytics SQL views
│   └── 003_seed_check.sql             # Table integrity verification
├── models/
│   ├── .gitkeep
│   ├── retention_model.pkl            # Trained model artifact (gitignored)
│   ├── feature_columns.json           # Expected feature column order
│   └── feature_importance.json        # Sorted feature importance scores
├── notebooks/
│   └── 01_eda.ipynb                   # Exploratory Data Analysis & visualizations
├── tests/
│   ├── __init__.py
│   ├── test_clean.py                  # Cleaning & validation unit tests
│   ├── test_api_engagement.py         # API engagement & content endpoints test
│   └── test_predict_endpoint.py       # Predict inference endpoint tests
├── frontend/
│   ├── Dockerfile                     # Multi-stage Next.js Dockerfile
│   ├── package.json                   # NPM dependencies & scripts
│   ├── tailwind.config.ts             # Tailwind design tokens & themes
│   ├── app/
│   │   ├── layout.tsx                 # Root layout with NavSidebar
│   │   ├── page.tsx                   # Screen 1: Executive Overview
│   │   ├── engagement/page.tsx        # Screen 2: Engagement Deep-Dive
│   │   ├── retention/page.tsx         # Screen 3: Retention Drivers & Simulator
│   │   └── content/page.tsx           # Screen 4: Content/Genre Insights
│   ├── components/
│   │   ├── KpiCard.tsx                # Metric KPI card
│   │   ├── ChartCard.tsx              # Card wrapper with loading/empty/error states
│   │   ├── FilterBar.tsx              # Genre and date filter controls
│   │   └── NavSidebar.tsx             # Navigation sidebar
│   ├── lib/
│   │   └── api.ts                     # Typed fetch client
│   └── __tests__/
│       └── smoke.test.tsx             # Vitest frontend smoke tests
├── docs/
│   ├── PRD.md                         # Product Requirements Document
│   ├── ETL.md                         # Detailed ETL pipeline documentation
│   └── architecture.png               # Architecture schematic note
└── .github/
    ├── workflows/
    │   ├── backend-ci.yml             # GitHub Actions backend CI
    │   └── frontend-ci.yml            # GitHub Actions frontend CI
    └── PULL_REQUEST_TEMPLATE.md       # PR review checklist
```

---

## 5. API Endpoints Reference

| Method | Path | Request Body | Response Description |
|---|---|---|---|
| `GET` | `/api/health` | - | `{"status": "ok"}` — Health check |
| `GET` | `/api/engagement-summary?genre=&start_date=&end_date=` | - | `List[EngagementSummary]` from `vw_engagement_by_genre` |
| `GET` | `/api/retention-drivers` | - | `List[RetentionDriver]` with plain-language business insights |
| `GET` | `/api/content-insights?limit=10` | - | `List[ContentInsight]` from `vw_top_content` |
| `POST` | `/api/predict` | `PredictRequest` | `PredictResponse` (risk score 0.0-1.0 and risk tier: low/medium/high) |

Interactive OpenAPI documentation is available at `http://localhost:8000/docs`.

---

## 6. Getting Started & Running Locally

### 6.1 Prerequisites
- Python 3.11+
- Node.js 20+ & npm

### 6.2 Setup Environment
```bash
# Clone the repository
git clone https://github.com/kalviumcommunity/S70_StreamLogicUnit_RetentionMetrics.git
cd S70_StreamLogicUnit_RetentionMetrics

# Configure environment variables
cp .env.example .env

# Install Python dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 6.3 Execute Pipeline & Train Model
```bash
# 1. Ingest Data (Kaggle or Synthetic Fallback)
PYTHONPATH=. python src/ingestion/run_pipeline.py

# 2. Clean & Validate Data
PYTHONPATH=. python src/processing/clean.py

# 3. Train & Evaluate ML Models
PYTHONPATH=. python src/ml/train.py
PYTHONPATH=. python src/ml/evaluate.py
```

### 6.4 Start Services
```bash
# Terminal 1: Start Backend API
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload

# Terminal 2: Start Frontend Dashboard
cd frontend && npm run dev
```

Visit the dashboard at `http://localhost:3000`.

### 6.5 Run with Docker Compose
```bash
docker-compose up --build
```

---

## 7. Running Tests

```bash
# Backend unit & integration tests with coverage
pytest --cov=src --cov-report=term-missing

# Backend linting
flake8 src/ tests/ --max-line-length=120

# Frontend smoke tests
cd frontend && npm test

# Frontend linting
cd frontend && npm run lint
```