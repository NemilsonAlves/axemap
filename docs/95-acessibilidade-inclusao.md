# 95 — Acessibilidade e Inclusão

> Etapa 13 da série de experiência do produto. Estabelece o compromisso de acessibilidade do AxéMap, as diretrizes por princípio WCAG, os padrões de navegação por teclado, a tabela de contraste dos tokens do Design System e o plano de teste de acessibilidade.
>
> Relaciona-se com: docs 24, 25, 37, 44, 57, 64, 94. Não duplica conteúdo: o foco aqui é a **conformidade técnica e a inclusão digital e cultural**, não a estética.

---

## 1. Compromisso de Acessibilidade

O AxéMap adota como padrão o **WCAG 2.2 nível AA+**, com a meta de **AAA para textos** sempre que não houver conflito com a identidade visual. O argumento de negócio é direto:

- A base de usuários-alvo inclui **dirigentes idosos de terreiros, pessoas com baixa fluência digital e usuários de dispositivos antigos e conexões lentas** — exatamente o público que mais se beneficia de acessibilidade.
- Acessibilidade é **requisito de produto, não correção pós-fato**. Entra no Definition of Ready de qualquer tela (ver doc 97).
- Acessibilidade é **inclusão religiosa e social**: garantir que uma pessoa cega possa conhecer um terreiro, que um idoso consiga cadastrar sua casa e que um celular de entrada carregue a plataforma é parte do propósito do AxéMap.

| Meta | Nível | Observação |
|------|-------|------------|
| Textos e interfaces | AA (WCAG 2.2) | Obrigatório em todas as telas |
| Textos | AAA (WCAG 2.2) | Meta: contraste ≥ 7:1 e textos em linguagem simples |
| Componentes interativos | AA (1.4.11, 2.4.7, 2.5.8) | Foco visível, alvos de toque ≥ 44px |
| Auditoria automatizada | CI | Bloqueio em PR quando regressão detectada |
| Teste manual e com usuários reais | Por release | Inclui pessoas com deficiência e idosos de terreiros |

---

## 2. Diretrizes por Princípio (WCAG 2.2)

### 2.1 Percebível

| Critério | Regra no AxéMap |
|----------|-----------------|
| **1.4.3 Contraste** | Texto normal ≥ 4.5:1; texto grande (≥ 18pt/14pt bold) ≥ 3:1. Meta AAA: 7:1 (ver tabela de tokens na seção 5) |
| **1.1.1 Texto alternativo** | `alt` descritivo em todas as imagens; fotos de terreiro com `alt` do contexto ("Foto da porta principal do terreiro X"); ícones decorativos com `aria-hidden="true"` |
| **1.2 Legendas e mídia** | Vídeo de apresentação do dirigente (ver doc 24) com **legendas** e **transcrição**; áudios de pontos/giras jamais publicados sem autorização e com legendas quando houver |
| **1.4.1 Uso da cor** | Nenhum significado deve depender **somente** de cor: selos de trust, estados de erro/sucesso e níveis de verificação devem ter **ícone + rótulo de texto** |
| **1.4.11 Não-texto** | Bordas de componentes interativos ≥ 3:1 (ver `--border`/`--input` na tabela) |
| **1.4.10 Reflow** | Layout responsivo até 320px de largura; sem scroll horizontal |
| **1.4.12 Espaçamento de texto** | Suportar aumento de espaçamento entre letras/palavras sem perda de conteúdo |
| **1.4.13 Conteúdo em hover/foco** | Tooltips aparecem em hover e em foco, são descartáveis (Esc) e não bloqueiam conteúdo |

### 2.2 Operável

| Critério | Regra no AxéMap |
|----------|-----------------|
| **2.1.1/2.1.2 Teclado** | Toda funcionalidade operável por teclado, sem armadilhas de foco (ver padrões por componente na seção 4) |
| **2.4.7 Foco visível** | Já implementado em `globals.css` via `:focus-visible` com `outline: 2px solid hsl(var(--ring))` e `outline-offset: 2px` — manter em **todos** os componentes |
| **2.4.11 Foco não obscurecido** | Elementos em foco não podem ser cobertos por modais/toasts; z-index dos overlays (ver tokens `--z-*`) deve respeitar foco ativo |
| **2.5.8 Tamanho de alvo** | Alvos de toque ≥ 44×44px (WCAG 2.2); botões compactos com alvo expandido |
| **2.3.3 Animação** | Qualquer animação que se move > 5px por segundo deve ter **controle de pausa** ou respeitar `prefers-reduced-motion` (ver seção 6) |
| **2.4.5 Múltiplas vias** | Busca global + navegação + mapa: nenhuma funcionalidade só alcançável por um caminho único |

