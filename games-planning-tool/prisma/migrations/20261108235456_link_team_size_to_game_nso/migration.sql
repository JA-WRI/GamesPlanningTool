-- DropForeignKey
ALTER TABLE "discipline_breakdowns" DROP CONSTRAINT "discipline_breakdowns_nso_id_game_id_fkey";

-- DropForeignKey
ALTER TABLE "team_size_estimates" DROP CONSTRAINT "team_size_estimates_game_id_fkey";

-- DropForeignKey
ALTER TABLE "team_size_estimates" DROP CONSTRAINT "team_size_estimates_nso_id_fkey";

-- AddForeignKey
ALTER TABLE "team_size_estimates" ADD CONSTRAINT "team_size_estimates_nso_id_game_id_fkey" FOREIGN KEY ("nso_id", "game_id") REFERENCES "game_nsos"("nso_id", "game_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_breakdowns" ADD CONSTRAINT "discipline_breakdowns_nso_id_game_id_fkey" FOREIGN KEY ("nso_id", "game_id") REFERENCES "team_size_estimates"("nso_id", "game_id") ON DELETE CASCADE ON UPDATE CASCADE;
