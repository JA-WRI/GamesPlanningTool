-- CreateEnum
CREATE TYPE "AccreditationStatus" AS ENUM ('CONFIRMED', 'TENTATIVE', 'DEVIATION');

-- CreateTable
CREATE TABLE "accreditation_periods" (
    "id" UUID NOT NULL,
    "game_member_id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "status" "AccreditationStatus" NOT NULL DEFAULT 'CONFIRMED',

    CONSTRAINT "accreditation_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "accreditation_periods_game_member_id_idx" ON "accreditation_periods"("game_member_id");

-- CreateIndex
CREATE INDEX "accreditation_periods_property_id_idx" ON "accreditation_periods"("property_id");

-- AddForeignKey
ALTER TABLE "accreditation_periods" ADD CONSTRAINT "accreditation_periods_game_member_id_fkey" FOREIGN KEY ("game_member_id") REFERENCES "game_members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accreditation_periods" ADD CONSTRAINT "accreditation_periods_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddCheckConstraint: a period can't end before it starts
ALTER TABLE "accreditation_periods" ADD CONSTRAINT "accreditation_periods_dates_check" CHECK ("end_date" >= "start_date");
