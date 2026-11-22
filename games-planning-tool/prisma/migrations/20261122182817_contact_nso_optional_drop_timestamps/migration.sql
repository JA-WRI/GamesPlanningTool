/*
  Warnings:

  - You are about to drop the `nso_contacts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "nso_contacts" DROP CONSTRAINT "nso_contacts_gameId_fkey";

-- DropForeignKey
ALTER TABLE "nso_contacts" DROP CONSTRAINT "nso_contacts_nsoId_fkey";

-- DropTable
DROP TABLE "nso_contacts";

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "nso_id" UUID,
    "game_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "type" "ContactType" NOT NULL,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contacts_nso_id_game_id_idx" ON "contacts"("nso_id", "game_id");

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
