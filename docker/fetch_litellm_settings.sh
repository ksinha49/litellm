#!/usr/bin/env bash
set -euo pipefail

# Fetch LiteLLM runtime settings from AWS SSM and write to /app/litellm_settings.yaml
# Usage: LITELLM_ENV=<env> docker/fetch_litellm_settings.sh

get_parameter_with_retries() {
  local name="$1"
  local attempt=1
  local max_attempts=5
  local value
  while [ "$attempt" -le "$max_attempts" ]; do
    if value=$(aws ssm get-parameter --with-decryption --name "$name" --query 'Parameter.Value' --output text 2>/dev/null); then
      echo "$value"
      return 0
    fi
    echo "Retrying $name ($attempt/$max_attempts)" >&2
    attempt=$(( attempt + 1 ))
    sleep $attempt
  done
  echo "Failed to retrieve parameter: $name" >&2
  return 1
}

# Determine environment
LITELLM_ENV="${LITELLM_ENV:-prod}"
PREFIX="/parameters/litellm/${LITELLM_ENV}"

S3_BUCKET_NAME=$(get_parameter_with_retries "$PREFIX/S3_BUCKET_NAME")
LOG_LEVEL=$(get_parameter_with_retries "$PREFIX/LOG_LEVEL")
POSTGRESQL_ENDPT=$(get_parameter_with_retries "$PREFIX/POSTGRESQL_ENDPT")
POSTGRESQL_PASSCODE=$(get_parameter_with_retries "$PREFIX/POSTGRESQL_PASSCODE")
POSTGRESQL_PORT=$(get_parameter_with_retries "$PREFIX/POSTGRESQL_PORT")

export POSTGRESQL_ENDPT POSTGRESQL_PASSCODE POSTGRESQL_PORT
export DATABASE_URL="postgresql://postgres:${POSTGRESQL_PASSCODE}@${POSTGRESQL_ENDPT}:${POSTGRESQL_PORT}/postgres"
if S3_REGION_NAME=$(get_parameter_with_retries "$PREFIX/S3_REGION_NAME" 2>/dev/null); then
  AWS_REGION="$S3_REGION_NAME"
else
  AWS_REGION="${AWS_REGION:-}"
  if [ -z "$AWS_REGION" ]; then
    TOKEN=$(curl -s -m 5 -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60" || true)
    if [ -n "$TOKEN" ]; then
      AWS_REGION=$(curl -s -m 5 -H "X-aws-ec2-metadata-token: $TOKEN" "http://169.254.169.254/latest/dynamic/instance-identity/document" | grep -oP '(?<=\"region\"\s*:\s*\")([^\"]+)')
    else
      AWS_REGION=$(curl -s -m 5 "http://169.254.169.254/latest/dynamic/instance-identity/document" | grep -oP '(?<=\"region\"\s*:\s*\")([^\"]+)')
    fi
  fi
fi

cat > /app/litellm_settings.yaml <<EOF2
litellm_settings:
  callbacks: ["s3_v2"]
  s3_callback_params:
    s3_bucket_name: "$S3_BUCKET_NAME"
    s3_region_name: "$AWS_REGION"
  global_log_level: "$LOG_LEVEL"
EOF2

