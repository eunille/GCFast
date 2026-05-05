-- =============================================================================
-- GFAST-MPTS: Migration 003 — Member Approval Workflow
-- Idempotent (safe to re-run)
-- =============================================================================

-- ── New enum ──────────────────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE account_status AS ENUM ('pending', 'active', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── Add account_status to profiles ───────────────────────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS account_status account_status NOT NULL DEFAULT 'active';

-- Existing accounts (treasurer + all seeded members) stay 'active' via the default.

-- ── Index for fast pending-member queries ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_profiles_account_status ON profiles(account_status);
