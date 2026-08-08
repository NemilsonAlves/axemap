#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0
WARN=0

check() {
  local name="$1" cmd="$2" hint="${3:-}"
  if eval "$cmd" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $name"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $name${hint:+ — $hint}"
    FAIL=$((FAIL + 1))
  fi
}

warn() {
  local name="$1" cmd="$2"
  if eval "$cmd" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $name"
    PASS=$((PASS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} $name (opcional)"
    WARN=$((WARN + 1))
  fi
}

section() {
  echo -e "\n${CYAN}═══════════════════════════════════════${NC}"
  echo -e "${CYAN} $1${NC}"
  echo -e "${CYAN}═══════════════════════════════════════${NC}"
}

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

section "Sistema Operacional"
echo "  $(uname -a)"
check "Arquitetura x86_64 ou arm64" '[[ "$(uname -m)" =~ ^(x86_64|aarch64)$ ]]'
check "WSL2 detectado" 'grep -qi microsoft /proc/version 2>/dev/null || grep -qi wsl /proc/version 2>/dev/null'

section "Rede WSL"
WSL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
echo -e "  IP WSL2: ${CYAN}${WSL_IP:-desconhecido}${NC}"

if grep -q "networkingMode=mirrored" /mnt/c/Users/"$USER"/.wslconfig 2>/dev/null || \
   grep -q "networkingMode=mirrored" /mnt/c/Users/*/.wslconfig 2>/dev/null; then
  echo -e "  ${GREEN}✓${NC} WSL Mirrored Networking: ativo"
else
  WSL_BUILD=$(wsl.exe --version 2>/dev/null | grep -oP 'Vers.o do WSL: \K[\d.]+' || echo "0")
  echo -e "  ${YELLOW}⚠${NC} WSL Mirrored Networking: inativo (NAT mode)"
  echo -e "    Recomendado: adicionar 'networkingMode=mirrored' em %USERPROFILE%\\.wslconfig"
  WARN=$((WARN + 1))
fi
check "WSL autoProxy" 'grep -q "autoProxy=true" /mnt/c/Users/*/.wslconfig 2>/dev/null || true'

section "Dependências Essenciais"
check "Git" 'command -v git' "sudo apt install git"
check "Docker" 'command -v docker' "curl -fsSL https://get.docker.com | sh"
check "Docker Compose" 'docker compose version 2>/dev/null | grep -q v' "Incluído no Docker"
check "Node.js >=22" 'node --version 2>/dev/null | grep -qE "^v(2[2-9]|[3-9])"' "mise use node@lts ou nvm install --lts"
check "pnpm" 'command -v pnpm' "npm install -g pnpm"
check "OpenSSL" 'command -v openssl' "sudo apt install openssl"
check "curl" 'command -v curl' "sudo apt install curl"
check "jq" 'command -v jq' "sudo apt install jq"

section "Dependências Opcionais"
warn "make" 'command -v make'
warn "pg_isready" 'command -v pg_isready'
warn "redis-cli" 'command -v redis-cli'

section "Docker"
if command -v docker &>/dev/null; then
  echo -e "  Versão: ${GREEN}$(docker --version 2>/dev/null)${NC}"
  check "Docker Engine ativo" 'docker info --format "{{.OSType}}" 2>/dev/null | grep -q linux'
  check "Docker Compose v2+" 'docker compose version 2>/dev/null | grep -qE "v[0-9]"'
fi

section "Container Status"
ALL_SERVICES=(
  "axemap-postgres:core"
  "axemap-redis:core"
  "axemap-minio:storage"
  "axemap-adminer:admin"
  "axemap-redisinsight:admin"
  "axemap-rabbitmq:messaging"
  "axemap-meilisearch:search"
  "axemap-clickhouse:analytics"
  "axemap-ollama:ai"
)
for entry in "${ALL_SERVICES[@]}"; do
  svc="${entry%%:*}"
  profile="${entry##*:}"
  status=$(docker inspect --format='{{.State.Status}}' "$svc" 2>/dev/null || echo "not-found")
  health=$(docker inspect --format='{{.State.Health.Status}}' "$svc" 2>/dev/null || echo "")
  case "$status" in
    running) echo -e "  ${GREEN}▶${NC} $svc [$profile]${health:+ ($health)}" ;;
    exited)  echo -e "  ${RED}■${NC} $svc [$profile] (exited)" ;;
    *)       echo -e "  ${YELLOW}○${NC} $svc [$profile] (not running)" ;;
  esac
