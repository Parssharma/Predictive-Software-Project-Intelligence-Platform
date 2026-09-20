-- init-db.sql
-- Creates a read-only role for the analytics service.
-- This script is run by the Postgres container on first startup.

DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'analytics_reader') THEN
    CREATE ROLE analytics_reader WITH LOGIN PASSWORD 'analytics_readonly';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE projectana TO analytics_reader;

-- Note: After Prisma migrations create tables, run:
-- GRANT USAGE ON SCHEMA public TO analytics_reader;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_reader;
-- ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO analytics_reader;
