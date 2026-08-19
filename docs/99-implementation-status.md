# AxéMap 2.1 — Status de Implementação

> Última atualização: Sprint Prompt-15 (Home Redesign V2 + Production Hardening) · branch `master`

## Resumo Executivo

| Dimensão | Status |
|---|---|
| TypeScript (web) | ✅ `tsc --noEmit` sem erros |
| TypeScript (api) | ✅ `tsc --noEmit` sem erros |
| i18n (6 idiomas) | ✅ pt-BR · pt-PT · en · es · fr · yo |
| Busca Estado+Cidade | ✅ API IBGE + fallback offline |
| Login layout artístico | ✅ 2 painéis + SVG Adinkra |
| Renomeação "Terreiros" | ✅ Todos textos visíveis → Casa de Axé/Asé |
| Diáspora redefinida | ✅ "todo culto fora da África" |
| Taxonomia multidimensional | ✅ TipoConceitual + 15 tradições catalogadas |
| API NestJS rodando | ✅ Boot OK · endpoints admin smoke-testados |
| SuperAdmin Console Central | ✅ Dashboard real, usuários, mapa, integrações, jobs, auditoria |
| Recuperação de senha | ✅ Backend (`/auth/forgot-password` + `/auth/reset-password`) + rotas web |
| Central de Proteção | ✅ Denúncia pública + páginas `/protecao`, `/admin/central` |
| Diáspora Africana | ✅ Módulo Home + catálogo (TERECO, ABAKUA, REGLA_DE_OCHA) |
| Níveis de Privacidade | ✅ Seção 23: PUBLICO/COMUNITARIO/RESTRITO/PRIVADO/SENSIVEL |
| OrganizationType expandido | ✅ PESQUISADOR, GRUPO_DE_PESQUISA, TEMPLO, ORGANIZACAO_INTERNACIONAL |
| Mapa Global | ✅ Filtro por continente (incl. Ásia + Oceania) + `autoFit` no Leaflet |
| Ifá | ✅ Página editorial `/ifa` (sistema de conhecimento yorùbá, seção 04) |
| Federações | ✅ Perfil próprio `/federacoes/[slug]` + `GET /federacoes/:slug` |
| Verificação de organizações | ✅ Enum no shared + `POST /admin/organizacoes/:id/verificacao` + painel admin |
| Proveniência | ✅ "Sobre esta informação" no perfil do terreiro (fonte/atualização/nível) |

---

## Rotas Web × Controllers Backend

