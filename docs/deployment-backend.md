# Backend & PostgreSQL Production Deployment Guide

## 1. Architecture & Hosting Topology
The StreamPulse backend is provisioned as a containerized web service with a managed PostgreSQL 16 database instance (configured via Render / Railway / AWS ECS).

* **Web Service**: FastAPI running under Uvicorn (`uvicorn src.api.main:app --host 0.0.0.0 --port $PORT`).
* **Database**: Managed PostgreSQL with connection pooling (`DATABASE_URL`).
* **Container Registry**: Built directly from `Dockerfile` root context.

## 2. Environment Variables Configuration

| Variable Name | Example Production Value | Purpose / Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@db-host.railway.app:5432/streaming_engagement` | Managed PostgreSQL connection string |
| `ALLOWED_ORIGINS`| `https://streampulse.vercel.app,http://localhost:3000` | CORS whitelist for Next.js frontend |
| `PORT` | `8000` | Ingress port exposed by the hosting provider |
| `KAGGLE_USERNAME`| `streampulse-service` | Ingestion service account |
| `KAGGLE_KEY` | `xxxxxxxxxxxxxxxxxxxxxxxx` | Kaggle API secret token |
| `PYTHONUNBUFFERED`| `1` | Enables instantaneous stdout/stderr logging |

## 3. Post-Deployment Provisioning & Health Verification
1. **Apply Schemas and Seed Clean Data**:
   ```bash
   python -m src.processing.load_to_postgres
   ```
2. **Smoke Test Health Endpoint**:
   ```bash
   curl -i https://streampulse-backend.onrender.com/api/health
   # Expected: HTTP 200 OK -> {"status": "ok"}
   ```
3. **Verify CORS Headers**:
   ```bash
   curl -I -X OPTIONS https://streampulse-backend.onrender.com/api/engagement-summary \
     -H "Origin: https://streampulse.vercel.app" \
     -H "Access-Control-Request-Method: GET"
   ```
