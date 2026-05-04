-- =============================================================================
-- GFAST-MPTS: Migration 001 — Idempotent (safe to re-run)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- ENUMS (skip if already exist)
-- =============================================================================

DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('treasurer', 'member');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_type AS ENUM ('MEMBERSHIP_FEE', 'MONTHLY_DUES');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('COMPLETE', 'HAS_BALANCE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE member_type AS ENUM ('FULL_TIME', 'ASSOCIATE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- =============================================================================
-- TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role       user_role   NOT NULL DEFAULT 'member',
  full_name  TEXT        NOT NULL,
  email      TEXT        NOT NULL UNIQUE,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS colleges (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL UNIQUE,
  code       TEXT        NOT NULL UNIQUE,
  is_active  BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS academic_periods (
  id         UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  month      SMALLINT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year       SMALLINT NOT NULL CHECK (year >= 2020),
  label      TEXT     NOT NULL,
  is_active  BOOLEAN  NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_academic_periods_month_year UNIQUE (month, year)
);

CREATE TABLE IF NOT EXISTS members (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID        UNIQUE REFERENCES profiles(id) ON DELETE SET NULL,
  college_id  UUID        NOT NULL REFERENCES colleges(id) ON DELETE RESTRICT,
  employee_id TEXT        UNIQUE,
  full_name   TEXT        NOT NULL,
  email       TEXT        NOT NULL UNIQUE,
  member_type member_type NOT NULL DEFAULT 'FULL_TIME',
  joined_at   DATE        NOT NULL DEFAULT CURRENT_DATE,
  is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
  notes       TEXT,
  created_by  UUID        REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_members_college_id  ON members(college_id);
CREATE INDEX IF NOT EXISTS idx_members_profile_id  ON members(profile_id);
CREATE INDEX IF NOT EXISTS idx_members_is_active   ON members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_member_type ON members(member_type);

CREATE TABLE IF NOT EXISTS dues_configurations (
  id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_type   payment_type NOT NULL,
  member_type    member_type  NOT NULL,
  amount         NUMERIC(10,2) NOT NULL CHECK (amount >= 0),
  effective_from DATE         NOT NULL,
  effective_until DATE,
  created_by     UUID         REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_dues_config_type_period UNIQUE (payment_type, member_type, effective_from)
);

CREATE TABLE IF NOT EXISTS payment_records (
  id                 UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id          UUID          NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
  payment_type       payment_type  NOT NULL,
  academic_period_id UUID          REFERENCES academic_periods(id) ON DELETE RESTRICT,
  amount_paid        NUMERIC(10,2) NOT NULL CHECK (amount_paid > 0),
  payment_date       DATE          NOT NULL DEFAULT CURRENT_DATE,
  reference_number   TEXT,
  notes              TEXT,
  recorded_by        UUID          NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_membership_fee_per_member
    EXCLUDE USING btree (member_id WITH =)
    WHERE (payment_type = 'MEMBERSHIP_FEE'),
  CONSTRAINT uq_monthly_dues_per_period
    UNIQUE (member_id, payment_type, academic_period_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_records_member_id          ON payment_records(member_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_type       ON payment_records(payment_type);
CREATE INDEX IF NOT EXISTS idx_payment_records_academic_period_id ON payment_records(academic_period_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_recorded_by        ON payment_records(recorded_by);
CREATE INDEX IF NOT EXISTS idx_payment_records_payment_date       ON payment_records(payment_date);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at        ON profiles;
DROP TRIGGER IF EXISTS trg_colleges_updated_at         ON colleges;
DROP TRIGGER IF EXISTS trg_members_updated_at          ON members;
DROP TRIGGER IF EXISTS trg_payment_records_updated_at  ON payment_records;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_colleges_updated_at
  BEFORE UPDATE ON colleges FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_members_updated_at
  BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payment_records_updated_at
  BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'member')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =============================================================================
-- VIEW: member_payment_summary
-- =============================================================================

CREATE OR REPLACE VIEW member_payment_summary AS
WITH
active_periods AS (
  SELECT id, month, year, label FROM academic_periods
  WHERE is_active = TRUE
    AND (year < EXTRACT(YEAR FROM NOW())
      OR (year = EXTRACT(YEAR FROM NOW()) AND month <= EXTRACT(MONTH FROM NOW())))
),
expected_dues AS (
  SELECT m.id AS member_id, COUNT(ap.id) AS total_periods_expected
  FROM members m CROSS JOIN active_periods ap
  WHERE m.is_active = TRUE GROUP BY m.id
),
paid_summary AS (
  SELECT
    pr.member_id,
    SUM(pr.amount_paid) FILTER (WHERE pr.payment_type = 'MEMBERSHIP_FEE') AS membership_fee_paid,
    SUM(pr.amount_paid) FILTER (WHERE pr.payment_type = 'MONTHLY_DUES')   AS total_dues_paid,
    COUNT(pr.id)        FILTER (WHERE pr.payment_type = 'MONTHLY_DUES')   AS periods_paid,
    ARRAY_AGG(ap.month ORDER BY ap.year, ap.month)
      FILTER (WHERE pr.payment_type = 'MONTHLY_DUES')                     AS months_paid,
    MAX(pr.payment_date) AS last_payment_date
  FROM payment_records pr
  LEFT JOIN academic_periods ap ON ap.id = pr.academic_period_id
  GROUP BY pr.member_id
),
current_rates AS (
  SELECT DISTINCT ON (payment_type, member_type) payment_type, member_type, amount
  FROM dues_configurations ORDER BY payment_type, member_type, effective_from DESC
)
SELECT
  m.id AS member_id, m.full_name, m.email, m.employee_id, m.member_type, m.joined_at,
  c.id AS college_id, c.name AS college_name, c.code AS college_code,
  CASE WHEN ps.membership_fee_paid > 0 THEN TRUE ELSE FALSE END AS membership_fee_paid,
  COALESCE(ps.membership_fee_paid, 0) AS membership_fee_amount_paid,
  COALESCE(ps.periods_paid, 0) AS periods_paid,
  COALESCE(ed.total_periods_expected, 0) AS periods_expected,
  COALESCE(ps.months_paid, ARRAY[]::SMALLINT[]) AS months_paid,
  COALESCE(ps.total_dues_paid, 0) AS total_dues_paid,
  ps.last_payment_date,
  GREATEST(
    (COALESCE(ed.total_periods_expected, 0) * COALESCE(cr_dues.amount, 0))
    - COALESCE(ps.total_dues_paid, 0)
    + CASE WHEN m.member_type = 'FULL_TIME' AND COALESCE(ps.membership_fee_paid, 0) = 0
           THEN COALESCE(cr_fee.amount, 0) ELSE 0 END
  , 0) AS outstanding_balance,
  CASE
    WHEN (m.member_type = 'ASSOCIATE' OR COALESCE(ps.membership_fee_paid, 0) > 0)
      AND COALESCE(ps.periods_paid, 0) >= COALESCE(ed.total_periods_expected, 0)
    THEN 'COMPLETE'::payment_status
    ELSE 'HAS_BALANCE'::payment_status
  END AS status
FROM members m
JOIN  colleges          c       ON c.id = m.college_id
LEFT JOIN paid_summary  ps      ON ps.member_id = m.id
LEFT JOIN expected_dues ed      ON ed.member_id = m.id
LEFT JOIN current_rates cr_dues ON cr_dues.payment_type = 'MONTHLY_DUES' AND cr_dues.member_type = m.member_type
LEFT JOIN current_rates cr_fee  ON cr_fee.payment_type  = 'MEMBERSHIP_FEE' AND cr_fee.member_type = m.member_type
WHERE m.is_active = TRUE;

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE colleges          ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_periods  ENABLE ROW LEVEL SECURITY;
ALTER TABLE members           ENABLE ROW LEVEL SECURITY;
ALTER TABLE dues_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records   ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop all policies first (safe re-run)
DROP POLICY IF EXISTS "treasurer_select_all_profiles"    ON profiles;
DROP POLICY IF EXISTS "member_select_own_profile"        ON profiles;
DROP POLICY IF EXISTS "user_update_own_profile"          ON profiles;
DROP POLICY IF EXISTS "authenticated_select_colleges"    ON colleges;
DROP POLICY IF EXISTS "treasurer_manage_colleges"        ON colleges;
DROP POLICY IF EXISTS "authenticated_select_periods"     ON academic_periods;
DROP POLICY IF EXISTS "treasurer_manage_periods"         ON academic_periods;
DROP POLICY IF EXISTS "treasurer_manage_members"         ON members;
DROP POLICY IF EXISTS "member_select_own_record"         ON members;
DROP POLICY IF EXISTS "authenticated_select_dues_config" ON dues_configurations;
DROP POLICY IF EXISTS "treasurer_manage_dues_config"     ON dues_configurations;
DROP POLICY IF EXISTS "treasurer_manage_payments"        ON payment_records;
DROP POLICY IF EXISTS "member_select_own_payments"       ON payment_records;

-- Re-create policies
CREATE POLICY "treasurer_select_all_profiles"
  ON profiles FOR SELECT USING (get_user_role() = 'treasurer');
CREATE POLICY "member_select_own_profile"
  ON profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "user_update_own_profile"
  ON profiles FOR UPDATE USING (id = auth.uid());

CREATE POLICY "authenticated_select_colleges"
  ON colleges FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "treasurer_manage_colleges"
  ON colleges FOR ALL USING (get_user_role() = 'treasurer');

CREATE POLICY "authenticated_select_periods"
  ON academic_periods FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "treasurer_manage_periods"
  ON academic_periods FOR ALL USING (get_user_role() = 'treasurer');

CREATE POLICY "treasurer_manage_members"
  ON members FOR ALL USING (get_user_role() = 'treasurer');
CREATE POLICY "member_select_own_record"
  ON members FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "authenticated_select_dues_config"
  ON dues_configurations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "treasurer_manage_dues_config"
  ON dues_configurations FOR ALL USING (get_user_role() = 'treasurer');

CREATE POLICY "treasurer_manage_payments"
  ON payment_records FOR ALL USING (get_user_role() = 'treasurer');
CREATE POLICY "member_select_own_payments"
  ON payment_records FOR SELECT USING (
    member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
  );

-- =============================================================================
-- SEED DATA
-- =============================================================================

INSERT INTO colleges (name, code) VALUES
  ('College of Computer Studies',                   'CCS'),
  ('College of Allied Health Studies',              'CAHS'),
  ('College of Business and Accountancy',           'CBA'),
  ('College of Education, Arts and Sciences',       'CEAS'),
  ('College of Hospitality and Tourism Management', 'CHTM')
ON CONFLICT (code) DO NOTHING;

INSERT INTO academic_periods (month, year, label)
SELECT
  m.month,
  EXTRACT(YEAR FROM NOW())::SMALLINT,
  TO_CHAR(MAKE_DATE(EXTRACT(YEAR FROM NOW())::INT, m.month::INT, 1), 'Month YYYY')
FROM (VALUES (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)) AS m(month)
ON CONFLICT (month, year) DO NOTHING;

INSERT INTO dues_configurations (payment_type, member_type, amount, effective_from) VALUES
  ('MEMBERSHIP_FEE', 'FULL_TIME', 200.00, '2025-01-01'),
  ('MONTHLY_DUES',   'FULL_TIME',  60.00, '2025-01-01'),
  ('MONTHLY_DUES',   'ASSOCIATE',  60.00, '2025-01-01')
ON CONFLICT (payment_type, member_type, effective_from) DO NOTHING;

-- =============================================================================
-- END OF MIGRATION 001
-- =============================================================================