### 2.3 Compreensível

| Critério | Regra no AxéMap |
|----------|-----------------|
| **3.1.1 Idioma** | `<html lang="pt-BR">` em toda a aplicação |
| **3.1.2 Partes em outro idioma** | Termos de origem iorubá/bantu (axé, orixá, ogã, ekedi) marcados como estrangeiros quando apropriado, com **glossário/tooltip** (ver doc 24) |
| **3.2.3 Navegação consistente** | Menus, busca e footer idênticos entre páginas; a ordem de navegação não muda sem aviso |
| **3.2.2 Ao receber dados de entrada** | Mudanças de contexto (redirecionar, abrir modal) só após ação explícita, com **prevenção de erro** |
| **3.3.1/3.3.2/3.3.3 Erros** | Identificação do erro em texto, sugestão de correção, e mensagens claras ("Informe um e-mail válido"), não apenas borda vermelha |
| **3.3.4 Prevenção de erro** | Ações irreversíveis (excluir terreiro, remover verificação) com confirmação e revisão |
| **3.3.7 Preenchimento redundante** | Dados já informados não são solicitados de novo (ver doc 94, seção 2) |

### 2.4 Robusto

| Critério | Regra no AxéMap |
|----------|-----------------|
| **4.1.1 Parsing** | HTML válido, sem duplicação de atributos `id` |
| **4.1.2 Nome, função, valor** | `role`, `aria-label` e estado corretos em modais, combobox, tabs, accordion, toasts, carousel |
| **4.1.3 Mensagens de status** | Toast e feedbacks usam `role="status"`/`aria-live` para que leitores de tela anunciem sem roubar o foco |
| **Semântica** | Usar elementos nativos (`<button>`, `<a>`, `<select>`, `<dialog>`) antes de ARIA; ARIA apenas para corrigir gaps |

---

## 3. Inclusão Cultural e Digital

### 3.1 Baixa fluência digital (dirigentes idosos de terreiros)

- **Interface de primeiro acesso simplificada**: telas com 1 ação primária, botões grandes (≥ 48px), instruções em 1 frase.
- **Onboarding assistido**: CTA "WhatsApp para ajudar a cadastrar" (ver docs 24 e 94).
- **Linguagem simples, sem jargão de plataforma**: "cadastre seu terreiro" em vez de "crie seu perfil de estabelecimento"; "confirmação de identidade" em vez de "verificação documental KYC".
- **Passos visíveis**: barra de progresso com rótulos ("1. Dados, 2. Fotos, 3. Revisar").
- **Suporte humano em português**: erros jamais soam punitivos; suporte de primeira linha não é só chatbot.

### 3.2 Leitores de tela e conteúdo religioso

- **Respeito aos nomes sagrados**: o app não deve pronunciar incorretamente (via leitores de tela) nomes de Orixás e termos ritualísticos; quando em dúvida, manter o termo como palavra em português com `lang` apropriada e glossário.
- **Conteúdo ritualístico nunca é transcrito de forma simplificadora**: legendas/transcrições de conteúdo religioso só com autorização do terreiro e revisão de dirigentes.
- **Acessibilidade das avaliações**: textos de terceiros (avaliações, posts) devem ser legíveis e navegáveis por leitores de tela, com identificação clara de autoria e data.
- **Contraste do trust score**: o detalhamento do Trust Score (ver doc 28) deve ser compreensível sem a cor do selo — usar rótulos de texto ("Verificado", "Estabelecido", "Em formação").

### 3.3 Dispositivos antigos e conexões lentas

