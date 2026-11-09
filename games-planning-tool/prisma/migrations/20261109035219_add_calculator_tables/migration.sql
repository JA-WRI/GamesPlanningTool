-- CreateTable
CREATE TABLE "traveler" (
    "id" SERIAL NOT NULL,
    "traveler_category_id" INTEGER NOT NULL,
    "games_id" INTEGER NOT NULL,
    "nso_id" UUID NOT NULL,
    "number_of_team_members" INTEGER NOT NULL DEFAULT 0,
    "days" INTEGER NOT NULL DEFAULT 0,
    "check_in_date" DATE,
    "check_out_date" DATE,
    "travel_cost_in_cents" INTEGER NOT NULL DEFAULT 0,
    "accommodation_cost_in_cents" INTEGER NOT NULL DEFAULT 0,
    "meals_cost_in_cents" INTEGER NOT NULL DEFAULT 0,
    "insurance_cost_in_cents" INTEGER NOT NULL DEFAULT 0,
    "extra_costs_in_cents" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "traveler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traveler_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "traveler_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estimated_cost_items" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "cost_in_cents" INTEGER NOT NULL DEFAULT 0,
    "unit_of_measure" TEXT NOT NULL,
    "notes" TEXT,
    "is_covered_by_COC" BOOLEAN NOT NULL DEFAULT false,
    "traveler_category_id" INTEGER,

    CONSTRAINT "estimated_cost_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversion_rates" (
    "id" SERIAL NOT NULL,
    "from_currency" TEXT NOT NULL,
    "to_currency" TEXT NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversion_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "traveler_games_id_nso_id_idx" ON "traveler"("games_id", "nso_id");

-- CreateIndex
CREATE INDEX "traveler_traveler_category_id_idx" ON "traveler"("traveler_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "traveler_category_name_key" ON "traveler_category"("name");

-- CreateIndex
CREATE INDEX "estimated_cost_items_traveler_category_id_idx" ON "estimated_cost_items"("traveler_category_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversion_rates_from_currency_to_currency_key" ON "conversion_rates"("from_currency", "to_currency");

-- AddForeignKey
ALTER TABLE "traveler" ADD CONSTRAINT "traveler_traveler_category_id_fkey" FOREIGN KEY ("traveler_category_id") REFERENCES "traveler_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler" ADD CONSTRAINT "traveler_games_id_fkey" FOREIGN KEY ("games_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traveler" ADD CONSTRAINT "traveler_nso_id_fkey" FOREIGN KEY ("nso_id") REFERENCES "nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "estimated_cost_items" ADD CONSTRAINT "estimated_cost_items_traveler_category_id_fkey" FOREIGN KEY ("traveler_category_id") REFERENCES "traveler_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
