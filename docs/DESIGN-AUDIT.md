# DESIGN AUDIT — Frontend AxéMap (Prompt 11)

> Auditoria real do frontend existente, antes das mudanças do redesign global.
> Escopo: `apps/web` (Next.js App Router). Backend, infraestrutura e banco **não** foram alterados.

---

## 1. Stack e fundamentos (real, verificado em código)

| Camada | Tecnologia | Evidência |
| --- | --- | --- |
| Framework | Next.js App Router (Turbopack) | `next.config.ts`, rotas em `src/app/**` |
| Linguagem | TypeScript estrito | `tsconfig.json` + `tsc --noEmit` |
| Estilo | Tailwind v4 (`@import "tailwindcss"`) | `src/app/globals.css` |
| Design tokens | HSL em `:root`/`.dark` + `design-tokens/colors.json` | `globals.css` |
| Fontes | Inter, Plus Jakarta Sans, IBM Plex Mono | `src/app/layout.tsx` |
| Mapas | Leaflet via abstração `MapProvider` | `src/lib/map/**` |
| i18n | Contexto próprio, 5 idiomas | `src/lib/i18n/translations.ts` |
| API | `@/lib/api-client` (fetch wrapper) | — |
| Auth | Contexto `useAuth()` | `src/lib/auth` |

Build estável antes do redesign: **typecheck OK, lint 0 erros, build OK, unit 57/57, E2E 20/20**.

---

## 2. Mapa de rotas (existentes, verificadas)

- Públicas: `/`, `/sobre`, `/termos`, `/privacidade`, `/protecao`, `/transparencia`, `/governanca`, `/mapa`,
  `/terreiros`, `/terreiros-verificados`, `/terreiros/top`, `/novos-terreiros`, `/tradicao`, `/tradicao/[tradicao]`,
  `/ifa`, `/federacoes`, `/federacoes/[slug]`, `/organizacoes`, `/organizacoes/[slug]`, `/eventos`, `/cursos`,
  `/busca`, `/campanhas`, `/campanhas/[slug]`, `/acoes-sociais`, `/central-evolucao`, `/grafo`, `/planos`,
  `/cidade/[cidadeUf]`, `/estado/[uf]`, `/t/[slug]`, `/terreiro/[slug]`.
- Conta: `/auth/login`, `/auth/cadastro`, `/auth/esqueci-senha`, `/auth/recuperar-senha`, `/onboarding`,
  `/perfil`, `/painel`, `/painel/terreiros/[id]`, `/notificacoes`.
- Admin: `/admin` + `/admin/{auditoria,axegraph,central,impacto,integracoes,jobs,mapa,system,transparencia,usuarios}`.

---

## 3. Logo oficial (verificada em disco)

- `C:\Users\pc\Desktop\AXÉMAP\AxeMap.png` — **2.353.214 bytes** (arquivo é `AxeMap.png`, **sem** acento).
- `apps/web/public/logo.png` — 1254×1254, ~2.3 MB (versão quadrada do repo).
- `apps/web/public/logo-mark.png` — 256×256 (marca compacta já usada no header).
- `apps/web/public/icon.svg`, `favicon.ico`, `apple-icon.png` presentes.

**Antes:** a marca usava somente `logo-mark.png` a 36px, texto "AxéMap" pequeno e um fundo "pílula" `bg-[var(--surface1)]`.
A logo oficial de 1254px não aparecia em lugar nenhum da Home.

---

## 4. Header (antes)

`src/components/layout/app-header.tsx`: ordem `explorar(/busca) · mapa(/mapa) · casas(/terreiros) · tradicao(/tradicao) · rede`.
**Problemas:** "Rede" não era categoria de primeira classe (sem dropdown próprio no desktop); "Federações"
estava escondida; Eventos/Cultura/Confiança/Impacto não tinham lugar na navegação primária; logo pequena.

---

## 5. Home (antes)

`src/app/page.tsx` + `src/components/home/*` (27 arquivos):
`HomeHero → HomeSearch → HomeTraditions → HomeDiaspora → HomeIfa → HomeMapLoader → HomeVerified → HomeTrust →
HomeEvents → HomeEducation → HomeCommunity → HomeMarketplace → HomeAI → HomeStory → HomeNumbers → HomeCulture →
HomePartners → HomeCTA`.

**Problemas:** sem seção de REDE INSTITUCIONAL; sem AxéMap ADS; mapa longe do topo; sem headline institucional
sobre federações/associações.

---

## 6. Mapa (antes)

`src/app/mapa/map-content.tsx`: filtro por continente (pills), marcadores de terreiros + campanhas, sem camadas,
sem lista paralela, sem painel lateral de seleção, sem busca. Estilo inline `style={{...}}`.

---

## 7. Trust / Verificação (antes)

`src/components/ui/trust-score-card.tsx` (score 0-100 + barra única) e `home-trust.tsx` (donut + 4 pilares).
`home-verified.tsx` mostra Trust Score com barra única (não havia "indicadores" por pilar visíveis).

---

## 8. AxéMap ADS (antes)

Não existia rota nem seção de publicidade; nenhuma separação explícita publicidade × confiança.

---

## 9. Federações (antes)

Rota `/federacoes` já reutilizava `RedeAxemapIndex` (de `organizacoes/page.tsx`) com `endpoint="/federacoes?limit=120"`.
Funcional, mas não havia destaque na Home nem na navegação primária.

---

## 10. Prioridades e ações executadas

| # | Problema | Prioridade | Ação |
| --- | --- | --- | --- |
| P1 | Sem paleta contemporânea/tokens semânticos | Alta | Adicionada paleta BASE+ENERGIA + 6 universos + gradientes (FASE 09/17) |
| P2 | Header sem categorias de primeira classe | Alta | Header redesenhado: MAPA·TRADIÇÕES·REDE·EVENTOS·CULTURA·CONFIANÇA·IMPACTO + dropdown REDE (FASE 04) |
| P3 | Logo subvalorizada | Alta | Logo maior no header; `LogoHero` no hero da Home (FASE 02) |
| P4 | Home sem REDE INSTITUCIONAL | Alta | Nova seção `HomeRedeInstitucional` + reordenação das 12 seções (FASE 11/05) |
| P5 | Mapa básico | Alta | Camadas, busca, toggle mapa/lista 65-35, painel lateral com dados + CTA (FASE 06) |
| P6 | Sem publicidade separada | Alta | Nova rota `/ads` + seção `HomeAxemapAds` com selo PATROCINADO e garantias (FASE 12) |
| P7 | Trust sem indicadores | Média | Componente `TrustIndicator` com barras por pilar (FASE 14) |
| P8 | Federações escondidas | Média | Primeiro item do dropdown REDE + seção dedicada na Home (FASE 05/16) |

---

## 11. Referências de código

- Tokens: `apps/web/src/app/globals.css`, `apps/web/src/design-tokens/colors.json`
- Header: `apps/web/src/components/layout/app-header.tsx`
- Logo: `apps/web/src/components/brand/logo.tsx`
- Home: `apps/web/src/app/page.tsx`, `apps/web/src/components/home/*`
- Mapa: `apps/web/src/app/mapa/map-content.tsx`, `apps/web/src/lib/map/**`
- ADS: `apps/web/src/app/ads/page.tsx`, `apps/web/src/components/home/home-axemap-ads.tsx`
- Trust: `apps/web/src/components/ui/trust-indicator.tsx`