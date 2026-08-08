#!/usr/bin/env bash
set -euo pipefail

CYAN='\033[0;36m'
GREEN='\033[0;32m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${CYAN}Parando AxéMap...${NC}"

# Parar containers
COMPOSE_FILE="docker-compose.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  COMPOSE_FILE="docker/docker-compose.dev.yml"
fi
if docker compose -f "$COMPOSE_FILE" ps -q 2>/dev/null | grep -q .; then
  docker compose -f "$COMPOSE_FILE" stop
  echo -e "  ${GREEN}✓${NC} Containers parados"
else
  echo -e "  Nenhum container ativo"
fi

# Matar processos node (API e Web)
if command -v pkill &>/dev/null; then
  pkill -f "nest start" 2>/dev/null || true
  pkill -f "next dev" 2>/dev/null || true
else
  kill $(pgrep -f "nest start" 2>/dev/null) 2>/dev/null || true
  kill $(pgrep -f "next dev" 2>/dev/null) 2>/dev/null || true
fi

echo -e "  ${GREEN}✓${NC} Servidores parados"
