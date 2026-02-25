#!/usr/bin/env bash
# deploy-02252026.sh — Release deploy script for LiteLLM v1.81.13 (2026-02-25)
#
# This is a ONE-TIME release wrapper around deploy.sh.
# It runs every step required for this specific upgrade in the correct order:
#
#   PHASE 1 — Pre-deploy:  PostgreSQL backup (backup_db.sh)
#   PHASE 2 — Deploy:      Build UI + Docker image + start containers (deploy.sh)
#   PHASE 3 — Post-deploy: DB migrations specific to this release
#               3a. Create / verify all required DB views  (docker exec python3)
#               3b. Fix view definitions + reconcile spend  (psql)
#   PHASE 4 — Manual step instructions: team budget migration
#
# What is NOT automated here (and why):
#   • migrate_to_team_budgets.sql Phase 2 — clears per-key budgets.
#     Requires human review of Phase 1 diagnostic output AND team/user budgets
#     to be set via the API before running.  Instructions are printed at the end.
#   • reconcile_spend.sql — nightly cron job, not a deploy step.
#   • spend_diagnostic.sql — read-only audit; run manually when needed.
#
# Usage:
#   ./deploy-02252026.sh [deploy.sh options]
#
#   Any unrecognised flags are forwarded to deploy.sh.
#   Example — skip UI build (Python-only changes already built):
#     ./deploy-02252026.sh --skip-ui-build
#
# Credentials:
#   Same source as deploy.sh: shell env → .env.deploy → interactive prompt.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RELEASE_DATE="2026-02-25"
RELEASE_VERSION="v1.81.13"

# ── colour / logging helpers ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
phase()   {
  echo ""
  echo -e "${CYAN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
  echo -e "${CYAN}${BOLD}║  $*${NC}"
  echo -e "${CYAN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"
}
step()    { echo -e "\n${CYAN}${BOLD}── $* ──${NC}"; }

# ── track which post-deploy steps succeeded ───────────────────────────────────
VIEWS_OK=false
FIX_SQL_OK=false
PSQL_AVAILABLE=false

# ── load .env.deploy (same source as deploy.sh) ───────────────────────────────
ENV_FILE="${REPO_ROOT}/.env.deploy"
if [[ -f "$ENV_FILE" ]]; then
  info "Loading .env.deploy"
  set -a; source "$ENV_FILE"; set +a
fi

# ── prompt helpers (same pattern as deploy.sh / backup_db.sh) ─────────────────
prompt_default() {
  local var="$1" label="$2" default="$3" input
  [[ -n "${!var:-}" ]] && return
  read -r -p "  ${label} [${default}]: " input
  printf -v "$var" '%s' "${input:-$default}"
}
prompt_secret() {
  local var="$1" label="$2" val
  [[ -n "${!var:-}" ]] && return
  read -r -s -p "  ${label}: " val; echo ""
  printf -v "$var" '%s' "$val"
}

# ── collect credentials (only prompts for what is not already set) ────────────
collect_credentials() {
  phase "Credential Setup"
  echo ""

  echo -e "  ${BOLD}Container / Image${NC}"
  prompt_default IMAGE_TAG            "Docker image tag"             "litellm-local"
  prompt_default LITELLM_CONTAINER    "LiteLLM container name"       "litellm"
  prompt_default PROMETHEUS_CONTAINER "Prometheus container name"    "litellm-prometheus-1"
  prompt_default DOCKER_NETWORK       "Docker bridge network"        "litellm-net"
  prompt_default HOST_PORT            "Host port → container 4000"   "8080"
  prompt_default PROMETHEUS_PORT      "Prometheus host port"         "9090"
  prompt_default APP_NAME             "UI display name"              "Ameritas LiteLLM"
  prompt_default CONFIG_PATH          "litellm_config.yaml path"     "${REPO_ROOT}/litellm_config.yaml"
  prompt_default PROMETHEUS_CONFIG    "prometheus.yml path"          "${REPO_ROOT}/prometheus.yml"
  prompt_default HTTP_PROXY_URL       "HTTP/HTTPS proxy"             "http://proxy.ameritas.com:8080"
  prompt_default NO_PROXY_LIST        "NO_PROXY list"                "localhost,127.0.0.1,registry-1.docker.io"

  echo ""
  echo -e "  ${BOLD}Database${NC}"
  prompt_default DB_HOST   "DB host"   "aio-llm-litellm-db2.cfko4wc6k724.us-east-2.rds.amazonaws.com"
  prompt_default DB_PORT   "DB port"   "5432"
  prompt_default DB_NAME   "DB name"   "litellmdb"
  prompt_default DB_SCHEMA "DB schema" "litellm"
  prompt_default DB_USER   "DB user"   "ameritasadmin"
  prompt_secret  DB_PASSWORD "DB password (hidden)"

  echo ""
  echo -e "  ${BOLD}LiteLLM secrets${NC}"
  prompt_secret LITELLM_MASTER_KEY "LITELLM_MASTER_KEY (hidden)"
  prompt_secret LITELLM_SALT_KEY   "LITELLM_SALT_KEY   (hidden)"

  echo ""
  echo -e "  ${BOLD}Backup${NC}"
  prompt_default SSL_CERT_PATH  "SSL cert path (for psql + backup)" "/certs/global-bundle.pem"
  prompt_default BACKUP_DIR     "Backup directory"                  "/opt/liteLLM/backups"
  prompt_default BACKUP_LABEL   "Backup label"                      "pre_v1.81.13_$(date +%Y%m%d)"
}

