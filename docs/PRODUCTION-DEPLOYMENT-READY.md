# PRODUCTION DEPLOYMENT READY — AxéMap

> Documento de status da preparação do repositório para deploy em produção (VPS Contabo).

## 1. Status

**READY** — o repositório está tecnicamente preparado para a etapa de provisionamento da VPS Contabo.

> Ressalva obrigatória: **Docker não está disponível neste ambiente de desenvolvimento**
> (Windows). As validações de `docker compose config` e builds reais de imagem **não foram
> executadas** aqui. Ver seção 11 (Limitações). No primeiro acesso à VPS, executar as
> validações Docker do roteiro (seção 12).

## 2. Resumo

O que foi preparado nesta etapa:

- Fail-fast de configuração em produção (API aborta o boot se segredos obrigatórios
  estiverem ausentes ou usarem placeholder).
- Dockerfiles de web e API corrigidos: build do monorepo com ordem correta
  (`@axemap/shared` antes das apps; `prisma generate` antes da API), `NEXT_PUBLIC_*` via
  build ARG, healthchecks reais, pacotes do workspace materializados no runner.
- `docker-compose.prod.yml` auditado: apenas 80/443 públicos, healthchecks funcionais,
  MinIO sem `curl` (usa `mc ready local`), console do MinIO não exposto, `APP_URL`.
- `.env.example` reescrito com placeholders e matriz de variáveis (sem valores reais).
- Scripts de backup/restore compatíveis com produção (detecção de compose prod/dev,
  sem vazar senhas em logs).
- Documentação alinhada à implementação real.

## 3. Arquitetura

```
Internet
   ↓   (portas 80/443 apenas)
Nginx (docker/nginx/nginx.conf)
   ├── axemap.com.br        → web:3000        (Next.js 16)
   ├── api.axemap.com.br    → api:3001        (NestJS 11)
   └── storage.axemap.com.br → storage:9000   (MinIO)
        ↓
Docker internal network (axemap_internal)
   ├── web        (Dockerfile.web,  porta 3000)
   ├── api        (Dockerfile.api,  porta 3001)
   ├── postgres   (postgis/postgis:16-3.4,  5432 — bind 127.0.0.1)
   ├── redis      (redis:7-alpine,          6379 — bind 127.0.0.1)
   └── storage    (quay.io/minio/minio:latest, 9000 — bind 127.0.0.1; console 9001 NÃO publicado)
```