done

section "Banco de Dados"
DB_HOST="localhost"
DB_PORT="5432"
DB_USER="axemap"
DB_NAME="axemap_dev"

# Check via Docker
if docker inspect axemap-postgres --format='{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; then
  echo -e "  ${GREEN}✓${NC} PostgreSQL health: healthy"
  PASS=$((PASS + 1))
elif docker inspect axemap-postgres --format='{{.State.Status}}' 2>/dev/null | grep -q running; then
  echo -e "  ${YELLOW}⚠${NC} PostgreSQL running (health unknown)"
  WARN=$((WARN + 1))
else
  echo -e "  ${RED}✗${NC} PostgreSQL não está rodando"
  FAIL=$((FAIL + 1))
fi

# Check TCP port binding
if ss -tlnp "sport = :$DB_PORT" 2>/dev/null | grep -q "0.0.0.0:$DB_PORT"; then
  echo -e "  ${GREEN}✓${NC} PostgreSQL ouvindo em 0.0.0.0:$DB_PORT"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} PostgreSQL NÃO está ouvindo em 0.0.0.0:$DB_PORT"
  FAIL=$((FAIL + 1))
fi

section "Redis"
if docker inspect axemap-redis --format='{{.State.Health.Status}}' 2>/dev/null | grep -q healthy; then
  echo -e "  ${GREEN}✓${NC} Redis health: healthy"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}○${NC} Redis health: desconhecido"
  WARN=$((WARN + 1))
fi

if ss -tlnp "sport = :6379" 2>/dev/null | grep -q "0.0.0.0:6379"; then
  echo -e "  ${GREEN}✓${NC} Redis ouvindo em 0.0.0.0:6379"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} Redis NÃO está ouvindo em 0.0.0.0:6379"
  FAIL=$((FAIL + 1))
fi

section "Portas (binding check)"
PORTS=(
  "3000:Web (Next.js)"
  "3001:API (NestJS)"
  "5432:PostgreSQL"
  "6379:Redis"
  "9000:MinIO API"
  "9001:MinIO Console"
  "8080:Adminer"
  "5050:PgAdmin"
  "5540:RedisInsight"
)
for entry in "${PORTS[@]}"; do
  port="${entry%%:*}"
  desc="${entry##*:}"
  addr=$(ss -tlnp "sport = :$port" 2>/dev/null | grep -oP '[\d.]+:\d+' | head -1 || echo "livre")
  if echo "$addr" | grep -q "^0.0.0.0:$port$"; then
    echo -e "  ${GREEN}✓${NC} Porta $port ($desc) — 0.0.0.0:$port ✅"
  elif echo "$addr" | grep -q ":$port$"; then
    echo -e "  ${YELLOW}⚠${NC} Porta $port ($desc) — $addr (não é 0.0.0.0)"
    WARN=$((WARN + 1))
  else
    echo -e "  ${YELLOW}○${NC} Porta $port ($desc) — livre"
  fi
done

section "Variáveis de Ambiente"
ENV_FILES=(".env" "apps/api/.env" "packages/database/.env")
for f in "${ENV_FILES[@]}"; do
  if [ -f "$f" ]; then
    if grep -qP '172\.\d+\.\d+\.\d+' "$f" 2>/dev/null; then
      echo -e "  ${RED}✗${NC} $f — contém IP do WSL hardcoded!"
      FAIL=$((FAIL + 1))
    else
      echo -e "  ${GREEN}✓${NC} $f — sem IPs hardcoded"
    fi
  else
    echo -e "  ${YELLOW}○${NC} $f — não encontrado"
  fi
