#!/usr/bin/env bash
# scripts/lib-migrate-status.sh
#
# Lógica da etapa [3/7] Migration status do migrate-deploy.sh.
#
# O `prisma migrate status` (Prisma >= 4.3.0) retorna exit code 1 em CINCO
# condições distintas (ver docs oficiais /cli/migrate/status):
#   1. erro de conexão ............ P1001/P1003 ("Error: P1...")
#   2. migrations pendentes ........ "have not yet been applied"
#   3. histórico divergente ........ "not found locally in prisma/migrations"
#   4. sem tabela de migrations .... "No migration table"
#   5. migration falhou ............ "failed migration" / P3009/P3015
#
# Como todas retornam exit 1, o exit code sozinho NÃO distingue pendentes de
# erro real. Esta função decide pela SAÍDA do comando:
#   - exit 0                 -> banco em dia: apenas informa e continua.
#   - somente pendentes      -> informa e continua (o deploy, etapa 4/7,
#                               é justamente quem vai aplicá-las).
#   - qualquer outro motivo  -> imprime a saída e ABORTA o pipeline.
#
# Depende de: prisma_cmd (definido no migrate-deploy.sh), echo, grep.

: "${YELLOW:=\033[1;33m}"
: "${RED:=\033[0;31m}"
: "${NC:=\033[0m}"

migrate_status() {
  local output code
  if output="$(prisma_cmd migrate status 2>&1)"; then
    printf '%s\n' "$output"
    return 0
  fi
  code=$?
  printf '%s\n' "$output"
  if printf '%s' "$output" | grep -qi 'have not yet been applied' \
    && ! printf '%s' "$output" | grep -qiE 'Error: P|not found locally|No migration table|failed migration|schema validation|shadow database'; then
    echo -e "${YELLOW}  ⚠ Há migrations pendentes (exit $code) — a etapa 4/7 (deploy) irá aplicá-las.${NC}"
    return 0
  fi
  echo -e "${RED}  ✗ prisma migrate status falhou (exit $code) — abortando o pipeline.${NC}" >&2
  exit 1
}