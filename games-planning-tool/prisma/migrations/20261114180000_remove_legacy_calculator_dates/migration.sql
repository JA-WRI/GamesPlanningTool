-- Older checkouts created this table; fresh databases may not have it.
ALTER TABLE IF EXISTS "calculator_traveler_items"
  DROP COLUMN IF EXISTS "check_in",
  DROP COLUMN IF EXISTS "check_out";
