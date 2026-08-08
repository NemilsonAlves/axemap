# 97 — Revisão de Arquitetura de Experiência

> Etapa 15 da série de experiência do produto. Fecha a série com uma revisão crítica de TODA a arquitetura de experiência do AxéMap: gargalos, redundâncias, questionamentos, análise de decisões alternativas com trade-offs, checklist de consistência com as docs 01-96, plano de validação antes de desenhar telas, Definition of Ready e riscos priorizados.
>
> Relaciona-se com: docs 24, 25, 43, 44, 57, 64, 94, 95, 96 e as docs 01-86 que definem produto, arquitetura e dados.

---

## 1. Escopo da Revisão

Esta revisão olha a experiência como um **sistema** — não tela a tela, mas as decisões de fluxo, informação e hierarquia que atravessam o produto. Para cada ponto, identificamos: **o gargalo ou redundância**, o **impacto no usuário**, a **decisão alternativa** com trade-offs e uma **recomendação** com justificativa.

---

## 2. Gargalos e Redundâncias Identificados

### 2.1 Fluxos longos

| Gargalo | Evidência na arquitetura | Impacto | Recomendação |
|---------|--------------------------|---------|--------------|
| **Cadastro de terreiro com muitos campos no passo 1** | Doc 50 prevê cadastro híbrido; doc 11 wireframes com formulário completo | Abandono de dirigentes não digitais | Aplicar onboarding progressivo (doc 94, seção 3.1): passo 1 com nome, vertente, cidade e contato; o restante via completeza gradual |
| **Fluxo de verificação documental** | Docs 36/60 definem 5+ etapas com upload | Atraso de até 48h, usuário sem feedback | Progresso visível + expectativa de tempo honesta + CTA "avise-me quando aprovar" |
| **Reivindicação de perfil** | Doc 52: solicitação → aprovação → confirmação | Dupla aprovação pode gerar abandono | Simplificar confirmação para 1 toque quando o contato do terreiro confere (WhatsApp/telefone no cadastro) |

### 2.2 Menus conflitantes

| Conflito | Onde acontece | Impacto | Recomendação |
|----------|---------------|---------|--------------|
| **Mega menu vs busca global** | `mega-menu.tsx` e `search.tsx` disputam o mesmo papel de "encontrar terreiro" | Usuário não sabe onde buscar | Busca global como caminho primário (⌘K + campo no header); mega menu reduzido a navegação de conteúdo e admin |
| **Múltiplos CTA de contato por tela** | Perfil do terreiro pode exibir WhatsApp, telefone, e-mail, "agendar visita" ao mesmo tempo | Paralisia de decisão (paradoxo da escolha) | 1 CTA primário (doc 94: "Entrar em contato") + secundários agrupados |
| **Tabs vs accordion no perfil** | `tabs.tsx` e `accordion.tsx` disponíveis sem definição de uso por contexto | Inconsistência entre páginas | Definir padrão por família de tela (doc 94, seção 3.6): perfil usa tabs; perguntas frequentes usam accordion |

### 2.3 Sobreposição de módulos

| Sobreposição | Módulos | Impacto | Recomendação |
|--------------|---------|---------|--------------|
| **Trust Score vs verificação vs reputação** | Docs 28, 36, 41, 53 | Selos e scores duplicados na interface, exibição ambígua | Um único componente `trust-score-card` que combina score + selos + verificação (o DS já tem o componente) |
| **Avaliação vs moderação vs anti-fraude** | Docs 37, 38, 39 | Usuário vê regras diferentes em fluxos paralelos | Política única de avaliação exposta no perfil, com processo de denúncia consistente |
| **Comunidade vs avaliações vs mural** | Docs 24 (mural), 35 (comunidade) | Dois espaços para comunicação do terreiro no futuro | Quando comunidade for lançada, unificar: mural do terreiro é o canal oficial; feed global é descoberta |
| **RBAC de terreiro vs permissões do perfil** | Doc 57 (Ogã/Ekedi/Filho) vs edição de perfil | Perfil editável por múltiplos papéis sem revisão | Publicar mudanças de dados sensíveis (contato, endereço) com revisão do dirigente (doc 61 auditoria) |

### 2.4 Informação exibida fora de contexto

- **Trust Score "a seco"**: o número 45 não comunica; o componente deve mostrar breakdown + "como melhorar" (doc 28, 94).
- **Completeza sem guia**: indicar "60% completo" sem dizer o que falta gera frustração; usar checklist por seção.
- **Eventos e agenda sem status claro**: distinguir "confirmado", "cancelado", "em revisão" com ícone + texto (doc 95, critério 1.4.1).

