# INFRASTRUCTURE — AxéMap

Documento de referência da infraestrutura. Status: **🟡 VPS PENDENTE — código preparado para produção**.

> Regra: NENHUM valor neste documento é um secret real. Tudo é placeholder dev
> (`change-this`, `axemap_dev`). Secrets de produção vivem apenas em `.env.production`
> na VPS / secrets do CI — nunca no git.

---

## 1. Arquitetura Atual (Dev)

```
Windows (dev local) / Linux (dev via Docker)
├── apps/api        NestJS 11  → porta 3001
├── apps/web        Next.js 16 → porta 3000
├── PostgreSQL 16 + PostGIS 3.4/3.5 → porta 5432
├── Redis 7 → porta 6379
├── MinIO (opcional) → porta 9000 (9001 console)
└── Email → ConsoleMailProvider (dev) / HttpMailProvider (configurável)
```

- **Banco local real**: serviço Windows `postgresql-x64-16` (PG 16.14) em `5432`, db `axemap_dev`.
- **PostgreSQL portátil** (`.pgportable`, v18.4): configurado p/ `5433`, **não utilizado**.
- **Docker**: disponível via `docker/docker-compose.dev.yml` e `infra/docker/compose/*.yml` (profiles).
- **CI/CD atual**: GitHub Actions (`ci.yml` + `cd.yml`) → Railway (API) + Vercel (Web).

---

## 2. Arquitetura de Produção Proposta (VPS)

```
Internet
   │  (somente 80/443)
   ▼
Cloudflare  ──DNS/HTTPS/WAF──►  Nginx / Reverse Proxy (VPS)
                                   │ 80/443
                     ┌─────────────┴──────────────┐
                     ▼                            ▼
                Next.js (web:3000)            NestJS (api:3001)
                     │                            │
                     └───────────┬────────────────┘
                                 ▼
                        Rede interna (bridge)
              ┌──────────────┬──────────────┬─────────────┐
              ▼              ▼              ▼             ▼
      PostgreSQL 16    Redis 7        MinIO/S3       Workers
      + PostGIS        (cache/rate)   (storage)      (futuro)
```

**Regras de rede:**
- **NUNCA** expor publicamente: PostgreSQL (5432), Redis (6379), MinIO console (9001).
- MinIO API (9000) só via proxy interno p/ arquivos públicos (`/files/`).
- Apenas Nginx expõe 80/443 à internet.
- PostgreSQL/Redis/MinIO ligados apenas em `127.0.0.1` ou rede interna do Docker.

---

## 3. Serviços, Portas e Redes

| Serviço | Container | Porta | Público? | Healthcheck |
|---|---|---|---|---|
| Nginx | `nginx:1.27-alpine` | 80/443 | ✅ | — |
| Web | `Dockerfile.web` | 3000 | interno | via nginx |
| API | `Dockerfile.api` | 3001 | interno | via nginx |
| PostgreSQL | `postgis/postgis:16-3.4` | 127.0.0.1:5432 | ❌ | `pg_isready` |
| Redis | `redis:7-alpine` | 127.0.0.1:6379 | ❌ | `redis-cli ping` |
| MinIO | `quay.io/minio/minio` | 127.0.0.1:9000 | ❌ | `/minio/health/live` |

---

## 4. Variáveis de Ambiente

Referência completa: `.env.example` (dev) e `docker/docker-compose.prod.yml` (prod template).

| Grupo | Vars | Nota |
|---|---|---|
| Banco | `DATABASE_URL`, `SHADOW_DATABASE_URL` | **NUNCA iguais** (ver FASE 06) |
| Redis | `REDIS_HOST`, `REDIS_PORT` | usado só em health checks hoje |
| JWT | `JWT_SECRET`, `JWT_REFRESH_SECRET`, `NEXTAUTH_SECRET` | ≥32 chars, gerados via `openssl rand` |
| API | `API_URL`, `PORT`, `NEXT_PUBLIC_API_URL` | CORS usa `FRONTEND_URL` |
| CORS | `FRONTEND_URL` | lista separada por vírgula; em prod = domínio real |
| Storage | `STORAGE_TYPE/REGION/ENDPOINT/ACCESS_KEY/SECRET_KEY/BUCKET/PUBLIC_URL/FORCE_PATH_STYLE` | abstração S3/MinIO/R2 |
| Email | `MAIL_PROVIDER`, `MAIL_API_URL`, `MAIL_API_KEY` | `console` (dev) / `http` (prod) |
| Env | `NODE_ENV`, `LOG_LEVEL` | `production`/`info` em prod |

---

## 5. Migrations & Prisma

- Schema: `packages/database/prisma/schema.prisma` — **65 models**, 15 migrations aplicadas.
- Produção usa **apenas** `prisma migrate deploy` (NUNCA `migrate reset` / `db push`).
- Pipeline oficial: `scripts/migrate-deploy.sh` (backup → status → deploy → generate → health → smoke).
- **Proteção shadow DB**: `scripts/check-shadow-db.sh` aborta se `DATABASE_URL == SHADOW_DATABASE_URL`.

---

## 6. Backup & Restore

Documentação completa: `docs/BACKUP-RESTORE.md`.

- Backup: `scripts/backup-db.sh` (gzip + retenção 30 dias).
- Restore: `scripts/restore-db.sh` (interativo, cria pre-restore).
- Estratégia de produção: **VPS + backup externo** (R2/S3/outro host).

---

## 7. Health Checks

| Endpoint | Verifica |
|---|---|
| `/api/v1/health` | DB + **PostGIS** + Redis |
| `/api/v1/health/db` | DB + **PostGIS** + DATABASE_URL mascarado |
| `/api/v1/health/redis` | Redis ping |
| `/api/v1/health/storage` | bucketExists |
| `/api/v1/health/full` | DB(+latência) + **PostGIS** + Redis + memória |
| `/api/v1/system/liveness` | vivo |
| `/api/v1/system/readiness` | DB pronto |

---

## 8. Status por Componente

| Componente | Dev | Produção | Notas |
|---|---|---|---|
| Código API/Web | 🟢 | 🟢 pronto | typecheck/build/testes OK |
| PostgreSQL | 🟢 | 🟡 pendente | VPS |
| PostGIS | 🟢 | 🟡 pendente | VPS |
| Redis | 🟢 | 🟡 pendente | só health hoje |
| MinIO/S3 | 🟢 code | 🟡 pendente | `health/storage` erro no ambiente local |
| Email | 🟢 console | 🟡 pendente | precisa provider real |
| Docker | 🟢 dev | 🟡 template | `docker-compose.prod.yml` modelo |
| Nginx | ❌ | 🟡 template | `docker/nginx/nginx.conf` modelo |
| CI/CD | 🟢 | 🟡 | Railway/Vercel hoje; VPS futura |
| VPS | ❌ | 🟡 **pendente** | não contratada |

---

## 9. Pendências / Riscos

1. **VPS não contratada** — bloqueia staging, prod, backup externo.
2. **Storage local offline** — `health/storage` retorna `AggregateError` (MinIO não sobe no ambiente atual). Não é falha de código.
3. **Email provider** — `MAIL_PROVIDER=http` requer `MAIL_API_URL`/`MAIL_API_KEY` reais; forgot-password funciona quando configurado.
4. **nginx/certs** — certs TLS reais quando domínio disponível.
5. **RabbitMQ, Meilisearch, ClickHouse, Ollama** — existem como profiles Docker mas NÃO são usados pela aplicação (não adicionar à infra de produção sem necessidade).