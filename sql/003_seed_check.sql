-- 003_seed_check.sql
-- Validation queries to check table seed counts and foreign key integrity

SELECT 'sessions' AS table_name, COUNT(*) AS row_count FROM sessions
UNION ALL
SELECT 'content_metadata', COUNT(*) FROM content_metadata
UNION ALL
SELECT 'engagement_events', COUNT(*) FROM engagement_events
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions;

-- Integrity check: engagement events with invalid content_id
SELECT COUNT(*) AS orphaned_engagement_events
FROM engagement_events ee
LEFT JOIN content_metadata cm ON ee.content_id = cm.content_id
WHERE cm.content_id IS NULL;
