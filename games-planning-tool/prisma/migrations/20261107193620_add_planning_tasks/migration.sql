-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('COMPLETE', 'SUBMITTED', 'ACTION_REQUIRED', 'IN_PROGRESS', 'NOT_STARTED');

-- CreateTable
CREATE TABLE "tasks" (
    "id" UUID NOT NULL,
    "game_nso_id" UUID NOT NULL,
    "step_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "deadline" DATE,

    CONSTRAINT "tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tasks_game_nso_id_step_key_key" ON "tasks"("game_nso_id", "step_key");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_game_nso_id_fkey" FOREIGN KEY ("game_nso_id") REFERENCES "game_nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
