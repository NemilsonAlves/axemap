# AXÉMAP — INFRASTRUCTURE READINESS REPORT

**Data**: 2026-08-16 · **Status**: 🟢 CÓDIGO PRONTO · 🟡 VPS/INFRA PENDENTE · 🔴 GO-LIVE PENDENTE

> Preparação de infraestrutura para produção (Prompt 10). Nenhuma credencial, IP,
> domínio, provider ou banco de produção inventado. Nenhuma migration executada
> contra infraestrutura inexistente. **GO não declarado.**

---

## 1. Arquitetura Atual

- **Monorepo** pnpm/turbo: `apps/api` (NestJS 11, porta 3001), `apps/web` (Next.js 16, porta 3000), `packages/database` (Prisma 6.19.3), `packages/shared`.
- **PostgreSQL 16.14 + PostGIS 3.4** local em `5432` (db `axemap_dev`).
- **Redis 7** em `6379` (usado apenas em health checks).
- **MinIO** opcional (`9000` API, `9001` console).
- **CI/CD**: GitHub Actions → Railway (API) + Vercel (Web).

## 2. Arquitetura de Produção Proposta

```
Internet
   │  (somente 80/443)
   ▼
Cloudflare ──► Nginx / Reverse Proxy (VPS)
                  ├── Next.js (web:3000)
                  └── NestJS (api:3001)
                         │
                  Rede interna
        ┌──────────┬───────────┬──────────┐
        ▼          ▼           ▼          ▼
 PostgreSQL 16   Redis 7   MinIO/S3   Workers (futuro)
 + PostGIS
```

Templates criados: `docker/docker-compose.prod.yml` (sem secrets, valores via `${VAR}`) e `docker/nginx/nginx.conf`.

## 3. Requisitos da VPS

- Nginx expõe apenas 80/443.
- PostgreSQL (5432), Redis (6379), MinIO console (9001) **nunca públicos** — só `127.0.0.1`/rede interna.
- Hardening: SSH por chave, sem root, firewall, fail2ban, atualizações, `pg_hba.conf` scram. (Docs: `docs/SECURITY.md`.)

## 4. PostgreSQL

- `DATABASE_URL` + `SHADOW_DATABASE_URL` documentados e separados.
- **Proteção crítica implementada**: `scripts/check-shadow-db.sh` aborta operação se `DATABASE_URL == SHADOW_DATABASE_URL`, exibindo "ERRO CRÍTICO: SHADOW DATABASE NÃO PODE APONTAR PARA O BANCO PRINCIPAL". Validado (exit 1 no cenário de colisão, exit 0 no cenário seguro).
- 15 migrations aplicadas, schema Prisma válido, 65 models.

## 5. PostGIS

- Extensão `postgis` habilitada no banco.
- **Health check de PostGIS adicionado** em `/health`, `/health/db` e `/health/full` (consulta `pg_extension`). Confirmado `postgis:"ok"` em ambiente real.
- Geometria/geografia/índices espaciais já suportados pelo schema de mapa/geo.

## 6. Redis

- Usado apenas em health checks (ioredis ad-hoc). Sem filas, sessões, cache ou rate limiting em Redis.
- BullMQ e @nestjs/schedule instalados porém **não utilizados** (deps mortas).
- Decisão: manter como serviço de infra opcional — não adicionar complexidade ao MVP.

## 7. Storage

- Abstração `StorageService` → `S3StorageService` (S3/MinIO/R2 compatíveis via `STORAGE_*`), interface em `packages/shared`.
- **Bug corrigido**: `getUrl()` ignorava `STORAGE_PUBLIC_URL` e retornava sempre `http://localhost:9000/...`. Agora usa origin configurável + bucket/key (fallback para endpoint configurado).
- `health/storage` verifica `bucketExists`.

## 8. Email

- `MailService` global com provider configurável: `MAIL_PROVIDER=console|http`, `MAIL_API_URL`, `MAIL_API_KEY`.
- Forgot-password funcionará quando o provider real for configurado (template HTML+texto, link 30min).

## 9. Docker

- Dockerfiles multi-stage, usuário não-root, sem secrets hardcoded.
- **`.dockerignore` criado** (antes inexistente — risco de vazar `.env` no build).
- Compose modular por profiles (core/admin/observability/storage/messaging/search/analytics/ai) + template de produção.

## 10. Networking

- Apenas Nginx público (80/443). API, web, PostgreSQL, Redis, MinIO na rede interna.
- Nginx template com HTTPS, HTTP→HTTPS redirect, headers de segurança, proxy `/api/` e `/files/`.

## 11. Security

- RBAC (37 controllers protegidos), ThrottlerGuard global (100 req/min), Helmet headers.
- Guard de shadow database (anti-incidente de 15/08/2026).
- Docs: `docs/SECURITY.md` (com seção de produção da VPS).

