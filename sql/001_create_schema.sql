-- 001_create_schema.sql
-- Base schema definitions for StreamPulse PostgreSQL database

CREATE TABLE IF NOT EXISTS content_metadata (
    content_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200),
    genre VARCHAR(50),
    runtime_minutes INTEGER,
    release_date DATE
);

CREATE TABLE IF NOT EXISTS sessions (
    user_id VARCHAR(50) NOT NULL,
    session_id VARCHAR(50) PRIMARY KEY,
    watch_duration_min DECIMAL(6,2),
    pause_count INTEGER,
    session_date DATE
);

CREATE TABLE IF NOT EXISTS engagement_events (
    event_id SERIAL PRIMARY KEY,
    content_id VARCHAR(50) REFERENCES content_metadata(content_id),
    completion_rate DECIMAL(5,2),
    rewatch_flag BOOLEAN,
    device_type VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS subscriptions (
    user_id VARCHAR(50) PRIMARY KEY,
    subscription_status VARCHAR(20),
    churn_flag BOOLEAN,
    tenure_days INTEGER
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_engagement_content_id ON engagement_events(content_id);
