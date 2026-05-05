-- =============================================================================
-- GFAST-MPTS: Migration 004 — Allow nullable college_id on members
-- Idempotent (safe to re-run)
-- Purpose: Self-registered pending members don't have a college assigned yet.
--          The treasurer fills in college (and other details) when approving.
-- =============================================================================

ALTER TABLE members
  ALTER COLUMN college_id DROP NOT NULL;
