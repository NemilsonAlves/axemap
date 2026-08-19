#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# migrate-deploy.sh
#
# Pipeline oficial de MIGRAÇÃO DE PRODUÇÃO:
#
#   1. Validação SHADOW_DATABASE_URL (proteção anti-incidente)
#   2. Backup do banco (pré-migração)
#   3. prisma migrate status
#   4. prisma migrate deploy
#   5. prisma generate
#   6. Health check
#   7. Smoke test (opcional)
#
# NUNCA use `prisma migrate reset` ou `prisma db push` em produção.
#
# Uso:
#   bash scripts/migrate-deploy.sh            # executa pipeline completa
#   bash scripts/migrate-deploy.sh --no-smoke # pula smoke test
#   bash scripts/migrate-deploy.sh --no-backup
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

RUN_SMOKE=1
RUN_BACKUP=1
for arg in "$@"; do
  case "$arg" in
    --no-smoke) RUN_SMOKE=0 ;;
    --no-backup) RUN_BACKUP=0 ;;
  esac
done

step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }

step "[1/7] Validando SHADOW_DATABASE_URL"
bash scripts/check-shadow-db.sh

if [ "$RUN_BACKUP" = "1" ]; then
  step "[2/7] Backup pré-migração"
  bash scripts/backup-db.sh
else
  step "[2/7] Backup pré-migração — PULADO (--no-backup)"
fi

step "[3/7] Migration status"
pnpm --filter @axemap/database exec prisma migrate status

step "[4/7] Migration deploy"
pnpm --filter @axemap/database exec prisma migrate deploy

step "[5/7] Prisma generate"
pnpm --filter @axemap/database exec prisma generate

step "[6/7] Health check"
HEALTH_URL="${HEALTH_URL:-http://localhost:3001/api/v1/health/db}"
status="$(curl -fsS --max-time 10 "$HEALTH_URL" 2>/dev/null || echo '{"status":"error"}')"
db_status="$(printf '%s' "$status" | sed -n 's/.*"status":"\([^"]*\)".*/\1/p')"
if [ "$db_status" = "ok" ]; then
  ok "Banco de dados saudável: $HEALTH_URL"
else
  echo -e "${RED}  ✗ Banco de dados não respondeu 'ok': $status${NC}"
  echo -e "${RED}  Aplicação pode estar fora do ar — investigue antes de continuar.${NC}"
  exit 1
fi

if [ "$RUN_SMOKE" = "1" ]; then
  step "[7/7] Smoke test"
  bash scripts/smoke.sh
else
  step "[7/7] Smoke test — PULADO (--no-smoke)"
fi

echo -e "\n${GREEN}✓ Migration deploy concluído com sucesso.${NC}"