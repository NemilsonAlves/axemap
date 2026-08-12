# 99 — Status de Implementação (GAP Analysis Executivo)

**Gerado em:** 2025  
**Objetivo:** Consolidar o estado real de implementação — rotas web, APIs backend e lacunas — com base na auditoria do doc 98 e no código atual.

---

## 1. Mapa de Rotas Web vs. Backend (status atual)

### Legenda
- ✅ Rota existe + API existe
- ⚠️ Rota existe, API parcial / sem integração real
- ❌ Ausente em um ou ambos os lados
- 🆕 Criado/corrigido nesta sprint

| Rota Web | Arquivo | Controller API | Status |
|---|---|---|---|
| `/` | `app/page.tsx` | `discovery`, `landing` | ✅ |
| `/busca` 🆕 | `app/busca/page.tsx` | `terreiro.controller` | ✅ filtro estado+cidade |
| `/mapa` | `app/mapa/page.tsx` | `geo.controller` + PostGIS | ⚠️ sem clustering |
| `/terreiros` (= Casas de Axé) 🆕 | `app/terreiros/page.tsx` | `terreiro.controller` | ✅ renomeado |
| `/terreiros-verificados` | `app/terreiros-verificados/page.tsx` | `terreiro.controller` | ⚠️ parcial |
| `/terreiros/top` | `app/terreiros/top/page.tsx` | `ranking.controller` | ⚠️ parcial |
| `/novos-terreiros` | `app/novos-terreiros/page.tsx` | `terreiro.controller` | ⚠️ parcial |
| `/terreiro/[slug]` | `app/terreiro/[slug]/page.tsx` | `terreiro.controller` | ✅ |
| `/tradicao` | `app/tradicao/page.tsx` | `discovery.controller` | ✅ |
| `/tradicao/[tradicao]` | `app/tradicao/[tradicao]/page.tsx` | `discovery.controller` | ✅ |
| `/cidade/[cidadeUf]` | `app/cidade/[cidadeUf]/page.tsx` | `geo.controller` | ⚠️ |
| `/estado/[uf]` | `app/estado/[uf]/page.tsx` | `geo.controller` | ⚠️ |
| `/eventos` | `app/eventos/page.tsx` | `eventos.controller` | ⚠️ sem `/eventos/[id]` |
| `/cursos` | `app/cursos/page.tsx` | `cursos.controller` | ⚠️ sem `/cursos/[id]` |
| `/cursos/[tradicao]` | `app/cursos/[tradicao]/page.tsx` | `cursos.controller` | ⚠️ |
| `/campanhas` | `app/campanhas/page.tsx` | `campanhas.controller` | ⚠️ |
| `/campanhas/[slug]` | `app/campanhas/[slug]/page.tsx` | `campanhas.controller` | ⚠️ |
| `/acoes-sociais` | `app/acoes-sociais/page.tsx` | `acoes-sociais.controller` | ⚠️ |
| `/central-evolucao` | `app/central-evolucao/page.tsx` | `evolution.controller` | ⚠️ |
| `/planos` | `app/planos/page.tsx` | `saas/planos.controller` | ✅ |
| `/auth/login` 🆕 | `app/auth/login/page.tsx` | `auth.controller` | ✅ novo layout |
| `/auth/cadastro` 🆕 | `app/auth/cadastro/page.tsx` | `auth.controller` | ✅ novo layout |
| `/auth/esqueci-senha` | `app/auth/esqueci-senha/page.tsx` | — | ❌ endpoint não existe |
| `/onboarding` | `app/onboarding/page.tsx` | `onboarding.controller` | ✅ |
| `/perfil` | `app/perfil/page.tsx` | `auth` + `terreiro` | ⚠️ |
| `/painel` | `app/painel/page.tsx` | `terreiro.controller` | ✅ |
| `/painel/terreiros/[id]` | `app/painel/terreiros/[id]/page.tsx` | `terreiro.controller` | ⚠️ |
| `/notificacoes` | `app/notificacoes/page.tsx` | `notificacoes.controller` | ⚠️ |
| `/grafo` | `app/grafo/page.tsx` | `axegraph.controller` | ⚠️ |
| `/organizacoes` | `app/organizacoes/page.tsx` | `organizacoes.controller` | ⚠️ |
| `/organizacoes/[slug]` | `app/organizacoes/[slug]/page.tsx` | `organizacoes.controller` | ⚠️ |
| `/transparencia` | `app/transparencia/page.tsx` | `verificacao.controller` | ⚠️ |
| `/transparencia/[slug]` | `app/transparencia/[slug]/page.tsx` | `verificacao.controller` | ⚠️ |
| `/admin` | `app/admin/page.tsx` | `admin.controller` | ✅ |
| `/admin/axegraph` | `app/admin/axegraph/page.tsx` | `axegraph-admin.controller` | ⚠️ |
| `/admin/impacto` | `app/admin/impacto/page.tsx` | `analytics.controller` | ⚠️ |
| `/admin/system` | `app/admin/system/page.tsx` | `system.controller` | ✅ |
| `/sobre` | `app/sobre/page.tsx` | — | ✅ estático |
| `/governanca` | `app/governanca/page.tsx` | — | ✅ estático |
| `/privacidade` | `app/privacidade/page.tsx` | — | ✅ estático |
| `/termos` | `app/termos/page.tsx` | — | ✅ estático |
| `/federacoes` | `app/federacoes/page.tsx` | — | ⚠️ sem backend |

---

## 2. Controllers API existentes (36 total)

Todos os módulos abaixo têm `*.controller.ts` implementado no backend:

| Módulo | Controller | Observação |
|---|---|---|
| Auth | `auth.controller.ts` | JWT, refresh, signup, login ✅ |
| Terreiro | `terreiro.controller.ts` | CRUD + slug + filtros ✅ |
| Discovery | `discovery.controller.ts` | Explorar + explore ✅ |
| Eventos | `eventos.controller.ts` | Lista; falta `/[id]` no frontend ⚠️ |
| Cursos | `cursos.controller.ts` | Lista; falta `/[id]` no frontend ⚠️ |
| Notificações | `notificacoes.controller.ts` | Backend existe; frontend básico ⚠️ |
| Trust Score | `trust-score.controller.ts` | Endpoint existe; integração parcial ⚠️ |
| Verificação | `verificacao.controller.ts` | Backend parcial ⚠️ |
| Avaliações | `avaliacoes.controller.ts` | Backend existe; frontend parcial ⚠️ |
| Geo | `geo.controller.ts` | PostGIS; sem clustering no mapa ⚠️ |
| AxeGraph | `axegraph.controller.ts` + `axegraph-admin.controller.ts` | Grafo funcional ⚠️ |
| Organizações | `organizacoes.controller.ts` | Backend novo ⚠️ |
| Moderação | `denuncias.controller.ts` + `admin-moderation.controller.ts` | Sem tela de denúncia ❌ |
| SaaS | `planos.controller.ts` + `saas-admin.controller.ts` | Planos integrados ✅ |
| Onboarding | `onboarding.controller.ts` | ✅ |
| Upload | `upload.controller.ts` | ✅ |
| Analytics | `analytics.controller.ts` | Dashboard admin ⚠️ |
| Ranking | `ranking.controller.ts` | Top terreiros ⚠️ |
| Campanhas | `campanhas.controller.ts` | ⚠️ |
| Growth | `growth.controller.ts` | Interno ⚠️ |
| Evolution | `evolution.controller.ts` | AxéScore ⚠️ |

---

## 3. Lacunas críticas (P0) — o que ainda falta

| # | Lacuna | Frontend | Backend | Prioridade |
|---|---|---|---|---|
| 1 | Recuperação de senha (esqueci-senha) | `/auth/esqueci-senha` existe mas sem endpoint | `POST /auth/forgot-password` ausente | **P0** |
| 2 | Detalhes de evento (`/eventos/[id]`) | Rota ausente | `GET /eventos/:id` existe | **P0** |
| 3 | Detalhes de curso (`/cursos/[id]`) | Rota ausente | `GET /cursos/:id` existe | **P0** |
| 4 | Denúncia de usuário | `/denuncias/nova` ausente | `POST /denuncias` existe | **P0** |
| 5 | Favoritos dedicados | `/favoritos` ausente | API favoritos existe | **P0** |
| 6 | Clustering no mapa | Leaflet sem clustering | PostGIS OK | **P0** |
| 7 | Autocomplete na busca (⌘K) | `Search` componente órfão | `/discovery/autocomplete` a criar | **P0** |
| 8 | Verificação de e-mail (tela) | Sem tela de confirmação | Endpoint parcial | **P0** |
| 9 | `not-found.tsx` / `error.tsx` próprios | Arquivos existem mas podem estar em inglês | — | **P0** |
| 10 | Multi-idioma aplicado 100% | ✅ lib i18n criada; strings parciais | — | **P1** |

---

## 4. O que foi implementado nesta sprint

### ✅ Busca com filtro Estado + Cidade
- `apps/web/src/app/busca/page.tsx` — select de estado (27 UFs) + carregamento dinâmico de cidades via API IBGE com fallback offline
- `apps/web/src/lib/brasil-geo.ts` — estados + fallback de cidades

### ✅ Renomeação: "Terreiros" → "Casa de Axé / Asé"
- Header, footer, nav mobile, `/terreiros/page.tsx`, `/painel/page.tsx`, `editar-terreiro.tsx`

### ✅ Layout de Login/Cadastro
- Dois painéis: formulário + painel visual com grafismo ancestral SVG (Adinkra)
- Login abre em nova aba (`target="_blank"`)
- Usa `auth.css` com design system correto

### ✅ Diáspora — texto corrigido
- `FILTROS_TRADICOES` — descrição precisa: "Todo culto de tradição africana praticado fora do continente africano"
- `tradicao/page.tsx` — "Na diáspora (fora da África): ..."
- `LABEL_FAMILIA` exportado com descrição correta

### ✅ Sistema i18n — 5 idiomas
- `apps/web/src/lib/i18n/translations.ts` — pt-BR, pt-PT, en, es, yo (Iorubá)
- `apps/web/src/lib/i18n/i18n-context.tsx` — `I18nProvider` + `useI18n()` hook
- `apps/web/src/components/i18n/locale-switcher.tsx` — seletor no header
- Integrado em: nav, footer, busca, auth, pages

---

## 5. Próximos passos recomendados (Lote 2)

1. **`/eventos/[id]`** — tela de detalhe com inscrição
2. **`/cursos/[id]`** — tela de detalhe com progresso
3. **`POST /auth/forgot-password`** — recuperação de senha
4. **Mapa clustering** — Leaflet MarkerCluster com filtro de tradição
5. **`/denuncias/nova`** — formulário com protocolo
6. **`/favoritos`** — lista do usuário
7. **Autocomplete ⌘K** — integrar componente `Search` ao header
8. **Expandir strings i18n** — `home`, `perfil`, `painel`, `terreiro/[slug]`
