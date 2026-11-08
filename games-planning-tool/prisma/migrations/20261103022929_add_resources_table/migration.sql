-- CreateTable
CREATE TABLE "resources" (
    "id" UUID NOT NULL,
    "parent_folder_id" UUID,
    "name" TEXT NOT NULL,
    "file_or_webpage_URL" TEXT,
    "is_webpage" BOOLEAN NOT NULL DEFAULT false,
    "categories" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "previous_element_id" UUID,
    "next_element_id" UUID,

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_parent_folder_id_fkey" FOREIGN KEY ("parent_folder_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_previous_element_id_fkey" FOREIGN KEY ("previous_element_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resources" ADD CONSTRAINT "resources_next_element_id_fkey" FOREIGN KEY ("next_element_id") REFERENCES "resources"("id") ON DELETE SET NULL ON UPDATE CASCADE;
