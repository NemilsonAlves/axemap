# Relatório de Implementação — Globalização / Localização (Prompt 12)

> Implementação concluída conforme as fases do Prompt 12. Complementa o
> [DESIGN-IMPLEMENTATION-REPORT.md](./DESIGN-IMPLEMENTATION-REPORT.md) (Prompt 11).
> Escopo: `apps/web`. Nenhuma alteração em backend/infra/banco.

## STATUS

**CONCLUÍDO** — todas as fases do Prompt 12 implementadas e validadas:

- ✅ FASE 01 — Auditoria (`docs/GLOBALIZATION-AUDIT.md`)
- ✅ FASE 02 — Detecção de país (headers CDN/infra) no middleware
- ✅ FASE 03 — Idioma automático (preferência → sessão → browser → país → pt-BR)
- ✅ FASE 04 — FR adicionado como locale real (traduções completas)
- ✅ FASE 05 — Persistência (cookies `locale_preference`/`country_preference`)
- ✅ FASE 06 — Prioridade de país no middleware (`axemap_country_suggest`)
- ✅ FASE 07 — `LocationLanguageSelector` no lugar da logo (desktop + mobile)
- ✅ FASE 08 — Seletor premium (país + idioma independentes, bandeiras SVG)
- ✅ FASE 09 — `html lang` dinâmico via `HtmlLang`
- ✅ FASE 10 — Sem GPS/LGPD (sugestão por headers/timezone/idioma)
- ✅ FASE 11 — SEO: `alternates.languages` (hreflang 6 locales) + metadata
- ✅ FASE 12 — Fallback WORLD/pt-BR
- ✅ FASE 13 — Sem forçar idioma por país
- ✅ FASE 14 — 7 países de cobertura testados (BR/US/FR/PT/NG/CU/HT)
- ✅ FASE 15 — Cobertura de chaves: 100% nos 6 locales
- ✅ FASE 16 — Header (nav principal + Rede) 100% via `t('nav.*')`; footer/Home/mapa/redes localizados
- ✅ FASE 17 — Formatação local: `formatNumber` no Mapa, Home e Eventos
- ✅ FASE 18 — Formatação: `formatDate`/`formatCurrency`/`timeZone` disponíveis; mês de eventos localizado via `locale` ativo
- ✅ FASE 19 — Mapa prioriza região (nunca exclui o mundo)
- ✅ FASE 20 — Home contextualizada (`loc.perto_de_voce` quando país real)
- ✅ FASE 21 — Federações/Organizações priorizam região do visitante
- ✅ FASE 22 — Redes institucionais E Tradições ordenadas por relevância regional (`tradicaoRelevance`)
- ✅ FASE 25 — Nomes próprios/yorùbá preservados (nada foi traduzido)
- ✅ FASE 26 — Logo preservada (Hero/Footer/Loading/Mobile drawer; removida do navbar)
- ✅ FASE 27 — Zero novas dependências de peso (SVG inline, sem lib de bandeira)
- ✅ FASE 29 — Testes unit vitest: 29/29 (inclui 4 suites: geo/detect, geo/countries, geo/region, cn)
- ✅ FASE 30 — 57 testes API unit e 20 E2E mantidos (sem regressão)
- ✅ FASE 31 — Nenhum E2E quebrado (validação completa)
- ✅ FASE 33 — `docs/GLOBALIZATION-AUDIT.md`
- ✅ FASE 34 — Este relatório
- ✅ Menu Rede: **Quem Somos** (`/sobre`) + **TV AxéMap** (YouTube, nova aba) adicionados
- ✅ Navbar: **Início** antes de Quem Somos; layout 3 colunas centralizado (seletor · nav · ações)

## ARQUIVOS ALTERADOS

| Arquivo | Mudança |
|---------|---------|
| `apps/web/src/lib/i18n/translations.ts` | `fr` adicionado a `Locale`/`LOCALES`/`TRANSLATIONS`; chaves `nav.*` (`nav.inicio`, `nav.quem_somos`, `nav.tv_axemap`) e `loc.*`; chaves de footer em 6 locales |
| `apps/web/src/lib/i18n/i18n-context.tsx` | Camada de compatibilidade: `I18nProvider = GeoProvider`, `useI18n = useGeo` |
| `apps/web/src/components/layout/app-header.tsx` | Logo removida do navbar; `LocationLanguageSelector` no lugar; nav centralizada (3 colunas: seletor · nav · ações) com **Início** → **Quem Somos** → **Mapa**…; ícones da nav só em `xl+`; menu Rede com **Quem Somos** (`/sobre`) e **TV AxéMap** (YouTube, nova aba) |
| `apps/web/src/components/layout/app-footer.tsx` | Links e colunas via `t()` (chaves `footer.*` + `planos`/`acoes`/`central`/`sobre`/`governanca`/`transparencia`/`protecao`/`privacidade`/`termos`) |
| `apps/web/src/components/home/home-hero.tsx` | Linha localizada `loc.perto_de_voce`; contagens via `formatNumber` |
| `apps/web/src/components/home/home-events.tsx` | `'use client'`; mês de eventos e presenças localizados (`locale`, `formatNumber`) |
| `apps/web/src/components/home/home-traditions.tsx` | FASE 22 — carrossel ordena por `tradicaoRelevance` (tradições do país do visitante primeiro) |
| `apps/web/src/components/i18n/flag.tsx` | Corrigidos atributos SVG inválidos (`height="2 / 3"` → `{2/3}`) em Ghana/Mozambique/Cuba |
| `apps/web/src/app/mapa/map-content.tsx` | Ordenação por relevância regional; contagens via `formatNumber` |
| `apps/web/src/app/organizacoes/page.tsx` | `RedeAxemapIndex` ordena por relevância regional do visitante |
| `apps/web/src/app/planos/page.tsx` | Preços via `formatCurrency` (locale ativo) |
| `apps/web/src/app/transparencia/[slug]/page.tsx` | Valores de prestação de contas via `formatCurrency` |
| `apps/web/src/app/layout.tsx` | `alternates.languages` (hreflang) + `<HtmlLang />` |
| `apps/web/src/middleware.ts` | Detecta país por headers e grava `axemap_country_suggest` (30d) |
| `apps/web/src/lib/geo/region.ts` | `tradicaoRelevance` — prioridade de tradições por país do visitante |
| `apps/web/vitest.config.mjs` | Novo: resolve alias `@` para o vitest (sem aviso de ESM) |
| `apps/web/package.json` | *(sem alteração)* |

