-- CreateTable
CREATE TABLE "nso_contacts" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country_code" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nso_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nso_contacts_role_key" ON "nso_contacts"("role");
