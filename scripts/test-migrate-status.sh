#!/usr/bin/env bash
# scripts/test-migrate-status.sh
#
# Testes de unidade da lógica da etapa [3/7] Migration status
# (scripts/lib-migrate-status.sh).
#
# Simula prisma_cmd com as saídas/exit codes REAIS do Prisma e valida que:
#   a) status exit 0 (banco em dia)          -> continua
#   b) exit 1 apenas migrations pendentes    -> continua (deploy aplica)
#   c) exit 1 P1001 (erro de conexão)        -> aborta
#   d) exit 1 P3009 (migration falhou)       -> aborta
#   e) exit 1 erro genérico                  -> aborta
#   f) exit 1 histórico divergente           -> aborta
#   g) exit 1 sem tabela de migrations       -> aborta
#
# Opcional (integração real): defina INTEGRATION_DATABASE_URL para rodar a
# função contra o Prisma real e validar o fluxo de "pendentes" de ponta a ponta.
#
# Uso: bash scripts/test-migrate-status.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/lib-migrate-status.sh"

PASS=0
FAIL=0

# Mock de prisma_cmd: imprime $MOCK_OUTPUT e retorna $MOCK_EXIT.
prisma_cmd() {
  printf '%s\n' "$MOCK_OUTPUT"
  return "$MOCK_EXIT"
}

# run_case <desc> <expect: continue|abort>
run_case() {
  local desc="$1" expect="$2" rc
  ( migrate_status ) >/dev/null 2>&1
  rc=$?
  if { [ "$expect" = "continue" ] && [ "$rc" -eq 0 ]; } \
    || { [ "$expect" = "abort" ] && [ "$rc" -ne 0 ]; }; then
    echo "PASS: $desc (exit $rc)"
    PASS=$((PASS + 1))
  else
    echo "FAIL: $desc (esperado $expect, obtido exit $rc)"
    FAIL=$((FAIL + 1))
  fi
}

# a) exit 0 — banco em dia
MOCK_OUTPUT=$'Prisma schema loaded from prisma\\schema.prisma\n\nDatabase schema is up to date!'
MOCK_EXIT=0
run_case "a) status exit 0 (up to date) -> continua" continue

# b) exit 1 — apenas migrations pendentes (formato real do Prisma 6)
MOCK_OUTPUT=$'17 migrations found in prisma/migrations\nFollowing migrations have not yet been applied:\n20260813100000_rede_axemap_2_1_graph\n\nTo apply migrations in development run prisma migrate dev.\nTo apply migrations in production run prisma migrate deploy.'
MOCK_EXIT=1
run_case "b) exit 1 (apenas pendentes) -> continua para o deploy" continue

# c) exit 1 — P1001 erro de conexão (saída real reproduzida localmente)
MOCK_OUTPUT=$'Error: P1001: Can\'t reach database server at `127.0.0.1:59999`\n\nPlease make sure your database server is running at `127.0.0.1:59999`.'
MOCK_EXIT=1
run_case "c) exit 1 (P1001 conexão) -> aborta" abort

# d) exit 1 — P3009 migration falhou
MOCK_OUTPUT=$'Error: P3009 migrate found failed migrations in the target database, new migrations will not be applied.'
MOCK_EXIT=1
run_case "d) exit 1 (P3009 migration falhou) -> aborta" abort

# e) exit 1 — erro genérico (sem marcador de pendente)
MOCK_OUTPUT=$'Error: An unexpected error occurred.'
MOCK_EXIT=1
run_case "e) exit 1 (erro genérico) -> aborta" abort

# f) exit 1 — histórico divergente
MOCK_OUTPUT=$'The migrations from the database are not found locally in prisma/migrations:\n20260818000000_add_ads_payments'
MOCK_EXIT=1
run_case "f) exit 1 (histórico divergente) -> aborta" abort

# g) exit 1 — sem tabela de migrations
MOCK_OUTPUT=$'No migration table found.'
MOCK_EXIT=1
run_case "g) exit 1 (sem tabela de migrations) -> aborta" abort

# h) exit 1 — schema inválido (mesmo com linha de pendente, deve abortar)
MOCK_OUTPUT=$'have not yet been applied: 20260813100000_rede_axemap_2_1_graph\nPrisma schema validation error at schema.prisma:1'
MOCK_EXIT=1
run_case "h) exit 1 (schema inválido + pendente) -> aborta" abort

# Integração real (opcional): migrar status do Prisma real contra o banco
# informado em INTEGRATION_DATABASE_URL. Como o banco de dev tem pendentes,
# o esperado é "continua" (exit 0 da função), sem deploy.
if [ -n "${INTEGRATION_DATABASE_URL:-}" ]; then
  echo
  echo ">>> Integração real (INTEGRATION_DATABASE_URL definido):"
  prisma_cmd() {
    pnpm --filter @axemap/database exec prisma "$@"
  }
  (
    export DATABASE_URL="$INTEGRATION_DATABASE_URL"
    migrate_status
  ) >/tmp/migrate-status-integration.log 2>&1
  rc=$?
  if [ "$rc" -eq 0 ]; then
    echo "PASS: integração real com migrations pendentes -> continua (exit 0)"
    PASS=$((PASS + 1))
  else
    echo "FAIL: integração real abortou com exit $rc"
    cat /tmp/migrate-status-integration.log
    FAIL=$((FAIL + 1))
  fi
fi

echo
if [ "$FAIL" -eq 0 ]; then
  echo "RESULTADO: $PASS PASS, $FAIL FAIL — OK"
  exit 0
else
  echo "RESULTADO: $PASS PASS, $FAIL FAIL"
  exit 1
fi