#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${YELLOW}⚠  ATENÇÃO: Isso vai destruir TODOS os dados do banco!${NC}"
echo -e "${YELLOW}   Banco: axemap_dev (localhost:5432)${NC}"
echo ""
read -p "Você tem certeza? (digite 'reset' para confirmar) " confirm

if [ "$confirm" != "reset" ]; then
  echo -e "${CYAN}Operação cancelada.${NC}"
  exit 0
fi

echo ""
echo -e "${CYAN}Resetando banco de dados...${NC}"

# Verificar se o container está rodando
if ! docker compose -f docker/docker-compose.dev.yml ps postgres 2>/dev/null | grep -q "Up\|running"; then
  echo -e "${RED}Container PostgreSQL não está rodando. Execute: docker compose -f docker/docker-compose.dev.yml up -d${NC}"
  exit 1
fi

# Backup automático de segurança
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/pre-reset-$(date +%Y-%m-%d-%H%M).sql.gz"
echo -e "  Criando backup de segurança em ${BACKUP_FILE}..."
docker compose -f docker/docker-compose.dev.yml exec -T postgres pg_dump -U axemap -d axemap_dev 2>/dev/null | gzip > "$BACKUP_FILE"
echo -e "  ${GREEN}✓${NC} Backup salvo em $BACKUP_FILE"

# Reset via Prisma
echo -e "  Executando prisma migrate reset..."
cd packages/database
npx prisma migrate reset --force 2>&1 || {
  echo -e "${RED}Falha ao resetar banco via Prisma. Tentando via SQL direto...${NC}"
  # Fallback: dropar e recriar banco via SQL
  docker compose -f "$PROJECT_DIR/docker/docker-compose.dev.yml" exec -T postgres psql -U axemap -c "DROP DATABASE IF EXISTS axemap_dev;" 2>&1
  docker compose -f "$PROJECT_DIR/docker/docker-compose.dev.yml" exec -T postgres psql -U axemap -c "CREATE DATABASE axemap_dev;" 2>&1
  npx prisma migrate deploy 2>&1
}
cd "$PROJECT_DIR"

echo -e "  Executando seed..."
cd packages/database
npx prisma db seed 2>&1 || echo -e "  ${YELLOW}⚠ Seed falhou${NC}"
cd "$PROJECT_DIR"

echo ""
echo -e "${GREEN}✓ Banco resetado e seed aplicada com sucesso!${NC}"
