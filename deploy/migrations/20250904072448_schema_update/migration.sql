Installing Prisma CLI
-- CreateTable
CREATE TABLE "LiteLLM_MetadataTable" (
    "metadata_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiteLLM_MetadataTable_pkey" PRIMARY KEY ("metadata_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LiteLLM_MetadataTable_key_key" ON "LiteLLM_MetadataTable"("key");

