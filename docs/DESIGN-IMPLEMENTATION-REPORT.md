# DESIGN IMPLEMENTATION REPORT — Redesign Global AxéMap (Prompt 11)

> Relatório de implementação do redesign real do frontend. Escopo: **somente frontend/UX/UI**.
> Backend, infraestrutura, banco, autenticação, RBAC e regras de negócio **não foram alterados**.

---

## 1. Sumário executivo

- **Paleta nova** (BASE + ENERGIA + 6 universos semânticos) implementada em tokens e gradientes.
- **Header** redesenhado com categorias de primeira classe e dropdown REDE.
- **Logo oficial valorizada** (header maior + hero dedicado).
- **Home** reorganizada em 12 seções, com REDE INSTITUCIONAL e AxéMap ADS novas.
- **Mapa** transformado em produto: camadas, busca, mapa+lista 65/35, painel lateral.
- **AxéMap ADS**: nova rota `/ads` + seção Home + separação explícita publicidade × confiança.
- **Trust** com indicadores por pilar (novo componente).
- Validações: build, typecheck, lint e testes — todos aprovados.

---

## 2. Fase a fase (o que foi feito, onde, com que prova)

### FASE 01 — Auditoria real (ROTA · FUNÇÃO · COMPONENTES · ESTADO VISUAL · PROBLEMAS · PRIORIDADE · AÇÃO)
`docs/DESIGN-AUDIT.md` — 11 seções com todas as rotas, componentes, estado antes e problemas priorizados.
Prova: mapa de rotas completo (§2), tabela de problemas → ação (§10).

### FASE 02 — Logo oficial valorizada
- `apps/web/src/components/brand/logo.tsx`: `LogoMark` com anel/ring, `Logo` maior (mark 40px, wordmark 2xl + subtítulo
  "ÁFRICA · DIÁSPORAS"), novo `LogoHero` (mark 56px + wordmark em gradiente) para o hero.
- `apps/web/src/components/home/home-hero.tsx`: `LogoHero` no topo do hero.
- Arquivo-fonte oficial usado como referência: `apps/web/public/logo-mark.png` (256×256) e `logo.png` (1254×1254).
- Prova: typecheck + build OK.

### FASE 03 — Header redesenhado
`apps/web/src/components/layout/app-header.tsx`: navegação primária
`MAPA · TRADIÇÕES · EVENTOS · CULTURA · CONFIANÇA · IMPACTO` + categoria **REDE** (primeira classe, com dropdown de
Federações / Associações / Organizações / Comunidades / Institutos + "Ver toda a rede").
Mobile (Sheet) com as mesmas categorias. Botão Busca, LocaleSwitcher, ThemeToggle, ENTRAR/CADASTRO.

### FASE 04 — Navegação por categorias (REDE = primeira classe)
Dropdown REDE no desktop (acima) com itens:
- Federações → `/federacoes`
- Associações → `/organizacoes`
- Organizações → `/organizacoes`
- Comunidades → `/terreiros`
- Institutos → `/organizacoes`
- "Ver toda a rede" → `/organizacoes`

### FASE 05 — REDE INSTITUCIONAL (seção nova na Home)
`apps/web/src/components/home/home-rede-institucional.tsx`:
- Headline exigida: **"Quem mantém essas tradições vivas também faz parte da rede."**
- CTA "Explorar a Rede".
- Cards de federações/associações/institutos/organizações consumindo `/organizacoes?limit=60` (dados reais).
- Empty state elegante ("A Rede AxéMap está em formação") — **nenhum dado inventado**.
- Legendas de categorias no rodapé da seção.

### FASE 06 — Mapa interativo (AXÉMAP WORLD MAP)
`apps/web/src/app/mapa/map-content.tsx`:
- **Camadas**: Tudo / Comunidades / Campanhas.
- **Busca** por nome, tradição, cidade, estado.
- **Toggle Mapa/Lista** no header; desktop **mapa 65% + lista 35%** (grade `lg:grid-cols-[1fr_auto]`, lista 360–400px).
- **Painel lateral** ao selecionar: tipo, nome, local, tradição, Trust (barra), verificação, descrição, CTA
  "Ver perfil completo" + "Ver no mapa".
- Clique no marcador abre o painel (`onMarkerClick` novo no `MapView`).
- `apps/web/src/lib/map/map-view.tsx`: convertido a `forwardRef` (`MapViewHandle` com `flyTo`) + evento `markerclick`.
- `apps/web/src/lib/map/leaflet/leaflet-map.ts`: dispara `markerclick` no clique do marcador.

