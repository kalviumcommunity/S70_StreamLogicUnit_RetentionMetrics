# Data Dictionary v1

This document provides a detailed layout of the fields, types, and constraints for each of the core datasets in the StreamPulse project. It also outlines the data-quality issues identified during ingestion and the corresponding mitigation rules applied in the processing pipeline.

---

## 1. Entity Schema Definitions

### 1.1. Subscriptions (`subscriptions`)
This table tracks subscriber account states, tenure, and churn status.

| Field Name | Type (Pydantic / DB) | Nullable | Primary Key | Foreign Key | Description |
|---|---|---|---|---|---|
| `user_id` | `VARCHAR(50)` / `string` | **No** | Yes | No | Unique identifier for each subscriber. |
| `subscription_status` | `VARCHAR(20)` / `string` | **No** | No | No | State of the subscription (e.g., `Active`, `Churned`, `Paused`). |
| `churn_flag` | `BOOLEAN` / `bool` | **No** | No | No | Target indicator showing if the subscriber has cancelled/churned. |
| `tenure_days` | `INTEGER` / `int` | *Yes* | No | No | Number of days the subscriber has been active on the platform. |

### 1.2. Content Metadata (`content_metadata`)
This table stores catalog details of titles, genres, and release configurations.

| Field Name | Type (Pydantic / DB) | Nullable | Primary Key | Foreign Key | Description |
|---|---|---|---|---|---|
| `content_id` | `VARCHAR(50)` / `string` | **No** | Yes | No | Unique identifier for each video title. |
| `title` | `VARCHAR(200)` / `string` | **No** | No | No | Standard catalog title of the video asset. |
| `genre` | `VARCHAR(50)` / `string` | **No** | No | No | Genre classification (e.g., `Action`, `Drama`, `Comedy`). |
| `runtime_minutes` | `INTEGER` / `int` | *Yes* | No | No | Length of the video asset in minutes. |
| `release_date` | `DATE` / `datetime` | *Yes* | No | No | Original release/premiere date of the title. |

### 1.3. Sessions (`sessions`)
This table records fine-grained viewing session metrics for subscribers.

| Field Name | Type (Pydantic / DB) | Nullable | Primary Key | Foreign Key | Description |
|---|---|---|---|---|---|
| `session_id` | `VARCHAR(50)` / `string` | **No** | Yes | No | Unique identifier for each video playback session. |
| `user_id` | `VARCHAR(50)` / `string` | **No** | No | Yes (`subscriptions.user_id`) | Reference to the subscriber who initiated the session. |
| `watch_duration_min` | `DECIMAL(6,2)` / `float` | *Yes* | No | No | Minutes watched during this playback session. |
| `pause_count` | `INTEGER` / `int` | *Yes* | No | No | Total pause actions recorded in the session. |
| `session_date` | `DATE` / `datetime` | **No** | No | No | The calendar date on which the session occurred. |

### 1.4. Engagement Events (`engagement_events`)
This table documents playback completion, device profiles, and replay habits.

| Field Name | Type (Pydantic / DB) | Nullable | Primary Key | Foreign Key | Description |
|---|---|---|---|---|---|
| `event_id` | `INTEGER` / `int` | **No** | Yes | No | Unique primary key for the engagement event. |
| `content_id` | `VARCHAR(50)` / `string` | **No** | No | Yes (`content_metadata.content_id`) | Reference to the video title. |
| `completion_rate` | `DECIMAL(5,2)` / `float` | *Yes* | No | No | Watch progress percentage, restricted to range $[0.00, 100.00]$. |
| `rewatch_flag` | `BOOLEAN` / `bool` | *Yes* | No | No | Flag indicating if this session was a repeat view. |
| `device_type` | `VARCHAR(30)` / `string` | *Yes* | No | No | Platform/client device class (e.g., `Smart Tv`, `Mobile`, `Web`). |

---

## 2. Data Quality Issues & Processing Rules

The raw dataset contains several quality anomalies introduced during data collection (or simulated during testing/synthetic fallback generation). These are handled systematically by `src/processing/clean.py` as detailed below:

### 2.1. Duplicate Records
> [!WARNING]
> Duplicate records exist across all raw CSV telemetry tables and must be resolved prior to staging in PostgreSQL to prevent violations of uniqueness constraints.

* **Subscriptions**: Deduplicated by `user_id` subset (~50 duplicates removed).
* **Content Metadata**: Deduplicated by `content_id` subset (~2 duplicates removed).
* **Sessions**: Deduplicated by `session_id` subset (~500 duplicates removed).
* **Engagement Events**: Deduplicated by `event_id` subset (~500 duplicates removed).

### 2.2. Missing Values (Nulls)
Null values are present in non-critical attributes (~3% of rows) and are imputed using robust defaults:
* `watch_duration_min`: Imputed using the **median duration** (~48.5 min) of all sessions to avoid zero-bias.
* `pause_count`: Imputed with `0`, assuming uninterrupted playback.
* `runtime_minutes`: Imputed using the **median duration** (~92 min) of catalog titles.
* `release_date`: Imputed using the **mode** (most common date).
* `device_type`: Imputed with `"Unknown"`.
* `rewatch_flag`: Imputed with `False` (default to first-time viewing).
* `tenure_days`: Imputed using the **median tenure** (~320 days) of active accounts.
* `subscription_status`: Imputed using the **mode**.

### 2.3. Casing & Whitespace Variations
Categorical values in raw data contain arbitrary casing (e.g. `"Action"`, `"action"`, `"DRAMA"`) and leading/trailing whitespace.
* **Standardization Rule**: All string categories in `genre`, `title`, `subscription_status`, and `device_type` are stripped of whitespaces and formatted in **Title Case** (e.g., `"Smart Tv"`, `"Action"`).

### 2.4. Range Violations
The `completion_rate` attribute is theoretically bounded between 0% and 100%. The raw dataset occasionally records values outside this domain due to telemetry logging errors.
* **Standardization Rule**: completion rates are clipped strictly to the interval $[0.0, 100.0]$.
