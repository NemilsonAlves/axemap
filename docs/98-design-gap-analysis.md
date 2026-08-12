# 98 — Auditoria de Design e GAP Analysis

**Autor:** Lead Product Designer / UX-UI
**Objetivo:** consolidar a auditoria do design atual, o GAP analysis funcional, o sitemap, os user flows e a priorização P0/P1/P2 — preservando a identidade já definida do AxéMap e preparando o produto para implementação real.
**Princípio:** não redesenhar do zero. Corrigir inconsistências, completar o que falta e garantir coerência entre módulos.

Referências: docs 88–97 (UX/design), 65–69 (knowledge graph / IA), 28–49 (confiança e governança), 22 (backlog), 90 (user stories).

---

## 1. O que já está consolidado (preservar)

- **Tokens e design system base** em `apps/web/src/app/globals.css`: paleta quente (barro/cobre/bronze/areia/fern/ocre/turquesa), tipografia (Inter / Plus Jakarta Sans / IBM Plex Mono), raios, sombras, motion, z-index, breakpoints, dark mode via classe `.dark` no `<html>` (sem flash, com suporte a `system`).
- **Component library shadcn/ui** em `apps/web/src/components/ui/*` (42 componentes): Button, Card, Input, Select, Badge, Dialog, Sheet, Toast/Toaster, Skeleton, Tabs, Accordion, Avatar, Timeline, Progress, Rating, Search (spotlight), TrustScoreCard, etc.
- **Tema:** ThemeProvider + ThemeToggle funcionais (light/dark/system).
- **Páginas novas** (tokens + dark): Home, `/mapa`, `/grafo`, `/central-evolucao`, `/planos`, `/campanhas`, `/eventos`, `/cursos`, `/admin/axegraph`.
- **Mapa:** Leaflet via camada de abstração (`lib/map/*`), OpenStreetMap, popup com "ver detalhes".

## 2. Problemas estruturais encontrados (auditoria)

### 2.1 Dois "sistemas" paralelos
O DS novo (tokens) coexiste com um conjunto de páginas legadas com CSS próprio inline/hex e `--color-white` fixo, que **quebram o dark mode** e apresentam **contraste baixo**:

| CSS | Problema | Impacto |
|---|---|---|
| `src/app/busca/page.css` (importado GLOBALMENTE em layout.tsx:4) | `--color-white` fixo; `.btn-primary`/`.trust-score-badge` com texto branco sobre `--color-secondary` claro | Dark quebrado em todas as páginas + botões ilegíveis no light |
| `src/app/painel/painel.css` | `--color-white`, `.painel-btn`/`.painel-tab.active` com texto branco sobre `--color-accent` claro | Painel do dirigente ilegível |
| `src/app/onboarding/onboarding.css` | fundos claros fixos, erros/avisos em hex | Dark quebrado |
| `src/app/admin/admin.css` | `--color-white`, badges e feedbacks em hex claro | Admin ilegível no dark |
| `src/app/central-evolucao/evolucao.css` | `--color-white`, verde/vermelho/âmbar em hex | Dark quebrado |
| `src/app/terreiro/[slug]/profile.css` | `--color-white` | Dark quebrado |
| `src/app/transparencia/[slug]/transparencia.css` | badges em hex claro | Dark quebrado |
| `src/app/perfil/page.tsx`, `auth/login`, `auth/cadastro` | `color:'white'`/`#c00` inline | Contraste AA falha |
| `src/app/admin/system/page.tsx` | tema Catppuccin fixo escuro | Ignora light mode |

### 2.2 Links quebrados (404)
| Link | De onde | Status |
|---|---|---|
| `/terreiros` | header (nav principal) | ❌ rota não existe |
| `/tradicao` | header + footer | ❌ rota não existe (existe só `/tradicao/[tradicao]`) |
| `/notificacoes` | menu do usuário (header) | ❌ rota não existe |
| `/sobre` | footer | ❌ rota não existe |
| `/governanca` | footer | ❌ rota não existe |
| `/privacidade` | footer | ❌ rota não existe |
| `/termos` | footer | ❌ rota não existe |

### 2.3 Funcionalidades prometidas no produto sem tela
Ver matriz completa na seção 4.

### 2.4 Acessibilidade
- Labels sem `htmlFor`/`id` (auth, onboarding, painel).
- Sem `not-found.tsx`/`error.tsx` (404/500 padrão em inglês).
- Erros inline sem `role="alert"`.
- Sem suporte a high-contrast (`prefers-contrast`/`forced-colors`).
- Contraste AA falhando nos pontos listados em 2.1.

---

## 3. Matriz de GAP (FUNCIONALIDADE × STATUS × TELAS × UX × BACKEND × PRIORIDADE)

Legenda status: ✅ existe · ⚠️ parcial · ❌ ausente.
Prioridade: **P0** = indispensável para MVP · **P1** = importante pós-MVP · **P2** = expansão.

