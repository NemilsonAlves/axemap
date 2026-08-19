#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PASS=0
FAIL=0

check() {
  local name="$1" cmd="$2"
  if eval "$cmd" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} $name"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}✗${NC} $name"
    FAIL=$((FAIL + 1))
  fi
}

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_URL="${API_URL:-http://localhost:3001/api/v1}"
WEB_URL="${WEB_URL:-http://localhost:3000}"

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  Smoke Tests - AxéMap${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "  API: ${API_URL}"
echo -e "  Web: ${WEB_URL}"
echo ""

echo -e "\n${CYAN}——— Health Checks (endpoints públicos) ———${NC}"
check "Health endpoint" "curl -sf ${API_URL}/system/health | grep -q healthy"
check "Liveness endpoint" "curl -sf ${API_URL}/system/liveness | grep -q alive"
check "Readiness endpoint" "curl -sf ${API_URL}/system/readiness | grep -q ready"

echo -e "\n${CYAN}——— Auth ———${NC}"
SIGNUP_RESP=$(curl -sf -X POST "${API_URL}/auth/signup" \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke-test@axemap.com","nome":"Smoke Test","senha":"Test1234"}' 2>/dev/null || echo "")
if [ -n "$SIGNUP_RESP" ]; then
  TOKEN=$(echo "$SIGNUP_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
  echo -e "  ${GREEN}✓${NC} Signup"
  PASS=$((PASS + 1))
else
  echo -e "  ${YELLOW}⚠${NC} Signup (pode já existir)"
  WARN=$((WARN + 1))
fi

LOGIN_RESP=$(curl -sf -X POST "${API_URL}/auth/login" \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke-test@axemap.com","senha":"Test1234"}' 2>/dev/null || echo "")
TOKEN=$(echo "$LOGIN_RESP" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
  echo -e "  ${GREEN}✓${NC} Login"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} Login"
  FAIL=$((FAIL + 1))
fi

REFRESH_RESP=$(curl -sf -X POST "${API_URL}/auth/refresh" \
  -H 'Content-Type: application/json' \
  -d '{"refreshToken":"'"$(echo "$LOGIN_RESP" | grep -o '"refreshToken":"[^"]*"' | cut -d'"' -f4)"'"}' 2>/dev/null || echo "")
if echo "$REFRESH_RESP" | grep -q accessToken; then
  echo -e "  ${GREEN}✓${NC} Refresh Token"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} Refresh Token"
  FAIL=$((FAIL + 1))
fi

echo -e "\n${CYAN}——— Terreiros ———${NC}"
TERREIROS=$(curl -sf "${API_URL}/terreiros" 2>/dev/null || echo "")
if echo "$TERREIROS" | grep -q "id\|nome"; then
  echo -e "  ${GREEN}✓${NC} Listar Terreiros"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} Listar Terreiros"
  FAIL=$((FAIL + 1))
fi

if [ -n "${TOKEN:-}" ]; then
  CREATE_RESP=$(curl -sf -X POST "${API_URL}/terreiros" \
    -H "Authorization: Bearer $TOKEN" \
    -H 'Content-Type: application/json' \
    -d '{"nome":"Terreiro Smoke Test","slug":"terreiro-smoke-test","tradicao":"UMBANDA","cidade":"São Paulo","estado":"SP","latitude":-23.55,"longitude":-46.63}' 2>/dev/null || echo "")
  if echo "$CREATE_RESP" | grep -q "id"; then
    TERREIRO_ID=$(echo "$CREATE_RESP" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    echo -e "  ${GREEN}✓${NC} Criar Terreiro"
    PASS=$((PASS + 1))
  else
    echo -e "  ${YELLOW}⚠${NC} Criar Terreiro"
    WARN=$((WARN + 1))
  fi
fi

echo -e "\n${CYAN}——— Feedbacks ———${NC}"
FB_RESP=$(curl -sf -X POST "${API_URL}/feedback" \
  -H 'Content-Type: application/json' \
  -d '{"tipo":"SUGESTAO","mensagem":"Smoke test feedback","pagina":"/"}' 2>/dev/null || echo "")
if echo "$FB_RESP" | grep -q "id\|mensagem"; then
  echo -e "  ${GREEN}✓${NC} Feedback"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}✗${NC} Feedback"
  FAIL=$((FAIL + 1))
fi

echo -e "\n${CYAN}——— Frontend ———${NC}"
check "Web acessível" "curl -sf -o /dev/null -w '%{http_code}' ${WEB_URL} | grep -q 200"
check "Sitemap" "curl -sf -o /dev/null -w '%{http_code}' ${WEB_URL}/sitemap.xml | grep -q 200"

echo ""
echo -e "═══════════════════════════════════════"
echo -e " Resultado: ${GREEN}${PASS} pass${NC}, ${RED}${FAIL} fail${NC}"
echo -e "═══════════════════════════════════════"

[ "$FAIL" -eq 0 ]
