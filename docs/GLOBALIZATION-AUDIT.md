# Auditoria de Globalização / Localização — AxéMap

> Documento de auditoria (Prompt 12 — FASE 01). Complementa o
> [DESIGN-AUDIT.md](./DESIGN-AUDIT.md) (Prompt 11). Escopo: apps/web.

## 1. Estado anterior (antes do Prompt 12)

| Área | Estado | Arquivos |
|------|--------|----------|
| Traduções | 5 locales (`pt-BR`, `pt-PT`, `en`, `es`, `yo`), ~65 chaves | `src/lib/i18n/translations.ts` |
| Contexto i18n | `I18nProvider` + `useI18n` | `src/lib/i18n/i18n-context.tsx` |
| Persistência | `localStorage` (`axemap_locale`) | `i18n-context.tsx` |
| Seletor | `LocaleSwitcher` (bandeiras emoji, ícone Globe) | `components/i18n/locale-switcher.tsx` |
| Detecção de país | **Inexistente** | — |
| `html lang` | Estático | `app/layout.tsx` |
| SEO/hreflang | Apenas `canonical` por página | `app/*/page.tsx` |
| Formatação | Datas/números/moeda sem localização | — |
| Middleware | Somente auth (`axemap_auth`) | `src/middleware.ts` |
| Bandeiras | Emoji (dependente do SO) | `locale-switcher.tsx` |
| Bibliotecas de bandeira | Nenhuma (sem `react-country-flag` etc.) | `package.json` |

## 2. Decisões (Prompt 12)

- **PAÍS e IDIOMA são independentes.** A seleção de um não muda o outro.
- **Idioma nunca é forçado por país.** Detecção de país = sugestão.
- **`fr` (Francês) foi adicionado como locale real** com traduções completas
  (FASE 03/14 — França → Français). Nenhuma tradução falsa/placeholder.
- **Nomes próprios e termos yorùbá nunca são traduzidos** (Ifá permanece Ifá;
  diacríticos yorùbá preservados).
- **Sem GPS automático** (LGPD). País vindo de headers de CDN/infra como sugestão.
- **Sem novas dependências pesadas**: bandeiras = SVGs inline (acessíveis).
- **Fallbacks**: país → `WORLD`; idioma → `pt-BR`.

## 3. Prioridade de detecção

### País
1. Preferência manual (`country_preference` cookie — nunca muda sozinha);
2. País do request (headers `x-vercel-ip-country`, `cf-ipcountry`, `x-country`);
3. Timezone do navegador;
4. Idioma do navegador (somente se informado);
5. Fallback `WORLD`.

### Idioma
1. Preferência manual (`locale_preference` cookie — vence SEMPRE);
2. Seleção manual da sessão (localStorage legado `axemap_locale`);
3. Idioma do navegador;
4. Idioma sugerido pelo país;
5. Fallback `pt-BR`.

## 4. Catálogo geográfico

16 países + `WORLD`. Cada país: nome em 6 locales, `suggestedLocales`,
`currency`, `timezone`, `continent`/`region`.

```
BR US CA GB FR PT ES NG GH BJ SN AO MZ CU HT JM  +  WORLD
```

Mapa de idiomas sugeridos: BR→pt-BR · US/CA→en · GB→en · FR→fr · PT→pt-PT ·
ES→es · NG/GH→en · BJ/SN→fr · AO/MZ→pt-PT · CU→es · HT→fr · JM→en.

## 5. Cobertura de tradução (chaves por locale)

Todas as chaves declaradas no union `TranslationKey` existem nos 6 locales.
Cobertura: **100%** (verificado por construção — cada bloco de locale declara o
mesmo conjunto de chaves; o union é a fonte de verdade e o typecheck falha se
faltar qualquer chave em qualquer bloco).

Cobertura de **páginas/componentes** (strings hardcoded): parcial —
header (nav completa) e footer 100% localizados; Home contextualizada (hero,
eventos, tradições, números); mapa e redes institucionais localizados.
`onboarding`, auth e centrais internas permanecem em pt-BR (funcionalidade de
produto, não crítica para exibição pública).

## 5b. Cobertura da navbar

`Início · Quem Somos · Mapa · Tradições · Eventos · Cultura · Confiança ·
Impacto · Rede` — todos via `t('nav.*')` (6 locales). `nav.inicio`,
`nav.quem_somos` e `nav.tv_axemap` adicionados ao union e a todos os blocos
(pt-BR, pt-PT via herança, en, es, fr, yo).

## 6. Formatação local

`GeoProvider` expõe `formatDate`, `formatNumber`, `formatCurrency` (via `Intl`,
locale ativo) e `timeZone` (`Intl.DateTimeFormat().resolvedOptions()`).

- Aplicado: contagens do Mapa e Home (números).
- Disponível para adoção: datas em eventos/campanhas, moedas em campanhas.

## 7. SEO

`layout.tsx` agora declara `alternates.languages` (hreflang) para as 6 locales +
`HtmlLang` sincroniza `document.documentElement.lang`. URLs não mudaram
(idioma por cookie, sem prefixo de rota — decisão compatível com os E2E atuais).

## 8. Persistência

| Cookie | Escopo | Duração |
|--------|--------|---------|
| `locale_preference` | domínio | 365 dias, SameSite=Lax |
| `country_preference` | domínio | 365 dias, SameSite=Lax |
| `axemap_country_suggest` | domínio | 30 dias (sugestão do middleware) |
| `axemap_locale` | localStorage | legado (migração compatível) |

## 9. Acessibilidade e desempenho

- Bandeiras: SVGs inline com `role="img"` + `aria-label` no texto visível.
- Seletor: `Dialog` com `aria-pressed`, foco gerenciado, `Esc` fecha.
- Sem bloat de runtime: nenhuma biblioteca de bandeiras/geo adicionada.
- `HtmlLang` é um efeito leve (nulo no render).

## 10. Riscos / pendências

- **PENDÊNCIA**: strings hardcoded em `onboarding`, `auth`, `perfil`, `admin`,
  `central-evolucao` (fora do escopo de exibição pública imediata).
- **RESOLVIDO**: `formatDate`/mês de eventos localizado (via `locale` ativo) e
  `formatNumber` em Mapa, Home e Eventos. `formatCurrency` aplicado em páginas
  públicas (Planos, Transparência); falta no Marketplace quando exibir valores.
- **RESOLVIDO**: config vitest renomeada para `.mjs` (aviso ESM silenciado).
- **SUGESTÃO**: adotar biblioteca `country-code-lookup` num futuro remote,
  mantendo zero deps local.

## 11. Menu Rede (nav)

O submenu **Rede** inclui, além das federações/associações/organizações/
comunidades/institutos, dois acessos de primeira classe:

| Item | Destino | Tipo |
|------|---------|------|
| **Quem Somos** | `/sobre` | Interno |
| **TV AxéMap** | `https://www.youtube.com/@TVAxeMap` | Externo (nova aba, `noopener noreferrer`) |

Chaves adicionadas em todos os 6 locales: `nav.quem_somos`, `nav.tv_axemap`,
`nav.inicio`. A navbar usa layout de 3 colunas centralizado (seletor · nav ·
ações); a nav é `flex-1 justify-center` e os ícones dos itens aparecem apenas
em `xl+` para evitar corte no lado direito.