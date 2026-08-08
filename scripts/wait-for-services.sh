#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

COMPOSE_FILE="${1:-docker-compose.yml}"
SERVICES=("postgres" "redis")

echo -e "${CYAN}Aguardando serviços Docker...${NC}"

check_service() {
  local service="$1"
  local max_retries="$2"
  local retries=0

  until docker compose -f "$COMPOSE_FILE" ps --format '{{.Name}} {{.Status}}' 2>/dev/null | grep -q "axemap-${service}.*healthy\|axemap-${service}.*Up"; do
    retries=$((retries + 1))
    if [ "$retries" -ge "$max_retries" ]; then
      echo -e "  ${RED}✗${NC} ${service} não ficou pronto após $max_retries tentativas"
      docker compose -f "$COMPOSE_FILE" logs "$service" 2>/dev/null | tail -5
      return 1
    fi
    echo -n "."
    sleep 2
  done
  echo -e "  ${GREEN}✓${NC} ${service} pronto"
  return 0
}

for svc in "${SERVICES[@]}"; do
  check_service "$svc" 30
done

echo -e "${GREEN}✓${NC} Todos os serviços estão prontos!"
