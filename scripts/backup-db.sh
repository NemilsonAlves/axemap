#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +%Y-%m-%d-%H%M)
BACKUP_FILE="$BACKUP_DIR/$TIMESTAMP.sql.gz"

echo -e "${CYAN}Criando backup do banco de dados...${NC}"

# Verificar container
if ! docker compose -f docker/docker-compose.dev.yml ps postgres 2>/dev/null | grep -q "Up\|running"; then
  echo -e "${YELLOW}Container PostgreSQL não encontrado. Tentando conexão direta...${NC}"
  if command -v pg_dump &>/dev/null; then
    export $(grep -v '^#' .env 2>/dev/null | xargs)
    pg_dump "$DATABASE_URL" 2>/dev/null | gzip > "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup direto salvo em: $BACKUP_FILE${NC}"
    exit 0
  else
    echo -e "${YELLOW}pg_dump não disponível localmente e container não rodando.${NC}"
    exit 1
  fi
fi

# Backup via container
docker compose -f docker/docker-compose.dev.yml exec -T postgres pg_dump -U axemap -d axemap_dev --clean --if-exists 2>/dev/null | gzip > "$BACKUP_FILE"

# Verificar integridade
if [ -s "$BACKUP_FILE" ]; then
  SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo -e "  ${GREEN}✓${NC} Backup salvo: $BACKUP_FILE ($SIZE)"

  # Testar integridade (ler o cabeçalho gzip)
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

# Rotação: manter últimos 30 backups diários + 4 semanais
echo -e "  Aplicando política de retenção..."
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +31 | xargs -r rm
echo -e "  ${GREEN}✓${NC} Backups antigos removidos (mantidos: 30 mais recentes)"