Justificativa dos binds em `127.0.0.1`: permitem backup/restore e migrate-deploy executados
a partir do host (scripts/*.sh) sem expor nada à rede pública.

## 4. Alterações

| Arquivo | O que mudou |
|---|---|
| `docker/Dockerfile.web` | ARG/ENV `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_TV_MUSIC_URL`; build via `turbo --filter=@axemap/web...` (compila shared primeiro); materialização dos pacotes workspace no runner; `HEALTHCHECK` (asset estático). |
| `docker/Dockerfile.api` | Build via `turbo --filter=@axemap/api...` (shared + `prisma generate` antes da API); materialização dos pacotes workspace; `HEALTHCHECK` (`GET /api/v1/health`). |
| `docker/docker-compose.prod.yml` | `APP_URL`; build args do web; healthchecks (nginx `wget /healthz`, MinIO `mc ready local`); comentários de justificativa dos binds 127.0.0.1; remoção de `NEXTAUTH_*` (não usados). |
| `.env.example` | Reescrito: placeholders apenas; adicionado `APP_URL` e `MIGRATION_DATABASE_URL`; removidas variáveis não usadas; matriz de variáveis. |
| `scripts/backup-db.sh` | Detecção de compose (prod>dev>root); `docker exec pg_dump`; fallback `DATABASE_URL`/`MIGRATION_DATABASE_URL`; sem impressão de senhas. |
| `scripts/restore-db.sh` | Detecção de compose; validação `gzip -t`; confirmação explícita; pre-restore automático; sem impressão de senhas. |
| `apps/api/src/main.ts` | `enableShutdownHooks()` (shutdown gracioso SIGTERM/SIGINT). |
| `apps/api/src/main.ts` | Guarda `assertProductionConfig()` (fail-fast de segredos/URLs em produção). |
| `apps/api/src/common/storage/storage.module.ts` | Credenciais de storage obrigatórias em produção (fail-fast; fallback dev preservado). |
| `apps/api/src/moderation/moderation.module.ts` | `config.getOrThrow('JWT_SECRET')`. |
| `packages/shared/package.json` + `tsconfig.json` | Script `build` (`tsc`) e exclusão de specs do emit (corrige ordem de build Docker e o Vitest). |
| `.gitignore` / `.dockerignore` | `*.pem`, `*.key`, `docker/nginx/certs/`, `.env.production`. |
| `scripts/preflight-vps.sh` | Novo: verificação pré-deploy no VPS. |
| Docs | `DEPLOYMENT.md`, `RUNBOOK.md`, `GO-LIVE-CHECKLIST.md`, `INFRASTRUCTURE.md`, `BACKUP-RESTORE.md` alinhados à implementação. |

## 5. Segurança

- **Secrets**: nenhum segredo real no repositório (auditoria limpa — ver seção 10).
  `.env.production`, `*.pem`, `*.key` e `docker/nginx/certs/` gitignorados.
- **Firewall**: apenas 80/443 expostos (nginx). UFW na VPS com 22/80/443 (ver preflight).
- **Containers**: API/Web rodam como usuário não-root (nextjs/nestjs, UID 1001).
  Rede interna `axemap_internal`; postgres/redis/storage com bind em 127.0.0.1.
- **Database**: PostGIS; credenciais via env; healthcheck `pg_isready`; 127.0.0.1:5432.
- **Redis**: sem senha configurada hoje (não exposto); bind 127.0.0.1:6379.
- **Storage**: credenciais via env (obrigatórias em produção); console 9001 não publicado;
  healthcheck `mc ready local`.
- **TLS**: HTTPS via nginx (certificados reais ficam fora do Git — `docker/nginx/certs/`);
  redirect HTTP→HTTPS no nginx.conf; HSTS em produção (API e web).
- **Headers**: helmet na API (CSP, nosniff, X-Frame-Options DENY, HSTS); security headers
  no Next.js (next.config.js).

## 6. Variáveis

Nomes necessários (sem valores — ver matriz completa em `.env.example`):

`NODE_ENV`, `PORT`, `DATABASE_URL`, `SHADOW_DATABASE_URL`, `MIGRATION_DATABASE_URL`,
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`, `JWT_SECRET`, `JWT_REFRESH_SECRET`,
`JWT_EXPIRES_IN`, `JWT_REFRESH_EXPIRES_IN`, `FRONTEND_URL`, `APP_URL`,
`NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TV_MUSIC_URL`, `REDIS_HOST`, `REDIS_PORT`,
`STORAGE_TYPE`, `STORAGE_REGION`, `STORAGE_ENDPOINT`, `STORAGE_ACCESS_KEY`,
`STORAGE_SECRET_KEY`, `STORAGE_BUCKET`, `STORAGE_PUBLIC_URL`, `STORAGE_FORCE_PATH_STYLE`,
`MAIL_PROVIDER`, `MAIL_API_URL`, `MAIL_API_KEY`, `LOG_LEVEL`.

Públicas (`NEXT_PUBLIC_*`, inlined no build): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_TV_MUSIC_URL`.
Secretas: `DATABASE_URL`, `SHADOW_DATABASE_URL`, `MIGRATION_DATABASE_URL`, `POSTGRES_PASSWORD`,
`JWT_SECRET`, `JWT_REFRESH_SECRET`, `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY`, `MAIL_API_KEY`.

## 7. Deploy

Ordem de execução (VPS Contabo — próxima etapa):

```
1. VPS            Contratar/atualizar (Ubuntu 22.04/24.04), bash scripts/preflight-vps.sh
2. DNS            axemap.com.br / api.axemap.com.br / storage.axemap.com.br → IP da VPS
3. Secrets        Criar /opt/axemap/.env.production (placeholders do .env.example)
4. Infraestrutura git clone; docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d (postgres/redis/storage primeiro)
5. Migration      MIGRATION_DATABASE_URL=... bash scripts/migrate-deploy.sh (host; guard shadow DB)
6. API            docker compose build api && up -d api
7. Web            docker compose build web (com --build-arg NEXT_PUBLIC_API_URL/TV_MUSIC_URL) && up -d web
8. Nginx          up -d nginx (nginx.conf + certs em docker/nginx/certs/)
9. TLS            Certificados Let's Encrypt/Cloudflare em docker/nginx/certs/ (fullchain.pem/privkey.pem); redirect HTTP→HTTPS
10. Smoke tests    curl /api/v1/health, /health/full; scripts/smoke.sh
```

> `prisma migrate deploy` NUNCA roda dentro do Dockerfile — é etapa separada (passo 5),
> executada a partir do host contra `127.0.0.1:5432`.

## 8. Backup

- **Backup**: `scripts/backup-db.sh` — `pg_dump` via `docker exec` (ou direto com
  `DATABASE_URL`/`MIGRATION_DATABASE_URL`), gzip, integridade, retenção de 30 backups.
- **Restore**: `scripts/restore-db.sh` — interativo, valida arquivo, confirmação explícita
  (`restaurar`), pre-restore automático.
- **Retenção**: 30 backups mais recentes localmente; estratégia externa (R2/S3/outro host)
  definida para quando a VPS existir (`docs/BACKUP-RESTORE.md`).
- **Localização**: `backups/` (gitignorado). Na VPS, mover para volume dedicado/offsite.

## 9. Rollback

1. Reverter código para release anterior (`git checkout <tag>`), rebuild das imagens.
2. Se houver mudança de schema, restaurar o `pre-restore`/backup pré-migração
   (`bash scripts/restore-db.sh`).
3. Revalidar `scripts/migrate-deploy.sh` (status consistente) e health checks.
4. `docker compose ... restart api web` e smoke test.

## 10. Testes

| Teste | Resultado |
|---|---|
| `pnpm lint` | ✅ PASS (4/4 pacotes) |
| `pnpm typecheck` | ✅ PASS (4/4 pacotes) |
| `pnpm test` | ✅ PASS — API 104/104 (13 suites), Web 29/29, Shared 15/15, Database `prisma validate` OK |
| `pnpm build` | ✅ PASS (4/4 tarefas turbo — inclui `next build` e `nest build`) |
| Sintaxe shell scripts | ✅ PASS (`bash -n` em backup-db, restore-db, preflight-vps, migrate-deploy, check-shadow-db) |
| Auditoria de secrets | ✅ PASS — nenhum secret real no repositório (somente placeholders e fallbacks dev) |
| `docker compose config --quiet` | ⚠️ NOT EXECUTED — Docker indisponível (revisão estática feita) |
| Build Dockerfile.web | ⚠️ NOT EXECUTED — Docker indisponível |
| Build Dockerfile.api | ⚠️ NOT EXECUTED — Docker indisponível |

## 11. Limitações

- **Docker não está disponível neste ambiente (Windows)**. Não foi possível executar
  `docker compose config`, builds de imagem nem `up`. Dockerfiles e compose foram revisados
  estaticamente e seguem padrões do monorepo pnpm (turbo build + materialização de workspace).
- **Healthcheck do MinIO** (`mc ready local`) é o mecanismo oficial da imagem, mas não pôde
  ser executado aqui — validar no primeiro `up` na VPS.
- **Certificados TLS**: estrutura criada (`docker/nginx/certs/`), certificados reais ainda não
  existem (dependem do domínio/VPS).
- **Backup externo offsite**: estratégia documentada, execução depende da VPS.
- **`pnpm build` local**: exigiu encerrar instâncias da API que seguravam o DLL do Prisma
  (lock do Windows); não afeta Linux/CI.

## 12. Próximo passo

**Preparar e configurar a VPS Contabo para o deploy do AxéMap**, seguindo a seção 7 (ordem:
VPS → DNS → secrets → infra → migration → API → Web → Nginx → TLS → smoke). Primeiro comando
na VPS: `bash scripts/preflight-vps.sh`. No primeiro acesso, executar também as validações
Docker não executadas aqui (seção 10) antes do go-live.