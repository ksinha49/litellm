#!/bin/bash

# LiteLLM Proxy Server Startup Script
# Usage: ./app-start.sh [--port PORT] [--config CONFIG_FILE] [--debug]

set -e

# Default values
PORT="${PORT:-4000}"
CONFIG_FILE="${CONFIG_FILE:-config.yaml}"
DEBUG_MODE=""
HOST="0.0.0.0"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Script directory (where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --port)
            PORT="$2"
            shift 2
            ;;
        --config)
            CONFIG_FILE="$2"
            shift 2
            ;;
        --debug)
            DEBUG_MODE="--detailed_debug"
            shift
            ;;
        --help)
            echo "Usage: ./app-start.sh [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --port PORT       Port to run the server on (default: 4000)"
            echo "  --config FILE     Config file to use (default: config.yaml)"
            echo "  --debug           Enable detailed debug logging"
            echo "  --help            Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  OPENAI_API_KEY        OpenAI API key"
            echo "  ANTHROPIC_API_KEY     Anthropic API key"
            echo "  DATABASE_URL          Database connection string (optional)"
            echo "  LITELLM_MASTER_KEY    Master key for admin access"
            exit 0
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            exit 1
            ;;
    esac
done

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  LiteLLM Proxy Server Startup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check for Python
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Error: Python3 is not installed.${NC}"
    exit 1
fi

echo -e "${YELLOW}Using Python: $(which python3)${NC}"
echo -e "${YELLOW}Python version: $(python3 --version)${NC}"
echo ""

# Install the local package if not already installed
echo -e "${YELLOW}Installing local LiteLLM package...${NC}"
pip3 install -e ".[proxy]" --quiet 2>/dev/null || pip3 install -e ".[proxy]"

# Create default config if it doesn't exist
if [[ ! -f "$CONFIG_FILE" ]]; then
    echo -e "${YELLOW}Config file '$CONFIG_FILE' not found. Creating default config...${NC}"
    cat > "$CONFIG_FILE" << 'EOF'
# LiteLLM Proxy Configuration
# Documentation: https://docs.litellm.ai/docs/proxy/configs

model_list:
  # OpenAI Models
  - model_name: gpt-4o
    litellm_params:
      model: openai/gpt-4o
      api_key: os.environ/OPENAI_API_KEY

  - model_name: gpt-4o-mini
    litellm_params:
      model: openai/gpt-4o-mini
      api_key: os.environ/OPENAI_API_KEY

  # Anthropic Models (uncomment if you have ANTHROPIC_API_KEY)
  # - model_name: claude-sonnet
  #   litellm_params:
  #     model: anthropic/claude-sonnet-4-20250514
  #     api_key: os.environ/ANTHROPIC_API_KEY

general_settings:
  # Master key for admin API access
  master_key: os.environ/LITELLM_MASTER_KEY

litellm_settings:
  set_verbose: false
EOF
    echo -e "${GREEN}Created default config at: $CONFIG_FILE${NC}"
fi

# Set default master key if not set
if [[ -z "$LITELLM_MASTER_KEY" ]]; then
    export LITELLM_MASTER_KEY="sk-litellm-master-key"
    echo -e "${YELLOW}Using default master key: $LITELLM_MASTER_KEY${NC}"
fi

# Check for API keys
echo ""
echo -e "${YELLOW}Checking API keys...${NC}"
if [[ -n "$OPENAI_API_KEY" ]]; then
    echo -e "  ${GREEN}✓${NC} OPENAI_API_KEY is set"
else
    echo -e "  ${YELLOW}!${NC} OPENAI_API_KEY not set (OpenAI models won't work)"
fi

if [[ -n "$ANTHROPIC_API_KEY" ]]; then
    echo -e "  ${GREEN}✓${NC} ANTHROPIC_API_KEY is set"
else
    echo -e "  ${YELLOW}!${NC} ANTHROPIC_API_KEY not set (Anthropic models won't work)"
fi

if [[ -n "$DATABASE_URL" ]]; then
    echo -e "  ${GREEN}✓${NC} DATABASE_URL is set (persistent storage enabled)"
else
    echo -e "  ${YELLOW}!${NC} DATABASE_URL not set (using in-memory storage)"
fi

echo ""
echo -e "${GREEN}Starting LiteLLM Proxy...${NC}"
echo -e "  Port:   ${PORT}"
echo -e "  Config: ${CONFIG_FILE}"
echo -e "  Debug:  ${DEBUG_MODE:-disabled}"
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "  Server will be available at:"
echo -e "  ${GREEN}http://localhost:${PORT}${NC}"
echo -e ""
echo -e "  Health check: curl http://localhost:${PORT}/health"
echo -e "  API docs:     http://localhost:${PORT}/docs"
echo -e "${GREEN}========================================${NC}"
echo ""

# Run the proxy server
exec python3 -m litellm.proxy.proxy_server \
    --config "$CONFIG_FILE" \
    --port "$PORT" \
    --host "$HOST" \
    $DEBUG_MODE