| Rota Web | Página | Controller API | Status |
|---|---|---|---|
| `/` | `page.tsx` | `app.controller.ts` | ✅ |
| `/busca` | `busca/page.tsx` | `terreiro.controller.ts` | ✅ |
| `/mapa` | `mapa/page.tsx` | `geo.controller.ts` | ✅ |
| `/tradicao` | `tradicao/page.tsx` | `discovery.controller.ts` | ✅ |
| `/tradicao/[tradicao]` | `tradicao/[tradicao]/page.tsx` | `discovery.controller.ts` | ✅ |
| `/terreiros` | `terreiros/page.tsx` | `landing.controller.ts` | ✅ |
| `/terreiros/top` | `terreiros/top/page.tsx` | `ranking.controller.ts` | ✅ |
| `/terreiros-verificados` | `terreiros-verificados/page.tsx` | `landing.controller.ts` | ✅ |
| `/novos-terreiros` | `novos-terreiros/page.tsx` | `landing.controller.ts` | ✅ |
| `/terreiro/[slug]` | `terreiro/[slug]/page.tsx` | `terreiro.controller.ts` | ✅ |
| `/t/[slug]` | `t/[slug]/page.tsx` | `terreiro.controller.ts` | ✅ (alias) |
| `/eventos` | `eventos/page.tsx` | `eventos.controller.ts` | ✅ |
| `/eventos/[local]` | `eventos/[local]/page.tsx` | `eventos.controller.ts` | ✅ |
| `/cursos` | `cursos/page.tsx` | `cursos.controller.ts` | ✅ |
| `/cursos/[tradicao]` | `cursos/[tradicao]/page.tsx` | `cursos.controller.ts` | ✅ |
| `/acoes-sociais` | `acoes-sociais/page.tsx` | `acoes-sociais.controller.ts` | ✅ |
| `/cidade/[cidadeUf]` | `cidade/[cidadeUf]/page.tsx` | `geo.controller.ts` | ✅ |
| `/cidade/[cidadeUf]/[tradicao]` | `cidade/[cidadeUf]/[tradicao]/page.tsx` | `geo.controller.ts` | ✅ |
| `/estado/[uf]` | `estado/[uf]/page.tsx` | `geo.controller.ts` | ✅ |
| `/auth/login` | `auth/login/page.tsx` | `auth.controller.ts` | ✅ |
| `/auth/cadastro` | `auth/cadastro/page.tsx` | `auth.controller.ts` | ✅ |
| `/auth/esqueci-senha` | `auth/esqueci-senha/page.tsx` | `auth.controller.ts` | ✅ (`POST /auth/forgot-password`) |
| `/auth/recuperar-senha` | `auth/recuperar-senha/page.tsx` | `auth.controller.ts` | ✅ (`POST /auth/reset-password`) |
| `/protecao` | `protecao/page.tsx` (Central de Proteção) | `denuncias.controller.ts` | ✅ |
| `/ifa` | `ifa/page.tsx` (editorial Ifá) | — | ✅ (estático + discovery) |
| `/federacoes/[slug]` | `federacoes/[slug]/page.tsx` | `organizacoes.controller.ts` (`GET /federacoes/:slug`) | ✅ |
| `/onboarding` | `onboarding/page.tsx` | `onboarding.controller.ts` | ✅ |
| `/painel` | `painel/page.tsx` | `terreiro.controller.ts` | ✅ |
| `/painel/terreiros/[id]` | `painel/terreiros/[id]/page.tsx` | `terreiro.controller.ts` | ✅ |
| `/perfil` | `perfil/page.tsx` | `auth.controller.ts` | ✅ |
| `/planos` | `planos/page.tsx` | `saas/planos.controller.ts` | ✅ |
| `/campanhas` | `campanhas/page.tsx` | `campanhas.controller.ts` | ✅ |
| `/campanhas/[slug]` | `campanhas/[slug]/page.tsx` | `campanhas.controller.ts` | ✅ |
| `/central-evolucao` | `central-evolucao/page.tsx` | `evolution.controller.ts` | ✅ |
| `/notificacoes` | `notificacoes/page.tsx` | `notificacoes.controller.ts` | ✅ |
| `/transparencia` | `transparencia/page.tsx` | — | ✅ (estático) |
| `/transparencia/[slug]` | `transparencia/[slug]/page.tsx` | — | ✅ (estático) |
| `/governanca` | `governanca/page.tsx` | `trust-ecosystem/trust-admin.controller.ts` | ✅ |
| `/organizacoes` | `organizacoes/page.tsx` | `organizacoes.controller.ts` | ✅ |
| `/organizacoes/[slug]` | `organizacoes/[slug]/page.tsx` | `organizacoes.controller.ts` | ✅ |
| `/federacoes` | `federacoes/page.tsx` | `organizacoes.controller.ts` (`GET /federacoes`) | ✅ |
| `/grafo` | `grafo/page.tsx` | `axegraph.controller.ts` | ✅ |
| `/admin` | `admin/page.tsx` (dashboard real) | `dashboard-admin.controller.ts` | ✅ |
| `/admin/central` | `admin/central/page.tsx` (moderação, 9 abas) | `admin.controller.ts` | ✅ |
| `/admin/usuarios` | `admin/usuarios/page.tsx` | `usuarios-admin.controller.ts` | ✅ |
| `/admin/mapa` | `admin/mapa/page.tsx` | `monitor-admin.controller.ts` | ✅ |
| `/admin/auditoria` | `admin/auditoria/page.tsx` | `admin.controller.ts` (`GET /admin/audit-logs`) | ✅ |
| `/admin/integracoes` | `admin/integracoes/page.tsx` | `monitor-admin.controller.ts` | ✅ |
| `/admin/jobs` | `admin/jobs/page.tsx` | `monitor-admin.controller.ts` | ✅ |
| `/admin/axegraph` | `admin/axegraph/page.tsx` | `axegraph-admin.controller.ts` | ✅ |
| `/admin/transparencia` | `admin/transparencia/page.tsx` | `admin.controller.ts` | ✅ |
| `/admin/system` | `admin/system/page.tsx` | `system.controller.ts` | ✅ (protegido pelo layout) |
| `/sobre` | `sobre/page.tsx` | — | ✅ (estático) |
| `/privacidade` | `privacidade/page.tsx` | — | ✅ (estático) |
| `/termos` | `termos/page.tsx` | — | ✅ (estático) |

