-- Preserve existing hotel records and rates while adopting the reviewed table name.
-- Keep the original migration unchanged: it has already run in isolated CI.
-- Apply all renames atomically so a failed statement cannot leave a partial rename.
BEGIN;

ALTER TABLE "game_hotels" RENAME TO "properties";
ALTER TABLE "properties" RENAME CONSTRAINT "game_hotels_pkey" TO "properties_pkey";
ALTER TABLE "properties" RENAME CONSTRAINT "game_hotels_game_id_fkey" TO "properties_game_id_fkey";
ALTER INDEX "game_hotels_game_id_idx" RENAME TO "properties_game_id_idx";

COMMIT;
