#!/usr/bin/env bash
# deploy.sh — Build and deploy LiteLLM + Prometheus containers
#
# Usage:
#   ./deploy.sh [options]
#
# Options:
#   --skip-ui-build       Skip the npm / Next.js UI build (use when only Python changed)
#   --skip-docker-build   Skip docker build (re-deploy the existing image tag)
#   --no-cache            Pass --no-cache to docker build (clean build, no layer cache)
#   --yes                 Non-interactive: skip all confirmation prompts
#   --help                Show this help and exit
#
# Credential loading (in priority order, highest first):
#   1. Shell environment variables already exported
#   2. .env.deploy file in the repo root (copy from .env.deploy.example to get started)
#   3. Interactive prompt for anything still unset
#
# Quick start:
#   cp .env.deploy.example .env.deploy   # fill in secrets — never commit this file
#   ./deploy.sh

set -euo pipefail

# ── directory of this script (repo root) ─────────────────────────────────────
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# ── colour / logging helpers ──────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'
info()    { echo -e "${CYAN}[INFO]${NC}  $*"; }
success() { echo -e "${GREEN}[OK]${NC}    $*"; }
warn()    { echo -e "${YELLOW}[WARN]${NC}  $*"; }
error()   { echo -e "${RED}[ERROR]${NC} $*" >&2; }
step()    { echo -e "\n${CYAN}${BOLD}── $* ──${NC}"; }
header()  {
  echo -e "\n${CYAN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
  echo -e   "${CYAN}${BOLD}  $*${NC}"
  echo -e   "${CYAN}${BOLD}═══════════════════════════════════════════════════════════${NC}"
}

# ── parse flags ───────────────────────────────────────────────────────────────
SKIP_UI_BUILD=false
SKIP_DOCKER_BUILD=false
NO_CACHE=false
AUTO_YES=false

for arg in "$@"; do
  case "$arg" in
    --skip-ui-build)     SKIP_UI_BUILD=true ;;
    --skip-docker-build) SKIP_DOCKER_BUILD=true ;;
    --no-cache)          NO_CACHE=true ;;
    --yes)               AUTO_YES=true ;;
    --help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//' | sed -n '2,17p'
      exit 0
      ;;
    *)
      error "Unknown option: $arg  (run '$0 --help' for usage)"
      exit 1
      ;;
  esac
done

# ── load .env.deploy (lowest priority — env vars already set take precedence) ─
ENV_FILE="${REPO_ROOT}/.env.deploy"
if [[ -f "$ENV_FILE" ]]; then
  info "Loading .env.deploy"
  # set -a exports every variable defined by source; set +a turns export off again
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# ── prompt helpers ────────────────────────────────────────────────────────────
# Skip prompt if the variable is already set (env var or .env.deploy)
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

# ── collect all parameters ────────────────────────────────────────────────────
collect_params() {
  header "LiteLLM Deployment — Parameter Setup"

  echo -e "\n  ${BOLD}Container / Image${NC}"
  prompt_default IMAGE_TAG            "Docker image tag"              "litellm-local"
  prompt_default LITELLM_CONTAINER    "LiteLLM container name"        "litellm"
  prompt_default PROMETHEUS_CONTAINER "Prometheus container name"     "litellm-prometheus-1"
  prompt_default DOCKER_NETWORK       "Docker bridge network"         "litellm-net"
  prompt_default HOST_PORT            "Host port → container 4000"    "8080"
  prompt_default PROMETHEUS_PORT      "Prometheus host port"          "9090"

  echo -e "\n  ${BOLD}Application${NC}"
  prompt_default APP_NAME          "UI display name"                "Ameritas LiteLLM"
  prompt_default PROXY_BASE_URL    "Proxy base URL"                 "https://api.ai.inbison.com"
  prompt_default CONFIG_PATH       "litellm_config.yaml path"       "${REPO_ROOT}/litellm_config.yaml"
  prompt_default PROMETHEUS_CONFIG "prometheus.yml path"            "${REPO_ROOT}/prometheus.yml"

  echo -e "\n  ${BOLD}Corporate proxy${NC}"
  prompt_default HTTP_PROXY_URL  "HTTP/HTTPS proxy"  "http://proxy.ameritas.com:8080"
  prompt_default NO_PROXY_LIST   "NO_PROXY list"     "localhost,127.0.0.1,registry-1.docker.io"

  echo -e "\n  ${BOLD}Database${NC}"
  if [[ -n "${DATABASE_URL:-}" ]]; then
    info "DATABASE_URL already set — skipping individual DB component prompts."
  else
    prompt_default DB_HOST   "DB host"   "aio-llm-litellm-db2.cfko4wc6k724.us-east-2.rds.amazonaws.com"
    prompt_default DB_PORT   "DB port"   "5432"
    prompt_default DB_NAME   "DB name"   "litellmdb"
    prompt_default DB_SCHEMA "DB schema" "litellm"
    prompt_default DB_USER   "DB user"   "ameritasadmin"
    prompt_secret  DB_PASSWORD "DB password (hidden)"
  fi

  echo -e "\n  ${BOLD}LiteLLM secrets${NC}"
  prompt_secret LITELLM_MASTER_KEY "LITELLM_MASTER_KEY (hidden)"
  prompt_secret LITELLM_SALT_KEY   "LITELLM_SALT_KEY   (hidden)"
}

