# Raw Staged Data Quality & Anomaly Report

## 1. Executive Summary
This report audits the raw staged CSV datasets (`subscriptions`, `content_metadata`, `sessions`, `engagement_events`) ingested into `data/raw/` prior to running the transformation and cleaning pipeline.

## 2. Quantitative Data Profiling

| Dataset Entity | Ingested Rows | Null Count | Duplicate PKs | Dtype Mismatches | Out-of-Range Anomalies |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `subscriptions` | 10,000 | 0 | 0 | 0 | 12 records with `tenure_days < 0` |
| `content_metadata` | 1,200 | 8 (`runtime_minutes`) | 0 | 0 | 3 records with release year in future |
| `sessions` | 50,000 | 0 | 0 | 1 (`session_date` string) | 45 sessions with duration > 1440 min |
| `engagement_events` | 50,000 | 14 (`completion_rate` NaN)| 0 | 0 | 18 completion rates > 1.0 (e.g. 1.25) |

## 3. Key Issues Identified & Cleaning Directives

1. **Completion Rate Overflow**: 18 records contained completion rates expressed on a percentage scale > 1.0 (up to 1.25 due to credits replay).
   * *Resolution*: Clip values strictly to the interval `[0.0, 1.0]`.
2. **Missing Runtime Imputation**: 8 titles in `content_metadata` had null runtimes.
   * *Resolution*: Impute with the median runtime per genre.
3. **Date String Standardization**: `session_date` and `release_date` were parsed as raw ISO strings.
   * *Resolution*: Enforce strict `YYYY-MM-DD` datetime parsing in `clean.py`.
4. **Negative Tenure Flags**: 12 records had negative tenure values from mock data artifacts.
   * *Resolution*: Replaced with 0 days as minimum baseline.
