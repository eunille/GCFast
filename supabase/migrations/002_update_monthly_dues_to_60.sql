-- =============================================================================
-- MIGRATION 002: Update monthly dues amount to ₱60.00 for all member types
-- =============================================================================

UPDATE dues_configurations
SET    amount = 60.00
WHERE  payment_type = 'MONTHLY_DUES';