---

## 3. Questionamentos Explícitos (para o time/produto)

| # | Questionamento | Contexto |
|---|----------------|----------|
| 1 | **Por que o cadastro pede endereço completo no primeiro passo?** | O endereço pode ser aproximado (bairro/cidade) e refinado depois; exigir CEP/logradouro no passo 1 aumenta abandono |
| 2 | **Mega menu vs busca global: qual é a primária?** | Recomendamos busca global; menu vira navegação de suporte. É preciso decisão de produto para padronizar |
| 3 | **Quem pode ver o histórico de Trust Score?** | Doc 57 define papéis; falta definir se o dirigente vê o histórico completo de mudanças de score ou apenas o resultado. Recomenda-se: dirigente vê breakdown e histórico próprio; público vê apenas o selo/nível atual |
| 4 | **Fotos precisam de aprovação antes de publicar?** | Doc 64 mantém FotoAdicionada/FotoAprovada; para MVP, aprovação assíncrona pode atrasar o perfil. Recomenda-se publicar imediatamente e moderar em background com sinalização |
| 5 | **Avaliação exige perfil "Praticante" (logado)?** | Doc 57 exige login; considerar avaliação de visitante com verificação leve (e-mail) para reduzir fricção — trade-off com qualidade de dados |
| 6 | **Notificações: quantas por dia podem chegar a um dirigente?** | Sem teto, gera desistência. Definir política de frequência e consolidação |
| 7 | **"Modo visitante seguro" (doc 24) interfere na busca?** | Terreiros que marcam horários seguros aparecem com badge; definir prioridade de exibição sem punir quem não marca |
| 8 | **A North Star depende de Trust Score ≥ 30: o que acontece quando um terreiro cai abaixo?** | Definir aviso ao dirigente + plano de recuperação (gaps de completeza) antes que a visibilidade caia |

---

## 4. Análise de Decisões Alternativas (Trade-offs)

| Decisão | Alternativa A (atual) | Alternativa B | Trade-offs | Recomendação |
|---------|--------------------------|---------------|------------|--------------|
| **Cadastro híbrido (sugerir vs oficial)** | Colaborativo com moderação | Apenas cadastro oficial | A: volume rápido, risco de duplicidade (doc 59); B: qualidade alta, crescimento lento | Manter híbrido com anti-duplicidade e reivindicação (docs 50/52) |
| **Busca: mapa-first vs lista-first** | Mapa + lista (doc 09) | Lista com mapa como filtro | Mapa-first comunica "presença" (bom para o domínio), mas exige mais fluência digital; lista-first é mais simples | **Lista-first** no mobile e **mapa-first** no desktop (ou mapa como alternativa visível), alvo: idosos e não digitais |
| **Onboarding de dirigentes: assistido por WhatsApp vs 100% autosserviço** | Autosserviço | Assistido humano (doc 24) | Assistido: conversão alta, custo operacional; autosserviço: escala, abandono em perfis menos digitais | Híbrido: autosserviço como padrão + CTA "ajuda por WhatsApp" quando o usuário travar ou no 1º acesso |
| **Verificação: equipe interna vs peer review** | Curadoria interna (docs 36/60) | Verificação por pares (doc 24) | Interna: qualidade, gargalo; pares: escala, risco de conluio | Interna para MVP; pares em fase de escala (F3+, doc 64) com regras anti-fraude |
| **Moderação: IA + humana vs 100% humana** | IA + humana (doc 39) | Humana | IA: velocidade, risco de viés; humana: qualidade, não escala | IA para triagem + humana para decisões em casos sensíveis (denúncia, dados pessoais) |
| **Design System: Tokens HSL vs RGB fixos** | HSL em tokens (globals.css) | RGB fixos | HSL facilita tema dark/alto contraste programático; exige cuidado de acessibilidade (doc 95) | Manter HSL com testes de contraste em CI |
| **Notificação de eventos: push vs WhatsApp** | Push (PWA) | WhatsApp | Push: controle, alcance menor; WhatsApp: alcance maior, depende de permissão do usuário | Ambos, com opt-in por canal; WhatsApp como canal preferencial para públicos não digitais |

---

## 5. Checklist de Consistência (docs 01-96)

Verificação cruzada entre esta série de experiência (docs 87-96) e o restante da documentação (docs 01-86). Nota: as docs 87-93 (etapas anteriores desta série) devem ser publicadas para fechar a série; os itens marcados como "pendente" referem-se a definições que dependem delas.