---

## i18n — Cobertura por Componente

| Componente | pt-BR | pt-PT | en | es | fr | yo |
|---|---|---|---|---|---|---|
| AppHeader | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| AppFooter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MobileBottomNav | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| LocaleSwitcher | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| BuscaPage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login / Cadastro | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| TerreirosPage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| HomePage (hero redesign) | pt-BR hardcode | — | — | — | — | — |
| TradicaoPage | pt-BR hardcode | — | — | — | — | — |
| Central de Proteção | pt-BR hardcode | — | — | — | — | — |

> **Próximo passo i18n:** extrair textos hardcode do Hero (V2), TradicaoPage, PerfilPage, PainelPage

---

## Fases do Roadmap — Estado Atual

### ✅ Concluídas

| Fase | Descrição |
|---|---|
| 1 | Posicionamento global — "infraestrutura digital para Africa e diásporas" |
| 2 | Taxonomia multidimensional (TipoConceitual, 15 tradições, FILTROS expandidos) |
| 3 | Hero reformulado — novo headline, tagline MAPA·MEMÓRIA·ANCESTRALIDADE·CONEXÃO, 3 CTAs |
| 4 | i18n completo — pt-BR, pt-PT, en, es, yo — I18nProvider + useI18n() + LocaleSwitcher |
| 5 | Busca avançada — filtro Estado (27 UFs) + Cidade via API IBGE + fallback offline |
| 6 | Login/Cadastro reformulados — nova aba, layout 2 painéis, SVG ancestral |
| 7 | Renomeação "Terreiros" → "Casas de Axé/Asé" em toda interface visível |
| 7b | Diáspora redefinida — "todo culto africano praticado fora do continente" |
| 7c | Metadata global internacional — layout.tsx, page.tsx, json-ld.tsx |
| S2.1-A | **SuperAdmin**: dashboard com dados reais (`GET /admin/dashboard`) + layout admin com sidebar e gate |
| S2.1-B | **Gestão de usuários**: listar, buscar, bloquear/desbloquear (com motivo), alterar papel — com auditoria |
| S2.1-C | **Bloco de conta**: migration `add_usuarios_bloqueio` + rejeição em login/refresh/JWT |
| S2.1-D | **RBAC**: feature-flags writes exigem ADMIN/SUPER_ADMIN; `/admin/system` protegido |
| S2.1-E | **Monitoramento**: `/admin/mapa`, `/admin/integracoes`, `/admin/jobs` |
| S2.1-F | **Moderação**: `/admin/eventos`, `/admin/organizacoes`, `/admin/avaliacoes` (arquivar/publicar/ocultar + auditoria) |
| S2.1-G | 54 testes API verdes (4 suítes novas), lint 0 erros, typecheck 4/4, build web OK |
| S2.5-A | **Recuperação de senha**: migrations `add_reset_senha` + `denuncia_publica`; `POST /auth/forgot-password` e `POST /auth/reset-password` com token expirante (2h) + migração de senha |
| S2.5-B | **Central de Proteção**: denúncia pública sem login (protocolo, e-mail de contato opcional), consulta por protocolo, `GET /denuncias/me` (autenticado), página `/protecao`, botão "Denunciar" nos perfis, aba "Denúncias" no `/admin/central` |
| S2.5-C | **Diáspora Africana**: módulo Home (seção 06) com caminho ancestral + catálogo; novas tradições TERECO, ABAKUA, REGLA_DE_OCHA |
| S2.5-D | **OrganizationType expandido**: PESQUISADOR, GRUPO_DE_PESQUISA, TEMPLO, ORGANIZACAO_INTERNACIONAL (migration `org_tipos_lideranca`) |
| S2.5-E | **Níveis de Privacidade** (seção 23): enum + campos `nivelPrivacidade` em Terreiro/Evento/ConteudoCultural/PatrimonioCultural + filtros de visibilidade em geo/axegraph/discovery (migration `niveis_privacidade`) |
| S2.5-F | 4 migrations aplicadas no dev, 54 testes API verdes, lint 0 erros, typecheck api/web/shared OK |