# ── build DATABASE_URL ────────────────────────────────────────────────────────
build_database_url() {
  local encoded_pw
  encoded_pw="$(python3 -c \
    "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" \
    "$DB_PASSWORD" 2>/dev/null || printf '%s' "$DB_PASSWORD")"
  DATABASE_URL="postgresql://${DB_USER}:${encoded_pw}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"
}

# ── confirmation ──────────────────────────────────────────────────────────────
confirm_proceed() {
  local git_branch git_sha
  git_branch="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
  git_sha="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"

  echo ""
  echo -e "${CYAN}─── Release Deploy Plan ─────────────────────────────────────${NC}"
  printf "  %-26s %s\n" "Release:"              "${RELEASE_VERSION} (${RELEASE_DATE})"
  printf "  %-26s %s\n" "Git branch / commit:"  "${git_branch} / ${git_sha}"
  printf "  %-26s %s\n" "Image tag:"            "${IMAGE_TAG}"
  printf "  %-26s %s\n" "LiteLLM container:"    "${LITELLM_CONTAINER}"
  printf "  %-26s %s\n" "DB:"                   "${DB_HOST}:${DB_PORT}/${DB_NAME}"
  printf "  %-26s %s\n" "Backup dir:"           "${BACKUP_DIR}/${BACKUP_LABEL}_*"
  printf "  %-26s %s\n" "SSL cert:"             "${SSL_CERT_PATH}"
  printf "  %-26s %s\n" ""                      ""
  printf "  %-26s %s\n" "Steps:"                ""
  printf "  %-26s %s\n" "  1. Pre-deploy backup"   "backup_db.sh"
  printf "  %-26s %s\n" "  2. Deploy"              "deploy.sh ${DEPLOY_FLAGS[*]:-<no extra flags>}"
  printf "  %-26s %s\n" "  3a. Create/verify views" "docker exec python3 create_views.py"
  printf "  %-26s %s\n" "  3b. Fix discrepancies"   "psql -f fix_discrepancies.sql"
  printf "  %-26s %s\n" "  4. Manual instructions"  "team budget migration (printed at end)"
  echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"
  echo ""
  local answer
  read -r -p "Proceed with full release deploy? [y/N]: " answer
  [[ "${answer,,}" =~ ^y ]] || { info "Aborted."; exit 0; }
}

# ── PHASE 1: pre-deploy backup ────────────────────────────────────────────────
run_backup() {
  phase "Phase 1 of 4 — Pre-Deploy Database Backup"

  local backup_script="${REPO_ROOT}/db_scripts/backup_db.sh"
  if [[ ! -x "$backup_script" ]]; then
    error "backup_db.sh not found or not executable: ${backup_script}"
    error "Aborting — backup is required before proceeding."
    exit 1
  fi

  info "Calling backup_db.sh (credentials pre-loaded from .env.deploy)"

  # Export the variable names that backup_db.sh's prompt_with_default() checks.
  # Because they are already set, backup_db.sh will skip all interactive prompts
  # for these fields.
  export DB_HOST DB_PORT DB_NAME DB_SCHEMA DB_USER DB_PASSWORD
  export SSL_CERT_PATH BACKUP_DIR BACKUP_LABEL
  # PGPASSWORD is set inside backup_db.sh itself; no need to export here.

  bash "$backup_script"

  success "Backup complete."
}