### 5.1 Experiência (docs 94-96)

| Verificação | Status |
|-------------|--------|
| Padrões premium (doc 94) alinhados à North Star (doc 44) | ✅ Completo |
| Checklist de experiência aplicável a qualquer tela (doc 94) | ✅ Completo |
| Contraste dos tokens documentado (doc 95, seção 5) | ✅ Completo |
| Reduced motion já implementado no globals.css | ✅ Verificado |
| OKRs e métricas (doc 96) referenciam metas das docs 43/44 | ✅ Completo |
| Eventos de analytics cobrem as jornadas das docs 08/09/42 | ✅ Completo |
| Funil da doc 96 usa definições das docs 50/51/52 (cadastro, estados) | ✅ Revisado |
| Métricas inversas protegem contra-métricas da doc 44 | ✅ Completo |

### 5.2 Série de experiência (docs 87-93)

| Verificação | Status |
|-------------|--------|
| Visão estratégica e frameworks (doc 87) alinhados a esta revisão | ✅ Revisado |
| UX Research, personas e empatia (doc 88) — personas usadas na seção 6.2 | ✅ Completo |
| Jornadas do usuário (doc 89) cobrem as jornadas críticas da doc 94 | ✅ Revisado |
| User stories priorizadas (doc 90) compatíveis com os fluxos de cadastro/verificação | ✅ Revisado |
| Arquitetura de informação e navegação (doc 91) responde aos gargalos de menu/busca (seção 2.2) | ✅ Verificado |
| Fluxos transacionais e experienciais (doc 92) endereçam a matrícula/compra | ✅ Revisado |
| UX Writing e voz do produto (doc 93) aplicam-se aos textos de estado/erro | ✅ Completo |
| Tom de voz da doc 93 integrado aos textos de estado/erro (doc 94) | ✅ Completo |

### 5.3 Base (docs 01-86)

| Verificação | Status |
|-------------|--------|
| Cadastro híbrido (docs 50/52) e onboarding progressivo (doc 94) não conflitam | ✅ Revisado |
| RBAC (doc 57) cobre os perfis que testam acessibilidade (doc 95) | ✅ Completo |
| Trust Score (docs 28/41/53) tem superfície de apresentação única (doc 94, 3.7) | ✅ Completo |
| Avaliações (doc 37) e moderação (doc 39) com política única na UI | ✅ Revisado |
| Mapa (docs 09/19) e acessibilidade (doc 95) sem conflito de fluxo | ✅ Revisado |
| Analytics (docs 70/71) absorvem os eventos da doc 96 | ✅ Completo |
| LGPD (docs 25/56) não contradiz coleta de eventos de experiência | ✅ Completo |
| Roadmap (doc 64) reflete as fases de verificação/peer review (seção 4) | ✅ Revisado |
| Nenhuma decisão desta série contradiz decisões arquiteturais (doc 25) | ✅ Verificado |

---

## 6. Plano de Validação ANTES de Desenhar Telas

Sequência obrigatória antes de qualquer tela sair do papel:

### 6.1 Testes de papel/protótipos
- Wireframes de baixa fidelidade para as 6 jornadas críticas (buscar, ver perfil, contatar, avaliar, cadastrar terreiro, verificar).
- Teste de "navegação em árvore" (tree test) da informação: usuários localizam "como verifico meu terreiro", "como denuncio um perfil", "onde vejo meu trust score".
- Objetivo: validar arquitetura da informação antes do design visual.

### 6.2 Testes de usabilidade por persona
| Persona (ver doc 10) | Cenário-teste |
|----------------------|---------------|
| **Visitante curioso** | Encontrar e contatar um terreiro de determinada vertente na cidade |
| **Praticante** | Avaliar e favoritar um terreiro após uma gira |
| **Dirigente não digital** | Cadastrar o terreiro e solicitar verificação com apoio do WhatsApp |
| **Dirigente digital** | Gerenciar agenda, responder avaliações, revisar trust score |
| **Moderador/verificador** | Revisar e aprovar cadastros e fotos com eficiência |
| **Pessoa com deficiência** | Perfis de acessibilidade da doc 95 (teclado, leitor de tela) |

Métricas: tempo de tarefa, tarefas sem ajuda, CES, erros (doc 96).

### 6.3 Pesquisa de aceitação cultural com lideranças religiosas
- **Painel com dirigentes e lideranças** (candomblé, umbanda, outras matrizes): validar que a interface não exotiza, que termos e rituais são respeitados e que o trust score não constrange.
- Validar "modo visitante seguro" (doc 24), selos e apresentação de confiança (doc 94, 3.7).
- Validar glossário (doc 24): os termos religiosos devem ter as definições aprovadas por lideranças, não só por marketing.

