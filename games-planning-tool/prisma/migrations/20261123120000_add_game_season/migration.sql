-- CreateEnum
CREATE TYPE "Season" AS ENUM ('Summer', 'Winter');

-- AlterTable
ALTER TABLE "games" ADD COLUMN "season" "Season" NOT NULL DEFAULT 'Summer';

-- Backfill existing rows from the game name
UPDATE "games"
SET "season" = CASE
    WHEN "name" ILIKE '%winter%' THEN 'Winter'::"Season"
    ELSE 'Summer'::"Season"
END;
