-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- FIX SUPABASE SECURITY WARNINGS
-- Date: 2025-11-23
-- 
-- Fixes 2 critical security warnings:
-- 1. Move pg_trgm extension from public to extensions schema
-- 2. Move unaccent extension from public to extensions schema
--
-- Security Level: WARN → FIXED
-- Category: SECURITY (EXTERNAL)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Create extensions schema if not exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension to extensions schema
DROP EXTENSION IF EXISTS pg_trgm CASCADE;
CREATE EXTENSION IF NOT EXISTS pg_trgm SCHEMA extensions;

-- Move unaccent extension to extensions schema  
DROP EXTENSION IF EXISTS unaccent CASCADE;
CREATE EXTENSION IF NOT EXISTS unaccent SCHEMA extensions;

-- Grant usage on extensions schema to authenticated users
GRANT USAGE ON SCHEMA extensions TO authenticated;
GRANT USAGE ON SCHEMA extensions TO anon;
GRANT USAGE ON SCHEMA extensions TO service_role;

-- Update search configurations to use extensions schema
-- (PostgreSQL will automatically find functions in extensions schema via search_path)

COMMENT ON SCHEMA extensions IS 'Schema for PostgreSQL extensions (security best practice)';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- VERIFICATION QUERIES
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Verify extensions are in correct schema
SELECT 
  e.extname AS extension_name,
  n.nspname AS schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE e.extname IN ('pg_trgm', 'unaccent')
ORDER BY e.extname;

-- Expected output:
--  extension_name | schema_name 
-- ----------------+-------------
--  pg_trgm        | extensions
--  unaccent       | extensions

