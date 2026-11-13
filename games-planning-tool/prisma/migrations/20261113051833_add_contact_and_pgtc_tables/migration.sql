/*
  Warnings:

  - Added the required column `gameId` to the `calculator_estimated_cost_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nsoId` to the `calculator_estimated_cost_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gameId` to the `calculator_traveler_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nsoId` to the `calculator_traveler_items` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('COC', 'NSO');

-- AlterTable
ALTER TABLE "calculator_estimated_cost_items" ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "nsoId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "calculator_traveler_items" ADD COLUMN     "gameId" TEXT NOT NULL,
ADD COLUMN     "nsoId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "nso_contacts" (
    "id" TEXT NOT NULL,
    "nsoId" UUID NOT NULL,
    "gameId" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nso_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pgtc_disciplines" (
    "id" TEXT NOT NULL,
    "nsoId" UUID NOT NULL,
    "gameId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "arrival_date" TEXT,
    "arrival_time" TEXT,
    "departure_date" TEXT,
    "departure_time" TEXT,
    "accommodation_name" TEXT,
    "street_name" TEXT,
    "street_number" TEXT,
    "zip_code" TEXT,
    "city" TEXT,
    "stateOrProvince" TEXT,
    "country" TEXT,
    "travel_method" TEXT,
    "point_of_entry" TEXT,
    "additional_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pgtc_disciplines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nso_contacts_role_key" ON "nso_contacts"("role");

-- CreateIndex
CREATE INDEX "nso_contacts_nsoId_gameId_idx" ON "nso_contacts"("nsoId", "gameId");

-- CreateIndex
CREATE INDEX "pgtc_disciplines_nsoId_gameId_idx" ON "pgtc_disciplines"("nsoId", "gameId");

-- CreateIndex
CREATE INDEX "calculator_estimated_cost_items_nsoId_gameId_idx" ON "calculator_estimated_cost_items"("nsoId", "gameId");

-- CreateIndex
CREATE INDEX "calculator_traveler_items_nsoId_gameId_idx" ON "calculator_traveler_items"("nsoId", "gameId");

-- AddForeignKey
ALTER TABLE "nso_contacts" ADD CONSTRAINT "nso_contacts_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nso_contacts" ADD CONSTRAINT "nso_contacts_nsoId_fkey" FOREIGN KEY ("nsoId") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgtc_disciplines" ADD CONSTRAINT "pgtc_disciplines_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgtc_disciplines" ADD CONSTRAINT "pgtc_disciplines_nsoId_fkey" FOREIGN KEY ("nsoId") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