| # | Funcionalidade | Status | Telas necessárias | UX necessária | Backend necessário | Prioridade |
|---|---|---|---|---|---|---|
| 1 | Login / Cadastro | ✅ `/auth/login`, `/auth/cadastro` | Login, cadastro (completo) | acessível, labels, validação inline | existente (JWT) | P0 |
| 2 | Recuperação de senha | ❌ | `/auth/esqueci-senha`, `/auth/redefinir-senha` | fluxo por e-mail, estados de erro/sucesso | endpoint `POST /auth/forgot` + `POST /auth/reset` | P0 |
| 3 | Verificação de e-mail | ⚠️ backend parcial | tela de confirmação | estado "e-mail pendente/verificado" | endpoint de confirmação | P0 |
| 4 | Termos de uso | ❌ | `/termos` | conteúdo legal + consentimento no cadastro | — | P0 |
| 5 | Política de privacidade (LGPD) | ❌ | `/privacidade` | conteúdo + controles de consentimento | — | P0 |
| 6 | Exclusão de conta | ❌ | modal/dialog no perfil | confirmação, direito ao esquecimento | endpoint `DELETE /usuarios/me` | P1 |
| 7 | Onboarding | ✅ `/onboarding` (4 passos) | onboarding inteligente | perguntar intenção de uso → personalização | persistir preferências | P0 |
| 8 | Busca global com autocomplete | ⚠️ `/busca` sem autocomplete | spotlight ⌘K + busca global | autocomplete, recentes, trending, empty states | endpoint sugerido (grafo) | P0 |
| 9 | Mapa inteligente | ⚠️ Leaflet, sem clustering/filtros | `/mapa` | clusters, filtros, marcadores com Trust Score, camadas | PostGIS (já existe geo) | P0 |
| 10 | Notificações (Notification Center) | ❌ (componente `NotificationsBell` órfão) | `/notificacoes` | categorias, ler/excluir, preferências | endpoint de notificações | P0 |
| 11 | Mensagens | ❌ | `/mensagens` (inbox/conversa) | inbox, arquivar, bloquear, denunciar | endpoints de mensagens | P1 |
| 12 | Eventos (detalhe) | ⚠️ listas sem `/eventos/[id]` | `/eventos/[id]` | detalhes, inscrição, lembrete, compartilhar | endpoint inscrição | P0 |
| 13 | Favoritos | ⚠️ só dentro do perfil | área "Meus Favoritos" dedicada | multi-tipo (terreiro/evento/curso/produto/conteúdo) | API favoritos existe | P0 |
| 14 | Denúncia | ⚠️ só admin | `/denuncias/nova` + acompanhamento | protocolo, evidências, status, direito de resposta | endpoint denúncias | P0 |
| 15 | Verificação (solicitação) | ⚠️ painel | fluxo completo no painel + página pública de status | envio de evidências, acompanhamento | parcial (prompt 06) | P0 |
| 16 | Mediação | ⚠️ dados em transparência | painel do dirigente + admin | contestação, resposta, histórico | parcial | P1 |
| 17 | Certificação | ⚠️ código na transparência | página pública de certificação | QR code, validade, renovação, histórico | parcial | P1 |
| 18 | Trust Score visual | ⚠️ `TrustScoreCard` existe | cards no perfil/busca/lista | "Índice de Confiança" com fatores e indicadores | endpoint existe | P0 |
| 19 | Avaliações estruturadas | ⚠️ perfil tem seção | formulário + moderação | critérios (acolhimento, organização, transparência…), resposta, contestação | parcial (prompt 06) | P0 |
| 20 | Perfil do Terreiro | ✅ `/terreiro/[slug]` | hero, galeria, eventos, serviços, trust | consistência visual, "Sobre esta informação" | existente | P0 |
| 21 | Painel do dirigente | ✅ `/painel` | dashboard do terreiro | admin de equipe, eventos, avaliações, estatísticas | existente | P0 |
| 22 | Dashboard AxéMap (admin) | ✅ `/admin` | overview + módulos | permissões por papel | existente | P0 |
| 23 | Marketplace | ⚠️ só seções estáticas | catálogo, produto, carrinho, pedido, avaliação, disputa | ecossistema artesãos/produtores | módulo financeiro desacoplado | P1 |
| 24 | Cursos (EAD) | ⚠️ listas sem `/cursos/[id]` | curso, módulos, área do aluno, progresso, certificado | progresso, certificado | parcial | P1 |
| 25 | Comunidade | ❌ | hub, perguntas, discussões | propósito claro, sem feed infinito | parcial (hub no perfil) | P1 |
| 26 | Conteúdo editorial / Cultura | ⚠️ seções na home | biblioteca, glossário, patrimônio | CMS admin | grafo cultural existe | P1 |
| 27 | Admin financeiro global | ❌ | financeiro no admin | visão de receita, planos, PIX | SaaS existe (sprint 7) | P1 |
| 28 | Privacidade (controles) | ❌ | configurações de privacidade | toggles por dado | — | P1 |
| 29 | Páginas institucionais | ❌ | `/sobre`, `/governanca` | narrativa de confiança e governança | — | P0 |
| 30 | 404/erros próprios | ❌ | `not-found`, `error`, `global-error` | estados em pt-BR com ação | — | P0 |