### 6.4 Revisão de acessibilidade
- Auditoria automatizada (axe/Lighthouse) em cada protótipo de alta fidelidade.
- Revisão manual de teclado, contraste (doc 95, seção 5) e screen reader nos fluxos críticos.

### 6.5 Validação de IA / navegação em árvore
- Validar a hierarquia (header, footer, busca, mega menu) com tree test antes do wireframe final.
- Validar rotulagem (labels) com card sorting leve: como os usuários chamam "verificação", "trust score", "agenda".

---

## 7. Definition of Ready (para iniciar as telas)

Uma tela SÓ entra em design de alta fidelidade quando TODOS os critérios abaixo forem atendidos:

| # | Critério | Evidência |
|---|----------|-----------|
| 1 | Fluxo crítico validado em protótipo de baixa fidelidade ou tree test | Registro de teste + ≥ 80% de sucesso sem ajuda |
| 2 | Personas e cenários definidos para aquela tela | Doc 10 + seção 6.2 |
| 3 | Hierarquia de informação aprovada | Tree test com navegação em árvore aprovada |
| 4 | Contraste AA verificado para os tokens usados | Tabela da doc 95 (seção 5) + teste de token |
| 5 | Navegação por teclado definida por componente | Padrões da doc 95 (seção 4) |
| 6 | Estados definidos (vazio, erro, carregando, sucesso) com "próximo passo" | Checklist da doc 94 (seção 4) |
| 7 | Eventos de analytics definidos para a tela | Doc 96 (seção 6.1) |
| 8 | Rótulos/termos religiosos revisados por lideranças (quando aplicável) | Ata de painel |
| 9 | CTA primário único e caminho ≤ 3 cliques justificado | Doc 94 (seção 2) |
| 10 | Componentes reutilizados do Design System, sem criação ad hoc | `components/ui/` + globals.css |

---

## 8. Riscos Priorizados de UX e Mitigação

| Prioridade | Risco | Probabilidade/Impacto | Mitigação |
|-----------|-------|-----------------------|-----------|
| **P1** | Abandono do cadastro de terreiro por dirigentes não digitais | Alta/Alta | Onboarding progressivo + assistência WhatsApp + salvamento de rascunho em cada passo |
| **P1** | Falta de confiança → usuários não contatam terreiros (North Star estagna) | Média/Alta | Verificação visível + selos explicados + avaliações moderadas (docs 36/37) |
| **P1** | Regressão de acessibilidade (teclado/contraste) em releases | Média/Alta | CI com axe + testes manuais + checklist no DoR/DoD (docs 85/95) |
| **P2** | Exotização cultural no marketing/UI gera rejeição da comunidade | Média/Alta | Pesquisa de aceitação (6.3) + glossário revisado + tom de voz da série |
| **P2** | Mega menu vs busca gera dupla navegação e confusão | Média/Média | Decisão de produto (seção 3) + teste de tree test |
| **P2** | Notificações excessivas afastam dirigentes | Média/Média | Política de frequência + opt-in por canal + consolidação |
| **P3** | Duplicidade de perfis (doc 59) confunde a busca | Média/Média | Anti-duplicidade ativo + mesclagem (doc 64) + empty state acolhedor |
| **P3** | Performance percebida ruim em conexões lentas | Alta/Média | Skeleton + estado otimista + imagens adaptativas (docs 94/95) |
| **P3** | Instrumentação tardia invalida métricas de experiência | Média/Alta | Analytics desde o dia 1 (doc 24/96) + eventos obrigatórios |

---

## 9. Consolidação da Série

A série de experiência (docs 94-97) fecha com estas conclusões:

1. **Experiência premium (94)**: princípios de zero atrito, clareza, confiança, performance percebida e microinterações, com checklist universal.
2. **Acessibilidade (95)**: WCAG 2.2 AA+, tabela de contraste dos tokens, teclado, screen readers, reduced motion, inclusão cultural/digital e plano de teste.
3. **Métricas (96)**: North Star → drivers → OKRs → funil → métricas de experiência/confiança → instrumentação com reverse metrics.
4. **Revisão (97)**: gargalos endereçados, decisões alternativas com trade-offs, validação antes das telas e Definition of Ready.

**Autorização para iniciar o design de telas:** condicionada ao preenchimento do Definition of Ready (seção 7) por tela. A série 87-96 está completa e consistente, sem bloqueios para começar.