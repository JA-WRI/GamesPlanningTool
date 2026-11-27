-- AlterTable
ALTER TABLE "games" ALTER COLUMN "start_date" DROP NOT NULL,
ALTER COLUMN "end_date" DROP NOT NULL,
ALTER COLUMN "planning_period_start" DROP NOT NULL,
ALTER COLUMN "planning_period_end" DROP NOT NULL;
