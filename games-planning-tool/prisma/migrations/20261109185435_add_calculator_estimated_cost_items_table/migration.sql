-- CreateTable
CREATE TABLE "calculator_estimated_cost_items" (
    "id" TEXT NOT NULL,
    "calculator_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit_of_measure" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calculator_estimated_cost_items_pkey" PRIMARY KEY ("id")
);
