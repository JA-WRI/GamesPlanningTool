/*
  Warnings:

  - Added the required column `gameId` to the `calculator_estimated_cost_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nsoId` to the `calculator_estimated_cost_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `calculator_traveler_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nsoId` to the `calculator_traveler_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `nso_contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nsoId` to the `nso_contacts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `pgtc_disciplines` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nsoId` to the `pgtc_disciplines` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "calculator_estimated_cost_items" ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "nsoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "calculator_traveler_items" ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "nsoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "nso_contacts" ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "nsoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "pgtc_disciplines" ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "nsoId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "calculator_estimated_cost_items_nsoId_gameId_idx" ON "calculator_estimated_cost_items"("nsoId", "gameId");

-- CreateIndex
CREATE INDEX "calculator_traveler_items_nsoId_gameId_idx" ON "calculator_traveler_items"("nsoId", "gameId");

-- CreateIndex
CREATE INDEX "nso_contacts_nsoId_gameId_idx" ON "nso_contacts"("nsoId", "gameId");

-- CreateIndex
CREATE INDEX "pgtc_disciplines_nsoId_gameId_idx" ON "pgtc_disciplines"("nsoId", "gameId");
