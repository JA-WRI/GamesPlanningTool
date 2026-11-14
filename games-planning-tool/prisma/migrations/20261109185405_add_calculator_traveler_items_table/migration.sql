-- CreateTable
CREATE TABLE "calculator_traveler_items" (
    "id" TEXT NOT NULL,
    "calculator_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "number_of_team_members" INTEGER NOT NULL DEFAULT 0,
    "days" INTEGER NOT NULL DEFAULT 0,
    "travel_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "check_in" TEXT,
    "check_out" TEXT,
    "accommodation_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "meals_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "insurance_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_cost_per_team_member" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculator_traveler_items_pkey" PRIMARY KEY ("id")
);
