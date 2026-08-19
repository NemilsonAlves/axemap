# AxéMap — Security Audit Report (Sprint 2.4)

## Executive Summary

Hardening sprint que adicionou proteção real no backend admin, rate limiting global, security headers, e auditoria completa. **66/66 testes de segurança passando.**

## Fixes Applied

### CRITICAL

| # | Finding | Fix | Status |
|---|---------|-----|--------|
| C1 | Rate limiting configurado mas ThrottlerGuard nunca aplicado | `APP_GUARD` provider com `ThrottlerGuard` no `AppModule` | FIXED |
| C2 | `/system/status`, `/system/metrics`, `/system/version` públicos | `RolesGuard` + `@Roles(ADMIN, SUPER_ADMIN)` no controller | FIXED |
| C3 | Feature flags sem auditoria | `AuditLogsService.registrar` nos endpoints de escrita | FIXED |

### HIGH

| # | Finding | Status | Notes |
|---|---------|--------|-------|
| H1 | Sem Helmet / security headers | FIXED | Helmet aplicado com `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` |
| H2 | Upload `kind` não sanitizado (path traversal) | FIXED | Sanitização: `[a-zA-Z0-9_-]`, max 30 chars |
| H3 | `/notificacoes` sem auth guard | FIXED | `useAuth()` + redirect para `/auth/login` |
| H4 | `.env.example` incompleto (~20 vars ausentes) | FIXED | Documentadas todas as vars (storage, email, whatsapp, maps, IA, OAuth, pagamentos, Sentry) |

### MEDIUM (documented, not fixed in this sprint)

| # | Finding | Recommendation |
|---|---------|---------------|
| M1 | 24 controllers usam `@Body() dto: any` (sem validação) | Criar DTOs com class-validator |
| M2 | `execSync` no system.service.ts | Manter atrás do guard, monitorar |
| M3 | Refresh token armazenado em plaintext no DB | Armazenar hash |
| M4 | Upload aceita 100MB em memória | Usar `dest` para disk storage |
| M5 | CORS permite todo localhost incondicionalmente | Restringir em produção |

### LOW (acceptable for dev)

| # | Finding | Notes |
|---|---------|-------|
| L1 | Seed com `senha123` | Dev-only |
| L2 | Docker compose com credenciais hardcoded | Dev-only, sem production compose |
| L3 | Console.log em mapa | Debug remanescente |

## Architecture

```
Frontend (Next.js)          Backend (NestJS)
├── /admin/* layout gate     ├── RolesGuard (APP_GUARD global)
│   └── useAuth() + role     ├── ThrottlerGuard (100 req/min)
├── Client-side redirect     ├── Helmet middleware
└── No middleware.ts         ├── ValidationPipe (whitelist)
    (known gap)              └── AuditLogsService (critical actions)
```

## RBAC Matrix

| Endpoint | USER | MODERATOR | ADMIN | SUPER_ADMIN | Anon |
|----------|------|-----------|-------|-------------|------|
| GET /admin/* | 403 | 403 | 200 | 200 | 401 |
| POST /admin/usuarios/:id/bloquear | 403 | 403 | 200 | 200 | 401 |
| PATCH /admin/usuarios/:id/role (→ADMIN) | 403 | 403 | 403 | 200 | 401 |
| PATCH /admin/usuarios/:id/role (→MODERATOR) | 403 | 403 | 200 | 200 | 401 |
| POST /feature-flags | 403 | 403 | 201 | 201 | 401 |
| GET /system/status | 403 | 403 | 200 | 200 | 401 |
| GET /system/health | 200 | 200 | 200 | 200 | 200 |

## Audit Log Events

| Event | Entity | Trigger |
|-------|--------|---------|
| USUARIO_BLOQUEAR | USUARIO | Admin bloqueia usuário |
| USUARIO_DESBLOQUEAR | USUARIO | Admin desbloqueia |
| USUARIO_ROLE | USUARIO | Papel alterado |
| FEATURE_FLAG_CRIAR | FEATURE_FLAG | Nova flag criada |
| FEATURE_FLAG_ATUALIZAR | FEATURE_FLAG | Flag atualizada |
| FEATURE_FLAG_OVERRIDE | FEATURE_FLAG | Override criado |
| EVENTO_ARQUIVAR | EVENTO | Evento arquivado |
| EVENTO_RESTAURAR | EVENTO | Evento restaurado |
| ORGANIZACAO_PUBLICAR | ORGANIZACAO | Organização publicada |
| ORGANIZACAO_ARQUIVAR | ORGANIZACAO | Organização arquivada |
| AVALIACAO_OCULTAR | AVALIACAO | Avaliação ocultada |
| AVALIACAO_RESTAURAR | AVALIACAO | Avaliação restaurada |
| MODERACAO_RESOLVER | DENUNCIA | Denúncia resolvida |

## Known Gaps (Backlog)

1. **No Next.js middleware.ts** — toda proteção de rotas é client-side
2. **Sem Sentry/OpenTelemetry** — error tracking e tracing não integrados
3. **Sem Prometheus metrics** — infra Docker existe mas app não exporta
4. **N+1 em axegraph buscar()** — 30 queries sequenciais (fix: batch)
5. **Sem class-validator DTOs** — ValidationPipe ineficaz com `any`
6. **Refresh token em plaintext** — considerar armazenar hash

---

# Produção — Segurança da VPS (FASE 14)

> Aplicável quando a VPS for disponibilizada. Nenhum passo executado ainda.

## 1. Hardening da VPS

- [ ] SSH por chave (desabilitar senha); desabilitar login `root` (usuário com `sudo`).
- [ ] Firewall (ufw/iptables): apenas 22, 80, 443.
- [ ] Portas mínimas; fechar todo o restante.
- [ ] `fail2ban` para SSH.
- [ ] Atualizações automáticas de segurança (`unattended-upgrades`).
- [ ] Docker security: `Dockerfile`s multi-stage, usuário não-root (já ok), não rodar container como root.
- [ ] Secrets: apenas `.env.production` na VPS com permissão 600; nunca no git/CI logs.

## 2. Serviços NÃO expostos à internet

| Serviço | Porta | Exposição |
|---|---|---|
| PostgreSQL | 5432 | ❌ apenas `127.0.0.1` / rede interna |
| Redis | 6379 | ❌ apenas `127.0.0.1` / rede interna |
| MinIO console | 9001 | ❌ nunca exposto |
| MinIO API | 9000 | só via proxy para arquivos públicos |

## 3. Aplicação

- JWT secrets ≥32 chars, únicos por ambiente (`openssl rand -base64 48`).
- `DATABASE_URL`/`SHADOW_DATABASE_URL` distintos — guard em `scripts/check-shadow-db.sh`.
- Helmet headers já aplicados (HSTS, nosniff, SAMEORIGIN).
- Rate limiting global (100 req/min) via `ThrottlerGuard`.
- CORS: `FRONTEND_URL` restrito ao domínio real em produção.
- `pg_hba.conf` em `scram-sha-256` (nunca `trust`).

## 4. Observabilidade

- Logs estruturados da API (`LOG_LEVEL=info` em prod).
- Monitoramento/alertas para API/db/storage offline (FASE 24) — pendente.
- Error tracking (Sentry) — backlog.
