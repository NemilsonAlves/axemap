#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# restore-db.sh — Restauração do PostgreSQL (dev e produção via Docker)
#
# ⚠️ RESTORE É DESTRUTIVO — exige confirmação explícita ("restaurar").
# ⚠️ Faz um backup de segurança dos dados atuais ANTES de restaurar.
#
# Detecta o compose file com o postgres em execução (prod > dev > root) e
# restaura via "docker exec psql". Se o container não estiver rodando, tenta
# psql direto usando DATABASE_URL ou MIGRATION_DATABASE_URL.
#
# NUNCA imprime senha/URL de conexão.
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"

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

echo -e "${CYAN}Restauração de Backup${NC}"
echo ""

# Listar backups disponíveis
BACKUPS=($(ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null || true))

if [ ${#BACKUPS[@]} -eq 0 ]; then
  echo -e "${RED}Nenhum backup encontrado em $BACKUP_DIR${NC}"
  exit 1
fi

echo -e "Backups disponíveis:"
echo ""
for i in "${!BACKUPS[@]}"; do
  SIZE=$(du -h "${BACKUPS[$i]}" | cut -f1)
  echo -e "  [$((i + 1))] $(basename "${BACKUPS[$i]}") (${SIZE})"
done

echo ""
read -p "Digite o número do backup para restaurar [1-${#BACKUPS[@]}]: " choice

if ! [[ "$choice" =~ ^[0-9]+$ ]] || [ "$choice" -lt 1 ] || [ "$choice" -gt "${#BACKUPS[@]}" ]; then
  echo -e "${RED}Opção inválida.${NC}"
  exit 1
fi

SELECTED="${BACKUPS[$((choice - 1))]}"

# Validar arquivo antes de prosseguir
if ! gzip -t "$SELECTED" 2>/dev/null; then
  echo -e "${RED}Arquivo de backup corrompido ou inválido: $(basename "$SELECTED")${NC}"
  exit 1
fi

echo ""
echo -e "${YELLOW}⚠  ATENÇÃO: Isso vai SOBRESCREVER todos os dados atuais!${NC}"
echo -e "  Backup selecionado: $(basename "$SELECTED")"
echo ""
read -p "Digite 'restaurar' para confirmar: " confirm

if [ "$confirm" != "restaurar" ]; then
  echo -e "${CYAN}Operação cancelada.${NC}"
  exit 0
fi

echo ""
echo -e "${CYAN}Restaurando backup...${NC}"

# Backup automático de segurança antes de restaurar
PRE_RESTORE="$BACKUP_DIR/pre-restore-$(date +%Y-%m-%d-%H%M).sql.gz"
echo -e "  Backup de segurança dos dados atuais..."

COMPOSE="$(detect_compose || true)"

if [ -n "$COMPOSE" ]; then
  docker compose -f "$COMPOSE" exec -T postgres \
    pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>/dev/null | gzip > "$PRE_RESTORE"
else
  if command -v pg_dump &>/dev/null; then
    URL="${DATABASE_URL:-${MIGRATION_DATABASE_URL:-}}"
    if [ -n "$URL" ]; then
      pg_dump "$URL" 2>/dev/null | gzip > "$PRE_RESTORE"
    fi
  fi
fi

if [ -s "$PRE_RESTORE" ]; then
  echo -e "  ${GREEN}✓${NC} Backup salvo: $PRE_RESTORE"
else
  echo -e "  ${YELLOW}⚠ Não foi possível gerar backup de segurança — prosseguindo com cautela.${NC}"
fi

# Restaurar
echo -e "  Restaurando $(basename "$SELECTED")..."
if [ -n "$COMPOSE" ]; then
  gunzip -c "$SELECTED" | docker compose -f "$COMPOSE" exec -T postgres \
    psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" 2>&1 | tail -n 20 || {
    echo -e "${RED}Falha na restauração.${NC}"
    exit 1
  }
else
  if command -v psql &>/dev/null; then
    URL="${DATABASE_URL:-${MIGRATION_DATABASE_URL:-}}"
    if [ -z "$URL" ]; then
      echo -e "${RED}DATABASE_URL/MIGRATION_DATABASE_URL não definido e container não rodando.${NC}"
      exit 1
    fi
    gunzip -c "$SELECTED" | psql "$URL" 2>&1 | tail -n 20 || {
      echo -e "${RED}Falha na restauração.${NC}"
      exit 1
    }
  else
    echo -e "${RED}psql não disponível localmente e container não rodando.${NC}"
    exit 1
  fi
fi

echo -e "  ${GREEN}✓${NC} Backup restaurado com sucesso!"
echo -e "  ${YELLOW}Execute 'make migrate' se houver mudanças no schema desde o backup.${NC}"