---

## 4. Sitemap atualizado (proposto)

```
/
├── /busca                        (busca global + autocomplete)
├── /mapa                         (mapa inteligente: clusters, filtros, trust)
├── /grafo                        (Axé Graph — visualizador)
├── /terreiros                    (índice de terreiros)             ← NOVO
│   ├── /terreiros-verificados
│   ├── /novos-terreiros
│   └── /terreiros/top
├── /terreiro/[slug]              (perfil público)
├── /tradicao                     (índice de tradições)             ← NOVO
│   └── /tradicao/[tradicao]
├── /cidade/[cidadeUf]            + /estado/[uf]
├── /eventos                      + /eventos/[id]                   ← NOVO [id]
│   └── /eventos/[local]
├── /cursos                       + /cursos/[id]                    ← NOVO [id]
│   └── /cursos/[tradicao]
├── /campanhas                    + /campanhas/[slug]
├── /acoes-sociais
├── /central-evolucao             (AxéScore, missões, conquistas)
├── /planos
├── /auth
│   ├── /auth/login
│   ├── /auth/cadastro
│   ├── /auth/esqueci-senha                                        ← NOVO
│   └── /auth/redefinir-senha                                      ← NOVO
├── /onboarding
├── /perfil                       (perfil do usuário + favoritos + privacidade)
├── /notificacoes                 (Notification Center)             ← NOVO
├── /mensagens                                                    ← NOVO (P1)
├── /favoritos                                                    ← NOVO (P0)
├── /denuncias/nova                                               ← NOVO (P0)
├── /painel                       (dashboard do dirigente)
│   └── /painel/terreiros/[id]
├── /admin                        (dashboard AxéMap)
│   ├── /admin/impacto
│   ├── /admin/axegraph
│   └── /admin/system
├── /transparencia/[slug]         (verificação/certificação pública)
├── /termos                                                       ← NOVO
├── /privacidade                                                 ← NOVO
├── /sobre                                                        ← NOVO
├── /governanca                                                   ← NOVO
└── /404 · /error                                                 ← NOVO
```

---

## 5. User Flows prioritários (P0)

### 5.1 Visitante → primeiro contato
`Home → busca/mapa → perfil do terreiro → confiança (Trust Score + verificação) → favoritar (login) → contato`

### 5.2 Cadastro e onboarding
`Cadastro → verificação de e-mail → onboarding (intenção de uso) → (usuário: busca) | (terreiro: reivindicar → completar perfil → solicitar verificação)`

### 5.3 Dirigente
`Login → painel → completar perfil → gerenciar equipe → publicar eventos → responder avaliações → solicitar verificação → acompanhar Trust Score`

### 5.4 Denúncia
`Perfil/entidade → "Denunciar" → categoria + evidências → protocolo → acompanhamento (status) → decisão + direito de resposta`

### 5.5 Notificações
`Evento disparado → Notification Center → categoria → abrir → ação → marcar lida/excluir → preferências`

---

## 6. Princípios de UI a partir daqui

1. **Um único sistema:** nada de hex solto fora de `globals.css`/tokens; usar variáveis `hsl(var(--...))` e classes utilitárias do DS.
2. **Dark mode é obrigatório:** toda cor nova deve definir valor no `:root` e no `.dark`.
3. **Estados por padrão:** loading/empty/error/success para toda seção de dados (via `StateCard`, `PageLoader`, toasts).
4. **Confiança como linguagem:** Trust Score como "Índice de Confiança" com indicadores e fatores — nunca "nota 9,8/10".
5. **Acessibilidade AA:** labels associados, `role="alert"` em erros, `aria-live` em loading, `not-found`/`error` próprios em pt-BR.
6. **Mobile-first:** navegação inferior dedicada; formulários empilhados; alvos de toque ≥ 44px.
7. **Respeito cultural:** sem visual folclorizado, sem selos que sugiram certificação inexistente.

---

## 7. Especificação de implementação (ordem de execução)

**Lote 1 — Correção estrutural (P0):**
1. Repontar/criar rotas quebradas: `/terreiros`, `/tradicao`, `/sobre`, `/governanca`, `/termos`, `/privacidade`, `/notificacoes`.
2. Corrigir dark mode e contraste nos CSS legados (busca, painel, onboarding, admin, evolucao, profile, perfil, auth).
3. Adicionar navegação inferior mobile.
4. Criar `not-found.tsx` / `error.tsx` em pt-BR.

**Lote 2 — Confiança e descoberta (P0):**
5. Integrar `Search` (autocomplete/⌘K) no header.
6. Mapa: clustering, filtros e Trust Score nos marcadores.
7. Avaliações estruturadas + `TrustScoreCard` consistente em busca/mapa/perfil.

**Lote 3 — Ciclo de vida do usuário (P0/P1):**
8. Recuperação de senha; verificação de e-mail; exclusão de conta.
9. Favoritos dedicados; eventos/cursos com detalhe; denúncia de usuário.

**Lote 4 — Expansão (P1/P2):**
10. Mensagens; marketplace; EAD; comunidade; conteúdo editorial; admin financeiro.
