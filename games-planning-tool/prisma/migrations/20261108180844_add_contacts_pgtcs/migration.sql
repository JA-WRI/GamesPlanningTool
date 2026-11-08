/*
  Warnings:

  - You are about to drop the column `createdAt` on the `games` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('COC', 'NSO');

-- AlterTable
ALTER TABLE "games" DROP COLUMN "createdAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "contacts" (
    "id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "nso_id" UUID,
    "type" "ContactType" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pgtcs" (
    "id" UUID NOT NULL,
    "nso_id" UUID NOT NULL,
    "discipline_name" TEXT NOT NULL,
    "arrival_date" DATE NOT NULL,
    "arrival_time" TIME(0) NOT NULL,
    "departure_date" DATE NOT NULL,
    "departure_time" TIME(0) NOT NULL,
    "accommodation_name" TEXT NOT NULL,
    "street_name" TEXT NOT NULL,
    "street_number" TEXT NOT NULL,
    "zip_code" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state_or_province" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "travel_method" TEXT NOT NULL,
    "poe" TEXT NOT NULL,
    "additional_notes" TEXT,

    CONSTRAINT "pgtcs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_game_id_idx" ON "contacts"("game_id");

-- CreateIndex
CREATE INDEX "contacts_nso_id_idx" ON "contacts"("nso_id");

-- CreateIndex
CREATE INDEX "pgtcs_nso_id_idx" ON "pgtcs"("nso_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pgtcs" ADD CONSTRAINT "pgtcs_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
