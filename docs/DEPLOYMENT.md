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

## 4. Deploy via Docker (VPS)

```bash
# Build das imagens (no VPS ou em build server)
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.axemap.com.br \
  --build-arg NEXT_PUBLIC_TV_MUSIC_URL= \
  -f docker/Dockerfile.web -t axemap-web:latest .
docker build -f docker/Dockerfile.api -t axemap-api:latest .

# Subir a stack — secrets vêm do .env.production na VPS (nunca do git)
docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d --build
```

- `NEXT_PUBLIC_*` é incorporado ao bundle no `next build` → passado por **build ARG**.
- Os Dockerfiles compilam o monorepo com `turbo` (ordem: `@axemap/shared` antes das apps; `prisma generate` antes da API). Migration **não** roda no build.
- Healthchecks reais: API → `GET /api/v1/health`; Web → asset estático; MinIO → `mc ready local` (MinIO não tem `curl`).
- Template: `docker/docker-compose.prod.yml` (sem secrets — valores via `${VAR}`); expõe apenas 80/443 (nginx). postgres/redis/storage ficam em `127.0.0.1` (justificativa: backup/migrate no host).
- Reverse proxy: `docker/nginx/nginx.conf` (rotas `axemap.com.br → web:3000`, `api.axemap.com.br → api:3001`, `storage.axemap.com.br → storage:9000`).
- **NUNCA** commit secrets; use `.env.production` na VPS (gitignorado).

Pré-deploy na VPS: `bash scripts/preflight-vps.sh` (CPU/RAM/disco, Docker, UFW, fail2ban, portas).

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