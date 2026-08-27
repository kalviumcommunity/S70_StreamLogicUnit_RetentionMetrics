# Business Requirements Document (BRD) — Data Sourcing & Ingestion Feasibility

## 1. Objective
Establish data sourcing pipelines for the StreamPulse platform by evaluating candidate datasets, defining ingestion feasibility, and validating API authentication mechanisms for automated ingestion.

## 2. Candidate Dataset Evaluation

We analyzed four candidate streaming engagement datasets on Kaggle against our core requirements (granularity at session level, user retention signals, content metadata, and churn markers):

### Candidate A: Netflix Userbase & Streaming Engagement
* **Source**: `arnavsmayan/netflix-userbase-dataset` (~2,500 records)
* **Pros**: Clean demographic data (age, country, device), clear subscription type, payment status, and join date.
* **Cons**: Small record volume, low granularity on interaction events (no per-episode watch duration or pause events).

### Candidate B: OTT Streaming Platform Engagement & Churn (Selected Primary)
* **Source**: `shivamb/netflix-shows` + `octopusc/ott-streaming-behavior-dataset` (50,000+ sessions)
* **Pros**: Detailed session-level telemetry (`session_duration_minutes`, `completion_rate`, `pause_count`, `buffering_events_count`), linked user subscription status (`churn_status`, `monthly_fee`), and rich content tags (`genre`, `release_year`).
* **Cons**: Requires schema normalization across sessions, users, and content catalogs.

### Candidate C: Spotify / Audio Streaming Interactions
* **Source**: `zaheenhamidani/ultimate-spotify-tracks-db`
* **Pros**: High volume session frequency.
* **Cons**: Audio consumption patterns differ significantly from long-form video streaming retention dynamics.

### Candidate D: Disney+ / Hulu Video Analytics
* **Source**: `shivamb/disney-movies-and-tv-shows`
* **Pros**: Strong content hierarchy.
* **Cons**: Lacks granular time-series engagement events.

## 3. Kaggle API Token & Ingestion Validation
* Verified local Kaggle API credentials (`~/.kaggle/kaggle.json` / `KAGGLE_USERNAME` & `KAGGLE_KEY` env vars).
* Tested programmatic download via `kaggle datasets download -d <dataset_name> --unzip`.
* Verified CLI response status (HTTP 200 OK) and confirmed fallback synthetic generation mechanism for offline/CI environments.
