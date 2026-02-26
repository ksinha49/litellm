-- CreateTable: LiteLLM_MetadataTable
-- Generic key-value store for internal bookkeeping (migration flags, salt key
-- hash verification, feature toggles, etc.)

CREATE TABLE IF NOT EXISTS "LiteLLM_MetadataTable" (
    "metadata_id"  TEXT         NOT NULL,
    "key"          TEXT         NOT NULL,
    "value"        TEXT         NOT NULL,
    "created_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LiteLLM_MetadataTable_pkey" PRIMARY KEY ("metadata_id")
);

-- Unique index on key so lookups and upserts are O(1)
CREATE UNIQUE INDEX IF NOT EXISTS "LiteLLM_MetadataTable_key_key"
    ON "LiteLLM_MetadataTable" ("key");
