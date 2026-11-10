-- Additive hotel reference pricing. Amounts are per room, per night.
CREATE TABLE "game_hotels" (
    "id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "game_hotels_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "hotel_rates" (
    "id" UUID NOT NULL,
    "game_hotel_id" UUID NOT NULL,
    "occupancy" VARCHAR(50) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "hotel_rates_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "hotel_rates_amount_nonnegative" CHECK ("amount" >= 0 AND "amount" <> 'NaN'::numeric),
    CONSTRAINT "hotel_rates_occupancy_valid" CHECK ("occupancy" IN ('single', 'double', 'triple'))
);

CREATE INDEX "game_hotels_game_id_idx" ON "game_hotels"("game_id");
CREATE UNIQUE INDEX "hotel_rates_game_hotel_id_occupancy_key" ON "hotel_rates"("game_hotel_id", "occupancy");
ALTER TABLE "game_hotels" ADD CONSTRAINT "game_hotels_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "hotel_rates" ADD CONSTRAINT "hotel_rates_game_hotel_id_fkey" FOREIGN KEY ("game_hotel_id") REFERENCES "game_hotels"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
