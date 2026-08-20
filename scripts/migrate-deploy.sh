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
#   7. Smoke test (opcional — em produção preferir --no-smoke)
#
# NUNCA use `prisma migrate reset` ou `prisma db push` em produção.
#
# Leitura de ambiente: .env.production (se existir) senão .env.
# O prisma pode rodar em DOIS contextos distintos:
#   - HOST (pnpm instalado): usa MIGRATION_DATABASE_URL (127.0.0.1:5432) —
#     o postgres é publicado pelo compose no 127.0.0.1 do host.
#   - CONTAINER (sem pnpm; `docker compose run api`): o container temporário
#     entra na rede axemap_internal, onde o PostgreSQL é alcançável pelo
#     hostname do serviço "postgres". Dentro do container, 127.0.0.1/localhost
#     apontam para o PRÓPRIO container e NÃO alcançam o banco.
# Por isso o script reescreve o host de DATABASE_URL (e SHADOW_DATABASE_URL)
# para "postgres" somente quando executa pelo fallback de container.
#
# Uso:
#   bash scripts/migrate-deploy.sh            # executa pipeline completa
#   bash scripts/migrate-deploy.sh --no-smoke # pula smoke test (recomendado em prod)
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

# Carrega .env.production (se existir) senão .env — sem imprimir valores.
ENV_FILE=""
if [ -f "$PROJECT_DIR/.env.production" ]; then
  ENV_FILE="$PROJECT_DIR/.env.production"
elif [ -f "$PROJECT_DIR/.env" ]; then
  ENV_FILE="$PROJECT_DIR/.env"
fi
if [ -n "$ENV_FILE" ]; then
  export $(grep -vE '^\s*#|^\s*$' "$ENV_FILE" | xargs) 2>/dev/null || true
fi

step() { echo -e "\n${CYAN}▶ $1${NC}"; }
ok()   { echo -e "${GREEN}  ✓ $1${NC}"; }

# Em produção, o prisma roda no host e precisa de uma URL alcançável
# (127.0.0.1:5432), não do hostname interno do Docker ("postgres").
# Aplicado ANTES do check de shadow para validar a URL que será usada.
if [ -n "${MIGRATION_DATABASE_URL:-}" ]; then
  export DATABASE_URL="$MIGRATION_DATABASE_URL"
  echo -e "${GREEN}  ✓${NC} DATABASE_URL apontada para MIGRATION_DATABASE_URL (host)"
fi

# Reescreve o host de uma URL de banco para o hostname do serviço "postgres"
# da rede Docker do compose (axemap_internal). Necessário quando o prisma roda
# DENTRO de um container `docker compose run`: ali 127.0.0.1/localhost é o
# PRÓPRIO container, não o host. Idempotente — se o host já for "postgres",
# a URL é devolvida como está.
container_db_url() {
  local url="$1"
  if [[ "$url" =~ ^(postgres(ql)?://[^@]*@)([^/:]+)(:[0-9]+)?(/.*)?$ ]]; then
    printf '%spostgres:5432%s\n' "${BASH_REMATCH[1]}" "${BASH_REMATCH[5]:-}"
  else
    printf '%s\n' "$url"
  fi
}

# Executa um comando prisma. Prefere pnpm no host; caso contrário usa o
# prisma do container api (docker compose run). O contexto decide o hostname
# correto do PostgreSQL (ver comentário no cabeçalho).
prisma_cmd() {
  if command -v pnpm &>/dev/null; then
    # CONTEXTO HOST — a URL do host (127.0.0.1 via MIGRATION_DATABASE_URL)
    # já está correta para o prisma rodando no host.
    pnpm --filter @axemap/database exec prisma "$@"
  else
    # CONTEXTO CONTAINER — `docker compose run` herda o env do host por
    # padrão, então a URL deve ser reescrita e injetada via --env. O --env
    # tem precedência sobre o bloco `environment:` do serviço no compose.
    local db_url
    db_url="$(container_db_url "${DATABASE_URL:-}")"
    local -a run_env=("--env" "DATABASE_URL=$db_url")
    if [ -n "${SHADOW_DATABASE_URL:-}" ]; then
      run_env+=("--env" "SHADOW_DATABASE_URL=$(container_db_url "$SHADOW_DATABASE_URL")")
    fi
    if [ "$db_url" != "${DATABASE_URL:-}" ]; then
      echo -e "${CYAN}  ↪ DATABASE_URL reescrita para o hostname Docker 'postgres'${NC}"
    fi
    # A imagem runtime da API materializa @axemap/database em node_modules
    # (cp -rL no Dockerfile.api); o schema não fica em /app/prisma.
    docker compose -f docker/docker-compose.prod.yml run --rm \
      "${run_env[@]}" \
      api \
      npx prisma "$@" --schema /app/node_modules/@axemap/database/prisma/schema.prisma
  fi
}

step "[1/7] Validando SHADOW_DATABASE_URL"
bash scripts/check-shadow-db.sh

if [ "$RUN_BACKUP" = "1" ]; then
  step "[2/7] Backup pré-migração"
  bash scripts/backup-db.sh
else
  step "[2/7] Backup pré-migração — PULADO (--no-backup)"
fi

# Migrations pendentes NÃO são erro do status — o deploy (4/7) irá aplicá-las.
# A função decide por saída/exit code e aborta apenas em erro real.
source "$PROJECT_DIR/scripts/lib-migrate-status.sh"

step "[3/7] Migration status"
migrate_status

step "[4/7] Migration deploy"
prisma_cmd migrate deploy

step "[5/7] Prisma generate"
prisma_cmd generate

step "[6/7] Health check"
if [ -z "${HEALTH_URL:-}" ]; then
  if [ "$NODE_ENV" = "production" ]; then
    HEALTH_URL="${API_HEALTH_URL:-https://api.axemap.com.br/api/v1/health/db}"
  else
    HEALTH_URL="${API_HEALTH_URL:-http://localhost:3001/api/v1/health/db}"
  fi
fi
status="$(curl -fsS --max-time 15 "$HEALTH_URL" 2>/dev/null || echo '{"status":"error"}')"
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