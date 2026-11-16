-- AI contribution: 50% or more AI-generated
-- Convert databases that applied the earlier ProgressStatus schema without losing progress.
-- Fresh databases already use TaskStatus; their values remain unchanged.
BEGIN;

ALTER TABLE "progress_tracking"
    ALTER COLUMN "contact_info" DROP DEFAULT,
    ALTER COLUMN "team_size" DROP DEFAULT,
    ALTER COLUMN "accreditation" DROP DEFAULT,
    ALTER COLUMN "estimated_costs" DROP DEFAULT,
    ALTER COLUMN "review_and_completion" DROP DEFAULT;

ALTER TABLE "progress_tracking"
    ALTER COLUMN "contact_info" TYPE "TaskStatus"
    USING (CASE "contact_info"::text
        WHEN 'completed' THEN 'COMPLETE'
        WHEN 'requires_update' THEN 'ACTION_REQUIRED'
        ELSE upper("contact_info"::text)
    END)::"TaskStatus",
    ALTER COLUMN "team_size" TYPE "TaskStatus"
    USING (CASE "team_size"::text
        WHEN 'completed' THEN 'COMPLETE'
        WHEN 'requires_update' THEN 'ACTION_REQUIRED'
        ELSE upper("team_size"::text)
    END)::"TaskStatus",
    ALTER COLUMN "accreditation" TYPE "TaskStatus"
    USING (CASE "accreditation"::text
        WHEN 'completed' THEN 'COMPLETE'
        WHEN 'requires_update' THEN 'ACTION_REQUIRED'
        ELSE upper("accreditation"::text)
    END)::"TaskStatus",
    ALTER COLUMN "estimated_costs" TYPE "TaskStatus"
    USING (CASE "estimated_costs"::text
        WHEN 'completed' THEN 'COMPLETE'
        WHEN 'requires_update' THEN 'ACTION_REQUIRED'
        ELSE upper("estimated_costs"::text)
    END)::"TaskStatus",
    ALTER COLUMN "review_and_completion" TYPE "TaskStatus"
    USING (CASE "review_and_completion"::text
        WHEN 'completed' THEN 'COMPLETE'
        WHEN 'requires_update' THEN 'ACTION_REQUIRED'
        ELSE upper("review_and_completion"::text)
    END)::"TaskStatus";

ALTER TABLE "progress_tracking"
    ALTER COLUMN "contact_info" SET DEFAULT 'NOT_STARTED'::"TaskStatus",
    ALTER COLUMN "team_size" SET DEFAULT 'NOT_STARTED'::"TaskStatus",
    ALTER COLUMN "accreditation" SET DEFAULT 'NOT_STARTED'::"TaskStatus",
    ALTER COLUMN "estimated_costs" SET DEFAULT 'NOT_STARTED'::"TaskStatus",
    ALTER COLUMN "review_and_completion" SET DEFAULT 'NOT_STARTED'::"TaskStatus";

DROP TYPE IF EXISTS "ProgressStatus";

COMMIT;

