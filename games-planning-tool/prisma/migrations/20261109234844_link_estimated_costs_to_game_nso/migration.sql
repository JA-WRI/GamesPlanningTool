/*
  Warnings:

  - Added the required column `game_nso_id` to the `estimated_cost_items` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "estimated_cost_items" ADD COLUMN     "game_nso_id" UUID NOT NULL;

-- CreateIndex
CREATE INDEX "estimated_cost_items_game_nso_id_idx" ON "estimated_cost_items"("game_nso_id");

-- AddForeignKey
ALTER TABLE "estimated_cost_items" ADD CONSTRAINT "estimated_cost_items_game_nso_id_fkey" FOREIGN KEY ("game_nso_id") REFERENCES "game_nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
