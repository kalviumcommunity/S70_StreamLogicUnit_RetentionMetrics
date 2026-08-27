-- =============================================================================
-- StreamPulse Schema Draft v0.1 (Review with Analytics Lead pending)
-- =============================================================================

CREATE TABLE IF NOT EXISTS subscriptions (
    user_id VARCHAR(50) PRIMARY KEY,
    subscription_status VARCHAR(20) NOT NULL,
    churn_flag BOOLEAN NOT NULL DEFAULT FALSE,
    tenure_days INTEGER CHECK (tenure_days >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_metadata (
    content_id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    genre VARCHAR(50) NOT NULL,
    runtime_minutes INTEGER CHECK (runtime_minutes > 0),
    release_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES subscriptions(user_id) ON DELETE CASCADE,
    content_id VARCHAR(50) NOT NULL REFERENCES content_metadata(content_id) ON DELETE CASCADE,
    session_duration_minutes NUMERIC(6, 2) NOT NULL CHECK (session_duration_minutes >= 0),
    completion_rate NUMERIC(4, 3) NOT NULL CHECK (completion_rate >= 0.0 AND completion_rate <= 1.0),
    pause_count INTEGER NOT NULL DEFAULT 0 CHECK (pause_count >= 0),
    buffering_events_count INTEGER NOT NULL DEFAULT 0 CHECK (buffering_events_count >= 0),
    watch_timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Draft Indexes for analytical query optimization
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_content ON sessions(content_id);
CREATE INDEX IF NOT EXISTS idx_sessions_watch_timestamp ON sessions(watch_timestamp);
CREATE INDEX IF NOT EXISTS idx_content_genre ON content_metadata(genre);
