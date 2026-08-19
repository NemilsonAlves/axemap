# MATRIZ DE MÓDULOS FUNCIONAIS — AxéMap (Prompt 13, FASE 02)

> Inventário completo do ecossistema. Gerado em 2026-08-16 a partir de leitura
> de código + consultas reais ao banco. Status será preenchido nas fases
> seguintes (PASS/PARTIAL/FAIL/BLOCKED/NOT IMPLEMENTED).

## 1. Frontend — rotas

### 1.1 Públicas institucionais / estáticas
| Rota | Arquivo | Tipo | SEO |
|---|---|---|---|
| `/` | `app/page.tsx` | Server | metadata + JSON-LD |
| `/sobre` | `app/sobre/page.tsx` | Server | ✅ |
| `/termos` | `app/termos/page.tsx` | Server | ✅ |
| `/privacidade` | `app/privacidade/page.tsx` | Server | ✅ |
| `/governanca` | `app/governanca/page.tsx` | Server | ✅ |
| `/protecao` | `app/protecao/page.tsx` | Client | ❌ (form denúncia) |
| `/planos` | `app/planos/page.tsx` | Client | ❌ |
| `/ads` | `app/ads/page.tsx` | Server | ✅ |

### 1.2 Landings / catálogos (Server, ISR)
| Rota | Arquivo | ISR |
|---|---|---|
| `/ifa` | `app/ifa/page.tsx` | — |
| `/acoes-sociais` | `app/acoes-sociais/page.tsx` | 3600 |
| `/eventos` | `app/eventos/page.tsx` | 3600 |
| `/eventos/[local]` | `app/eventos/[local]/page.tsx` | — |
| `/cursos` | `app/cursos/page.tsx` | 3600 |
| `/cursos/[tradicao]` | `app/cursos/[tradicao]/page.tsx` | — |
| `/tradicao` | `app/tradicao/page.tsx` | — |
| `/tradicao/[tradicao]` | `app/tradicao/[tradicao]/page.tsx` | 3600 |
| `/campanhas` | `app/campanhas/page.tsx` | 150 |
| `/campanhas/[slug]` | `app/campanhas/[slug]/page.tsx` | 120 |
| `/terreiros/top` | `app/terreiros/top/page.tsx` | 3600 |
| `/terreiros-verificados` | `app/terreiros-verificados/page.tsx` | 3600 |
| `/novos-terreiros` | `app/novos-terreiros/page.tsx` | 3600 |
| `/terreiro/[slug]` | `app/terreiro/[slug]/page.tsx` | 300 |
| `/t/[slug]` | `app/t/[slug]/page.tsx` | redirect |
| `/estado/[uf]` | `app/estado/[uf]/page.tsx` | 3600 |
| `/cidade/[cidadeUf]` | `app/cidade/[cidadeUf]/page.tsx` | 3600 |
| `/cidade/[cidadeUf]/[tradicao]` | `app/cidade/[cidadeUf]/[tradicao]/page.tsx` | 3600 |
| `/organizacoes` | `app/organizacoes/page.tsx` | Client |
| `/organizacoes/[slug]` | `app/organizacoes/[slug]/page.tsx` | Server |
| `/federacoes` | `app/federacoes/page.tsx` | Server |
| `/federacoes/[slug]` | `app/federacoes/[slug]/page.tsx` | Server |
| `/transparencia` | `app/transparencia/page.tsx` | Client |
| `/transparencia/[slug]` | `app/transparencia/[slug]/page.tsx` | Client |

### 1.3 Ferramentas públicas interativas
| Rota | Arquivo | Tipo | Obs |
|---|---|---|---|
| `/mapa` | `app/mapa/page.tsx` | Client (Leaflet) | produto principal |
| `/grafo` | `app/grafo/page.tsx` | Client | disallow robots |
| `/busca` | `app/busca/page.tsx` | Client | CSS global |
| `/terreiros` | `app/terreiros/page.tsx` | Client | sem SEO |

### 1.4 Auth
| Rota | Arquivo | Comportamento |
|---|---|---|
| `/auth/login` | `app/auth/login/page.tsx` | vai p/ `/perfil` (ignora `?redirect=`) |
| `/auth/cadastro` | `app/auth/cadastro/page.tsx` | vai p/ `/perfil` |
| `/auth/esqueci-senha` | `app/auth/esqueci-senha/page.tsx` | POST `/auth/forgot-password` |
| `/auth/recuperar-senha` | `app/auth/recuperar-senha/page.tsx` | token+email, POST `/auth/reset-password` |

### 1.5 Protegidas (middleware cookie `axemap_auth` + useAuth)
| Rota | Arquivo | Gate |
|---|---|---|
| `/onboarding` | `app/onboarding/page.tsx` | auth |
| `/perfil` | `app/perfil/page.tsx` | auth |
| `/painel` | `app/painel/page.tsx` | auth (sem role-check) |
| `/painel/terreiros/[id]` | `app/painel/terreiros/[id]/page.tsx` | auth + posse |
| `/notificacoes` | `app/notificacoes/page.tsx` | auth |
| `/central-evolucao` | `app/central-evolucao/page.tsx` | auth |