# ── construct DATABASE_URL ────────────────────────────────────────────────────
build_database_url() {
  # If DATABASE_URL is already fully specified, use it as-is
  if [[ -n "${DATABASE_URL:-}" && -z "${DB_HOST:-}" ]]; then
    info "Using pre-built DATABASE_URL from environment."
    return
  fi
  # percent-encode the password so special characters (@, $, etc.) are safe in the URL
  local encoded_pw
  encoded_pw="$(python3 -c \
    "import urllib.parse, sys; print(urllib.parse.quote(sys.argv[1], safe=''))" \
    "$DB_PASSWORD" 2>/dev/null || printf '%s' "$DB_PASSWORD")"
  DATABASE_URL="postgresql://${DB_USER}:${encoded_pw}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=${DB_SCHEMA}"
}

# ── pre-flight checks ─────────────────────────────────────────────────────────
check_prereqs() {
  step "Pre-flight checks"
  local fail=0

  # Docker daemon must be reachable
  if ! docker info &>/dev/null; then
    error "Docker daemon is not running or not accessible."
    fail=1
  else
    success "Docker: $(docker version --format '{{.Server.Version}}' 2>/dev/null || echo ok)"
  fi

  # Config files must exist
  if [[ ! -f "$CONFIG_PATH" ]]; then
    error "litellm_config.yaml not found: ${CONFIG_PATH}"
    fail=1
  else
    success "Config:  ${CONFIG_PATH}"
  fi

  if [[ ! -f "$PROMETHEUS_CONFIG" ]]; then
    error "prometheus.yml not found: ${PROMETHEUS_CONFIG}"
    fail=1
  else
    success "Prometheus config: ${PROMETHEUS_CONFIG}"
  fi

  # UI build prerequisites (only when not skipped)
  if [[ "$SKIP_UI_BUILD" == "false" ]]; then
    if [[ ! -f "${REPO_ROOT}/ui/litellm-dashboard/package.json" ]]; then
      error "ui/litellm-dashboard/package.json not found."
      fail=1
    fi
    if [[ ! -f "${REPO_ROOT}/ui/litellm-dashboard/build_ui.sh" ]]; then
      error "ui/litellm-dashboard/build_ui.sh not found."
      fail=1
    fi
  fi

  if [[ $fail -ne 0 ]]; then error "Pre-flight failed — aborting."; exit 1; fi
}

# ── git info (informational only) ─────────────────────────────────────────────
git_info() {
  if command -v git &>/dev/null && git -C "$REPO_ROOT" rev-parse --git-dir &>/dev/null; then
    GIT_BRANCH="$(git -C "$REPO_ROOT" rev-parse --abbrev-ref HEAD 2>/dev/null || echo unknown)"
    GIT_SHA="$(git -C "$REPO_ROOT" rev-parse --short HEAD 2>/dev/null || echo unknown)"
  else
    GIT_BRANCH="unknown"; GIT_SHA="unknown"
  fi
}

