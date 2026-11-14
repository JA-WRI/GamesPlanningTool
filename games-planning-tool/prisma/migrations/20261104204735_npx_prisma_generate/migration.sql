-- AI contribution: 50% or more AI-generated
-- REVIEW: Create the progress schema in this PR's new migration. Databases
-- that already applied the core migration will not replay edits to that file.
CREATE TYPE "ProgressStatus" AS ENUM ('not_started', 'in_progress', 'submitted', 'requires_update', 'completed');

CREATE TABLE "progress_tracking" (
    "id" UUID NOT NULL,
    "game_nso_id" UUID NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "contact_info" "ProgressStatus" NOT NULL DEFAULT 'not_started',
    "team_size" "ProgressStatus" NOT NULL DEFAULT 'not_started',
    "accreditation" "ProgressStatus" NOT NULL DEFAULT 'not_started',
    "estimated_costs" "ProgressStatus" NOT NULL DEFAULT 'not_started',
    "review_and_completion" "ProgressStatus" NOT NULL DEFAULT 'not_started',

    CONSTRAINT "progress_tracking_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "progress_tracking_game_nso_id_fkey"
        FOREIGN KEY ("game_nso_id") REFERENCES "game_nsos"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "progress_tracking_game_nso_id_key" ON "progress_tracking"("game_nso_id");
