-- CreateTable
CREATE TABLE "pgtc_disciplines" (
    "id" TEXT NOT NULL,
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
    "state" TEXT,
    "country" TEXT,
    "travel_method" TEXT,
    "point_of_entry" TEXT,
    "additional_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pgtc_disciplines_pkey" PRIMARY KEY ("id")
);
