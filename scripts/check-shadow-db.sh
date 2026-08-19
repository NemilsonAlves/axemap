#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# check-shadow-db.sh
#
# Proteção contra o incidente de SHADOW DATABASE apontando para o banco
# principal. Antes de QUALQUER operação de migração, valide que
# DATABASE_URL != SHADOW_DATABASE_URL.
#
# Se forem iguais: ABORTA com código de saída 1.
#
# Uso:
#   bash scripts/check-shadow-db.sh              # lê de .env (raiz)
#   DATABASE_URL=... SHADOW_DATABASE_URL=... bash scripts/check-shadow-db.sh
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="${ENV_FILE:-$PROJECT_DIR/.env}"

if [ -f "$ENV_FILE" ]; then
  export $(grep -v '^#' "$ENV_FILE" | xargs) 2>/dev/null || true
fi

DATABASE_URL="${DATABASE_URL:-}"
SHADOW_DATABASE_URL="${SHADOW_DATABASE_URL:-}"

# Normalização: remove esquema de query string, user:senha e diferenciação de
# host local (localhost vs 127.0.0.1) para comparação robusta.
normalize_url() {
  local url="$1"
  # remove query string (?suffix)
  url="${url%%\?*}"
  # remove credenciais (scheme://user:pass@host -> scheme://host)
  url="$(printf '%s' "$url" | sed -E 's#^(.*//)[^/@]+:[^/@]+@#\1#')"
  # normaliza 127.0.0.1 -> localhost
  url="$(printf '%s' "$url" | sed -E 's#127\.0\.0\.1#localhost#g')"
  # remove barras finais
  url="${url%/}"
  printf '%s' "$url"
}

if [ -z "$DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠ DATABASE_URL não definido — abortando por segurança.${NC}"
  exit 1
fi

if [ -z "$SHADOW_DATABASE_URL" ]; then
  echo -e "${YELLOW}⚠ SHADOW_DATABASE_URL não definido — sem proteção contra incidente.${NC}"
  echo -e "${YELLOW}  Defina SHADOW_DATABASE_URL em um banco SEPARADO do principal.${NC}"
  exit 1
fi

NORM_DB="$(normalize_url "$DATABASE_URL")"
NORM_SHADOW="$(normalize_url "$SHADOW_DATABASE_URL")"

if [ "$NORM_DB" = "$NORM_SHADOW" ]; then
  echo -e "${RED}==============================================================================${NC}"
  echo -e "${RED}ERRO CRÍTICO: SHADOW DATABASE NÃO PODE APONTAR PARA O BANCO PRINCIPAL.${NC}"
  echo -e "${RED}==============================================================================${NC}"
  echo -e "${RED}  DATABASE_URL:      ${DATABASE_URL}${NC}"
  echo -e "${RED}  SHADOW_DATABASE_URL: ${SHADOW_DATABASE_URL}${NC}"
  echo ""
  echo -e "${RED}  Este incidente já destruiu o schema do banco em 15/08/2026.${NC}"
  echo -e "${RED}  Abortando operação. Corrija SHADOW_DATABASE_URL antes de continuar.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ SHADOW_DATABASE_URL aponta para banco distinto do principal.${NC}"
exit 0