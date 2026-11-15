-- CreateTable
CREATE TABLE "drafts" (
    "scope_key" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drafts_pkey" PRIMARY KEY ("scope_key")
);

-- CreateIndex
CREATE INDEX "drafts_updated_at_idx" ON "drafts"("updated_at");