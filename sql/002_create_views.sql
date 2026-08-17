-- 002_create_views.sql
-- Analytics views for StreamPulse analytics platform

-- 1. Engagement metrics aggregated by genre
CREATE OR REPLACE VIEW vw_engagement_by_genre AS
SELECT 
    cm.genre,
    ROUND(AVG(ee.completion_rate)::numeric, 2) AS avg_completion_rate,
    ROUND(AVG(s.watch_duration_min)::numeric, 2) AS avg_watch_duration,
    COUNT(s.session_id) AS session_count
FROM content_metadata cm
LEFT JOIN engagement_events ee ON cm.content_id = ee.content_id
LEFT JOIN sessions s ON 1=1
GROUP BY cm.genre;

-- 2. Weekly retention rate based on active sessions and subscription status
CREATE OR REPLACE VIEW vw_weekly_retention AS
SELECT 
    DATE_TRUNC('week', s.session_date)::DATE AS week_start,
    COUNT(DISTINCT s.user_id) AS active_subscribers,
    COUNT(DISTINCT CASE WHEN sub.churn_flag = FALSE THEN s.user_id END) AS retained_subscribers,
    ROUND(
        (COUNT(DISTINCT CASE WHEN sub.churn_flag = FALSE THEN s.user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT s.user_id), 0)::numeric) * 100, 2
    ) AS retention_rate_pct
FROM sessions s
LEFT JOIN subscriptions sub ON s.user_id = sub.user_id
GROUP BY DATE_TRUNC('week', s.session_date)::DATE
ORDER BY week_start;

-- 3. Top 10 content titles by completion rate and engagement volume
CREATE OR REPLACE VIEW vw_top_content AS
SELECT 
    cm.content_id,
    cm.title,
    cm.genre,
    ROUND(AVG(ee.completion_rate)::numeric, 2) AS avg_completion_rate,
    COUNT(ee.event_id) AS total_sessions
FROM content_metadata cm
JOIN engagement_events ee ON cm.content_id = ee.content_id
GROUP BY cm.content_id, cm.title, cm.genre
ORDER BY avg_completion_rate DESC, total_sessions DESC
LIMIT 10;
