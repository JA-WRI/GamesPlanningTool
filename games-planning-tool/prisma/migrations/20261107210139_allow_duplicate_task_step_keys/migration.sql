/*
  Warnings:

  - A unique constraint covering the columns `[game_nso_id]` on the table `tasks` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tasks_game_nso_id_step_key_key";

-- CreateIndex
CREATE UNIQUE INDEX "tasks_game_nso_id_key" ON "tasks"("game_nso_id");
