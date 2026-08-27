# Backend Bug Bash & User-Journey Quality Log

## 1. Overview
* **Session Goal**: Stress test API responses, data transformations, and edge cases simulating real user workflows on the frontend dashboard.
* **Testers**: Data & Backend Lead in coordination with Frontend Lead.
* **Duration**: 2-hour exploratory session covering 4 primary dashboard views and manual predictive scoring.

## 2. Issues Logged & Resolution Matrix

| Bug ID | Component | Severity | Description | Resolution Status |
| :--- | :--- | :--- | :--- | :--- |
| **BUG-01** | `/engagement-summary` | Medium | Case-sensitive genre parameter caused empty response when frontend sent "action" instead of "Action". | **FIXED**: Applied `LOWER(genre) = LOWER(:genre)` in SQL and pandas filtering. |
| **BUG-02** | `/retention-drivers` | Low | Missing dictionary fallback when `feature_importance.json` is missing or unreadable. | **FIXED**: Added static top-6 baseline fallback. |
| **BUG-03** | `/predict` | High | High latency (>350ms) on concurrent predict requests due to repeated disk model reads. | **FIXED**: Pre-loaded model into memory at application lifespan startup. |
| **BUG-04** | DB Connection | Medium | SSL mode timeout on remote managed Postgres instance. | **FIXED**: Configured `sslmode=require` query param detection in `database.py`. |

## 3. Regression Verification
* Ran automated test suite `pytest tests/` (100% passing across 6 tests).
* Verified sub-50ms response times on all GET endpoints under 20 concurrent simulated requests.
