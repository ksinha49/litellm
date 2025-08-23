#!/usr/bin/env bash
set -euo pipefail

# Allow skipping the SSM fetch entirely
if [ "${SKIP_SSM_FETCH:-}" = "1" ]; then
  echo "SKIP_SSM_FETCH set; skipping settings fetch" >&2
  exit 0
fi

FETCH_SETTINGS=true
if ! command -v aws >/dev/null 2>&1; then
  echo "AWS CLI not installed; skipping settings fetch" >&2
  FETCH_SETTINGS=false
elif ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "AWS credentials not configured; skipping settings fetch" >&2
  FETCH_SETTINGS=false
fi

# If we can't talk to AWS and no overrides are provided, nothing to do
if ! $FETCH_SETTINGS && [ -z "${LOG_LEVEL:-}${POSTGRESQL_ENDPT:-}${POSTGRESQL_PASSCODE:-}${POSTGRESQL_PORT:-}${POSTGRESQL_USERID:-}${S3_BUCKET_NAME:-}" ]; then
  exit 0
fi

AWS_REGION="${AWS_REGION:-us-east-2}"
LOG_LEVEL="${LOG_LEVEL:-}"
POSTGRESQL_ENDPT="${POSTGRESQL_ENDPT:-}"
POSTGRESQL_PASSCODE="${POSTGRESQL_PASSCODE:-}"
POSTGRESQL_PORT="${POSTGRESQL_PORT:-}"
POSTGRESQL_USERID="${POSTGRESQL_USERID:-}"
S3_BUCKET_NAME="${S3_BUCKET_NAME:-}"
S3_REGION_NAME="${S3_REGION_NAME:-}"

get_parameter_with_retries() {
  local name="$1"
  local attempt=1
  local max_attempts=5
  local value
  while [ "$attempt" -le "$max_attempts" ]; do
    if value=$(aws ssm get-parameter --region "$AWS_REGION" --with-decryption --name "$name" --query 'Parameter.Value' --output text 2>/dev/null); then
      echo "$value"
      return 0
    fi
    echo "Retrying $name ($attempt/$max_attempts)" >&2
    attempt=$(( attempt + 1 ))
    sleep $attempt
  done
  return 1
}

if $FETCH_SETTINGS; then
  # Resolve region
  TOKEN=$(curl -s -m 5 -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" || true)
  if [ -n "$TOKEN" ]; then
    AWS_REGION=$(curl -s -m 5 -H "X-aws-ec2-metadata-token: $TOKEN" "http://169.254.169.254/latest/dynamic/instance-identity/document" | grep -oP '"region"\s*:\s*"\K[^\"]+')
  else
    AWS_REGION=$(curl -s -m 5 "http://169.254.169.254/latest/dynamic/instance-identity/document" | grep -oP '"region"\s*:\s*"\K[^\"]+')
  fi
  if [ -z "$AWS_REGION" ]; then
    AWS_REGION=$(aws configure get region 2>/dev/null || true)
  fi
  if [ -z "$AWS_REGION" ]; then
    AWS_REGION="us-east-2"
  fi

  LITELLM_ENV="${LITELLM_ENV:-prod}"
  PREFIX="/parameters/litellm/${LITELLM_ENV}"

  S3_BUCKET_NAME="${S3_BUCKET_NAME:-$(get_parameter_with_retries "$PREFIX/S3_BUCKET_NAME" 2>/dev/null || true)}"
  LOG_LEVEL="${LOG_LEVEL:-$(get_parameter_with_retries "$PREFIX/LOG_LEVEL" 2>/dev/null || true)}"
  POSTGRESQL_ENDPT="${POSTGRESQL_ENDPT:-$(get_parameter_with_retries "$PREFIX/POSTGRESQL_ENDPT" 2>/dev/null || true)}"
  POSTGRESQL_PASSCODE="${POSTGRESQL_PASSCODE:-$(get_parameter_with_retries "$PREFIX/POSTGRESQL_PASSCODE" 2>/dev/null || true)}"
  POSTGRESQL_PORT="${POSTGRESQL_PORT:-$(get_parameter_with_retries "$PREFIX/POSTGRESQL_PORT" 2>/dev/null || true)}"
  POSTGRESQL_USERID="${POSTGRESQL_USERID:-$(get_parameter_with_retries "$PREFIX/POSTGRESQL_USERID" 2>/dev/null || true)}"

  if [ -n "$S3_BUCKET_NAME" ]; then
    S3_REGION_NAME="${S3_REGION_NAME:-$(get_parameter_with_retries "$PREFIX/S3_REGION_NAME" 2>/dev/null || true)}"
    if [ -n "$S3_REGION_NAME" ]; then
      AWS_REGION="$S3_REGION_NAME"
    fi
  fi
fi

# Fallback defaults
LOG_LEVEL="${LOG_LEVEL:-INFO}"
POSTGRESQL_ENDPT="${POSTGRESQL_ENDPT:-localhost}"
POSTGRESQL_PASSCODE="${POSTGRESQL_PASSCODE:-postgres}"
POSTGRESQL_PORT="${POSTGRESQL_PORT:-5432}"
POSTGRESQL_USERID="${POSTGRESQL_USERID:-postgres}"
S3_REGION_NAME="${S3_REGION_NAME:-$AWS_REGION}"

export POSTGRESQL_ENDPT POSTGRESQL_PASSCODE POSTGRESQL_PORT POSTGRESQL_USERID
export DATABASE_URL="postgresql://${POSTGRESQL_USERID}:${POSTGRESQL_PASSCODE}@${POSTGRESQL_ENDPT}:${POSTGRESQL_PORT}/postgres"

cat > /app/litellm_settings.yaml <<EOF2
litellm_settings:
  global_log_level: "$LOG_LEVEL"
EOF2

if [ -n "$S3_BUCKET_NAME" ]; then
cat >> /app/litellm_settings.yaml <<EOF2
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: "$S3_BUCKET_NAME"
    s3_region_name: "$S3_REGION_NAME"
EOF2
fi

