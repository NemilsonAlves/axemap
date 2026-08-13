# AxéMap 2.1 — Status de Implementação

> Última atualização: gerado automaticamente · branch `master`

## Resumo Executivo

| Dimensão | Status |
|---|---|
| TypeScript (web) | ✅ `tsc --noEmit` sem erros |
| i18n (5 idiomas) | ✅ pt-BR · pt-PT · en · es · yo |
| Busca Estado+Cidade | ✅ API IBGE + fallback offline |
| Login layout artístico | ✅ 2 painéis + SVG Adinkra |
| Renomeação "Terreiros" | ✅ Todos textos visíveis → Casa de Axé/Asé |
| Diáspora redefinida | ✅ "todo culto fora da África" |
| Taxonomia multidimensional | ✅ TipoConceitual + 15 tradições catalogadas |
| API NestJS rodando | ✅ Boot OK · endpoints admin smoke-testados |
| SuperAdmin Console Central | ✅ Dashboard real, usuários, mapa, integrações, jobs, auditoria |

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
| `/auth/esqueci-senha` | `auth/esqueci-senha/page.tsx` | `auth.controller.ts` | ⚠️ Endpoint POST pendente |
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
| `/federacoes` | `federacoes/page.tsx` | — | ⚠️ Controller ausente |
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

| Componente | pt-BR | pt-PT | en | es | yo |
|---|---|---|---|---|---|
| AppHeader | ✅ | ✅ | ✅ | ✅ | ✅ |
| AppFooter | ✅ | ✅ | ✅ | ✅ | ✅ |
| MobileBottomNav | ✅ | ✅ | ✅ | ✅ | ✅ |
| LocaleSwitcher | ✅ | ✅ | ✅ | ✅ | ✅ |
| BuscaPage | ✅ | ✅ | ✅ | ✅ | ✅ |
| Login / Cadastro | ✅ | ✅ | ✅ | ✅ | ✅ |
| TerreirosPage | ✅ | ✅ | ✅ | ✅ | ✅ |
| HomePage (hero) | pt-BR hardcode | — | — | — | — |
| TradicaoPage | pt-BR hardcode | — | — | — | — |

> **Próximo passo i18n:** extrair textos hardcode do Hero, TradicaoPage, PerfilPage, PainelPage

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

### ⚠️ Em Progresso

| Fase | Descrição | Bloqueio |
|---|---|---|
| S2.1-H | Testar fluxo completo de bloqueio pela UI web (login + acesso negado + auditoria) | Precisa dos 2 servidores de pé |
| i18n+ | Extrair textos hardcode de Hero, Tradição, Perfil, Painel | Média |

### ⏳ Pendentes

| Fase | Descrição | Prioridade |
|---|---|---|
| 8 | Rede AxéMap — federações, pesquisadores, museus, organizações | Alta |
| 9 | Mapa Global — clustering, filtros globais, continente/país/povo | Alta |
| 10 | Governança — verificação níveis 0-4, trust, proteção, privacidade | Média |
| i18n+ | Extrair textos hardcode de Hero, Tradição, Perfil, Painel | Média |
| auth | POST `/auth/forgot-password` — recuperação de senha | Média |
| nav | Autocomplete ⌘K no header | Baixa |
| seo | `data-scroll-behavior="smooth"` no `<html>` do layout | Baixa |
| federacoes | Controller backend para `/federacoes` | Baixa |

---

## Pendências Backend Específicas

| Endpoint | Status |
|---|---|
| `POST /auth/forgot-password` | ⚠️ Frontend existe, backend pendente |
| `GET /federacoes` | ⚠️ Página existe, controller ausente |
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