### ⚠️ Em Progresso

| Fase | Descrição | Bloqueio |
|---|---|---|
| S2.1-H | Testar fluxo completo de bloqueio pela UI web (login + acesso negado + auditoria) | Precisa dos 2 servidores de pé |
| S2.5-G | Testar fluxo E2E de recuperação de senha + denúncia pública pela UI | Precisa dos 2 servidores de pé |
| i18n+ | Extrair textos hardcode de Hero, Diáspora, Proteção, Tradição, Perfil, Painel | Média |

### ⏳ Pendentes

| Fase | Descrição | Prioridade |
|---|---|---|
| 8 | Rede AxéMap — federações, pesquisadores, museus, organizações | Alta |
| 9 | Mapa Global — clustering, filtros globais, continente/país/povo | Alta |
| 10 | Governança — verificação níveis 0-4, trust, proteção, privacidade | Média |
| i18n+ | Extrair textos hardcode de Hero, Diáspora, Proteção, Tradição, Perfil, Painel | Média |
| federacoes | Controller backend para `/federacoes` | Baixa |

---

## Pendências Backend Específicas

| Endpoint | Status |
|---|---|
| `POST /auth/forgot-password` | ✅ Token reset + expiração 2h (mock de envio em dev) |
| `POST /auth/reset-password` | ✅ Valida token + troca senha + invalida refresh |
| `POST /denuncias` | ✅ Denúncia pública (anonimato, protocolo, sem login) |
| `GET /denuncias/protocolo/:protocolo` | ✅ Consulta pública por protocolo |
| `GET /denuncias/me` | ✅ Minhas denúncias (autenticado) |
| `GET /admin/denuncias` | ✅ Aba Denúncias na moderação |
| `GET /federacoes/:slug` | ✅ Federação específica |
| `POST /admin/organizacoes/:id/verificacao` | ✅ Nível de verificação + auditoria |
| `GET /federacoes` | ✅ |
| `GET /terreiros/meus` | ✅ |
| `POST /terreiros` (onboarding) | ✅ |
| `GET /discovery/explore` | ✅ |
| `GET /landing/recentes` | ✅ |
| `GET /landing/verificados` | ✅ |
| `GET /ranking/top` | ✅ |

---

## Correções de UI Pendentes (Minor)

```
1. layout.tsx → <html> tag precisa de data-scroll-behavior="smooth"
   (aviso do Next.js: não use `scroll-behavior` no CSS global)

2. AppHeader → aria-label do botão de busca hardcoded em pt-BR
   → deve usar t('busca.titulo')

3. HomePage hero → textos hardcoded, não usa useI18n()
   → extrair para TranslationKey + traduzir nos 5 idiomas
```

---

## Sprint 2.4 — Hardening (2026-08-13)

### Security Fixes Aplicados

| Fix | Severidade | Arquivo |
|-----|-----------|---------|
| ThrottlerGuard global (100 req/min) | CRITICAL | `app.module.ts` |
| Helmet (HSTS, X-Content-Type, X-Frame) | HIGH | `main.ts` |
| `/system/status|version|metrics` protegidos por RBAC | CRITICAL | `system.controller.ts` |
| Feature flags: audit em criar/atualizar/override | CRITICAL | `feature-flags.controller.ts` |
| Upload `kind` sanitizado (path traversal) | HIGH | `upload.controller.ts` |
| `/notificacoes` auth guard | HIGH | `notificacoes/page.tsx` |
| `.env.example` completo (~40 vars) | HIGH | `.env.example` |

### Testes de Segurança: 66/66 PASS

- RBAC matrix: 9 endpoints × 4 roles + anonimo
- Privilege escalation bloqueada
- IDOR prevenido
- Bloqueio completo (signup→block→401→unblock→200)
- Auditoria verificada (sem segredos nos logs)

### Gaps Conhecidos (Backlog)

