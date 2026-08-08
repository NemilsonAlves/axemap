#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${CYAN}Iniciando AxéMap...${NC}"

if [ ! -f ".env" ]; then
  echo -e "${RED}.env não encontrado. Execute: make setup${NC}"
  exit 1
fi

export $(grep -v '^#' .env | xargs)

echo -e "  Subindo containers (core)..."
docker compose -f docker-compose.yml --profile core up -d 2>&1 || {
  echo -e "${RED}Falha ao subir containers. Execute: make doctor${NC}"
  exit 1
}

echo -e "  Aguardando banco de dados..."
bash scripts/wait-for-services.sh docker-compose.yml

echo -e "  Iniciando API (porta ${PORT:-3001})..."
cd apps/api
npx nest start --watch &
API_PID=$!
cd "$PROJECT_DIR"

sleep 2

echo -e "  Iniciando Web (porta 3000)..."
cd apps/web
npx next dev --hostname 0.0.0.0 &
WEB_PID=$!
cd "$PROJECT_DIR"

echo ""
echo -e "${GREEN}✓${NC} Servidores iniciados:"
echo -e "  ${CYAN}API:${NC}  http://localhost:${PORT:-3001}"
echo -e "  ${CYAN}Web:${NC}  http://localhost:3000"
echo -e "  ${CYAN}Health:${NC} http://localhost:${PORT:-3001}/api/v1/health"
echo ""
echo -e "  Pressione Ctrl+C para parar todos os servidores"
echo ""

trap "kill $API_PID $WEB_PID 2>/dev/null; exit" SIGINT SIGTERM
wait