| Frente | Medida |
|--------|--------|
| **Peso** | PWA leve, imagens com resolução adaptativa (thumb/medium/full — ver doc 24), lazy loading, virtual scroll |
| **Rede** | Skeleton + estado otimista (ver doc 94); service worker com cache do mapa Leaflet |
| **Legado** | Suporte aos 2 navegadores mais usados entre públicos de baixa renda no Brasil (Chrome/Android + uma versão atrás); sem dependência de recursos modernos para funcionalidades críticas |
| **Dados** | Modo de dados econômicos (sem vídeo automático, imagens em menor qualidade) |

---

## 4. Navegação por Teclado (Padrões por Componente)

Padrões gerais: **Tab/Shift+Tab** move o foco na ordem do DOM; **Enter** ativa; **Esc** fecha/cancela. O componente `dialog`/`sheet` da biblioteca (Radix, ver `components/ui/`) já implementa *focus trap* e restauração de foco — não customizar sem motivo.

| Componente | Teclas | Comportamento |
|------------|--------|---------------|
| **Menu (dropdown-menu)** | Enter/Espaço abre; Setas navegam; Enter seleciona; Esc fecha | Foco retorna ao gatilho ao fechar |
| **Dialog/Modal (dialog, sheet)** | Esc fecha; foco preso dentro; Tab cíclico; ao fechar, foco retorna ao elemento que abriu | `role="dialog"`, `aria-modal`, título associado via `aria-labelledby` |
| **Combobox (busca, select)** | Setas movem a lista; Enter seleciona; Esc fecha lista mantendo digitação | `role="combobox"` + `listbox`, `aria-expanded`, `aria-activedescendant` |
| **Tabs (tabs)** | Setas ←/→ alternam abas (padrão roving tabindex); Tab sai do grupo | `role="tablist"/"tab"/"tabpanel"`, `aria-selected` |
| **Carousel (carousel)** | Setas ←/→ mudam slide; foco em controles; pausa com a tecla de pausa | Sem rotação automática sem pausa; `aria-roledescription` |
| **Tooltip (tooltip)** | Abre em focus dentro; Esc fecha | Conteúdo também acessível de outra forma (ex.: label no perfil) |
| **Accordion (accordion)** | Enter/Espaço alterna; setas movem entre headers | `aria-expanded`, `aria-controls` |
| **Sheet/Drawer** | Mesmo padrão do dialog | Oculto com `aria-hidden` quando fechado |
| **Toast** | Anunciado via `aria-live`; ação executável por teclado | Não rouba o foco |
| **Busca global (⌘K)** | Ctrl/Cmd+K abre; Esc fecha; setas navegam resultados | Atalho exibido na interface (ver Linear, doc 94) |

**Skip link**: link "Pular para o conteúdo" no início de cada página.

---

## 5. Contraste: Tabela de Tokens do Design System

Valores calculados sobre os tokens de `apps/web/src/app/globals.css` (WCAG 2.2, método de luminância relativa).

### 5.1 Tema claro — pares que passam AA (≥ 4.5:1 em texto normal)

| Par (frente/sobre) | Contraste | Nível |
|--------------------|-----------|-------|
| `--foreground` sobre `--background` | 17.35:1 | AAA |
| `--foreground` sobre `--card` | 18.41:1 | AAA |
| `--muted-foreground` sobre `--card` | 5.19:1 | AA |
| `--muted-foreground` sobre `--background` | 4.89:1 | AA |
| `--secondary-foreground` sobre `--secondary` | 13.48:1 | AAA |
| `--accent-foreground` sobre `--accent` | 11.77:1 | AAA |
| `--destructive-foreground` sobre `--destructive` | 5.28:1 | AA |
| `--danger-foreground` sobre `--danger` | 5.10:1 | AA |
| `--info-foreground` sobre `--info` | 5.02:1 | AA |
| `--copper-strong` sobre `--background` | 5.90:1 | AA |
| `--soil` sobre `--background` | 14.64:1 | AAA |
| `--soil-soft` sobre `--background` | 8.61:1 | AAA |

### 5.2 Tema claro — pares que NÃO passam AA e exigem ajuste