1. ~~**Sem Next.js middleware.ts**~~ — **✅ RESOLVIDO** em Sprint Prompt-15: middleware completo com session + role cookies
2. **Sem Sentry/OpenTelemetry** — error tracking e tracing não integrados
3. **Sem Prometheus metrics** — infra Docker existe mas app não exporta
4. ~~**N+1 em axegraph buscar()**~~ — **✅ RESOLVIDO** em Sprint Prompt-15: batched de 30 para 1 query
5. **Sem class-validator DTOs** — ValidationPipe ineficaz com `any`
6. **Refresh token em plaintext** — considerar hash
7. **Dashboard de organizações** — sem trust-score calculado nem self-service de reivindicação
8. **Dark mode** — 9+ páginas com cores hardcoded (home nova usa tokens dark corretos)

---

## Sprint 2.6 — Global & Governance 2 (2026-08-14)

### Migration Aplicada (1)

| Migration | Conteúdo |
|---|---|
| `mapa_global` | Campo `continente` em `Terreiros` (default `AMERICA-SUL`) |

### Entregas

1. **Mapa Global (seção 19)** — `GET /terreiros` aceita `pais` e `continente`; `/mapa` reescrito: centro mundial, filtro por continente (Mundo/África/Américas/Caribe/Europa/Ásia/Oceania), `autoFit` dos limites via `MapView`; contagem por filtro. Antes: centro hardcoded em Recife, Brasil-only.
2. **Ifá (seção 04)** — nova página editorial `/ifa` com classificação "sistema de conhecimento e adivinhação de tradição yorùbá", áreas (história, Odù, biblioteca, pesquisadores, comunidades, instituições), alerta sobre não publicar segredos iniciáticos e nota de governança. Ligada a partir da Home e do índice de tradições.
3. **Federações (seção 12)** — `GET /federacoes/:slug` (enum `NotFound` se `tipo !== FEDERACAO`) + página própria `/federacoes/[slug]` com template de federação (comunidades associadas, tradições representadas, consentimento dos vínculos). Índice `/federacoes` usa `GET /federacoes` e aponta para os perfis próprios.
4. **Verificação de organizações (seção 15)** — enum `OrganizationVerificationLevel` no shared; `POST /admin/organizacoes/:id/verificacao` com auditoria (`ORGANIZACAO_VERIFICACAO`); painel "Verificação de organizações" na aba Moderação do `/admin/central` (select dos 5 níveis). Antes o campo existia mas nenhum endpoint gravava.
5. **Proveniência pública (seção 18)** — seção "Sobre esta informação" no perfil do terreiro (`/terreiro/[slug]`): fonte classifica- da (comunitária/institucional via nível), documentos validados, última atualização, aviso de que selo ≠ legitimidade religiosa + link para sugestão de correção.
6. **SEO** — sitemap inclui `/ifa`, `/tradicao`, `/organizacoes`, `/federacoes` como estáticas.

### Verificação

- ✅ `prisma validate` + migrate `mapa_global` aplicada
- ✅ typecheck: api, web, shared sem erros
- ✅ lint: 0 erros
- ✅ Testes API: 54/54 passando
- ⏳ Smoke E2E pela UI (mapa global, `/ifa`, `/federacoes/[slug]`, painel de verificação) — depende dos servidores de pé

---

## Sprint 2.5 — Comunidade & Privacidade (2026-08-14)

### Migrations Aplicadas (4)

| Migration | Conteúdo |
|---|---|
| `add_reset_senha` | Tabela `ResetSenhaToken` (token hash, expiração 2h, usedAt) |
| `denuncia_publica` | Tabela `Denuncia` (anonimato, protocolo, tipo, latitude/longitude) |
| `org_tipos_lideranca` | Enum OrganizationType: PESQUISADOR, GRUPO_DE_PESQUISA, TEMPLO, ORGANIZACAO_INTERNACIONAL |
| `niveis_privacidade` | Enum `NivelPrivacidade` + campos em Terreiro/Evento/ConteudoCultural/PatrimonioCultural |

### Entregas

