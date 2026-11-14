-- CreateTable
CREATE TABLE "property_clusters" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "property_clusters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "properties" (
    "id" UUID NOT NULL,
    "cluster_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "properties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "occupancy_types" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "capacity" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "occupancy_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "property_prices" (
    "id" UUID NOT NULL,
    "property_id" UUID NOT NULL,
    "occupancy_type_id" UUID NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',

    CONSTRAINT "property_prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_properties" (
    "id" UUID NOT NULL,
    "game_id" INTEGER NOT NULL,
    "property_id" UUID NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "game_properties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "property_clusters_name_key" ON "property_clusters"("name");

-- CreateIndex
CREATE UNIQUE INDEX "properties_cluster_id_name_key" ON "properties"("cluster_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "occupancy_types_code_key" ON "occupancy_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "property_prices_property_id_occupancy_type_id_key" ON "property_prices"("property_id", "occupancy_type_id");

-- CreateIndex
CREATE INDEX "game_properties_property_id_idx" ON "game_properties"("property_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_properties_game_id_property_id_key" ON "game_properties"("game_id", "property_id");

-- AddForeignKey
ALTER TABLE "properties" ADD CONSTRAINT "properties_cluster_id_fkey" FOREIGN KEY ("cluster_id") REFERENCES "property_clusters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_prices" ADD CONSTRAINT "property_prices_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "property_prices" ADD CONSTRAINT "property_prices_occupancy_type_id_fkey" FOREIGN KEY ("occupancy_type_id") REFERENCES "occupancy_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_properties" ADD CONSTRAINT "game_properties_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_properties" ADD CONSTRAINT "game_properties_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