# ── PHASE 2: container deploy ─────────────────────────────────────────────────
run_deploy() {
  phase "Phase 2 of 4 — Container Deploy"

  local deploy_script="${REPO_ROOT}/deploy.sh"
  if [[ ! -x "$deploy_script" ]]; then
    error "deploy.sh not found or not executable: ${deploy_script}"
    exit 1
  fi

  # Export all variables that deploy.sh reads so it skips its own prompts.
  # deploy.sh uses the same source → prompt chain; exported vars satisfy it.
  export IMAGE_TAG LITELLM_CONTAINER PROMETHEUS_CONTAINER DOCKER_NETWORK
  export HOST_PORT PROMETHEUS_PORT APP_NAME CONFIG_PATH PROMETHEUS_CONFIG
  export HTTP_PROXY_URL NO_PROXY_LIST
  export DB_HOST DB_PORT DB_NAME DB_SCHEMA DB_USER DB_PASSWORD
  export LITELLM_MASTER_KEY LITELLM_SALT_KEY

  # Run deploy.sh non-interactively (--yes) plus any extra flags passed to us.
  bash "$deploy_script" --yes "${DEPLOY_FLAGS[@]:-}"

  success "Container deploy complete."
}

# ── PHASE 3a: create / verify DB views ────────────────────────────────────────
run_create_views() {
  step "Phase 3a — Create / Verify DB Views"

  # create_views.py lives at /app/db_scripts/create_views.py inside the container
  # (Dockerfile does COPY . . so all repo files are present under /app/).
  # Run it with docker exec so prisma and all Python deps are already installed.

  build_database_url

  if ! docker inspect "${LITELLM_CONTAINER}" &>/dev/null; then
    warn "Container '${LITELLM_CONTAINER}' not found — skipping view creation."
    warn "Run manually after the container is up:"
    warn "  docker exec -e DATABASE_URL='...' ${LITELLM_CONTAINER} python3 /app/db_scripts/create_views.py"
    return
  fi

  info "Running create_views.py inside container '${LITELLM_CONTAINER}'..."
  docker exec \
    -e DATABASE_URL="${DATABASE_URL}" \
    "${LITELLM_CONTAINER}" \
    python3 /app/db_scripts/create_views.py

  VIEWS_OK=true
  success "DB views created / verified."
}

# ── psql connection helper ────────────────────────────────────────────────────
_psql_run() {
  local sql_file="$1"
  local ssl_opts=""

  if [[ -f "$SSL_CERT_PATH" ]]; then
    ssl_opts="sslmode=verify-full sslrootcert=${SSL_CERT_PATH}"
  else
    warn "SSL cert not found at ${SSL_CERT_PATH} — connecting without SSL verification."
    ssl_opts="sslmode=require"
  fi

  PGPASSWORD="$DB_PASSWORD" psql \
    "host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} ${ssl_opts}" \
    -v ON_ERROR_STOP=1 \
    -f "$sql_file"
}

# ── PHASE 3b: fix discrepancies ───────────────────────────────────────────────
run_fix_discrepancies() {
  step "Phase 3b — Fix View Definitions + Reconcile Spend"

  local sql_file="${REPO_ROOT}/db_scripts/fix_discrepancies.sql"

  if ! command -v psql &>/dev/null; then
    PSQL_AVAILABLE=false
    warn "psql not found in PATH — skipping automated SQL step."
    warn "Run manually:"
    warn "  PGPASSWORD='<pw>' psql \"host=${DB_HOST} dbname=${DB_NAME} user=${DB_USER} sslmode=verify-full sslrootcert=${SSL_CERT_PATH}\" -f db_scripts/fix_discrepancies.sql"
    return
  fi

  PSQL_AVAILABLE=true
  info "Running fix_discrepancies.sql..."
  _psql_run "$sql_file"

  FIX_SQL_OK=true
  success "fix_discrepancies.sql applied."
}

