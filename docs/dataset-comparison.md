# Dataset Comparison & Primary Selection Report

## 1. Overview
This document evaluates the shortlisted candidate datasets for the StreamPulse Retention & Engagement Analytics Platform, documents the selection criteria, and logs the initial raw sanity check results.

## 2. Quantitative Comparison

| Evaluation Metric | Netflix Userbase | OTT Streaming Engagement (Selected) | Spotify User Streaming |
| :--- | :--- | :--- | :--- |
| **Row Count** | 2,500 rows | 50,000+ session rows | 100,000+ track plays |
| **Unique Users** | 2,500 | 10,000 | 8,200 |
| **Session Granularity** | Aggregate account only | Per-session timestamps & watch lengths | Per-track play events |
| **Engagement Markers** | Subscription plan only | `completion_rate`, `pause_count`, `buffering_events` | `danceability`, `duration_ms` |
| **Retention Ground Truth**| Join/Last Payment date | 30-day retention flag (`is_retained`) & churn date | None (needs proxy heuristics) |
| **Content Hierarchy** | Type (Movie/Show) | Content ID, Title, Genre, Duration, Rating | Artist, Track, Album |

## 3. Primary Dataset Selection Decision
**Selected Primary Dataset**: OTT Streaming Platform User Engagement Dataset.

**Rationale**:
1. **Behavioral Depth**: Provides per-session interaction metrics essential for computing behavioral features like Binge Index and Completion Ratios.
2. **Explicit Retention Targets**: Contains clear ground-truth labels for 30-day retention and subscription status.
3. **Multi-entity Modeling**: Allows clean relational separation into `users`, `sessions`, `content_metadata`, and `subscriptions`.

## 4. Raw Data Sanity Check
* **File Check**: Verified CSV integrity across 50,000 session records and 1,200 content metadata records.
* **Null Check**: 0 missing values in mandatory primary keys (`user_id`, `session_id`, `content_id`).
* **Value Ranges**: Session duration ranges between 1 and 240 minutes; completion rate is strictly bounded in `[0.0, 1.0]`.
* **Outliers**: Identified <0.2% sessions with extreme pause frequencies (>50 pauses), flagged for downstream cleaning.
