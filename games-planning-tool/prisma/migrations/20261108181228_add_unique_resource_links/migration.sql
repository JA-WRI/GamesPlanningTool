-- CreateIndex
CREATE UNIQUE INDEX "resources_previous_element_id_key" ON "resources"("previous_element_id");

-- CreateIndex
CREATE UNIQUE INDEX "resources_next_element_id_key" ON "resources"("next_element_id");