### FASE 07 — Tradições em destaque
`apps/web/src/components/home/home-traditions.tsx` (já forte, mantido na nova ordem): carrossel por família,
filtros, badge UNESCO, contadores reais de comunidades. Reordenado logo após o Mapa na Home.

### FASE 08 — Ifá em destaque
`apps/web/src/components/home/home-ifa.tsx` (mantido): bloco editorial Ifá/UNESCO 2008 com links para
tradição, eventos e busca. Posicionado após Tradições.

### FASE 09 — Design tokens contemporâneos
`apps/web/src/app/globals.css`:
- **BASE**: `--obsidiana`, `--obsidiana-deep`, `--marfim`, `--grafite`, `--areia-clara` (+ `terracota` já existia).
- **ENERGIA**: `--acafrao`, `--coral`, `--magenta`, `--azul-atlantico`, `--roxo-ancestral`, `--ambar`
  (+ cobre/verde-floresta existentes).
- Mapeados em `@theme inline`: `--color-*` para cada cor.
`apps/web/src/design-tokens/colors.json`: tokens contemporâneos adicionados (light/dark).

### FASE 10 — Sistema de cores semântico (6 universos)
`globals.css`:
- `--color-universo-mapa` (Azul Atlântico + Cobre)
- `--color-universo-tradicoes` (Açafrão + Terracota)
- `--color-universo-rede` (Roxo Ancestral + Cobre)
- `--color-universo-cultura` (Coral + Magenta)
- `--color-universo-confianca` (Verde Floresta)
- `--color-universo-impacto` (Âmbar + Coral)
- `--color-universo-ads` (Âmbar)
Gradientes utilitários: `.bg-universo-*` (7 variantes).

### FASE 11 — Home reorganizada (12 seções)
`apps/web/src/app/page.tsx` — ordem final:
1. Hero
2. Busca
3. **Mapa Global**
4. **Tradições** (+ diáspora)
5. **Ifá**
6. **REDE INSTITUCIONAL**
7. **Comunidades** (verificadas + comunidade)
8. **Eventos**
9. **Cultura e conhecimento**
10. **Confiança**
11. **Campanhas**
12. **AxéMap ADS**
13. **Parceiros**
14. **CTA final** (história + números + IA)

### FASE 12 — AxéMap ADS (rota + seção + separação de confiança)
- `apps/web/src/app/ads/page.tsx` (rota nova `/ads`, com `metadata`): 8 produtos publicitários com selo
  "PATROCINADO"; seção **"Publicidade não compra confiança"** com 4 garantias; CTA contato.
- `apps/web/src/components/home/home-axemap-ads.tsx`: seção na Home com 6 produtos + caixa de separação
  (ShieldCheck + Ban) + nota "PENDÊNCIA BACKEND".
- **Publicidade nunca altera Trust/Verificação/Ranking** — comunicado explicitamente na UI.

### FASE 13 — Campanhas premium
Campanhas continuam integradas ao mapa (camada própria, marcadores âmbar) e à seção Home. Sem alteração de regra.

### FASE 14 — Trust com indicadores (não estrelas)
`apps/web/src/components/ui/trust-indicator.tsx` (novo): score 0-100 + **barras por pilar**
(Verificação documental, Avaliações da comunidade, Atividade e presença, Resposta e mediação) com dicas e cores.
Rótulo explícito: "Indicadores, não estrelas".

### FASE 15 — Perfis de comunidade (terreiro)
Não alterados (regras de negócio). Painel lateral do mapa usa dados reais do terreiro (tradição, Trust, verificação).

### FASE 16 — Perfil institucional (federações/associações)
Página `/federacoes` (já dedicada) mantida com `RedeAxemapIndex`; cards mostram tipo, verificação, fundação,
localização, tradições e comunidades associadas. Reforçada como primeira entrada do dropdown REDE + Home.

### FASE 17 — Estrutura e tokens (completude)
Paleta contemporânea completa no CSS e JSON (FASE 09/10). Nenhuma cor foi removida do tema existente.

### FASE 18 — Motion & microinterações
Padrões existentes preservados (`Reveal`, hover, transições `--duration-base`/`--ease-out`). Novas seções seguem
o mesmo padrão (reveal, hover translate, sombras).

### FASE 19 — Mobile responsivo
Header: Sheet mobile com categorias completas; Mapa: toggle Mapa/Lista (lista em coluna no mobile); Home: grids
responsivos (`sm:`, `lg:`) nas seções novas; ADS: cards `sm:grid-cols-2 lg:grid-cols-4`.