# ── confirmation summary ──────────────────────────────────────────────────────
confirm_proceed() {
  git_info

  echo ""
  echo -e "${CYAN}─── Deployment Summary ──────────────────────────────────────${NC}"
  printf "  %-24s %s\n" "Git branch:"            "${GIT_BRANCH}"
  printf "  %-24s %s\n" "Git commit:"            "${GIT_SHA}"
  printf "  %-24s %s\n" "Image tag:"             "${IMAGE_TAG}"
  printf "  %-24s %s\n" "LiteLLM container:"     "${LITELLM_CONTAINER}"
  printf "  %-24s %s\n" "Prometheus container:"  "${PROMETHEUS_CONTAINER}"
  printf "  %-24s %s\n" "Docker network:"        "${DOCKER_NETWORK}"
  printf "  %-24s %s\n" "Host → container:"      "${HOST_PORT} → 4000"
  printf "  %-24s %s\n" "Prometheus port:"       "${PROMETHEUS_PORT} → 9090"
  printf "  %-24s %s\n" "App name:"              "${APP_NAME}"
  printf "  %-24s %s\n" "Proxy base URL:"        "${PROXY_BASE_URL}"
  if [[ -n "${DB_HOST:-}" ]]; then
    printf "  %-24s %s\n" "DB host:"             "${DB_HOST}:${DB_PORT}/${DB_NAME} (schema: ${DB_SCHEMA})"
    printf "  %-24s %s\n" "DB user:"             "${DB_USER}"
    printf "  %-24s %s\n" "DB password:"         "****"
  else
    printf "  %-24s %s\n" "DATABASE_URL:"        "(pre-built — credentials redacted)"
  fi
  printf "  %-24s %s\n" "LITELLM_MASTER_KEY:"    "****"
  printf "  %-24s %s\n" "LITELLM_SALT_KEY:"      "****"
  printf "  %-24s %s\n" "HTTP proxy:"            "${HTTP_PROXY_URL}"
  printf "  %-24s %s\n" "Skip UI build:"         "${SKIP_UI_BUILD}"
  printf "  %-24s %s\n" "Skip Docker build:"     "${SKIP_DOCKER_BUILD}"
  echo -e "${CYAN}────────────────────────────────────────────────────────────${NC}"

  [[ "$AUTO_YES" == "true" ]] && return

  echo ""
  local answer
  read -r -p "Proceed? [y/N]: " answer
  [[ "${answer,,}" =~ ^y ]] || { info "Aborted."; exit 0; }
}

# ── source nvm ────────────────────────────────────────────────────────────────
# nvm is a shell function — it must be sourced into the current shell, not executed
load_nvm() {
  # Already on the right node version?
  if command -v node &>/dev/null; then
    local ver
    ver="$(node -e 'process.stdout.write(process.version.slice(1).split(".")[0])')"
    [[ "$ver" == "20" ]] && { success "Node.js v20 already active."; return; }
  fi

  local candidates=(
    "$HOME/.nvm/nvm.sh"
    "/usr/local/nvm/nvm.sh"
    "/usr/share/nvm/nvm.sh"
    "/opt/nvm/nvm.sh"
  )
  for f in "${candidates[@]}"; do
    if [[ -s "$f" ]]; then
      info "Loading nvm from: ${f}"
      # shellcheck disable=SC1090
      \. "$f"
      nvm use v20
      return
    fi
  done
  warn "nvm not found at common locations — proceeding with current node."
}

# ── step 1: build UI ──────────────────────────────────────────────────────────
# The compiled Next.js output lands in litellm/proxy/_experimental/out/.
# It must exist BEFORE docker build so that COPY . . in the Dockerfile picks it up.
build_ui() {
  if [[ "$SKIP_UI_BUILD" == "true" ]]; then
    info "Skipping UI build (--skip-ui-build)."
    return
  fi

  header "Step 1/4 — Build Next.js UI"

  local ui_dir="${REPO_ROOT}/ui/litellm-dashboard"

  load_nvm
  success "Node: $(node --version)"

  info "npm ci ..."
  (cd "$ui_dir" && npm ci)

  info "build_ui.sh ..."
  # build_ui.sh uses relative paths so it must run from ui/litellm-dashboard/
  (cd "$ui_dir" && bash build_ui.sh)

  success "UI build complete — static files copied to litellm/proxy/_experimental/out/"
}

# ── step 2: build Docker image ────────────────────────────────────────────────
# Note: POSTGRESQL_ENDPT / _PASSCODE / _PORT are intentionally omitted — those
# ARGs are not declared in the Dockerfile and were no-ops in earlier commands.
build_image() {
  if [[ "$SKIP_DOCKER_BUILD" == "true" ]]; then
    info "Skipping Docker build (--skip-docker-build)."
    return
  fi

  header "Step 2/4 — Build Docker Image"
  info "Image tag: ${IMAGE_TAG}"

  DOCKER_BUILD_EXTRA_ARGS=()
  if [[ "${NO_CACHE}" == "true" ]]; then
    DOCKER_BUILD_EXTRA_ARGS+=(--no-cache)
  fi

  docker build \
    -f "${REPO_ROOT}/Dockerfile" \
    --build-arg HTTP_PROXY="${HTTP_PROXY_URL}" \
    --build-arg HTTPS_PROXY="${HTTP_PROXY_URL}" \
    --build-arg NO_PROXY="${NO_PROXY_LIST}" \
    "${DOCKER_BUILD_EXTRA_ARGS[@]}" \
    -t "${IMAGE_TAG}" \
    "${REPO_ROOT}"

  success "Image built: ${IMAGE_TAG}"
}

