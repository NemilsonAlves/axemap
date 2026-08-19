# DEPLOYMENT — AxéMap

Estratégia de deploy. **Status: 🟡 VPS PENDENTE — código e pipeline preparados.**

---

## 1. Ambientes

| Ambiente | URL | Banco | Quando |
|---|---|---|---|
| Dev | `localhost:3000/3001` | `axemap_dev` | agora |
| Staging | `staging.<dominio>` | `axemap_staging` | quando VPS ativa (FASE 17) |
| Produção | `<dominio>` | `axemap` | quando VPS ativa (FASE 26) |

---

## 2. Pré-requisitos de Build

- Node.js ≥ 22, pnpm ≥ 9 (`corepack enable`).
- Nenhum secret no build — apenas `.env` de runtime.

```bash
pnpm install --frozen-lockfile
pnpm --filter @axemap/database exec prisma generate
pnpm build          # turbo build (web + api)
```

---

## 3. Migração de Produção (oficial)

```bash
bash scripts/migrate-deploy.sh
# 1/7 guard shadow DB (aborta se DATABASE_URL == SHADOW_DATABASE_URL)
# 2/7 backup pré-migração
# 3/7 prisma migrate status
# 4/7 prisma migrate deploy
# 5/7 prisma generate
# 6/7 health check /api/v1/health/db
# 7/7 smoke test
```

NUNCA usar `prisma migrate reset` / `prisma db push` em produção.

---

## 4. Deploy via Docker (VPS futura)

```bash
docker build -f docker/Dockerfile.api -t axemap-api:latest .
docker build -f docker/Dockerfile.web -t axemap-web:latest .

docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d
```

- Template: `docker/docker-compose.prod.yml` (sem secrets — valores via `${VAR}`).
- Reverse proxy: `docker/nginx/nginx.conf` (portas 80/443; api/web/storage internos).
- **NUNCA** commit secrets; use `.env.production` na VPS.

---

## 5. Pipeline CI/CD (atual)

`.github/workflows/ci.yml` — push p/ `main`/`develop` e PR p/ `main`:
`lint` → `typecheck` + `test` → `build`.

`.github/workflows/cd.yml` — push p/ `main` e tags `v*`:
- `deploy-api` → Railway (`npx railway up --service axemap-api`, secret `RAILWAY_TOKEN`).
- `deploy-web` → Vercel (`amondnet/vercel-action`, secrets `VERCEL_TOKEN` etc.).

> Quando a VPS existir, o CD pode ser estendido para SSH/docker na VPS mantendo o
> mesmo gate: build → testes → health → smoke.

---

## 6. Health Checks pós-deploy

| Endpoint | Esperado |
|---|---|
| `/api/v1/health` | `status: ok`, checks database/postgis/redis |
| `/api/v1/health/db` | `status: ok` + postgis ok |
| `/api/v1/health/storage` | `status: ok` |
| `/api/v1/health/full` | `status: ok` + recursos |

---

## 7. Rollback

1. Reverter o código para a release anterior (git tag `v*`).
2. Se necessário, restaurar banco do backup pré-deploy (`restore-db.sh`).
3. Re-executar `migrate-deploy.sh` para garantir consistência.
4. Validar health checks e smoke test.

---

## 8. Checklist de bloqueio

Não fazer deploy se:
- build falhar;
- testes críticos falharem;
- migration falhar (incluindo guard de shadow DB);
- health check falhar.