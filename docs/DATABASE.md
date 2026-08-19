# DATABASE — AxéMap

Documentação do banco de dados PostgreSQL + PostGIS.

---

## 1. Stack

| Item | Versão |
|---|---|
| PostgreSQL | 16 (produção sugerida: `postgis/postgis:16-3.4`) |
| PostGIS | 3.4 (3.5 disponível em imagens 17) |
| Prisma | 6.x (`@axemap/database`) |
| ORM | Prisma Client |

---

## 2. Conexões

```
DATABASE_URL=postgresql://<user>:<senha>@<host>:5432/<db>        # principal
SHADOW_DATABASE_URL=postgresql://<user>:<senha>@<host>:5432/<db>_shadow   # separado
```

**REGRA CRÍTICA**: `SHADOW_DATABASE_URL` NUNCA pode ser igual a `DATABASE_URL`.
A proteção automatizada está em `scripts/check-shadow-db.sh`, que **aborta** a
operação imprimindo:

> ERRO CRÍTICO: SHADOW DATABASE NÃO PODE APONTAR PARA O BANCO PRINCIPAL.

---

## 3. Extensões

| Extensão | Função | Obrigatória |
|---|---|---|
| `plpgsql` | linguagem | sim (default) |
| `postgis` | tipos geom/geography, índices espaciais, funções geográficas | **sim** |

Habilitar PostGIS (como superuser ou role com permissão):
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Health check valida a extensão: `SELECT extversion FROM pg_extension WHERE extname='postgis'`
(exibido em `/api/v1/health/db` e `/api/v1/health`).

---

## 4. Migrations

- Pasta: `packages/database/prisma/migrations/` — **15 migrations aplicadas**.
- Produção usa **exclusivamente**:
  ```bash
  bash scripts/migrate-deploy.sh   # guard shadow → backup → status → deploy → generate → health → smoke
  ```
- **PROIBIDO em produção**: `prisma migrate reset` e `prisma db push`.
- Em dev: `pnpm --filter @axemap/database exec prisma migrate dev`.

Pipeline detalhado:
1. `scripts/check-shadow-db.sh` — valida `DATABASE_URL != SHADOW_DATABASE_URL`.
2. `scripts/backup-db.sh` — backup gzip pré-migração.
3. `prisma migrate status` — verifica pendências.
4. `prisma migrate deploy` — aplica migrations pendentes (transacional, idempotente).
5. `prisma generate` — regenera Prisma Client.
6. Health check `/api/v1/health/db` — confirma `status=ok` + postgis ok.
7. `scripts/smoke.sh` — smoke test opcional.

---

## 5. Índices, Constraints e FKs

- Todas as FKs e índices são gerenciados pelo Prisma via migrations.
- Índices espaciais: criados via SQL nas migrations de mapa/geo (PostGIS `GIST`).
- Convenção de nomes: snake_case no banco, camelCase no Prisma (via `@map`/`@@map`).

---

## 6. Banco de Produção (quando VPS ativa — FASE 18)

1. Criar banco `axemap`.
2. `CREATE EXTENSION postgis`.
3. Criar usuário de aplicação (sem CREATEDB, sem superuser) com senha forte.
4. Configurar `DATABASE_URL` e `SHADOW_DATABASE_URL` (banco `axemap_shadow` separado).
5. Executar `bash scripts/migrate-deploy.sh`.
6. Seed apenas se necessário: `pnpm --filter @axemap/database seed`.
7. Validar health checks.

---

## 7. Segurança

- Banco **NÃO exposto publicamente** — apenas `127.0.0.1` ou rede interna Docker.
- Usuário de app sem permissões administrativas.
- Senhas fortes em `.env.production` (nunca no git).
- `pg_hba.conf` com `scram-sha-256` (nunca `trust` em produção).
- Backup externo à VPS (ver `docs/BACKUP-RESTORE.md`).