# ── docker network ────────────────────────────────────────────────────────────
ensure_network() {
  if docker network inspect "${DOCKER_NETWORK}" &>/dev/null; then
    info "Network '${DOCKER_NETWORK}' already exists."
  else
    info "Creating network '${DOCKER_NETWORK}'..."
    docker network create "${DOCKER_NETWORK}"
    success "Network created."
  fi
}

# ── stop and remove a container (idempotent) ──────────────────────────────────
remove_container() {
  local name="$1"
  if docker container inspect "$name" &>/dev/null 2>&1; then
    info "Stopping ${name}..."
    docker stop "$name" >/dev/null
    docker rm   "$name" >/dev/null
    success "Removed: ${name}"
  else
    info "Container '${name}' not found — skipping removal."
  fi
}

# ── step 3: start LiteLLM ────────────────────────────────────────────────────
start_litellm() {
  header "Step 3/4 — Start LiteLLM (${LITELLM_CONTAINER})"

  build_database_url

  docker run -d \
    --name            "${LITELLM_CONTAINER}" \
    --network         "${DOCKER_NETWORK}" \
    --network-alias   litellm \
    --restart         unless-stopped \
    -p "${HOST_PORT}:4000" \
    -e UI_APP_NAME="${APP_NAME}" \
    -e NEXT_PUBLIC_APP_NAME="${APP_NAME}" \
    -e PROXY_BASE_URL="${PROXY_BASE_URL}" \
    -e DATABASE_URL="${DATABASE_URL}" \
    -e LITELLM_MASTER_KEY="${LITELLM_MASTER_KEY}" \
    -e LITELLM_SALT_KEY="${LITELLM_SALT_KEY}" \
    -e STORE_MODEL_IN_DB=true \
    -e HTTP_PROXY="${HTTP_PROXY_URL}" \
    -e HTTPS_PROXY="${HTTP_PROXY_URL}" \
    -e NO_PROXY="${NO_PROXY_LIST}" \
    -v "${CONFIG_PATH}:/app/config/config.yaml:ro" \
    "${IMAGE_TAG}" \
    --config /app/config/config.yaml

  success "LiteLLM container started."

  # Wait for the liveliness endpoint (up to 90 s)
  info "Waiting for LiteLLM to become healthy..."
  local attempt=0 max=18
  until curl -fsS "http://localhost:${HOST_PORT}/health/liveliness" &>/dev/null; do
    attempt=$(( attempt + 1 ))
    [[ $attempt -ge $max ]] && { warn "Health check timed out — check: docker logs ${LITELLM_CONTAINER}"; break; }
    printf '.'
    sleep 5
  done
  echo ""
  if [[ $attempt -lt $max ]]; then success "LiteLLM is healthy."; fi
}