| Par | Contraste | Problema | Ajuste recomendado |
|-----|-----------|----------|--------------------|
| `--muted-foreground` sobre `--muted` | 4.38:1 | Texto normal abaixo de 4.5:1 | Não usar texto informativo sobre `--muted`; ou escurecer `--muted-foreground` |
| `--primary-foreground` sobre `--primary` | 4.16:1 | Botão primário (texto normal) | Escurecer `--primary` (ex.: próximo a `--copper-strong`) ou usar texto escuro; passar AA Large |
| `--success-foreground` sobre `--success` | 3.86:1 | Selo/estado de sucesso | Escurecer o verde; meta AAA 7:1 para textos |
| `--warning-foreground` sobre `--warning` | 3.22:1 | Alerta de warning | Escurecer o âmbar; nunca depender só de cor (ver 2.1) |
| `--bronze` sobre `--background` | 3.51:1 | Texto decorativo/título | Texto: usar `--copper-strong`/`--soil`; bronze reservado a grafismo grande |
| `--clay` sobre `--background` | 4.16:1 | Texto em destaque | Usar `--soil-soft` para texto |
| `--fern` sobre `--background` | 4.38:1 | Texto verde | Escurecer ou usar apenas em ícones grandes (≥ 3:1) |
| `--ochre` sobre `--background` | 2.85:1 | Texto | Escurecer ou restringir a elementos decorativos |
| `--sand` sobre `--background` | 2.15:1 | Texto | Restringir a decoração; nunca texto |
| `--border` sobre `--background` | 1.22:1 | Borda de componentes (1.4.11 exige 3:1) | Bordas de campos/botões em estado normal: usar `--input` apenas como contorno decorativo e reforçar com foco; ou escurecer borda para estados interativos |
| `--input` sobre `--background` | 1.34:1 | Borda de input | idem; o `:focus-visible` (`--ring`, 3.87:1) cobre o requisito de 3:1 durante o foco |
| `--copper` sobre `--background` | 4.07:1 | Título/botão | Passa AA Large (3:1) e AAA Large; para texto normal, usar `--copper-strong` |

### 5.3 Tema escuro — pontos de atenção

| Par | Contraste | Observação |
|-----|-----------|------------|
| `--foreground` sobre `--background` | 16.29:1 | AAA |
| `--muted-foreground` sobre `--background` | 6.84:1 | AA+ |
| `--primary-foreground` sobre `--primary` | 5.77:1 | AA |
| `--success-foreground` sobre `--success` | 6.85:1 | AA+ |
| `--warning-foreground` sobre `--warning` | 8.43:1 | AAA |
| `--destructive-foreground` sobre `--destructive` | **3.71:1** | NÃO passa AA em texto normal — escurecer o fundo ou clarear o texto |
| `--sand` sobre `--background` | 5.02:1 | AA (em dark o sand passa; em light não) |
| `--soil`/`--soil-soft` sobre `--background` | 1.16:1 / 1.64:1 | Decorativos em dark; nunca texto |
| `--border` sobre `--background` | 1.41:1 | Idem tema claro (usar foco/ring para sinalizar) |
| `--ring` sobre `--background` | 6.29:1 | AA |

### 5.4 Regras práticas de contraste

1. **Texto sobre qualquer token de marca** (cobre, bronze, barro, ocre, areia): preferir `--copper-strong`, `--soil`, `--soil-soft` ou o token `*-foreground` correspondente; nunca usar o token puro.
2. **Texto secundário** (`muted-foreground`): não usar sobre `--muted`; sobre `--card`/`--background` está OK.
3. **Nunca usar cor sozinha** para transmitir estado (erro, sucesso, verificação): sempre ícone + rótulo (critério 1.4.1).
4. **Bordas interativas**: o estado "pronto para receber interação" precisa de 3:1; na prática, usar `--ring`/`--copper-strong` na borda de campos em foco/hover e contornos visíveis.
5. **Modo alto contraste**: oferecer um tema de alto contraste (variação dos tokens `--background`/`--foreground`/`--primary`) via alternância manual e respeitar `prefers-contrast: more` (CSS media query) para elevar automaticamente o contraste de textos e bordas.

---

## 6. Reduced Motion

O bloco global já existe em `globals.css` (linhas 438-447):

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Regras adicionais do AxéMap:
- **Nenhum componente pode fazer scroll ou animação autoplay** (carousel, marquee) sem pausa; com `prefers-reduced-motion`, desativar totalmente.
- Microinterações (ver doc 94) devem ser reduzidas a estados instantâneos no modo reduced motion.
- Exceções de "movimento essencial" não se aplicam ao domínio (não há cargas/transições críticas que precisem de movimento).
- Testar com `prefers-reduced-motion: reduce` em CI (Playwright) e em revisão manual.

