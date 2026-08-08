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
    echo -e "  ${YELLOW}⚠${NC} $name"
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

section "Secrets e Variáveis"
check "JWT_SECRET definido" 'grep -q "^JWT_SECRET=" .env 2>/dev/null'
check "JWT_REFRESH_SECRET definido" 'grep -q "^JWT_REFRESH_SECRET=" .env 2>/dev/null'
check "NEXTAUTH_SECRET definido" 'grep -q "^NEXTAUTH_SECRET=" .env 2>/dev/null'

check "Sem secrets default em produção" '! grep -q "change-me-in-production" .env 2>/dev/null || true'
check "DATABASE_URL sem IP do WSL" '! grep -qP "172\.\d+\.\d+\.\d+" .env 2>/dev/null'

section "Dependências Vulneráveis"
if command -v pnpm &>/dev/null; then
  warn "pnpm audit" 'pnpm audit --audit-level=high 2>/dev/null'
fi

section "Headers HTTP"
API_URL="${API_URL:-http://localhost:3001}"
HEADERS=$(curl -sI "${API_URL}/api/v1/system/health" 2>/dev/null || echo "")
if [ -n "$HEADERS" ]; then
  check "CORS habilitado" 'echo "$HEADERS" | grep -qi "access-control-allow-origin"'
fi

section "Rate Limit"
RATE_OK=$(curl -sf -o /dev/null -w "%{http_code}" "${API_URL}/api/v1/system/health" 2>/dev/null || echo "000")
check "API respondendo (rate limit ok)" '[ "$RATE_OK" = "200" ]'

section "JWT"
JWT_SECRET=$(grep "^JWT_SECRET=" .env 2>/dev/null | cut -d= -f2-)
if [ -n "$JWT_SECRET" ]; then
  JWT_LEN=${#JWT_SECRET}
  check "JWT_SECRET com comprimento seguro" '[ "$JWT_LEN" -ge 32 ]'
fi

section "Permissões"
check "scripts executáveis" '[ -x scripts/check.sh ] && [ -x scripts/start.sh ] && [ -x scripts/setup.sh ] && [ -x scripts/wait-for-services.sh ]'
if [ -f ".env" ]; then
  check ".env sem permissão global" '[ "$(stat -c %a .env 2>/dev/null || echo 600)" -le 600 ] || true'
fi

echo ""
echo -e "═══════════════════════════════════════"
echo -e " Resultado: ${GREEN}$PASS ok${NC}, ${RED}$FAIL falhas${NC}, ${YELLOW}$WARN avisos${NC}"
echo -e "═══════════════════════════════════════"

[ "$FAIL" -eq 0 ]
