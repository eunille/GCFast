-- 005_fix_member_payment_summary_left_join.sql
-- Fix: member_payment_summary view used INNER JOIN colleges, which excluded
-- self-registered members whose college_id is NULL (they have no college yet).
-- Changing to LEFT JOIN ensures all active members appear in the view.

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
LEFT JOIN colleges          c       ON c.id = m.college_id   -- LEFT JOIN: include members with college_id = NULL
LEFT JOIN paid_summary      ps      ON ps.member_id = m.id
LEFT JOIN expected_dues     ed      ON ed.member_id = m.id
LEFT JOIN current_rates     cr_dues ON cr_dues.payment_type = 'MONTHLY_DUES' AND cr_dues.member_type = m.member_type
LEFT JOIN current_rates     cr_fee  ON cr_fee.payment_type  = 'MEMBERSHIP_FEE' AND cr_fee.member_type = m.member_type
WHERE m.is_active = TRUE;
