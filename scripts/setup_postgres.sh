#!/usr/bin/env bash
# ==============================================================================
# StreamPulse PostgreSQL Setup Script
# Configures local database and initializes 'streaming_engagement'
# ==============================================================================

set -euo pipefail

DB_NAME="${POSTGRES_DB:-streaming_engagement}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

echo "==> Initializing PostgreSQL setup for StreamPulse..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "Warning: psql command not found. Ensuring PostgreSQL container/service is running..."
fi

# Create database if not exists
echo "==> Creating database '$DB_NAME' if not present on $DB_HOST:$DB_PORT..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -tc \
  "SELECT 1 FROM pg_database WHERE datname = '$DB_NAME'" | grep -q 1 || \
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c \
  "CREATE DATABASE $DB_NAME;"

# Verify connection
echo "==> Verifying connection to $DB_NAME..."
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT current_database(), current_user, version();"

echo "==> PostgreSQL setup and connection verification completed successfully."
