-- CreateTable
CREATE TABLE "announcements" (
    "id" UUID NOT NULL,
    "game_nso_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "published_at" DATE NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "announcements_game_nso_id_idx" ON "announcements"("game_nso_id");

-- CreateIndex
CREATE INDEX "tasks_game_nso_id_idx" ON "tasks"("game_nso_id");

-- AddForeignKey
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_game_nso_id_fkey" FOREIGN KEY ("game_nso_id") REFERENCES "game_nsos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