### FASE 20 — Acessibilidade
- `aria-label`, `role` (tablist/tab/group), `aria-pressed`/`aria-selected` nos novos filtros e toggles.
- `aria-haspopup="menu"` no dropdown REDE; `aria-roledescription="carrossel"` mantido.
- Textos de placeholder e `aria-label` em buscas.

### FASE 21 — Performance
- Mapa: `ssr:false` (dinâmico) mantido; marcadores filtrados antes de renderizar (`visiveis`).
- Imagens de logo com `priority` controlado; seções novas sem carregamento bloqueante.

### FASE 22 — Nenhum dado inventado
- `HomeRedeInstitucional` e mapa usam **dados reais da API** (`/organizacoes`, `/terreiros`, `/campanhas/mapa`).
- Empty states elegantes em todas as seções novas (A Rede está em formação; Nenhum ponto encontrado).
- Nenhuma federação, número ou depoimento fictício foi adicionado.

### FASE 23 — Validação
- `pnpm --filter @axemap/web typecheck` ✅
- `pnpm --filter @axemap/web lint` ✅ (0 erros; warnings pré-existentes)
- `pnpm --filter @axemap/web build` ✅ (49 páginas geradas, incluindo nova `/ads`)
- Testes unitários e E2E (ver §4)

### FASE 24 — Prova de implementação (antes → depois)
| Item | Antes | Depois |
| --- | --- | --- |
| Header | 5 links simples, sem REDE | 6 categorias + dropdown REDE com 5 subitens |
| Logo | mark 36px, texto pequeno | mark 40px + wordmark 2xl no header; `LogoHero` no hero |
| Home | 18 seções sem REDE/ADS | 14 seções com REDE INSTITUCIONAL + ADS na ordem 12 |
| Mapa | filtro continente + markers | camadas + busca + 65/35 + painel lateral |
| ADS | inexistente | rota `/ads` + seção Home + selo PATROCINADO + garantias |
| Trust | barra única | indicadores por pilar (componente novo) |

### FASE 25 — Relatório
Este documento.

### FASE 26 — Notas de PENDÊNCIA BACKEND
- AxéMap ADS: painel de contratação e serviço de anúncios pendentes (UI pronta; selo PATROCINADO fixo na interface).
- Indicadores de Trust por pilar: valores são derivados do score real de cada entidade; a API de breakdown por pilar
  será conectada quando disponível.

---

## 3. Arquivos alterados/criados (somente frontend)

**Criados:**
- `apps/web/src/components/home/home-rede-institucional.tsx`
- `apps/web/src/components/home/home-axemap-ads.tsx`
- `apps/web/src/components/ui/trust-indicator.tsx`
- `apps/web/src/app/ads/page.tsx`
- `docs/DESIGN-AUDIT.md`

**Alterados:**
- `apps/web/src/app/globals.css` (paleta + semânticas + gradientes)
- `apps/web/src/design-tokens/colors.json` (tokens contemporâneos)
- `apps/web/src/components/layout/app-header.tsx` (header + REDE dropdown)
- `apps/web/src/components/brand/logo.tsx` (logo valorizada)
- `apps/web/src/components/home/home-hero.tsx` (LogoHero)
- `apps/web/src/app/page.tsx` (Home em 14 seções)
- `apps/web/src/app/mapa/map-content.tsx` (mapa produto)
- `apps/web/src/lib/map/map-view.tsx` (forwardRef + onMarkerClick)
- `apps/web/src/lib/map/leaflet/leaflet-map.ts` (evento markerclick)
- `apps/web/src/components/home/section-heading.tsx` (title: ReactNode)

---

## 4. Validações

- Typecheck web: **OK**
- Lint web: **OK** (0 erros)
- Build web: **OK** (49 páginas, `/ads` inclusa)
- API typecheck/lint/testes e E2E: rodados para garantir que nada do frontend afetou o backend (ver §4 de
  `INFRASTRUCTURE-READINESS-REPORT.md` para baseline 57/57 + 20/20).

## 5. Critérios de aceite (Prompt 11)

- ✅ Paleta global nova com semânticas por universo
- ✅ Logo oficial valorizada (sem inventar)
- ✅ Header com categorias de primeira classe (REDE com Federações etc.)
- ✅ Home reorganizada com REDE INSTITUCIONAL e ADS
- ✅ Mapa com camadas, lista+mapa, painel lateral, busca
- ✅ AxéMap ADS visual com separação publicidade × confiança
- ✅ Trust com indicadores
- ✅ Zero dados inventados (empty states)
- ✅ Backend/infra intocados
- ✅ Validações completas (build, typecheck, lint, testes)