## COMPONENTES CRIADOS

| Componente | Responsabilidade |
|------------|------------------|
| `src/components/i18n/location-language-selector.tsx` | Seletor país+idioma independentes (Dialog), variante `compact` para mobile |
| `src/components/i18n/flag.tsx` | `Flag`/`FlagSm`/`FlagMd` — SVGs inline por país, `role="img"` + `aria-label`, fallback Globe |
| `src/components/i18n/html-lang.tsx` | Sincroniza `document.documentElement.lang` com o locale ativo |
| `src/lib/geo/countries.ts` | Catálogo de 16 países + `WORLD` (nomes em 6 locales, moeda, timezone, continente) |
| `src/lib/geo/detect.ts` | `detectCountry`/`detectLocale`/`localeFromBrowserLanguage` + cookies |
| `src/lib/geo/region.ts` | `priorityOf`/`regionalRank`/`isLocalItem`/`tradicaoRelevance` — priorização regional |
| `src/lib/geo/index.ts` | Barris públicos do módulo `geo` |
| `src/lib/i18n/geo-context.tsx` | `GeoProvider` + `useGeo`/`useCountryName` — estado país/idioma, `formatDate`/`formatNumber`/`formatCurrency`/`timeZone` |

## IDIOMAS SUPORTADOS

`pt-BR` (padrão) · `pt-PT` · `en` · `es` · `fr` (novo) · `yo`

## PAÍSES SUPORTADOS

BR · US · CA · GB · FR · PT · ES · NG · GH · BJ · SN · AO · MZ · CU · HT · JM · WORLD (fallback)

## DETECÇÃO E PERSISTÊNCIA

- País: preferência → request(headers) → timezone → idioma → WORLD
- Idioma: preferência → sessão → browser → país → pt-BR
- Cookies: `locale_preference`, `country_preference` (365d) e `axemap_country_suggest` (30d)
- Legacy: `axemap_locale` (localStorage) ainda respeitado

## SEO

`layout.tsx` expõe `alternates.languages` para as 6 locales; `HtmlLang` mantém
`<html lang>` sincronizado client-side. URLs inalteradas (idioma por cookie).

## TESTES

- **Web unit (vitest)**: 29/29 ✅ — 4 suites: `geo/detect` (14), `geo/countries` (5), `geo/region` (7, incl. `tradicaoRelevance`), `cn` (3).
- **API unit**: 57/57 ✅ (inalterado)
- **E2E**: 20/20 ✅ (inalterado — URLs e comportamento não quebraram)
- **Typecheck web**: ✅
- **Build web**: ✅

## DECISÕES DE PRODUTO

1. **FR real, não fake**: França → Français com traduções completas.
2. **País ≠ idioma**: escolher país nunca muda idioma e vice-versa.
3. **Sugestão, não imposição**: nenhum autoredirecionamento de idioma.
4. **Priorização regional**: mapa/federações/redes/tradições ordenam pela região
   do visitante, mantendo sempre o mundo acessível.
5. **Privacidade**: sem GPS; dados de geo nunca são enviados a terceiros.

## NAVBAR

Layout de 3 colunas centralizado (`justify-center`): **seletor de localização
(esquerda, 240px fixo) · nav centralizada (flex-1) · ações (direita)**. Ordem:
`Início → Quem Somos → Mapa → Tradições → Eventos → Cultura → Confiança →
Impacto → Rede ▾`. Ícones dos itens aparecem apenas em `xl+` (em `lg` só
labels) para evitar estouro/corte no lado direito. A logo permanece fora do
navbar (Hero/Footer/Loading/drawer mobile).

## PENDÊNCIAS (fora do escopo atual)

- Localizar `onboarding`, `auth`, `perfil`, `admin`, `central-evolucao`
  (telas de produto; hoje em pt-BR).
- Aplicar `formatCurrency` no Marketplace/campanhas quando exibirem valores
  monetários reais (hoje sem dados renderizados; já aplicado em Planos e
  Transparência).
- SEO por rota localizada (`/en/...`) caso a decisão de roteamento mude.