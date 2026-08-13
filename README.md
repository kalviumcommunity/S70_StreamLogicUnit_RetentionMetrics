# StreamPulse — Viewer Engagement Analytics for Subscriber Retention

> A full-lifecycle data product that connects viewer engagement behavior to subscriber retention — built in 25 days, from documentation and Figma design through a deployed, ML-powered dashboard.


## Problem

A subscription-based streaming platform captures watch duration, pause frequency, episode completion rate, and session data — but content acquisition teams still greenlight new content without knowing which engagement patterns actually correlate with subscriber retention.

StreamPulse builds a data pipeline, a trained retention-prediction model, and a designed dashboard that answers:

1. Which engagement behaviors predict whether a subscriber stays or churns?
2. Which content/genres drive the strongest engagement?
3. What should the acquisition and growth teams do about it?

Full requirements, personas, and scope live in [`docs/PRD.md`](docs/PRD.md).

## Tech Stack

| Layer | Tool |
|---|---|
| Data Source | Kaggle + Kaggle API |
| Processing | Python, Pandas, NumPy |
| Database | PostgreSQL |
| Analysis | Jupyter/Colab, Matplotlib, Seaborn |
| ML | Scikit-learn |
| Design | Figma |
| Frontend | React / Next.js + Tailwind (or Streamlit) |
| Backend | FastAPI |
| CI/CD | GitHub Actions |
| Containerization | Docker |git status
| Deployment | Render/Railway (API) + Vercel (frontend) |

## Architecture

```
Kaggle Dataset
     │
     ▼
Ingestion (Kaggle API → staging)
     │
     ▼
Cleaning & Validation (Pandas)
     │
     ▼
PostgreSQL (fact tables + SQL views)
     │
     ▼
EDA + Feature Engineering + Model Training (Scikit-learn)
     │
     ▼
FastAPI (serves data + /predict)
     │
     ▼
Dashboard (built from Figma spec, React/Next.js or Streamlit)
     │
     ▼
Deployment (Docker + GitHub Actions CI/CD)
```

## Repository Structure

```
.
├── data/                  # raw/staging data (gitignored except samples)
├── src/
│   ├── ingestion/         # Kaggle import scripts
│   ├── processing/        # cleaning, transformation, SQL loaders
│   └── api/                # FastAPI backend
├── notebooks/             # EDA and model training notebooks
├── frontend/               # dashboard app
├── docs/
│   ├── PRD.md              # full product requirements document
│   ├── ETL.md               # data pipeline documentation
│   └── data-dictionary.md
├── .github/
│   ├── workflows/           # CI pipelines
│   └── PULL_REQUEST_TEMPLATE.md
└── README.md
```

---

## Team & Roles

| Role | Owns |
|---|---|
| **yashash — Data & Backend Lead** | Kaggle ingestion, PostgreSQL, data cleaning, SQL, FastAPI backend, backend CI/Docker |
| **vasu — Design & Frontend Lead** | Personas & feature matrix, Figma (wireframes → UI kit → prototype), frontend build, frontend CI/Docker, deployment |
| **saideep — Analytics & ML Lead** | EDA, feature engineering, model training/evaluation, final report |

See `docs/PRD.md` Section 15 for the full day-by-day task breakdown per role.

---

## Getting Started

```bash
# clone
git clone https://github.com/kalviumcommunity/S70_StreamLogicUnit_RetentionMetrics.git
cd streampulse

# python environment
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# configure secrets (Kaggle API token, DB credentials)
cp .env.example .env   # then fill in values — never commit .env

# run the pipeline
python src/ingestion/run_pipeline.py

# run the API locally
uvicorn src.api.main:app --reload

# run the frontend
cd frontend && npm install && npm run dev
```
## Project Timeline (25 Days)

| Gate | Days | Focus |
|---|---|---|
| 1 — Documentation | 1–4 | BRD, PRD, personas, architecture |
| 2 — Design | 5–9 | Figma wireframes → UI kit → prototype |
| 3 — Implementation | 10–20 | Data pipeline, ML model, backend API, frontend build, integration |
| 4 — DevOps | 21–24 | Docker, CI/CD, deployment |
| 5 — Delivery | 25 | Final report, demo, presentation |

---

## Contribution Workflow (Daily PRs)

We ship one pull request per person per day, tied to that day's task in `docs/PRD.md`. See [`CONTRIBUTING.md`](CONTRIBUTING.md) for the full branch naming, commit, and review workflow, and [`docs/PR_SCHEDULE.md`](docs/PR_SCHEDULE.md) for the exact PR scheduled for every day of the build.

Quick version:
1. Branch off `develop`: `git checkout -b <initials>/day<NN>-<short-task>`
2. Do the day's task, commit with a conventional message
3. Push and open a PR into `develop` using the PR template
4. Get at least one teammate's review + passing CI
5. Squash-merge, delete the branch

`develop` merges into `main` at each Gate checkpoint (Days 4, 9, 20, 24).

---

## License

TBD.