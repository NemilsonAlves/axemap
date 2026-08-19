# AxéMap — Production Readiness Checklist

> Última revisão: Staging Validation 2026-08-18 · branch `master`
> Ver relatório completo: [`docs/STAGING-VALIDATION-REPORT.md`](./STAGING-VALIDATION-REPORT.md)

Este documento lista os critérios que devem estar satisfeitos antes de qualquer deploy em produção.
Cada item tem seu status atual e o responsável por confirmar antes do go-live.

---

## 1. Build & Typecheck

| Critério | Status | Validação |
|---|---|---|
| `tsc --noEmit` (web) sem erros | ✅ Validado 2026-08-18 | `cd apps/web && npx tsc --noEmit` |
| `tsc --noEmit` (api) sem erros | ✅ Validado 2026-08-18 | `cd apps/api && npx tsc --noEmit` |
| `next build` sem erros | ✅ Validado 2026-08-18 | `cd apps/web && npx next build` |
| `nest build` sem erros | ✅ Validado 2026-08-18 | `cd apps/api && npx nest build` |

---

## 2. Lint

| Critério | Status | Validação |
|---|---|---|
| `eslint src` (web) — 0 erros, 0 warnings | ✅ Validado 2026-08-18 | `cd apps/web && npx eslint src --ext .ts,.tsx` |
| `eslint src` (api) — 0 erros | ✅ Validado 2026-08-18 | `cd apps/api && npx eslint src --ext .ts` |

---

## 3. Testes

| Critério | Status | Validação |
|---|---|---|
| 104/104 unit tests passando | ✅ Validado 2026-08-18 | `cd apps/api && npx jest` |
| Nenhuma regressão nas suítes existentes | ✅ Validado 2026-08-18 | 13 suítes |
| Trust/ADS/Webhook/Privacy isolation tests | ✅ Validado 2026-08-18 | 4 suítes de segurança |
| E2E smoke test (API + Web reais) | ✅ HTTP smoke tests executados | Ver STAGING-VALIDATION-REPORT |

---

## 4. Segurança

| Critério | Status | Arquivo |
|---|---|---|
| CSP `connect-src` — sem localhost em produção | ✅ | `apps/web/next.config.js` |
| HSTS apenas em HTTPS (desabilitado em dev) | ✅ | `apps/api/src/main.ts` |
| Helmet configurado (X-Frame, X-Content-Type, Referrer) | ✅ | `apps/api/src/main.ts` |
| ThrottlerGuard global (100 req/min) | ✅ | `apps/api/src/app.module.ts` |
| RBAC em endpoints admin (`ADMIN`, `SUPER_ADMIN`) | ✅ | Vários controllers |
| Next.js middleware protege `/admin`, `/painel` | ✅ | `apps/web/src/middleware.ts` |
| Upload `kind` sanitizado (path traversal) | ✅ | `apps/api/src/upload/upload.controller.ts` |
| `visibilidadeLocalizacao` respeitada em geo/axegraph | ✅ | `geo.service.ts`, `axegraph.service.ts` |
| `arquivoUrl` de documentos privados não exposto | ✅ | `verificacao.service.ts` |
| Sem credenciais em código-fonte | ✅ | Usar `.env` com todas as variáveis do `.env.example` |

---

## 5. LGPD & Privacidade

| Critério | Status | Detalhe |
|---|---|---|
| Cookie Consent funcional | ✅ | `components/cookies/cookie-consent.tsx` |
| ConsentRecord armazenado no banco | ✅ | Model `Consent` + `POST /consent/record` |
| Analytics/marketing não carregam sem consentimento | ✅ | `consent-script-loader.tsx` + `analytics-context.tsx` |
| Exportação de dados pessoais | ✅ | `GET /auth/me/dados` |
| Exclusão de conta | ✅ | `DELETE /auth/me` |
| Revogação de consentimento | ✅ | `DELETE /consent` |
| Privacy Center acessível | ✅ | `/meus-dados`, `/privacidade`, `/protecao` |
| Central de Proteção (denúncia pública) | ✅ | `/protecao` + `POST /denuncias` |

---

## 6. Banco de Dados

| Critério | Status | Detalhe |
|---|---|---|
| Todas as migrations aplicadas em produção | ⏳ | `npx prisma migrate deploy` |
| `prisma validate` sem erros | ✅ | `cd packages/database && npx prisma validate` |
| PostGIS extension ativa | ⏳ | Confirmar no banco de produção |
| Seeds opcionais executados | ⏳ | `npx prisma db seed` (apenas em dev/staging) |

---

## 7. Variáveis de Ambiente

Todas as variáveis listadas em [`.env.example`](../.env.example) devem estar configuradas em produção.

