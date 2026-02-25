#!/usr/bin/env bash
# backup_db.sh — Pre-upgrade logical backup for LiteLLM PostgreSQL (RDS)
#
# Usage:  ./db_scripts/backup_db.sh
# All credentials are prompted interactively; nothing is hardcoded.
#
# Produces four files in BACKUP_DIR:
#   <label>_schema.sql      – DDL / schema-only dump
#   <label>_full.dump       – Full custom-format dump (data + schema, compressed)
#   <label>_critical.sql    – Plain-text dump of critical configuration tables
#   <label>_migrations.sql  – Prisma migration history (_prisma_migrations)
#   <label>_manifest.txt    – Manifest with sizes, checksums, metadata

set -euo pipefail

# ── colour helpers ─────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ── exit trap ──────────────────────────────────────────────────────────────
BACKUP_STATUS="FAILED"
trap '_on_exit' EXIT

_on_exit() {
  unset PGPASSWORD 2>/dev/null || true
  if [[ "$BACKUP_STATUS" == "SUCCESS" ]]; then
    success "Backup completed successfully."
  else
    error "Backup did NOT complete successfully. Partial files (if any) have been left in place for inspection."
    exit 1
  fi
}

# ── helpers ────────────────────────────────────────────────────────────────

# prompt_with_default VAR_NAME "Prompt text" "default value"
prompt_with_default() {
  local var_name="$1"
  local prompt_text="$2"
  local default_val="$3"
  local user_input
  read -r -p "  ${prompt_text} [${default_val}]: " user_input
  printf -v "$var_name" '%s' "${user_input:-$default_val}"
}

# prompt_secret VAR_NAME "Prompt text"
prompt_secret() {
  local var_name="$1"
  local prompt_text="$2"
  local secret_val
  read -r -s -p "  ${prompt_text}: " secret_val
  echo ""  # newline after silent read
  printf -v "$var_name" '%s' "$secret_val"
}

# sha256 of a file, cross-platform
file_sha256() {
  local filepath="$1"
  if command -v sha256sum &>/dev/null; then
    sha256sum "$filepath" | awk '{print $1}'
  elif command -v shasum &>/dev/null; then
    shasum -a 256 "$filepath" | awk '{print $1}'
  else
    echo "unavailable"
  fi
}

# human-readable file size
file_size_human() {
  local filepath="$1"
  if command -v du &>/dev/null; then
    du -sh "$filepath" 2>/dev/null | awk '{print $1}'
  else
    wc -c < "$filepath"
  fi
}

# ── pre-flight checks ──────────────────────────────────────────────────────
check_prereqs() {
  info "Checking prerequisites..."
  local missing=0

  if ! command -v pg_dump &>/dev/null; then
    error "pg_dump not found. Install postgresql-client and ensure it is in PATH."
    missing=1
  else
    success "pg_dump found: $(command -v pg_dump) ($(pg_dump --version | head -1))"
  fi

  if ! command -v pg_restore &>/dev/null; then
    error "pg_restore not found. Install postgresql-client and ensure it is in PATH."
    missing=1
  else
    success "pg_restore found: $(command -v pg_restore)"
  fi

  if ! command -v curl &>/dev/null; then
    warn "curl not found — automatic SSL cert download will be unavailable."
  else
    success "curl found: $(command -v curl)"
  fi

  if [[ $missing -ne 0 ]]; then
    error "Missing required tools. Aborting."
    exit 1
  fi
}

# ── SSL cert ───────────────────────────────────────────────────────────────
ensure_ssl_cert() {
  if [[ -f "$SSL_CERT_PATH" ]]; then
    success "SSL cert found: $SSL_CERT_PATH"
    return 0
  fi

  warn "SSL cert not found at: $SSL_CERT_PATH"

  if ! command -v curl &>/dev/null; then
    error "curl is unavailable; cannot download cert automatically."
    error "Provide the AWS RDS global bundle at $SSL_CERT_PATH and re-run."
    exit 1
  fi

  local download_url="https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem"
  local answer
  read -r -p "  Download AWS RDS global bundle from ${download_url}? [y/N]: " answer
  if [[ ! "${answer,,}" =~ ^y ]]; then
    error "SSL cert is required. Aborting."
    exit 1
  fi

  local cert_dir
  cert_dir="$(dirname "$SSL_CERT_PATH")"
  if [[ ! -d "$cert_dir" ]]; then
    info "Creating cert directory: $cert_dir"
    mkdir -p "$cert_dir"
  fi

  info "Downloading RDS global bundle..."
  local curl_opts=(-fsSL --output "$SSL_CERT_PATH")
  # Use Ameritas proxy if set in environment
  if [[ -n "${HTTPS_PROXY:-}" ]]; then
    curl_opts+=(--proxy "$HTTPS_PROXY")
    info "  Using proxy: $HTTPS_PROXY"
  elif [[ -n "${HTTP_PROXY:-}" ]]; then
    curl_opts+=(--proxy "$HTTP_PROXY")
    info "  Using proxy: $HTTP_PROXY"
  fi

  if curl "${curl_opts[@]}" "$download_url"; then
    success "SSL cert downloaded to $SSL_CERT_PATH"
  else
    error "curl download failed. Download manually:"
    error "  $download_url"
    exit 1
  fi
}

