-- AI contribution: 50% or more AI-generated
-- REVIEW: Create the progress schema in this PR's new migration. Databases
-- that already applied the core migration will not replay edits to that file.
CREATE TABLE "progress_tracking" (
    "id" UUID NOT NULL,
    "game_nso_id" UUID NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL,
    "contact_info" "TaskStatus" NOT NULL DEFAULT 'not_started',
    "team_size" "TaskStatus" NOT NULL DEFAULT 'not_started',
    "accreditation" "TaskStatus" NOT NULL DEFAULT 'not_started',
    "estimated_costs" "TaskStatus" NOT NULL DEFAULT 'not_started',
    "review_and_completion" "TaskStatus" NOT NULL DEFAULT 'not_started',

    CONSTRAINT "progress_tracking_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "progress_tracking_game_nso_id_fkey"
        FOREIGN KEY ("game_nso_id") REFERENCES "game_nsos"("id")
        ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "progress_tracking_game_nso_id_key" ON "progress_tracking"("game_nso_id");