---

## 7. Font Scaling, Leitura e Texto Redimensionável

| Frente | Regra |
|--------|-------|
| **Zoom 200%** | Layout não pode quebrar até 200% de zoom (WCAG 1.4.4); grid fluido, sem larguras fixas de conteúdo |
| **Aumento de fonte do SO** | Tipos devem usar `rem`/`clamp` (o DS já usa `clamp` nos tokens `--text-*`), nunca `px` fixo para tamanhos de texto |
| **Refluxo de texto** | Linhas com 40-80 caracteres; quebras de linha longas evitadas |
| **Modo de leitura** | Conteúdo extenso (descrição do terreiro, política, glossário) disponível em formato de leitura contínua, sem popups interrompendo |
| **Redimensionável** | Texto deve aumentar 200% sem cortar conteúdo nem exigir scroll horizontal (testar em 320px e em zoom 200%) |

---

## 8. Plano de Teste de Acessibilidade

### 8.1 Auditoria automatizada (contínua, em CI)

| Ferramenta | Escopo | Gatilho |
|------------|--------|---------|
| **axe-core** (via Playwright) | Scans de todas as rotas principais | Bloqueia PR se violações AA/AAA |
| **Lighthouse a11y** | Score de cada página em pipeline de deploy | Meta ≥ 0.95 |
| **Pa11y** | Rotas críticas (busca, perfil, cadastro) | Noturno, relatório para Slack |
| **Contraste** | Verificação dos tokens (checklist da seção 5) | Teste unitário no Design System |

### 8.2 Teste manual

| Frente | Método |
|--------|--------|
| **Teclado** | Percorrer todas as jornadas críticas só com Tab/Enter/Esc/setas; verificar skip link, foco visível, foco aprisionado em modais e restauração de foco |
| **Screen readers** | NVDA + Chrome (Windows), VoiceOver + Safari (macOS), TalkBack (Android), JAWS (Windows, validação final) |
| **Reduced motion** | Ativar preferência no SO e validar que animações e carousel param |
| **Zoom e fontes** | Zoom 200%, fonte do SO a 200%, largura 320px |
| **Alto contraste** | Ativar `prefers-contrast: more` e o tema manual; validar textos e bordas |

### 8.3 Teste com usuários reais

- **5-8 participantes por release** com perfis: 1 usuário cego (leitor de tela), 1 usuário com baixa visão (alto contraste), 1 usuário com mobilidade limitada (teclado), **1-2 dirigentes idosos de terreiro** (baixa fluência digital), 1 usuário de dispositivo de entrada + rede lenta.
- Roteiros cobrindo: buscar terreiro, ver perfil, entrar em contato, avaliar, cadastrar terreiro, solicitar verificação.
- Critério de aceite: **as 6 tarefas críticas concluídas sem ajuda** em ≤ 2 tentativas, para cada perfil.

### 8.4 Governança

- Checklist de acessibilidade entra no **Definition of Ready** (ver doc 97) e no **Definition of Done** (ver doc 85).
- Regressão de acessibilidade bloqueia release; métricas de acessibilidade reportadas trimestralmente junto aos KPIs (ver doc 96).

---

## 9. Relação com as demais docs

| Doc | Relação |
|-----|---------|
| 24 | Onboarding assistido e glossário de termos — base da inclusão digital |
| 25 | Neutralidade religiosa — reforça acessibilidade sem exotizar a cultura |
| 37 | Avaliações acessíveis e respeitosas a leitores de tela |
| 44 | Acessibilidade eleva a North Star (mais pessoas conseguem conectar) |
| 57 | RBAC — o que cada papel pode ver reflete nos testes de foco/leitura de tela |
| 64 | Tokens do Design System — base dos cálculos de contraste desta doc |
| 94 | Microinterações, motion e feedback — esta doc define limites acessíveis |
| 96 | Métricas de experiência incluem erros e tempo de tarefa por perfil |
| 97 | Definition of Ready inclui checklist de acessibilidade |

**Próximo passo:** a doc 96 (Métricas de Experiência) define como medir o resultado dessas decisões.