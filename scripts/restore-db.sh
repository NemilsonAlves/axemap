#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="$PROJECT_DIR/backups"

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

# Verificar container
if ! docker compose -f docker/docker-compose.dev.yml ps postgres 2>/dev/null | grep -q "Up\|running"; then
  echo -e "${RED}Container PostgreSQL não está rodando.${NC}"
  exit 1
fi

# Backup automático de segurança antes de restaurar
PRE_RESTORE="$BACKUP_DIR/pre-restore-$(date +%Y-%m-%d-%H%M).sql.gz"
echo -e "  Backup de segurança dos dados atuais..."
docker compose -f docker/docker-compose.dev.yml exec -T postgres pg_dump -U axemap -d axemap_dev 2>/dev/null | gzip > "$PRE_RESTORE"
echo -e "  ${GREEN}✓${NC} Backup salvo: $PRE_RESTORE"

# Restaurar
echo -e "  Restaurando $(basename "$SELECTED")..."
gunzip -c "$SELECTED" | docker compose -f docker/docker-compose.dev.yml exec -T postgres psql -U axemap -d axemap_dev 2>&1 || {
  echo -e "${RED}Falha na restauração.${NC}"
  exit 1
}

echo -e "  ${GREEN}✓${NC} Backup restaurado com sucesso!"
echo -e "  ${YELLOW}Execute 'make migrate' se houver mudanças no schema desde o backup.${NC}"