# ── credential collection ──────────────────────────────────────────────────
collect_credentials() {
  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  LiteLLM Pre-Upgrade Database Backup — Credential Setup  ${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo ""

  prompt_with_default DB_HOST     "DB host"           "aio-llm-litellm-db2.cfko4wc6k724.us-east-2.rds.amazonaws.com"
  prompt_with_default DB_PORT     "DB port"           "5432"
  prompt_with_default DB_NAME     "DB name"           "litellmdb"
  prompt_with_default DB_SCHEMA   "DB schema"         "litellm"
  prompt_with_default DB_USER     "DB user"           "ameritasadmin"
  prompt_secret       DB_PASSWORD "DB password (hidden)"
  prompt_with_default SSL_CERT_PATH "SSL cert path"   "/certs/global-bundle.pem"
  prompt_with_default BACKUP_DIR  "Backup directory"  "/opt/liteLLM/backups"
  prompt_with_default BACKUP_LABEL "Backup label"     "pre_upgrade_v1.81.13"
}

# ── confirmation ───────────────────────────────────────────────────────────
confirm_proceed() {
  echo ""
  echo -e "${CYAN}─── Connection Summary ──────────────────────────────────────${NC}"
  echo "  Host:        $DB_HOST"
  echo "  Port:        $DB_PORT"
  echo "  Database:    $DB_NAME"
  echo "  Schema:      $DB_SCHEMA"
  echo "  User:        $DB_USER"
  echo "  SSL cert:    $SSL_CERT_PATH"
  echo "  Backup dir:  $BACKUP_DIR"
  echo "  Label:       $BACKUP_LABEL"
  echo ""
  echo "  Output files (will be created/overwritten):"
  echo "    ${BACKUP_DIR}/${BACKUP_LABEL}_schema.sql"
  echo "    ${BACKUP_DIR}/${BACKUP_LABEL}_full.dump"
  echo "    ${BACKUP_DIR}/${BACKUP_LABEL}_critical.sql"
  echo "    ${BACKUP_DIR}/${BACKUP_LABEL}_migrations.sql"
  echo "    ${BACKUP_DIR}/${BACKUP_LABEL}_manifest.txt"
  echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
  echo ""

  local answer
  read -r -p "Proceed with backup? [y/N]: " answer
  if [[ ! "${answer,,}" =~ ^y ]]; then
    info "Backup aborted by user."
    BACKUP_STATUS="SUCCESS"  # not a failure — intentional abort
    exit 0
  fi
}

# ── pg_dump base args ──────────────────────────────────────────────────────
# Builds the common pg_dump arguments as an array.
# PGPASSWORD must already be exported before calling any pg_dump.
pg_dump_base_args() {
  echo -n ""  # dummy; we build args array inline in callers
}

# Common connection flags (array, to avoid word-splitting issues)
_pg_conn_args() {
  local args=(
    --host="$DB_HOST"
    --port="$DB_PORT"
    --username="$DB_USER"
    --dbname="$DB_NAME"
    --no-password
  )
  if [[ -f "$SSL_CERT_PATH" ]]; then
    # Pass SSL options via PGSSLMODE / PGSSLROOTCERT env vars (already exported)
    : # handled via env vars set in main()
  fi
  printf '%s\n' "${args[@]}"
}

# ── backup steps ───────────────────────────────────────────────────────────

run_schema_dump() {
  local outfile="${BACKUP_DIR}/${BACKUP_LABEL}_schema.sql"
  info "Step 1/4 — Schema-only dump → $(basename "$outfile")"

  mapfile -t conn_args < <(_pg_conn_args)

  pg_dump \
    "${conn_args[@]}" \
    --schema-only \
    --schema="$DB_SCHEMA" \
    --file="$outfile"

  success "Schema dump complete ($(file_size_human "$outfile"))"
}

run_full_dump() {
  local outfile="${BACKUP_DIR}/${BACKUP_LABEL}_full.dump"
  info "Step 2/4 — Full custom-format dump → $(basename "$outfile")"

  mapfile -t conn_args < <(_pg_conn_args)

  pg_dump \
    "${conn_args[@]}" \
    --schema="$DB_SCHEMA" \
    --format=custom \
    --compress=9 \
    --file="$outfile"

  success "Full dump complete ($(file_size_human "$outfile"))"
}

run_critical_tables_dump() {
  local outfile="${BACKUP_DIR}/${BACKUP_LABEL}_critical.sql"
  info "Step 3/4 — Critical tables plain-text dump → $(basename "$outfile")"

  # Tables that must survive the upgrade
  local critical_tables=(
    "LiteLLM_VerificationToken"
    "LiteLLM_UserTable"
    "LiteLLM_TeamTable"
    "LiteLLM_ProxyModelTable"
    "LiteLLM_Config"
    "LiteLLM_OrganizationTable"
    "LiteLLM_BudgetTable"
    "LiteLLM_GuardrailsTable"
  )

  mapfile -t conn_args < <(_pg_conn_args)

  # Build --table flags (fully qualified with schema)
  local table_args=()
  for tbl in "${critical_tables[@]}"; do
    table_args+=(--table="${DB_SCHEMA}.${tbl}")
  done

  pg_dump \
    "${conn_args[@]}" \
    --schema="$DB_SCHEMA" \
    --format=plain \
    "${table_args[@]}" \
    --file="$outfile"

  success "Critical tables dump complete ($(file_size_human "$outfile"))"
}

run_migrations_dump() {
  local outfile="${BACKUP_DIR}/${BACKUP_LABEL}_migrations.sql"
  info "Step 4/4 — Prisma migration history dump → $(basename "$outfile")"

  mapfile -t conn_args < <(_pg_conn_args)

  # _prisma_migrations lives in the public schema by default in Prisma
  pg_dump \
    "${conn_args[@]}" \
    --format=plain \
    --table="public._prisma_migrations" \
    --file="$outfile"

  success "Migration history dump complete ($(file_size_human "$outfile"))"
}

# ── post-backup verification & manifest ───────────────────────────────────

verify_and_manifest() {
  local manifest="${BACKUP_DIR}/${BACKUP_LABEL}_manifest.txt"
  local full_dump="${BACKUP_DIR}/${BACKUP_LABEL}_full.dump"

  echo ""
  info "Verifying backup files..."

  local files=(
    "${BACKUP_DIR}/${BACKUP_LABEL}_schema.sql"
    "${BACKUP_DIR}/${BACKUP_LABEL}_full.dump"
    "${BACKUP_DIR}/${BACKUP_LABEL}_critical.sql"
    "${BACKUP_DIR}/${BACKUP_LABEL}_migrations.sql"
  )

  # Verify the custom-format dump is valid
  info "Validating full dump with pg_restore --list ..."
  if pg_restore --list "$full_dump" > /dev/null; then
    success "pg_restore --list: dump file is valid"
  else
    error "pg_restore --list failed — dump may be corrupt!"
    exit 1
  fi

  # Build manifest
  {
    echo "# LiteLLM Pre-Upgrade Database Backup Manifest"
    echo "# Generated: $(date -u '+%Y-%m-%dT%H:%M:%SZ')"
    echo ""
    echo "host:       $DB_HOST"
    echo "port:       $DB_PORT"
    echo "database:   $DB_NAME"
    echo "schema:     $DB_SCHEMA"
    echo "user:       $DB_USER"
    echo "label:      $BACKUP_LABEL"
    echo "pg_dump:    $(pg_dump --version | head -1)"
    echo ""
    echo "# Files"
    printf '%-60s  %8s  %s\n' "filename" "size" "sha256"
    printf '%-60s  %8s  %s\n' "--------" "----" "------"
    for f in "${files[@]}"; do
      if [[ -f "$f" ]]; then
        local size checksum
        size="$(file_size_human "$f")"
        checksum="$(file_sha256 "$f")"
        printf '%-60s  %8s  %s\n' "$(basename "$f")" "$size" "$checksum"
      else
        printf '%-60s  %8s  %s\n' "$(basename "$f")" "MISSING" "N/A"
      fi
    done
  } > "$manifest"

  echo ""
  echo -e "${CYAN}─── Backup File Summary ─────────────────────────────────────${NC}"
  for f in "${files[@]}"; do
    if [[ -f "$f" ]]; then
      echo "  $(file_size_human "$f")   $(basename "$f")"
      echo "    sha256: $(file_sha256 "$f")"
    else
      echo -e "  ${RED}MISSING${NC}   $(basename "$f")"
    fi
  done
  echo "  Manifest: $(basename "$manifest")"
  echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
}

# ── main ───────────────────────────────────────────────────────────────────
main() {
  check_prereqs
  collect_credentials
  ensure_ssl_cert
  confirm_proceed

  info "Creating backup directory: $BACKUP_DIR"
  mkdir -p "$BACKUP_DIR"

  # Export credentials for libpq
  export PGPASSWORD="$DB_PASSWORD"
  export PGSSLMODE="verify-full"
  export PGSSLROOTCERT="$SSL_CERT_PATH"

  # Unset password on any exit path
  trap 'unset PGPASSWORD PGSSLMODE PGSSLROOTCERT 2>/dev/null || true; _on_exit' EXIT

  echo ""
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}  Starting backup — $(date '+%Y-%m-%d %H:%M:%S')           ${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════${NC}"

  run_schema_dump
  run_full_dump
  run_critical_tables_dump
  run_migrations_dump
  verify_and_manifest

  echo ""
  success "All backup files written to: $BACKUP_DIR"

  BACKUP_STATUS="SUCCESS"
}

main "$@"
