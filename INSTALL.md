# LiteLLM Proxy — Production Installation Guide

This document covers a full production deployment of the Ameritas LiteLLM proxy on a Linux host using Docker. The proxy exposes port **8080** behind your load balancer / reverse proxy at `https://api.ai.inbison.com`.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Node.js Setup (UI builds)](#nodejs-setup-ui-builds)
4. [Create `.env.deploy`](#create-envdeploy)
5. [Configure `litellm_config.yaml`](#configure-litellm_configyaml)
6. [Database Setup](#database-setup)
7. [Custom Migrations](#custom-migrations)
8. [First Deploy](#first-deploy)
9. [Verify the Deployment](#verify-the-deployment)
10. [Subsequent Deploys](#subsequent-deploys)
11. [Logs & Monitoring](#logs--monitoring)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Notes |
|---|---|---|
| Docker Engine | ≥ 24 | `docker info` must succeed without `sudo` |
| Node.js | **v20** via nvm | Only needed on the build host; not baked into the image |
| nvm | any | Used to pin Node 20 for UI builds |
| Python 3 | ≥ 3.9 | For URL-encoding the DB password in `deploy.sh` |
| psql client | any | Optional — used for the post-deploy spend backfill |
| Git | any | |
| Network access | — | Outbound HTTPS through `proxy.ameritas.com:8080` |

Install nvm if not already present:

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.nvm/nvm.sh
nvm install 20
nvm use 20
```

---

## Clone the Repository

```bash
git clone <repo-url> /opt/liteLLM/litellm
cd /opt/liteLLM/litellm
```

---

## Node.js Setup (UI builds)

The `deploy.sh` script calls `build_ui.sh` which requires Node **v20**. Confirm before deploying:

```bash
source ~/.nvm/nvm.sh
nvm use v20
node --version   # must print v20.x.x
```

If the active version is not 20, the UI build will fail silently (the script exits 0 on build error). Always verify with `node --version` before running `deploy.sh` without `--skip-ui-build`.

---

## Create `.env.deploy`

Copy the example file and fill in every value:

```bash
cp .env.deploy.example .env.deploy
$EDITOR .env.deploy
```

**All variables:**

```bash
# ── Container / Image ─────────────────────────────────────────────────────────
IMAGE_TAG=litellm-local
LITELLM_CONTAINER=litellm
PROMETHEUS_CONTAINER=litellm-prometheus-1
DOCKER_NETWORK=litellm-net
HOST_PORT=8080
PROMETHEUS_PORT=9090

# ── Application ───────────────────────────────────────────────────────────────
APP_NAME="Ameritas LiteLLM"
PROXY_BASE_URL=https://api.ai.inbison.com   # public URL clients use — must match your LB/DNS
CONFIG_PATH=/opt/liteLLM/litellm/litellm_config.yaml
PROMETHEUS_CONFIG=/opt/liteLLM/litellm/prometheus.yml

# ── Corporate proxy ───────────────────────────────────────────────────────────
HTTP_PROXY_URL=http://proxy.ameritas.com:8080
NO_PROXY_LIST=localhost,127.0.0.1,registry-1.docker.io

# ── Database (AWS RDS PostgreSQL) ─────────────────────────────────────────────
# Set DATABASE_URL directly to skip the individual component prompts:
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>?schema=litellm
# — OR — supply the components and deploy.sh will construct the URL:
# DB_HOST=<rds-endpoint>
# DB_PORT=5432
# DB_NAME=<dbname>
# DB_SCHEMA=litellm
# DB_USER=<user>
# DB_PASSWORD=<password>     # special characters are URL-encoded automatically

# ── LiteLLM secrets ───────────────────────────────────────────────────────────
LITELLM_MASTER_KEY=<master-key>   # used to call the proxy's admin APIs
LITELLM_SALT_KEY=<salt-key>       # used to hash/encrypt stored keys — never change after first deploy
```

> **`LITELLM_SALT_KEY` is permanent.** It is used to hash virtual keys stored in the database. If you change it after keys have been created, all existing keys will become invalid.

> **`PROXY_BASE_URL`** must match the URL your API clients reach — `https://api.ai.inbison.com`. Setting it to an internal IP will break the UI's API calls when opened from outside the host.

---

## Configure `litellm_config.yaml`

This file is bind-mounted into the container at `/app/config/config.yaml`. A minimal production config enabling audit logging to S3 and Prometheus metrics:

```yaml
litellm_settings:
  store_audit_logs: true
  success_callback: ["s3_v2", "prometheus"]
  failure_callback: ["prometheus"]
  s3_callback_params:
    s3_bucket_name: <your-s3-bucket>
    s3_region_name: us-east-2
    s3_aws_access_key_id: <aws-access-key-id>
    s3_aws_secret_access_key: <aws-secret-access-key>
```

The Prometheus scrape config (`prometheus.yml`) expects the container to be reachable at `litellm:4000` on the Docker bridge network — this is satisfied automatically by the `--network-alias litellm` that `deploy.sh` sets on the container.

---

## Database Setup

LiteLLM requires a PostgreSQL database (≥ 14). The connection string must use the `litellm` schema:

```
postgresql://<user>:<password>@<host>:5432/<dbname>?schema=litellm
```

On first startup, LiteLLM automatically runs Prisma migrations to create all required tables and views. No manual schema setup is required **except** the custom migration described in the next section.

### AWS RDS notes

- Use a `db.t3.medium` or larger instance class
- Enable automated backups (7-day retention minimum)
- The security group must allow inbound 5432 from the Docker host's private IP
- Download the AWS global certificate bundle if SSL is required:
  ```bash
  curl -o /certs/global-bundle.pem \
    https://truststore.pki.us-east-1.amazonaws.com/us-east-2/us-east-2-bundle.pem
  ```

---

## Custom Migrations

LiteLLM's bundled migrations (`litellm_proxy_extras`) stop at August 2025. Two additional migrations in `deploy/migrations/` must be applied manually on a **fresh** database. All scripts are idempotent (`IF NOT EXISTS` / `IF NOT EXISTS`).

| Migration | File | What it does |
|---|---|---|
| September 2025 | `deploy/migrations/20250904_add_metadata_table/migration.sql` | Creates `LiteLLM_MetadataTable` (key/value store for proxy config) |
| February 2026 | `deploy/migrations/20260226_add_spend_at_last_reset/migration.sql` | Adds `spend_at_last_reset` to keys, users, and teams for accurate period budget tracking |

Apply both in order:

```bash
DB_URL="${DATABASE_URL%%\?*}"   # strip ?schema=litellm — psql doesn't support Prisma URL params

psql "$DB_URL" -f deploy/migrations/20250904_add_metadata_table/migration.sql
psql "$DB_URL" -f deploy/migrations/20260226_add_spend_at_last_reset/migration.sql
```

These can be applied before or after first startup — all changes are additive with safe defaults.

---

## First Deploy

```bash
cd /opt/liteLLM/litellm
source ~/.nvm/nvm.sh && nvm use v20   # ensure Node 20 is active
bash deploy.sh
```

The script will:

1. **Prompt** for any values not set in `.env.deploy`
2. **Show** a deployment summary and ask for confirmation (skip with `--yes`)
3. **Build** the Next.js UI (`ui/litellm-dashboard`) with `npm ci` + `build_ui.sh` — output goes to `litellm/proxy/_experimental/out/`
4. **Build** the Docker image (`litellm-local`) via `docker build`
5. **Start** the `litellm` container on `litellm-net`, port `8080 → 4000`
6. **Run** the post-deploy `spend_at_last_reset` backfill (idempotent — skipped on subsequent deploys)
7. **Start** the `litellm-prometheus-1` container on `litellm-net`, port `9090`

> **Known behaviour:** The in-container health check (`wget http://localhost:4000/health/liveliness`) may time out and print a warning even when the service is healthy — LiteLLM takes up to 90 s to fully start on a cold RDS connection. Verify externally with `curl http://localhost:8080/health/liveliness`.

---

## Verify the Deployment

```bash
# Liveness
curl http://localhost:8080/health/liveliness
# → "I'm alive!"

# Running containers
docker ps --filter name=litellm --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Tail logs
docker logs -f litellm
docker logs -f litellm-prometheus-1
```

Open the UI at **http://localhost:8080** (or via your reverse proxy at `https://api.ai.inbison.com`). Sign in with the master key to reach the admin dashboard.

---

## Subsequent Deploys

| Changed | Command |
|---|---|
| Python code only | `bash deploy.sh --skip-ui-build` |
| UI + Python | `bash deploy.sh` |
| Force clean rebuild | `bash deploy.sh --no-cache` |
| Non-interactive CI/CD | `bash deploy.sh --yes` |

The deploy script is fully idempotent — it stops and removes the existing containers before starting new ones.

### UI build note

`build_ui.sh` does not propagate a non-zero exit code on build failure (upstream bug), so a failed UI build will proceed to `docker build` using the **previous** compiled output. Always check that `npm run build` reports `✓ Compiled successfully` before assuming the new UI was included. If in doubt, run the UI build manually:

```bash
cd ui/litellm-dashboard
source ~/.nvm/nvm.sh && nvm use v20
npm ci
npm run build            # must print "✓ Compiled successfully"
cp -r out/* ../../litellm/proxy/_experimental/out/
rm -rf out
cd ../..
bash deploy.sh --skip-ui-build
```

---

## Logs & Monitoring

```bash
# Live application logs
docker logs -f litellm

# Prometheus UI
open http://localhost:9090

# Example: total requests in last 5 minutes
curl -sg 'http://localhost:9090/api/v1/query?query=sum(litellm_requests_total)' | jq .
```

Prometheus scrapes `litellm:4000/metrics/` every 15 seconds. Metrics are retained for 15 days (`--storage.tsdb.retention.time=15d`).

---

## Troubleshooting

### Container exits immediately

```bash
docker logs litellm
```

Common causes:
- `DATABASE_URL` is wrong or the RDS security group blocks port 5432
- `LITELLM_MASTER_KEY` is unset
- `litellm_config.yaml` has a YAML syntax error

### `PROXY_BASE_URL` shows internal IP in the UI

Edit `.env.deploy`, set `PROXY_BASE_URL=https://api.ai.inbison.com`, then redeploy. This value is baked into the Docker image at build time via `NEXT_PUBLIC_APP_NAME` / `PROXY_BASE_URL` environment variables passed to `docker run`.

### `column t.guardrails does not exist` warning in logs

Non-fatal. The `LiteLLM_TeamTable` view was built against a newer schema than what `litellm_proxy_extras` migrated. The service functions normally.

### Active Keys shows 0

The `/global/spend/keys` endpoint returns HTTP 500 for unauthenticated callers when `user_id` is `None`. This is patched in this fork — ensure you are running the version built from this repository, not the upstream Docker image.

### UI build silently used old files

Symptom: UI changes aren't visible after deploy. Cause: `build_ui.sh` exited non-zero (usually wrong Node version) but `deploy.sh` continued. See the [UI build note](#ui-build-note) above for the manual build procedure.

### Health check times out during deploy

The `deploy.sh` health check polls `http://localhost:4000/health/liveliness` inside the container using `wget`. On a cold start with a remote RDS instance this can exceed the 90-second window. The service is almost always healthy by the time the warning is printed — verify with `curl http://localhost:8080/health/liveliness` from the host.