1. **Recuperação de senha** — `POST /auth/forgot-password` (gera token, mock de envio em dev) e `POST /auth/reset-password` (valida expiração, troca senha, invalida refresh tokens). Páginas `/auth/esqueci-senha` e `/auth/recuperar-senha`.
2. **Central de Proteção** — denúncia pública sem login com protocolo e contato opcional; consulta por protocolo; `GET /denuncias/me`; página `/protecao`; botão "Denunciar" nos perfis de terreiros/organizações; aba "Denúncias" em `/admin/central`.
3. **Diáspora Africana (Home)** — módulo com caminho ancestral (África → Rotas → Diáspora) + chamadas para o catálogo; novas tradições TERECO, ABAKUA, REGLA_DE_OCHA.
4. **OrganizationType expandido** — PESQUISADOR, GRUPO_DE_PESQUISA, TEMPLO, ORGANIZACAO_INTERNACIONAL + tipos de liderança (padre/madre de santo, babalorixá, ialorixá etc.).
5. **Níveis de Privacidade (seção 23)** — enum PUBLICO/COMUNITARIO/RESTRITO/PRIVADO/SENSIVEL; filtros de visibilidade aplicados em geo (terreiros/eventos), axegraph e discovery.

### Verificação

- ✅ `prisma validate` + `prisma generate` OK
- ✅ 4 migrations aplicadas no banco dev
- ✅ typecheck: api, web, shared sem erros
- ✅ lint: 0 erros (warnings pré-existentes de `<img>`/exhaustive-deps)
- ✅ Testes API: 54/54 passando
- ⏳ Smoke E2E pela UI (recuperar senha + denúncia) — depende dos servidores de pé

---

## Sprint Prompt-14 — Sustentabilidade, Segurança & Monetização (2026-08-18)

### Objetivo
Implementar a arquitetura financeira sustentável do AxéMap, módulo de publicidade (ADS), payment abstraction layer, testes de separação Trust/Dinheiro, documentação de segurança e governança financeira.

### Auditoria Realizada (Antes de Criar)

| Módulo | Encontrado | Decisão |
|---|---|---|
| `ApoioPlataforma` (Prisma) | ✅ | Reaproveitado |
| `ApoieService` + controladores | ✅ | Reaproveitado |
| `apoie.service.spec.ts` (17 testes) | ✅ | Reaproveitado |
| `Campanhas` (full lifecycle) | ✅ | Reaproveitado |
| `CampanhasAdminService` (IA, aprovação) | ✅ | Reaproveitado |
| `Denuncias` + `ModerationService` | ✅ | Reaproveitado |
| `TrustEcosystemService` | ✅ | Reaproveitado |
| `AuditLogs`, `AntifraudeRegistro` | ✅ | Reaproveitados |
| `mascararLocalizacao()` + spec | ✅ | Reaproveitados |
| `PlanoSaaS`, `PlanoAssinatura` | ✅ | Reaproveitados |
| Enums (`ApoioNivel`, `DenunciaMotivo`…) | ✅ | Reaproveitados |
| Frontend `/apoie`, `/transparencia`, `/protecao` | ✅ | Reaproveitados |
| ADS Backend | ❌ Ausente | **Criado** |
| Payment Abstraction Layer | ❌ Ausente | **Criado** |
| WebhookService (idempotência) | ❌ Ausente | **Criado** |
| Testes Trust/Dinheiro | ❌ Ausente | **Criados** |
| 12 documentações pedidas | ❌ Ausente | **Criadas** |

### Código Criado

#### Backend (`apps/api/src/`)
| Arquivo | Descrição |
|---|---|
| `ads/ads.types.ts` | Enums e DTOs do módulo ADS |
| `ads/ads.service.ts` | CRUD + moderação de anúncios |
| `ads/ads.controller.ts` | Endpoints públicos e de anunciante |
| `ads/ads-admin.controller.ts` | Endpoints de moderação admin |
| `ads/ads.module.ts` | Módulo NestJS |
| `payments/payment.types.ts` | Interface `IPaymentProvider` + DTOs |
| `payments/mock-payment.provider.ts` | Provider de dev (sem gateway real) |
| `payments/webhook.service.ts` | Idempotência, dead-letter, auditoria |
| `payments/webhook.controller.ts` | Receptor de webhooks de gateway |
| `payments/payments.module.ts` | Módulo com injeção substituível |
| `common/tests/trust-money-separation.spec.ts` | Dinheiro não compra Trust |
| `common/tests/ads-trust-separation.spec.ts` | Publicidade não altera Trust |
| `common/tests/webhook-security.spec.ts` | Idempotência e segurança |
| `common/tests/location-privacy.spec.ts` | Privacidade de localização |