# ── PHASE 4: manual step instructions ─────────────────────────────────────────
print_manual_steps() {
  phase "Phase 4 of 4 — Manual Steps (action required)"

  echo ""
  echo -e "${YELLOW}${BOLD}  Team Budget Migration (migrate_to_team_budgets.sql)${NC}"
  echo -e "${YELLOW}  ─────────────────────────────────────────────────────${NC}"
  echo "  This script has two phases that must be run with human review between them."
  echo ""
  echo -e "  ${BOLD}Step A — Run Phase 1 diagnostic (read-only):${NC}"
  echo "    PGPASSWORD='<pw>' psql \\"
  echo "      \"host=${DB_HOST} port=${DB_PORT} dbname=${DB_NAME} user=${DB_USER} sslmode=verify-full sslrootcert=${SSL_CERT_PATH}\" \\"
  echo "      -f db_scripts/migrate_to_team_budgets.sql"
  echo ""
  echo -e "  ${BOLD}Step B — Review the output:${NC}"
  echo "    • Identify keys that still have per-key max_budget set (query 1a)"
  echo "    • Confirm team-level budgets are configured via the admin API/UI:"
  echo "        POST /team/update  { \"team_id\": \"...\", \"max_budget\": <n>, \"budget_duration\": \"30d\" }"
  echo "        POST /user/update  { \"user_id\": \"...\", \"max_budget\": <n>, \"budget_duration\": \"30d\" }"
  echo ""
  echo -e "  ${BOLD}Step C — Once team/user budgets are set, run Phase 2 to clear per-key budgets:${NC}"
  echo "    The COMMIT at the end of the file applies the UPDATE automatically."
  echo "    Re-run the same psql command from Step A — Phase 2 is inside a"
  echo "    BEGIN/COMMIT block at the bottom of the file."
  echo ""
}

# ── deployment summary ─────────────────────────────────────────────────────────
print_summary() {
  echo ""
  echo -e "${GREEN}${BOLD}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}${BOLD}║  Release Deploy Complete — $(date '+%Y-%m-%d %H:%M:%S')       ║${NC}"
  echo -e "${GREEN}${BOLD}║  ${RELEASE_VERSION}                                              ║${NC}"
  echo -e "${GREEN}${BOLD}╚════════════════════════════════════════════════════════════╝${NC}"
  echo ""
  printf "  %-32s %s\n" "1. Pre-deploy backup:"      "✓ complete — ${BACKUP_DIR}/${BACKUP_LABEL}_*"
  printf "  %-32s %s\n" "2. Container deploy:"        "✓ complete"
  printf "  %-32s %s\n" "3a. DB views:"               "$( [[ "$VIEWS_OK"   == true ]] && echo "✓ complete" || echo "⚠ skipped — run manually (see Phase 3a)" )"
  printf "  %-32s %s\n" "3b. Fix discrepancies SQL:"  "$( [[ "$FIX_SQL_OK" == true ]] && echo "✓ complete" || echo "⚠ skipped — psql not found (see Phase 3b)" )"
  printf "  %-32s %s\n" "4. Team budget migration:"   "⚠ manual — review instructions above"
  echo ""
  echo -e "  LiteLLM UI:   ${BOLD}http://localhost:${HOST_PORT}${NC}"
  echo -e "  Prometheus:   ${BOLD}http://localhost:${PROMETHEUS_PORT}${NC}"
  echo ""
  echo -e "  Tail logs:"
  echo -e "    docker logs -f ${LITELLM_CONTAINER}"
  echo -e "    docker logs -f ${PROMETHEUS_CONTAINER}"
  echo ""
}

# ── main ──────────────────────────────────────────────────────────────────────
# Separate any flags destined for deploy.sh from our own args.
DEPLOY_FLAGS=()
for arg in "$@"; do
  case "$arg" in
    --skip-ui-build|--skip-docker-build) DEPLOY_FLAGS+=("$arg") ;;
    --help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed -n '2,25p'
      exit 0
      ;;
    *)
      error "Unknown flag: $arg"
      echo "Run '$0 --help' for usage."
      exit 1
      ;;
  esac
done

echo ""
echo -e "${CYAN}${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}${BOLD}║  LiteLLM Release Deploy                                   ║${NC}"
echo -e "${CYAN}${BOLD}║  ${RELEASE_VERSION}  •  ${RELEASE_DATE}                           ║${NC}"
echo -e "${CYAN}${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}"

collect_credentials
confirm_proceed

run_backup
run_deploy
run_create_views
run_fix_discrepancies
print_manual_steps
print_summary
