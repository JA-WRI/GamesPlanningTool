-- CreateEnum
CREATE TYPE "Discipline" AS ENUM ('hp', 'ss_ba', 'ae', 'mo');

-- CreateTable
CREATE TABLE "team_size_estimates" (
    "nso_id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "low_female" INTEGER,
    "best_guess_female" INTEGER,
    "high_female" INTEGER,
    "low_male" INTEGER,
    "best_guess_male" INTEGER,
    "high_male" INTEGER,
    "notes" TEXT NOT NULL DEFAULT '',
    "discipline_breakdown_notes" TEXT NOT NULL DEFAULT '',
    "low_medals" INTEGER,
    "high_medals" INTEGER,

    CONSTRAINT "team_size_estimates_pkey" PRIMARY KEY ("nso_id","game_id")
);

-- CreateTable
CREATE TABLE "discipline_breakdowns" (
    "id" UUID NOT NULL,
    "nso_id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "discipline" "Discipline" NOT NULL,
    "best_female" INTEGER,
    "best_male" INTEGER,
    "low_female" INTEGER,
    "low_male" INTEGER,

    CONSTRAINT "discipline_breakdowns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "team_size_estimates_game_id_idx" ON "team_size_estimates"("game_id");

-- CreateIndex
CREATE UNIQUE INDEX "discipline_breakdowns_nso_id_game_id_discipline_key" ON "discipline_breakdowns"("nso_id", "game_id", "discipline");

-- AddForeignKey
ALTER TABLE "team_size_estimates" ADD CONSTRAINT "team_size_estimates_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "team_size_estimates" ADD CONSTRAINT "team_size_estimates_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "discipline_breakdowns" ADD CONSTRAINT "discipline_breakdowns_nso_id_game_id_fkey" FOREIGN KEY ("nso_id", "game_id") REFERENCES "team_size_estimates"("nso_id", "game_id") ON DELETE RESTRICT ON UPDATE CASCADE;
