#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# backup-db.sh — Backup do PostgreSQL (dev e produção via Docker)
#
# Detecta o compose file com o container postgres em execução
# (prod > dev > root) e faz pg_dump via "docker exec". Se o container não
# estiver rodando, tenta pg_dump direto usando DATABASE_URL ou
# MIGRATION_DATABASE_URL (este último aponta para 127.0.0.1:5432 na VPS).
#
# NUNCA imprime senha/URL de conexão.
# Saída: backups/<timestamp>.sql.gz + verificação de integridade + retenção.
# =============================================================================

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"

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

POSTGRES_USER="${POSTGRES_USER:-axemap}"
POSTGRES_DB="${POSTGRES_DB:-axemap_dev}"

TIMESTAMP=$(date +%Y-%m-%d-%H%M)
BACKUP_FILE="$BACKUP_DIR/$TIMESTAMP.sql.gz"

# Detecta o primeiro compose file com o postgres em execução
detect_compose() {
  for cf in docker/docker-compose.prod.yml docker/docker-compose.dev.yml docker-compose.yml; do
    if docker compose -f "$cf" ps postgres 2>/dev/null | grep -q "Up\|running"; then
      printf '%s' "$cf"
      return 0
    fi
  done
  return 1
}

echo -e "${CYAN}Criando backup do banco de dados...${NC}"
COMPOSE="$(detect_compose || true)"

if [ -n "$COMPOSE" ]; then
  echo -e "  Via container ($COMPOSE)"
  docker compose -f "$COMPOSE" exec -T postgres \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists 2>/dev/null \
    | gzip > "$BACKUP_FILE"
else
  echo -e "${YELLOW}Container PostgreSQL não encontrado. Tentando conexão direta...${NC}"
  if command -v pg_dump &>/dev/null; then
    URL="${DATABASE_URL:-${MIGRATION_DATABASE_URL:-}}"
    if [ -z "$URL" ]; then
      echo -e "${YELLOW}DATABASE_URL/MIGRATION_DATABASE_URL não definido.${NC}"
      exit 1
    fi
    pg_dump "$URL" --clean --if-exists 2>/dev/null | gzip > "$BACKUP_FILE"
  else
    echo -e "${YELLOW}pg_dump não disponível localmente e container não rodando.${NC}"
    exit 1
  fi
fi

# Verificar integridade
if [ -s "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "  ${GREEN}✓${NC} Backup salvo: $BACKUP_FILE ($SIZE)"

  if gzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} Integridade verificada"
  else
    echo -e "  ${YELLOW}⚠ Backup corrompido!${NC}"
    rm -f "$BACKUP_FILE"
    exit 1
  fi
else
  echo -e "${YELLOW}⚠ Backup vazio ou falhou.${NC}"
  rm -f "$BACKUP_FILE"
  exit 1
fi

# Rotação: manter os 30 backups mais recentes
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm
echo -e "  ${GREEN}✓${NC} Retenção aplicada (mantidos: 30 mais recentes)"