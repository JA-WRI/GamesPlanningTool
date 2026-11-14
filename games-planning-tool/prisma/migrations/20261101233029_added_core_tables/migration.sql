/* AI contribution: Less than 50% AI-generated */
/*
  Warnings:

  - You are about to drop the `Games` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Admin', 'COC', 'NSO');

-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('Athlete', 'Staff');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('invited', 'active', 'inactive');

-- DropTable
DROP TABLE "Games";

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "planning_period_start" TIMESTAMP(3) NOT NULL,
    "planning_period_end" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nsos" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "sport" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "nso_id" UUID,
    "role" "Role" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'invited',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_nsos" (
    "id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "nso_id" UUID NOT NULL,

    CONSTRAINT "game_nsos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "members" (
    "id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "type" "MemberType" NOT NULL,
    "discipline" TEXT,
    "nso_id" UUID NOT NULL,

    CONSTRAINT "members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_members" (
    "id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "member_id" UUID NOT NULL,
    "funded_by" TEXT,
    "clothing" TEXT,
    "outfitting_bag" TEXT,
    "request_room_notes" TEXT,
    "game_arrival" DATE,
    "game_departure" DATE,
    "games_role" TEXT,
    "rank" TEXT,
    "event" TEXT,
    "medal" TEXT,
    "medal_notes" TEXT,

    CONSTRAINT "game_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_nso_id_idx" ON "users"("nso_id");

-- CreateIndex
CREATE INDEX "game_nsos_nso_id_idx" ON "game_nsos"("nso_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_nsos_game_id_nso_id_key" ON "game_nsos"("game_id", "nso_id");

-- CreateIndex
CREATE INDEX "members_nso_id_idx" ON "members"("nso_id");

-- CreateIndex
CREATE INDEX "game_members_member_id_idx" ON "game_members"("member_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_members_game_id_member_id_key" ON "game_members"("game_id", "member_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_nsos" ADD CONSTRAINT "game_nsos_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_nsos" ADD CONSTRAINT "game_nsos_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "members" ADD CONSTRAINT "members_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_members" ADD CONSTRAINT "game_members_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_members" ADD CONSTRAINT "game_members_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
