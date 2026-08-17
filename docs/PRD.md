# Product Requirements Document (PRD) — StreamPulse

## 1. Executive Summary & Problem Statement

### 1.1 The Problem
Subscription-based streaming platforms capture vast amounts of fine-grained telemetry — including session watch duration, pause frequencies, completion rates, and login recency. However, Content Acquisition and Growth teams frequently operate in silos:
- Content Acquisition teams greenlight multi-million dollar catalog licenses without clear visibility into which content engagement patterns directly drive long-term subscriber retention.
- Growth and Lifecycle Marketing teams lack explainable, early-warning signals to identify churn-risk subscribers before cancellation occurs.

### 1.2 The Solution
**StreamPulse** is a production-grade analytics platform that unifies raw viewer engagement telemetry with subscription lifecycle data. It provides:
1. Automated ingestion, validation, and idempotent PostgreSQL storage.
2. Machine learning classification models that identify the strongest leading indicators of churn.
3. A responsive 4-screen analytical dashboard tailored for Content Acquisition Managers, Growth Analysts, and Product Executives.

---

## 2. Target Personas & Use Cases

| Persona | Primary Goal | Core Screen / Feature Used |
|---|---|---|
| **Content Acquisition Manager** | Identify high-retention genres and evaluate catalog license ROI. | Content/Genre Insights (`/content`) |
| **Growth & Retention Analyst** | Rank leading churn drivers and simulate intervention triggers. | Retention Drivers (`/retention`) |
| **VP of Product** | Review 2-minute executive health summary and retention trajectories. | Executive Overview (`/`) |
| **Data Engineer (Internal)** | Automated, reproducible pipeline with schema enforcement and CI/CD. | Ingestion & Cleaning Pipeline |

---

## 3. Data Schema Specifications

StreamPulse enforces the following 4 normalized entities:

### 3.1 Sessions (`sessions`)
- `user_id` (VARCHAR 50): Subscriber unique identifier.
- `session_id` (VARCHAR 50, PK): Unique playback session ID.
- `watch_duration_min` (DECIMAL 6,2): Minutes streamed in session.
- `pause_count` (INTEGER): Number of pause events triggered during playback.
- `session_date` (DATE): Timestamp of viewing session.

### 3.2 Content Metadata (`content_metadata`)
- `content_id` (VARCHAR 50, PK): Unique title identifier.
- `title` (VARCHAR 200): Catalog title.
- `genre` (VARCHAR 50): Content genre classification.
- `runtime_minutes` (INTEGER): Standard content duration.
- `release_date` (DATE): Premiere / release date.

### 3.3 Engagement Events (`engagement_events`)
- `event_id` (SERIAL, PK): Event primary key.
- `content_id` (VARCHAR 50, FK): Reference to content metadata.
- `completion_rate` (DECIMAL 5,2): Percentage of content watched (0.00 – 100.00%).
- `rewatch_flag` (BOOLEAN): Flag indicating repeat viewing.
- `device_type` (VARCHAR 30): Client device (Smart TV, Mobile, Web, Tablet).

### 3.4 Subscriptions (`subscriptions`)
- `user_id` (VARCHAR 50, PK): Subscriber identifier.
- `subscription_status` (VARCHAR 20): Current state (`active`, `churned`, `paused`).
- `churn_flag` (BOOLEAN): Binary classification ground truth.
- `tenure_days` (INTEGER): Total active days as subscriber.

---

## 4. API Functional Requirements

The backend exposes the following RESTful endpoints under `/api`:

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status check. |
| `GET` | `/api/engagement-summary` | Aggregated completion rate, watch duration, and session count by genre. |
| `GET` | `/api/retention-drivers` | Ranked feature importance scores with plain-language action items. |
| `GET` | `/api/content-insights` | Top catalog titles ranked by completion rate and session volume. |
| `POST` | `/api/predict` | Computes 0.0–1.0 churn risk probability and risk tier (`low`, `medium`, `high`). |

---

## 5. Machine Learning Requirements

- **Model Type**: Supervised Binary Classification (Random Forest Classifier + Logistic Regression baseline).
- **Target Variable**: `churn_flag` (1 = churned, 0 = retained).
- **Engineered Features**: `avg_completion_rate`, `avg_watch_duration`, `session_count`, `days_since_last_session`, `binge_score`, `pause_rate`.
- **Target Performance**: $\ge 80\%$ precision on churn class.
- **Export Artifacts**: `retention_model.pkl`, `feature_importance.json`, `feature_columns.json`.

---

## 6. Acceptance Criteria

1. End-to-end data pipeline executes idempotently from raw CSVs to PostgreSQL.
2. API serves all endpoints with strict Pydantic v2 schemas and <100ms response latency.
3. Frontend provides full loading, empty, and error handling across all 4 screens.
4. Unit and integration tests achieve $\ge 80\%$ test coverage on core backend modules.
5. Multi-container Docker environment boots with passing health checks.