# ── post-deploy: backfill spend_at_last_reset baseline ────────────────────────
# One-time data migration: for every API key with an active budget period, set
#   spend_at_last_reset = spend - SUM(daily_spend_in_current_period)
# so that period_spend = spend - spend_at_last_reset reflects only the current
# billing window, not all-time cumulative spend.
#
# Idempotency guard: a completion flag is stored in LiteLLM_Config under the key
# 'spend_at_last_reset_backfill_v1'. If that row exists, the function exits
# immediately on every subsequent deploy.
backfill_spend_at_last_reset() {
  step "Post-deploy: spend_at_last_reset backfill"

  if ! command -v psql &>/dev/null; then
    warn "psql not found on host — skipping spend_at_last_reset backfill. Run manually if needed."
    return
  fi

  # Strip ?schema=... query param — psql doesn't support Prisma-style URL params
  local psql_url="${DATABASE_URL%%\?*}"

  # Guard: check if completion flag is already recorded in LiteLLM_Config
  local already_done
  already_done="$(psql "$psql_url" -tAq -c "
    SET search_path TO litellm;
    SELECT param_value::text FROM \"LiteLLM_Config\"
    WHERE param_name = 'spend_at_last_reset_backfill_v1'
    LIMIT 1;
  " 2>/dev/null || true)"
  already_done="${already_done// /}"

  if [[ -n "$already_done" ]]; then
    info "spend_at_last_reset backfill already applied — skipping."
    return
  fi

  info "Running spend_at_last_reset backfill for active budget-tracked keys..."

  local updated
  updated="$(psql "$psql_url" -tAq -c "
    SET search_path TO litellm;
    WITH updated AS (
      UPDATE \"LiteLLM_VerificationToken\" vt
      SET spend_at_last_reset = GREATEST(0, vt.spend - COALESCE(
          (SELECT SUM(dus.spend)
           FROM \"LiteLLM_DailyUserSpend\" dus
           WHERE dus.api_key = vt.token
             AND dus.date >= CASE
                 WHEN vt.budget_duration ILIKE '%mo%' OR vt.budget_duration ILIKE '%month%'
                     THEN TO_CHAR(vt.budget_reset_at - INTERVAL '1 month', 'YYYY-MM-DD')
                 WHEN vt.budget_duration = '30d'
                     THEN TO_CHAR(vt.budget_reset_at - INTERVAL '30 days', 'YYYY-MM-DD')
                 WHEN vt.budget_duration IN ('7d', '1w')
                     THEN TO_CHAR(vt.budget_reset_at - INTERVAL '7 days', 'YYYY-MM-DD')
                 WHEN vt.budget_duration = '1d'
                     THEN TO_CHAR(vt.budget_reset_at - INTERVAL '1 day', 'YYYY-MM-DD')
                 WHEN vt.budget_duration = '1y'
                     THEN TO_CHAR(vt.budget_reset_at - INTERVAL '1 year', 'YYYY-MM-DD')
                 ELSE TO_CHAR(vt.budget_reset_at - INTERVAL '1 month', 'YYYY-MM-DD')
             END
          ), 0)
      )
      WHERE vt.budget_duration IS NOT NULL
        AND vt.budget_reset_at > NOW()
        AND vt.spend_at_last_reset = 0
      RETURNING 1
    )
    SELECT COUNT(*) FROM updated;
  " 2>/dev/null || echo "0")"
  updated="${updated// /}"

  # Record completion flag so future deploys skip this step
  local ts
  ts="$(date -u '+%Y-%m-%dT%H:%M:%SZ')"
  psql "$psql_url" -c "
    SET search_path TO litellm;
    INSERT INTO \"LiteLLM_Config\" (param_name, param_value)
    VALUES ('spend_at_last_reset_backfill_v1', to_jsonb('${ts}'::text))
    ON CONFLICT (param_name) DO NOTHING;
  " &>/dev/null || warn "Could not record backfill completion flag in LiteLLM_Config."

  success "spend_at_last_reset backfill complete — ${updated} key(s) updated."
}

# ── step 4: start Prometheus ──────────────────────────────────────────────────
# prometheus.yml scrapes 'litellm:4000' — both containers share DOCKER_NETWORK
# and LiteLLM is aliased as 'litellm' on that network, so discovery works.
start_prometheus() {
  header "Step 4/4 — Start Prometheus (${PROMETHEUS_CONTAINER})"

  docker run -d \
    --name          "${PROMETHEUS_CONTAINER}" \
    --network       "${DOCKER_NETWORK}" \
    --restart       unless-stopped \
    -p "${PROMETHEUS_PORT}:9090" \
    -v "${PROMETHEUS_CONFIG}:/etc/prometheus/prometheus.yml:ro" \
    prom/prometheus \
    --config.file=/etc/prometheus/prometheus.yml \
    --storage.tsdb.path=/prometheus \
    --storage.tsdb.retention.time=15d

  success "Prometheus container started."
}

# ── main ──────────────────────────────────────────────────────────────────────
main() {
  collect_params
  check_prereqs
  confirm_proceed

  # Build phase (UI first — Docker COPY picks up the compiled static files)
  build_ui
  build_image

  # Deploy phase
  header "Replacing Running Containers"
  ensure_network
  remove_container "${LITELLM_CONTAINER}"
  remove_container "${PROMETHEUS_CONTAINER}"
  start_litellm
  backfill_spend_at_last_reset
  start_prometheus

  # Done
  echo ""
  echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}${BOLD}  Deployment complete — $(date '+%Y-%m-%d %H:%M:%S')   ${NC}"
  echo -e "${GREEN}${BOLD}════════════════════════════════════════════════════════${NC}"
  echo ""
  printf "  %-20s %s\n" "LiteLLM UI:"  "http://localhost:${HOST_PORT}"
  printf "  %-20s %s\n" "Prometheus:"  "http://localhost:${PROMETHEUS_PORT}"
  printf "  %-20s %s\n" "Git branch:"  "${GIT_BRANCH}  (${GIT_SHA})"
  echo ""
  echo -e "  Tail logs:"
  echo -e "    docker logs -f ${LITELLM_CONTAINER}"
  echo -e "    docker logs -f ${PROMETHEUS_CONTAINER}"
  echo ""
}

main "$@"