## 12. Backup

- `scripts/backup-db.sh`: `pg_dump` → gzip → validação `gzip -t` → retenção 30 backups.
- Estratégia produção: diário + pré-migração, **VPS + backup externo** (R2/S3), criptografia opcional. (Docs: `docs/BACKUP-RESTORE.md`.)

## 13. Restore

- `scripts/restore-db.sh` interativo (cria pre-restore automático).
- Processo prod: backup → nova instância → restore → PostGIS → migrations → health → application.
- Nota PG16 × pg_dump mais novo: remover `transaction_timeout` se dumper > servidor (incidente tratado).

## 14. CI/CD

- `.github/workflows/ci.yml`: lint → typecheck + test → build.
- `.github/workflows/cd.yml`: deploy Railway (API) + Vercel (Web).
- Pipeline de migração oficial: `scripts/migrate-deploy.sh` = guard shadow → backup → status → deploy → generate → health → smoke.
- Bloqueio de deploy se build/testes/migration/health falharem. (Docs: `docs/DEPLOYMENT.md`.)

## 15. Health Checks

| Endpoint | Verifica |
|---|---|
| `/api/v1/health` | DB + PostGIS + Redis |
| `/api/v1/health/db` | DB + PostGIS + DATABASE_URL mascarado |
| `/api/v1/health/redis` | Redis ping |
| `/api/v1/health/storage` | bucketExists |
| `/api/v1/health/full` | DB(+latência) + PostGIS + Redis + memória |
| `/api/v1/system/{liveness,readiness,health}` | processo / DB |

## 16. Monitoring

- Logs estruturados (`LOG_LEVEL`). Alertas/error-tracking (Sentry/Prometheus) = pendente/backlog.
- Health checks prontos para probes e monitoramento externo.

## 17. Staging

- Ambiente definido em `docs/STAGING.md`: banco `axemap_staging`, storage/email/secrets separados, dados mock.
- Será criado quando a VPS estiver disponível (FASE 17).

## 18. Pendências

1. **VPS não contratada** — bloqueia staging, produção, backup externo.
2. **Storage local offline** — `health/storage` retorna erro no ambiente atual (MinIO não sobe); não é falha de código.
3. **Email provider real** — `MAIL_PROVIDER=http` requer credenciais reais.
4. **Domínio/TLS** — certs reais quando domínio disponível.
5. **Monitoring/alertas** — configurar quando infra ativa.

## 19. Riscos

- Perda da VPS sem backup externo (mitigação: backup externo obrigatório).
- Migração destrutiva (mitigação: guard shadow DB + backup pré-migração).
- Exposição acidental de serviços internos (mitigação: bind `127.0.0.1`/rede interna).
- Dependência de provider externo (storage/email) para funcionalidades de produção.

## 20. GO-LIVE Checklist

Documentado em `docs/GO-LIVE-CHECKLIST.md` — **não executado**. Requer VPS, PostgreSQL+PostGIS, Redis, Storage, Email, Domain, HTTPS, Firewall, Secrets, Backup+Restore testado, Migrations, RBAC/Auth/E2E/Upload/Campanhas/Denúncias/Auditoria testados, Health OK, Monitoring OK, Rollback documentado.

---

## Validação Executada

| Verificação | Resultado |
|---|---|
| typecheck API | ✅ |
| typecheck Web | ✅ |
| typecheck Database | ✅ |
| lint (arquivos alterados) | ✅ 0 erros |
| Jest unit (API) | ✅ 57/57 |
| E2E (API real) | ✅ 20/20 |
| `prisma validate` | ✅ schema válido |
| `prisma migrate status` | ✅ 15/15, up-to-date |
| Health real `/health`, `/health/db`, `/health/full` | ✅ db+postgis+redis ok |
| Guard shadow DB (colisão / distinto) | ✅ exit 1 / exit 0 |

## Estado Final

- 🟢 CÓDIGO PRONTO
- 🟢 TESTES LOCAIS APROVADOS
- 🟢 ARQUITETURA DE PRODUÇÃO DEFINIDA
- 🟢 MIGRATIONS PREPARADAS
- 🟢 DOCKER PREPARADO
- 🟢 BACKUP/RESTORE DOCUMENTADOS
- 🟡 VPS PENDENTE
- 🟡 POSTGRESQL PRODUÇÃO PENDENTE
- 🟡 STORAGE PRODUÇÃO PENDENTE
- 🟡 EMAIL PRODUÇÃO PENDENTE
- 🟡 STAGING PENDENTE
- 🔴 GO-LIVE PENDENTE

Próxima etapa somente após a VPS estar disponível.