| Variável crítica | Detalhe |
|---|---|
| `DATABASE_URL` | PostgreSQL com PostGIS (não SQLite) |
| `JWT_SECRET` | String longa e aleatória (mín. 32 chars) |
| `JWT_REFRESH_SECRET` | Diferente do JWT_SECRET |
| `NEXT_PUBLIC_API_URL` | URL pública da API (sem trailing slash) |
| `APP_URL` | URL pública do frontend |
| `AWS_*` / `R2_*` | Credenciais de storage (S3 ou Cloudflare R2) |
| `MAIL_*` | SMTP para e-mails transacionais (reset senha, denúncias) |
| `NODE_ENV` | `production` nos dois apps |
| `SUPER_ADMIN_EMAIL` | E-mail do super admin inicial |
| `SUPER_ADMIN_PASSWORD` | Senha forte do super admin inicial |

---

## 8. Performance

| Critério | Status | Detalhe |
|---|---|---|
| Imagens em S3/R2 (não storage local) | ✅ | `s3-storage.service.ts` |
| Next.js `<Image>` com `remotePatterns` configurados | ✅ | `next.config.js` |
| Mapa carregado com lazy import | ✅ | `dynamic(() => import(...), { ssr: false })` |
| Axé Graph: query batched (sem N+1) | ✅ | `axegraph.service.ts` (Sprint Prompt-15) |
| `revalidate` em páginas estáticas | ✅ | `/terreiros`, `/tradicao`, etc. |
| `robots.ts` e `sitemap.ts` configurados | ✅ | `apps/web/src/app/robots.ts`, `sitemap.ts` |

---

## 9. Acessibilidade

| Critério | Status | Ferramenta |
|---|---|---|
| WCAG AA — contraste mínimo 4.5:1 texto normal | ⏳ | axe DevTools / Lighthouse |
| Navegação por teclado (focus-visible) | ⏳ | Teste manual |
| `aria-label` em todos elementos interativos sem texto | ⏳ | Inspeção manual |
| `prefers-reduced-motion` respeitado | ✅ | `globals.css` + componentes de mapa |
| Skip-link presente | ⏳ | `layout.tsx` |
| Alternativa textual ao mapa | ✅ | Seção de lista de casas `/terreiros` |

---

## 10. Home — Critérios Visuais (Redesign V2)

| Critério | Status |
|---|---|
| Identidade visual própria (Obsidian + Dourado + Terracota) | ✅ |
| Logo valorizada (180px desktop) | ✅ |
| Brasil como protagonista — sem "diáspora" na Home | ✅ |
| Mapa SVG interativo com marcadores por tipo | ✅ |
| Busca funcional navegando para `/mapa` | ✅ |
| Cadastro gratuito destacado no header e hero | ✅ |
| Tradições valorizadas (seção com cards) | ✅ |
| Federações visíveis (seção Rede) | ✅ |
| TV AxéMap com link para `/tv` | ✅ |
| Trust separado de ADS (cards separados) | ✅ |
| Impacto com links reais | ✅ |
| Dados vêm da API (sem hardcode) | ✅ |
| Responsividade mobile/tablet/desktop | ⏳ Teste manual |
| Sem erros críticos no console do browser | ⏳ Teste manual |

---

## 11. Monitoramento (Pós-deploy)

| Critério | Status | Detalhe |
|---|---|---|
| Logs estruturados (NestJS Logger) | ✅ | Ativo em produção |
| Audit log de ações admin | ✅ | Modelo `AuditLog` |
| Alertas de falhas de webhook | ✅ | Dead-letter em `PaymentWebhookLog` |
| Sentry / error tracking | ⏳ | Não integrado ainda |
| Prometheus metrics | ⏳ | Infra Docker disponível, app não exporta |
| Uptime monitor | ⏳ | Configurar externamente (UptimeRobot, etc.) |

---

## 12. Checklist Final Pré-Deploy

```
[ ] .env de produção configurado com todas as variáveis
[ ] prisma migrate deploy executado no banco de produção
[ ] PostGIS ativo no banco de produção
[ ] next build + nest build passando na CI/CD
[ ] 104+ testes passando na CI/CD
[ ] Lint 0 erros/warnings
[ ] HTTPS configurado (certificado TLS válido)
[ ] Domínio axemap.com.br apontando para o servidor correto
[ ] CDN/R2 acessível para imagens
[ ] SMTP configurado e testado (e-mail de reset senha)
[ ] Super admin criado (ou seed executado)
[ ] Cookie consent testado no browser
[ ] Mapa testado com dados reais
[ ] Home testada visualmente em desktop + mobile
[ ] Console do browser sem erros críticos
[ ] Lighthouse score > 80 em Performance + Accessibility
```

---

> **Nota:** Este documento não substitui um plano de disaster recovery, backup, ou runbook operacional.
> Consulte [`docs/DEPLOYMENT.md`](./DEPLOYMENT.md) para instruções de deploy detalhadas.