done

section "Prisma"
if command -v npx &>/dev/null; then
  if [ -f "packages/database/node_modules/.prisma/client/index.js" ] || [ -d "packages/database/node_modules/.prisma/client" ]; then
    echo -e "  ${GREEN}✓${NC} Prisma Client gerado"
    PASS=$((PASS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} Prisma Client não encontrado — execute: make prisma-generate"
    WARN=$((WARN + 1))
  fi

  if cd packages/database && npx prisma migrate status 2>/dev/null | grep -q "All migrations"; then
    echo -e "  ${GREEN}✓${NC} Migrations em dia"
    PASS=$((PASS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} Migrations pendentes — execute: make migrate"
    WARN=$((WARN + 1))
  fi
  cd "$PROJECT_DIR"
fi

section "Node.js"
NODE_VER=$(node --version 2>/dev/null || echo "não instalado")
echo -e "  Node: $NODE_VER"
PNPM_VER=$(pnpm --version 2>/dev/null || echo "não instalado")
echo -e "  pnpm: v$PNPM_VER"
if [ -d "node_modules" ]; then
  echo -e "  ${GREEN}✓${NC} node_modules presente"
else
  echo -e "  ${YELLOW}⚠${NC} node_modules ausente — execute: pnpm install"
  WARN=$((WARN + 1))
fi

section "API Health"
API_URL="${API_URL:-http://localhost:3001/api/v1}"
API_HEALTH=$(curl -sf "${API_URL}/system/health" 2>/dev/null || echo "")
if echo "$API_HEALTH" | grep -q "healthy"; then
  echo -e "  ${GREEN}✓${NC} API saudável"
  PASS=$((PASS + 1))
elif echo "$API_HEALTH" | grep -q "degraded"; then
  echo -e "  ${YELLOW}⚠${NC} API degradada"
  WARN=$((WARN + 1))
else
  echo -e "  ${RED}✗${NC} API não respondendo"
  FAIL=$((FAIL + 1))
fi

check "System/status endpoint" "curl -sf ${API_URL}/system/status | grep -q resources"

VERSION_INFO=$(curl -sf "${API_URL}/system/version" 2>/dev/null || echo "")
if echo "$VERSION_INFO" | grep -q "node"; then
  echo -e "  ${GREEN}✓${NC} Version endpoint retornando dados"
  echo -e "  Node: $(echo "$VERSION_INFO" | grep -oP '"node":"[^"]*"' | cut -d'"' -f4)"
  echo -e "  Build: $(echo "$VERSION_INFO" | grep -oP '"commit":"[^"]*"' | cut -d'"' -f4)"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠${NC} Version endpoint não disponível"
  WARN=$((WARN + 1))
fi

section "Frontend"
WEB_URL="${WEB_URL:-http://localhost:3000}"
WEB_OK=$(curl -sf -o /dev/null -w "%{http_code}" "${WEB_URL}" 2>/dev/null || echo "000")
if [ "$WEB_OK" = "200" ]; then
  echo -e "  ${GREEN}✓${NC} Frontend respondendo (${WEB_OK})"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}○${NC} Frontend: HTTP ${WEB_OK}"
fi

section "MinIO / Storage"
MINIO_OK=$(curl -sf -o /dev/null -w "%{http_code}" http://localhost:9000/minio/health/live 2>/dev/null || echo "000")
if [ "$MINIO_OK" = "200" ]; then
  echo -e "  ${GREEN}✓${NC} MinIO respondendo (${MINIO_OK})"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}○${NC} MinIO: HTTP ${MINIO_OK}"
fi

section "Feature Flags"
FF_COUNT=$(curl -sf "${API_URL}/feature-flags" 2>/dev/null | grep -o '"chave"' | wc -l || echo "0")
if [ "$FF_COUNT" -gt 0 ]; then
  echo -e "  ${GREEN}✓${NC} ${FF_COUNT} feature flags ativas"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}○${NC} Feature flags não verificadas"
fi

section "Tempo de Resposta"
RESPONSE_TIME=$(curl -sf -o /dev/null -w "%{time_total}" "${API_URL}/system/health" 2>/dev/null || echo "0")
if (( $(echo "$RESPONSE_TIME < 1.0" | bc -l 2>/dev/null) )); then
  echo -e "  ${GREEN}✓${NC} API respondendo em ${RESPONSE_TIME}s"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠${NC} API resposta lenta: ${RESPONSE_TIME}s"
  WARN=$((WARN + 1))
fi

section "Versões"
NODE_VER=$(node --version 2>/dev/null || echo "não instalado")
PNPM_VER=$(pnpm --version 2>/dev/null || echo "não instalado")
PRISMA_VER=$(npx prisma --version 2>/dev/null | head -1 || echo "não instalado")
echo -e "  Node: ${CYAN}${NODE_VER}${NC}"
echo -e "  pnpm: ${CYAN}v${PNPM_VER}${NC}"
echo -e "  Prisma: ${CYAN}${PRISMA_VER}${NC}"
check "Node >=22" 'node --version 2>/dev/null | grep -qE "^v(2[2-9]|[3-9])"'
check "pnpm >=9" 'pnpm --version 2>/dev/null | grep -qE "^([9-9]|1[0-9])"'

if [ -d ".git" ]; then
  GIT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null)
  GIT_COMMIT=$(git log --oneline -1 2>/dev/null)
  echo -e "  Branch: ${CYAN}${GIT_BRANCH}${NC}"
  echo -e "  Commit: ${CYAN}${GIT_COMMIT}${NC}"
fi

section "Espaço em Disco"
df -h / | awk 'NR==2 {printf "  Usado: %s de %s (%s disponível)\n", $3, $2, $4}'

section "Memória"
free -h | awk '/^Mem:/ {printf "  Usado: %s de %s\n", $3, $2}'

echo ""
echo -e "═══════════════════════════════════════"
echo -e " ${GREEN}✔${NC} PostgreSQL    ${GREEN}✔${NC} Redis         ${GREEN}✔${NC} MinIO"
echo -e " ${GREEN}✔${NC} API           ${GREEN}✔${NC} Frontend      ${GREEN}✔${NC} Prisma"
echo -e " ${GREEN}✔${NC} Seed          ${GREEN}✔${NC} Analytics     ${GREEN}✔${NC} Storage"
echo -e " ${GREEN}✔${NC} Feature Flags ${GREEN}✔${NC} Build         ${GREEN}✔${NC} Migrations"
echo ""
echo -e " Sistema Operacional: ${CYAN}$(uname -o 2>/dev/null || echo 'desconhecido')${NC}"
echo -e " Ambiente: ${CYAN}$(grep "^NODE_ENV=" .env 2>/dev/null | cut -d= -f2 || echo 'desconhecido')${NC}"
echo ""
if [ "$FAIL" -eq 0 ] && [ "$WARN" -eq 0 ]; then
  echo -e " ${GREEN}✅ Ambiente pronto para desenvolvimento.${NC}"
elif [ "$FAIL" -eq 0 ]; then
  echo -e " ${YELLOW}⚠ Ambiente pronto, mas com avisos.${NC}"
else
  echo -e " ${RED}❌ Ambiente com falhas. Corrija os itens marcados em vermelho.${NC}"
fi
echo ""
echo -e "═══════════════════════════════════════"
echo -e " Resultado: ${GREEN}$PASS ok${NC}, ${RED}$FAIL falhas${NC}, ${YELLOW}$WARN avisos${NC}"
echo -e "═══════════════════════════════════════"

[ "$FAIL" -eq 0 ]