#### Prisma Schema
| Adição | Descrição |
|---|---|
| Enum `AdStatus` (9 valores) | Estados do ciclo de anúncio |
| Enum `AdPlacement` (10 valores) | Tipos de posicionamento |
| Enum `AdCategory` (9 valores) | Categorias de anúncio |
| Model `AdCampanha` | Campanha publicitária |
| Model `AdPagamento` | Pagamento de anúncio |
| Model `PaymentWebhookLog` | Audit de webhooks (idempotência) |
| Relations em `Usuarios` | 3 novas relações para ADS |

#### Migration
| Arquivo | Descrição |
|---|---|
| `20260818000000_add_ads_payments/migration.sql` | ADS + PaymentWebhookLog |

#### Documentação (`docs/`)
| Arquivo | Descrição |
|---|---|
| `SUSTAINABILITY.md` | Modelo de sustentabilidade |
| `SUPPORTERS.md` | Círculo de Apoiadores |
| `FINANCIAL-GOVERNANCE.md` | Governança financeira |
| `ADS.md` | AxéMap ADS |
| `CAMPAIGNS-SECURITY.md` | Segurança de campanhas |
| `USER-SAFETY.md` | Segurança dos usuários |
| `LOCATION-PRIVACY.md` | Privacidade de localização |
| `PAYMENTS.md` | Pagamentos e abstraction layer |
| `WEBHOOKS.md` | Segurança de webhooks |
| `SECURITY-MODEL.md` | Modelo de segurança |
| `MONETIZATION.md` | Monetização |
| `PRODUCTION-READINESS.md` | Critérios de go-live |

### Verificação

- ✅ TypeScript (API): `tsc --noEmit` — 0 erros
- ✅ Lint (API): `eslint src` — 0 erros, 0 warnings
- ✅ Testes: **104/104 passando** (13 suítes) — +4 testes (axegraph batched query)
  - 17 testes ApoieService (existentes) — repassaram
  - 18 testes TrustMoneySeparation (novos)
  - 13 testes AdsTrustSeparation (novos)
  - 12 testes WebhookSecurity (novos)
  - 10 testes LocationPrivacy (novos)
  - axegraph.service.spec.ts — repassou pós-fix N+1
  - Demais suítes existentes — nenhuma regressão

### Regra Absoluta Testada Automaticamente

```
DINHEIRO NÃO COMPRA CONFIANÇA.
DINHEIRO NÃO COMPRA VERIFICAÇÃO.
PUBLICIDADE NÃO ALTERA TRUST.
LOCALIZAÇÃO PRIVADA NÃO VAZA.
```

### Pendências (Dependem de Infraestrutura Externa)

| Item | Bloqueio |
|---|---|
| Gateway de pagamento real (Mercado Pago) | VPS + credenciais |
| `prisma generate` com novos models | Banco de desenvolvimento ativo |
| Migration `add_ads_payments` aplicada | Banco de desenvolvimento ativo |
| Área `/minha-conta/apoio` (frontend) | Fase posterior |
| Dashboard ADS no admin (frontend) | Fase posterior |
| Rate limiting específico por endpoint (login, forgot-password) | Fase posterior |
| rawBody preservation para HMAC real | Configuração no main.ts em produção |

---

## Sprint Prompt-15 — Home Redesign V2 + Production Hardening (2026-08-18+)

### Objetivo
Redesign visual completo da página inicial (`/`) com identidade afro-brasileira premium + hardening de produção (CSP, middleware, N+1, HSTS, lint, auth cookies).

### Auditoria Realizada

