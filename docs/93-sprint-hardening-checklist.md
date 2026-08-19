# AxéMap 2.4 — Sprint Hardening Acceptance Checklist

## ✅ FASE 1-2: Baseline & Commit
- [x] git status limpo (baseline)
- [x] pnpm install sem erros
- [x] lint: 0 errors (30 warnings pré-existentes)
- [x] typecheck: 0 erros
- [x] test: 54/54 passando
- [x] build: apps/api + apps/web OK
- [x] Commit `393001f` "feat(admin): implement superadmin console and RBAC controls"

## ✅ FASE 3-9: Security Validation (66/66 PASS)
- [x] RBAC matrix testada: 9 endpoints × 4 roles + anonimo
- [x] Privilege escalation bloqueada: ADMIN→SUPER_ADMIN (403), self-role (403), self-block (403)
- [x] IDOR prevenido: user não acessa recursos de outro (403)
- [x] Bloqueio completo: signup → block → 401 → unblock → 200
- [x] Auditoria: ações críticas registradas com actor/entity/id, sem segredos
- [x] Feature flags: USER/MODERATOR bloqueados (403), ADMIN/SUPER OK

## ✅ FASE 10-17: Backend Validation
- [x] Dashboard: 50 queries paralelas (Promise.all), sem N+1
- [x] Integracoes: status field explícito (configurado/not_configured), DB/Redis reais
- [x] Jobs: queues: [] (sem BullMQ fantasma), contagens reais
- [x] Mapa admin: groupBy sem N+1
- [x] Moderação: todos os writes auditados com IP/userAgent
- [x] `/notificacoes`: auth guard adicionado

## ✅ FASE 18-20: Frontend & Environment
- [x] 51 rotas classificadas: 34 publicas, 6 auth, 11 admin
- [x] Admin layout gate verificado
- [x] Auth context import path corrigido em notificacoes

## ✅ FASE 21-23: Federations, i18n, Mocks
- [x] Federações: page existe, controller ausente (documentado no gap analysis)
- [x] i18n: 5 idiomas ativos, strings hardcoded restantes documentadas
- [x] Mock audit: nenhum mock em código de produção

## ✅ FASE 24-25: Security Hardening
- [x] ThrottlerGuard global: 100 req/min por IP
- [x] Helmet: HSTS, X-Content-Type-Options, X-Frame-Options, X-Powered-By removido
- [x] Upload sanitization: kind parameter validado
- [x] .env.example: todas as ~40 variáveis documentadas
- [x] .env files: todos gitignored, nenhum commitado

## ✅ FASE 26-28: Performance, Observability, CI/CD
- [x] N+1 identificado em axegraph buscar() (30 seq queries)
- [x] Pino logger: structured JSON em prod, requestId per-request
- [x] Health checks: /system/* + /health/* comprehensivos
- [x] CI pipeline: ci.yml (lint→typecheck+test→build)
- [x] CD pipeline: cd.yml (Railway + Vercel)
- [x] Pre-commit: husky + lint-staged + commitlint

## ✅ FASE 30: ADS Gap Analysis
- [x] docs/98-design-gap-analysis.md revisado
- [x] Gaps mapeados: password recovery, dark mode, accessibility, federations backend

## ✅ FASE 31: Final Verification
- [x] lint: 0 errors ✅
- [x] typecheck: 0 errors ✅
- [x] test: 54/54 ✅
- [x] build: OK ✅
- [x] security tests: 66/66 ✅

## ✅ FASE 32: Documentation
- [x] SUPERADMIN.md atualizado com hardening sprint
- [x] SECURITY.md criado com audit report completo
- [x] .env.example atualizado com todas as variáveis
