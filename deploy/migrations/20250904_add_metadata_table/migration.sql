-- Migration: Add LiteLLM_MetadataTable
--
-- Introduced in LiteLLM v1.49 (September 2025). Stores arbitrary key/value
-- metadata for the proxy (e.g. feature flags, runtime config).
--
-- litellm_proxy_extras package migrations stop at August 2025 and do not
-- include this table. Apply this script on any database that was provisioned
-- from those packages before running a build that includes v1.49+ schema.
--
-- Idempotent: uses CREATE TABLE IF NOT EXISTS and CREATE INDEX IF NOT EXISTS.

SET search_path TO litellm;

CREATE TABLE IF NOT EXISTS "LiteLLM_MetadataTable" (
    "metadata_id" TEXT        NOT NULL,
    "key"         TEXT        NOT NULL,
    "value"       TEXT        NOT NULL,
    "created_at"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "LiteLLM_MetadataTable_pkey" PRIMARY KEY ("metadata_id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "LiteLLM_MetadataTable_key_key"
    ON "LiteLLM_MetadataTable" ("key");