### 1.6 Admin (middleware + `admin/layout.tsx` com `ADMIN/SUPER_ADMIN`)
`/admin` · `/admin/usuarios` · `/admin/mapa` · `/admin/auditoria` ·
`/admin/integracoes` · `/admin/jobs` · `/admin/central` ·
`/admin/axegraph` · `/admin/impacto` · `/admin/transparencia` ·
`/admin/system` (todas Client, sem metadata).

### 1.7 Erros / loading / SEO técnico
| Item | Arquivo |
|---|---|
| error global | `app/error.tsx` (retry + início) |
| 404 | `app/not-found.tsx` ("Este caminho não está no mapa.") |
| loading global | `app/loading.tsx` (Logo pulsante) |
| sitemap | `app/sitemap.ts` |
| robots | `app/robots.ts` |
| manifest | `public/manifest.webmanifest` |
| service worker | **NENHUM** |

## 2. Backend — controllers (41 classes, prefixo `api/v1`)

| Controller | Rotas | Auth | Roles |
|---|---|---|---|
| App | `/` | — | — |
| Auth | `/auth/*` (login, signup, refresh, logout, me, forgot/reset) | parcial JWT | — |
| Terreiro | `/terreiros*` (CRUD, fotos, meus, perfil) | parcial JWT | DELETE: ADMIN/SUPER_ADMIN/DIRIGENTE |
| Admin | `/admin/terreiros*`, `/admin/audit-logs`, reivindicações | RolesGuard | ADMIN/SUPER_ADMIN |
| UsuariosAdmin | `/admin/usuarios*` (bloquear, role) | RolesGuard | ADMIN/SUPER_ADMIN |
| MonitorAdmin | `/admin/mapa`, `/admin/integracoes`, `/admin/jobs` | RolesGuard | ADMIN/SUPER_ADMIN |
| ModerationAdmin | `/admin/eventos*`, `/admin/organizacoes*`, `/admin/avaliacoes*` | RolesGuard | ADMIN/SUPER_ADMIN |
| DashboardAdmin | `/admin/dashboard` | RolesGuard | ADMIN/SUPER_ADMIN |
| AcoesSociais | `/acoes-sociais*` | parcial JWT | — |
| Verificacao | `/verificacoes*` | parcial JWT | pendentes/status: ADMIN/SUPER_ADMIN |
| Campanhas | `/campanhas*` | parcial JWT (apoiar/comentar) | — |
| Avaliacoes | `/avaliacoes*` | parcial JWT | — |
| AxegraphPublic | `/graph/*` | público | — |
| AxegraphUser | `/graph/relacionamentos`, `/graph/conteudos`, etc. | JWT (classe) | — |
| AxegraphAdmin | `/admin/graph/*` | RolesGuard | ADMIN/SUPER_ADMIN |
| Upload | `/upload` | JWT | — |
| Cursos | `/cursos*` | parcial JWT | — |
| Denuncias | `/denuncias*` | **JWT manual** (sem guard) | anônimo |
| AdminModeration | `/admin/moderation*` | RolesGuard | ADMIN/SUPER_ADMIN/**MODERATOR** |
| Analytics | `/analytics/*` | parcial JWT | — |
| TrustScore | `/terreiros/:id/trust-score` | público | — |
| Feedback | `/feedback*` | parcial JWT | — |
| Landing | `/landing/*` | público | — |
| Evolution | `/evolucao/*` (gamificação) | JWT (classe) | — |
| CampanhasAdmin | `/admin/campanhas*` | RolesGuard | ADMIN/SUPER_ADMIN |
| Growth | `/growth/*` (seguir, favoritos, membros, presença, QR) | parcial JWT | — |
| FeatureFlags | `/feature-flags*` | escrita: ADMIN/SUPER_ADMIN | — |
| TrustPublic | `/trust/*` | parcial JWT (mediações) | — |
| TrustAdmin | `/admin/trust/*` | RolesGuard | ADMIN/SUPER_ADMIN |
| Health | `/health*` | público | — |
| Geo | `/geo/*` (raio, bounding-box, próximos, cidades) | público | — |
| Recommendation | `/recommendation/*` | público (sem auth!) | — |
| Discovery | `/discovery/*` | público | — |
| Onboarding | `/onboarding/*`, `/terreiros/:id/reivindicar` | parcial JWT | — |
| System | `/system/*` | status/version/metrics: ADMIN/SUPER_ADMIN | — |
| Ranking | `/ranking/*` | público | — |
| Organizacoes | `/organizacoes*`, `/federacoes*`, `/taxonomia/regioes` | parcial JWT | — |
| Notificacoes | `/notificacoes*` | JWT (classe) | — |
| Planos/Saas | `/planos*`, `/financeiro/*` | parcial JWT | — |
| SaasAdmin | `/admin/saas/*` | RolesGuard | ADMIN/SUPER_ADMIN |
| Eventos | `/eventos*` | parcial JWT | — |

### 2.1 Guards / estratégias
- `ThrottlerGuard` (global, 100 req/60s)
- `JwtStrategy` (Passport, valida token, carrega usuário, rejeita bloqueado)
- `RolesGuard` (estende AuthGuard('jwt'), lê metadata `roles`)
- `@Roles(...)` decorator; helper `isAdminRole`/`hasRole`
- **Denuncias**: auth manual via `JwtService.verifyAsync` (permite anônimo)

### 2.2 Schedulers / filas
- **NENHUM**: sem `@Cron`, sem BullMQ, sem consumer. `GET /admin/jobs` retorna `queues: []`.

### 2.3 Integrações externas
| Integração | Estado |
|---|---|
| Storage S3/MinIO | Implementado; **OFFLINE** (AggregateError) |
| E-mail | `console` (default) ou `http` (`MAIL_API_URL`); `MAIL_PROVIDER` não configurado |
| WhatsApp / Evolution API | **NÃO existe** módulo de WhatsApp; `EvolutionModule` = gamificação |
| Pagamentos | PIX manual (string EMV) + confirmação manual admin; sem gateway real |
| IA | análise de campanha = heurística regex (sem LLM) |
| Redis | **só health check**, não cache/queue |

## 3. Banco — models (65) e enums (28)

### 3.1 Models principais
Usuarios · Terreiros (PostGIS `geoPoint`) · Avaliacoes · Eventos · Favoritos ·
MembrosTerreiro · Cursos · MatriculasCurso · ProdutosMarketplace (sem
controller!) · Conteudos · AcoesSociais · Denuncias · DocumentosVerificacao ·
TerreiroFoto · TerreiroVideo · AvaliacaoResposta · AuditLogs ·
SeguidoresTerreiro · PresencaEvento · Indicacoes · AcessoQRCode ·
ClaimRequest · Mission · UserMission · Achievement · UserAchievement ·
AxScoreHistory · EvolutionAction · EvolutionGoal · AnalyticsEvent ·
FeatureFlag · FeatureFlagOverride · Feedback · Notificacoes · Instituicoes ·
Organizacoes · OrganizacaoRelacionamentos · Regioes · RegiaoTradicoes ·
Campanhas · CampanhaApoio · CampanhaAtualizacao · CampanhaPrestacaoConta ·
CampanhaComentario · DocumentosCampanha · Certificado · Mediacoes ·
MediacaoMensagem · ComplianceChecklist · ComplianceItem ·
AntifraudeRegistro · Evidencia · GovernancaMembro · PlanoSaaS ·
PlanoAssinatura · PlanoPagamento · TransacaoFinanceira · PixConfiguracao ·
GraphEntidade · GraphRelacionamento · GraphRelacionamentoHistorico ·
GraphCandidatoDuplicidade · ConteudoCultural · PatrimonioCultural · Source

### 3.2 PostGIS
- Única coluna real: `Terreiros.geo_point geography(Point,4326)` (nullable).
- Sem índices GIST declarados. Demais geo = Float lat/lng.

### 3.3 Enums de role
`VISITOR PRACTITIONER DIRIGENTE OGA EKEDI FILHO_DE_SANTO MEMBER CO_ADMIN CURATOR MODERATOR VERIFIER SUPPORT ADMIN SUPER_ADMIN`

## 4. Riscos estruturais detectados no inventário (serão validados)

| # | Achado | Provável classificação |
|---|---|---|
| R1 | **ADS**: frontend `/ads` existe, mas **NÃO há controller/endpoint de ADS** | ⚪ NOT IMPLEMENTED / 🟡 PARTIAL |
| R2 | **Marketplace**: model `ProdutosMarketplace` existe, **sem controller** | ⚪ NOT IMPLEMENTED |
| R3 | **E-mail**: default `console` provider; sem env real | ⚫ BLOCKED (infra) |
| R4 | **WhatsApp/Evolution API**: não existe | ⚪ NOT IMPLEMENTED |
| R5 | **Storage**: MinIO offline | ⚫ BLOCKED (storage) |
| R6 | **Redis**: usado só em health, não cache/fila | 🟡 PARTIAL |
| R7 | **Schedulers/jobs**: nenhum | ⚪ NOT IMPLEMENTED |
| R8 | **DTOs**: bodies tipados inline (`dto: any`), sem classes `class-validator` | 🟡 PARTIAL (validação fraca) |
| R9 | **Recommendation**: rotas de escrita `POST /pesos`, `POST /pesos/resetar` **sem auth** | 🔴 FALHA DE SEGURANÇA (validar) |
| R10 | **Auth manual em Denuncias** diverge do padrão de guards | 🟡 PARTIAL |
| R11 | **`?redirect=` do login ignorado** (login sempre vai p/ `/perfil`) | 🟡 PARTIAL |
| R12 | **`/painel` sem role-check** (qualquer logado acessa) | 🟡 PARTIAL |
| R13 | **Status como String** (Denuncias, Mediacoes, etc.) sem enum/check | 🟡 PARTIAL |
| R14 | **Sem service worker** apesar do manifest PWA | 🟡 PARTIAL |
| R15 | **`/admin/jobs` sem filas reais** | ⚪ NOT IMPLEMENTED |