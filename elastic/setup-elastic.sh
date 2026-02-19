#!/bin/bash
# Quick setup script for LiteLLM Guardrails Elasticsearch integration
# Usage: ./setup-elastic.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== LiteLLM Guardrails Elasticsearch Setup ===${NC}\n"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file from template...${NC}"
    cat > .env << 'EOF'
# PostgreSQL Connection
POSTGRES_CONNECTION_STRING="jdbc:postgresql://localhost:5432/litellm"
POSTGRES_USER="postgres"
POSTGRES_PASSWORD="your_password_here"

# Elasticsearch Connection
ELASTICSEARCH_HOSTS="http://localhost:9200"
ELASTICSEARCH_USER="elastic"
ELASTICSEARCH_PASSWORD="your_password_here"
EOF
    echo -e "${YELLOW}Please edit .env file with your credentials before continuing.${NC}"
    echo -e "${YELLOW}Press Enter when ready...${NC}"
    read
fi

# Load environment variables
source .env

echo -e "${GREEN}Step 1: Testing PostgreSQL connection...${NC}"
if command -v psql &> /dev/null; then
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$(echo $POSTGRES_CONNECTION_STRING | sed 's/.*:\/\/\([^:]*\):.*/\1/')" \
        -U "$POSTGRES_USER" \
        -d "$(echo $POSTGRES_CONNECTION_STRING | sed 's/.*\/\(.*\)/\1/')" \
        -c "SELECT COUNT(*) FROM \"LiteLLM_SpendLogs\" WHERE metadata::jsonb ? 'guardrail_information';" \
        2>/dev/null && echo -e "${GREEN}✓ PostgreSQL connection successful${NC}" || echo -e "${RED}✗ PostgreSQL connection failed${NC}"
else
    echo -e "${YELLOW}⚠ psql not found, skipping PostgreSQL test${NC}"
fi

echo -e "\n${GREEN}Step 2: Testing Elasticsearch connection...${NC}"
ES_RESPONSE=$(curl -s -u "$ELASTICSEARCH_USER:$ELASTICSEARCH_PASSWORD" "$ELASTICSEARCH_HOSTS/_cluster/health")
if echo "$ES_RESPONSE" | grep -q "cluster_name"; then
    echo -e "${GREEN}✓ Elasticsearch connection successful${NC}"
    echo "$ES_RESPONSE" | grep -o '"status":"[^"]*"'
else
    echo -e "${RED}✗ Elasticsearch connection failed${NC}"
    echo "$ES_RESPONSE"
    exit 1
fi

echo -e "\n${GREEN}Step 3: Installing Elasticsearch index template...${NC}"
TEMPLATE_RESPONSE=$(curl -s -X PUT "$ELASTICSEARCH_HOSTS/_index_template/litellm-guardrails" \
    -H 'Content-Type: application/json' \
    -u "$ELASTICSEARCH_USER:$ELASTICSEARCH_PASSWORD" \
    -d @litellm-guardrails-template.json)

if echo "$TEMPLATE_RESPONSE" | grep -q "acknowledged"; then
    echo -e "${GREEN}✓ Index template installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install index template${NC}"
    echo "$TEMPLATE_RESPONSE"
    exit 1
fi

echo -e "\n${GREEN}Step 4: Verifying template installation...${NC}"
curl -s -X GET "$ELASTICSEARCH_HOSTS/_index_template/litellm-guardrails" \
    -u "$ELASTICSEARCH_USER:$ELASTICSEARCH_PASSWORD" | \
    grep -o '"name":"litellm-guardrails"' && \
    echo -e "${GREEN}✓ Template verified${NC}" || \
    echo -e "${RED}✗ Template verification failed${NC}"

echo -e "\n${GREEN}Step 5: Checking for Logstash...${NC}"
if command -v logstash &> /dev/null; then
    echo -e "${GREEN}✓ Logstash found: $(logstash --version | head -1)${NC}"

    echo -e "\n${GREEN}Step 6: Testing Logstash configuration...${NC}"
    logstash -f logstash-litellm-guardrails.conf --config.test_and_exit && \
        echo -e "${GREEN}✓ Logstash configuration is valid${NC}" || \
        echo -e "${RED}✗ Logstash configuration has errors${NC}"

    echo -e "\n${YELLOW}Would you like to start Logstash now? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "${GREEN}Starting Logstash...${NC}"
        logstash -f logstash-litellm-guardrails.conf &
        LOGSTASH_PID=$!
        echo -e "${GREEN}✓ Logstash started with PID $LOGSTASH_PID${NC}"
        echo -e "${YELLOW}Monitor logs: tail -f /var/log/logstash/logstash-plain.log${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Logstash not found. Please install Logstash to continue.${NC}"
    echo -e "${YELLOW}Installation guide: https://www.elastic.co/guide/en/logstash/current/installing-logstash.html${NC}"
fi

echo -e "\n${GREEN}Step 7: Checking PostgreSQL JDBC Driver...${NC}"
DRIVER_PATH="/usr/share/logstash/postgresql-driver/postgresql-42.6.0.jar"
if [ -f "$DRIVER_PATH" ]; then
    echo -e "${GREEN}✓ PostgreSQL JDBC driver found${NC}"
else
    echo -e "${YELLOW}⚠ PostgreSQL JDBC driver not found at $DRIVER_PATH${NC}"
    echo -e "${YELLOW}Download: wget https://jdbc.postgresql.org/download/postgresql-42.6.0.jar${NC}"
    echo -e "${YELLOW}Install to: $DRIVER_PATH${NC}"
fi

echo -e "\n${GREEN}=== Setup Summary ===${NC}"
echo -e "Configuration files:"
echo -e "  ✓ logstash-litellm-guardrails.conf - Logstash pipeline"
echo -e "  ✓ litellm-guardrails-template.json - Elasticsearch index template"
echo -e "  ✓ README-ELASTIC-SETUP.md - Complete documentation"
echo -e "  ✓ .env - Environment variables"

echo -e "\n${GREEN}Next Steps:${NC}"
echo -e "1. Wait 5-10 minutes for initial data ingestion"
echo -e "2. Verify data: curl -X GET \"$ELASTICSEARCH_HOSTS/litellm-guardrails-*/_count\" -u $ELASTICSEARCH_USER:****"
echo -e "3. Open Kibana and create dashboards using examples in README-ELASTIC-SETUP.md"
echo -e "4. Set up alerting rules based on your requirements"

echo -e "\n${GREEN}Useful Commands:${NC}"
echo -e "  Check indices:    curl -X GET \"$ELASTICSEARCH_HOSTS/_cat/indices/litellm-guardrails-*?v\" -u $ELASTICSEARCH_USER:****"
echo -e "  View logs:        tail -f /var/log/logstash/logstash-plain.log"
echo -e "  Stop Logstash:    pkill -f logstash-litellm-guardrails"

echo -e "\n${GREEN}Setup complete!${NC}"