| Componente | Decisão | Justificativa |
|---|---|---|
| `HomeHero` | Refatorado | Nova composição 88vh, stats bar, Brasil como protagonista |
| `HeroMapVisual` | Substituído | `<img>` → SVG interativo com 18 marcadores por tipo, legend, sem trust hardcoded |
| `AppHeader` | Refatorado | Logo restaurada em 180px, CTA dourado "Cadastrar Casa de Axé", transparente no hero |
| `HomeTrust` | Refatorado | Obsidian dark, 4 cards com bordas coloridas, DonutChart removido (era fake) |
| `HomeMarketplace` | Refatorado → `HomeImpacto` | Cards reais de impacto com links para campanhas/projetos |
| `HomeTraditions` | Corrigido | Eyebrow "Diáspora" removido; aria-label correto |
| `page.tsx` | Atualizado | Ordem das seções + divisores dourados entre seções |
| `globals.css` | Estendido | `.section-divider-gold`, `.section-divider-dark`, `@keyframes map-pulse` |
| `middleware.ts` | Criado | Session + role cookie checks, proteção de rotas admin/painel |
| `auth-context.tsx` | Atualizado | Cookie `axemap_role` setado junto com `axemap_auth=1` |

### Bugs Corrigidos

| Bug | Arquivo | Severidade |
|---|---|---|
| N+1 em `axegraph.buscar()` — 30 queries sequenciais | `axegraph.service.ts` | Alta |
| HSTS em HTTP (dev) — cabeçalho inseguro sem HTTPS | `main.ts` | Média |
| Reset token TTL 30min (docs diziam 2h) | `auth.service.ts` | Baixa |
| CSP connect-src hardcoded localhost em prod | `next.config.js` | Alta |
| `scroll-behavior` no CSS global (Next.js warning) | `layout.tsx` | Baixa |
| Filtros de continente: Ásia e Oceania ausentes | `map-content.tsx` | Baixa |
| Middleware ausente — proteção de rotas só client-side | `middleware.ts` | Alta |
| 24 lint warnings em apps/web | múltiplos arquivos | Média |

### Lint — Arquivos Corrigidos

| Arquivo | Correção |
|---|---|
| `app/admin/ads/page.tsx` | Removeu `BarChart2`, `Clock`, `Eye` unused |
| `app/ads/campanhas/page.tsx` | Removeu `ExternalLink` unused; `catch(e)` → `catch {}` |
| `app/cursos/page.tsx` | Removeu `Link` unused |
| `app/imprensa/page.tsx` | Removeu `Link` unused |
| `app/mapa/map-content.tsx` | Removeu `Progress`, `Layers`, `EventoNoMapa` unused |
| `app/meus-dados/page.tsx` | `variant` → `_variant`; removeu `isExternal` unused |
| `app/admin/central/page.tsx` | `eslint-disable-line` para `exhaustive-deps` em efeito deliberado |
| `components/cookies/consent-script-loader.tsx` | Removeu `eslint-disable` desnecessário |
| `components/home/discovery-cards.tsx` | `<img>` → `<Image fill>` |
| `components/landing/terreiro-card.tsx` | `<img>` → `<Image fill>` |
| `components/terreiro/galeria-section.tsx` | `<img>` grid → `<Image fill>`; modal usa eslint-disable |
| `eslint.config.mjs` | Adicionou `varsIgnorePattern` + `destructuredArrayIgnorePattern` |
| `next.config.js` | Adicionou `remotePatterns` para axemap.com.br + localhost dev |

### Verificação Final

- ✅ TypeScript (web): `tsc --noEmit` — 0 erros
- ✅ TypeScript (api): `tsc --noEmit` — 0 erros
- ✅ Lint (web): `eslint src --ext .ts,.tsx` — **0 erros, 0 warnings**
- ✅ Lint (api): `eslint src --ext .ts` — 0 erros
- ✅ Testes API: **104/104 passando** (13 suítes)
- ✅ Build web: `next build` — sucesso, todas as rotas compiladas
- ⏳ E2E smoke test — depende dos 2 servidores de pé
- ⏳ Validação visual e funcional manual — deve ser realizada com os servidores rodando

### Pendências

| Item | Prioridade |
|---|---|
| Extração de textos hardcoded do Hero V2 para i18n | Média |
| E2E smoke test (requer API + web rodando) | Alta |
| Mini player de áudio (arquivo local → CDN) | Baixa |
| Sentry / OpenTelemetry | Baixa |
| class-validator DTOs no API | Baixa |
