# 96 — Métricas de Experiência

> Etapa 14 da série de experiência do produto. Define como medir a experiência: a North Star e seus drivers, OKRs trimestrais, o funil de valor, as métricas de experiência e de confiança, e o plano de instrumentação (eventos, dashboards, experimentação e métricas inversas).
>
> Relaciona-se com: docs 43, 44, 70, 71, 94, 95. Não duplica conteúdo: aqui o foco é **medir a experiência**, consolidando e estendendo o que as docs 43/44/70 definem.

---

## 1. North Star Validada e Drivers

A **North Star Metric** do AxéMap é **"Conexões Confiáveis por Mês" (TCPM)** — definida e detalhada na doc 44. Recordando a alavanca estrutural:

```
TCPM = Usuários Ativos × Taxa de Conexão por Usuário × Terreiros com Trust Score ≥ 30
```

### Desdobramento em drivers de experiência

Cada driver da North Star tem um componente de **experiência** que é responsabilidade do Design/Produto:

| Driver da North Star | Componente de experiência | Métrica de experiência associada |
|----------------------|---------------------------|----------------------------------|
| **Aumentar tráfego qualificado** | Busca e descoberta funcionais | Taxa de rejeição da home, tempo até encontrar terreiro |
| **Melhorar taxa de conexão** | Busca → perfil → WhatsApp e avaliar fluidos | Tempo de tarefa, tarefas concluídas sem ajuda, CES |
| **Elevar Trust Score médio** | Onboarding de dirigentes e verificação sem atrito | Completeza média, % de verificação concluída, tempo de verificação |
| **Retenção** | Motivos para voltar e primeiro valor rápido | Time-to-first-value, retenção D1/D7/D30, churn |

**Validação da North Star (hipóteses a confirmar):**
1. Usuários que fazem 1ª conexão confiável em ≤ 3 dias têm retenção D30 ≥ 2x da média.
2. Terreiros com Trust Score ≥ 30 e completezza ≥ 80% recebem ≥ 2x mais conexões que os abaixo disso.
3. Reduzir o tempo de tarefa "entrar em contato" em 50% eleva a taxa de conexão na mesma jornada.

---

## 2. OKRs Trimestrais de Produto

Objetivos (3-4) por trimestre, cada um com 3 resultados-chave mensuráveis. Metas de 12 meses de referência vêm da doc 43.

### O1. Tornar a busca e a descoberta de terreiros rápidas e confiáveis
- **KR1:** Tempo de tarefa mediano "achar um terreiro e entrar em contato" ≤ 90s (baseline 180s).
- **KR2:** 65% dos usuários novos concluem a primeira busca útil em ≤ 30s.
- **KR3:** Taxa de rejeição da página de busca ≤ 30% (baseline 50%).

### O2. Reduzir o atrito no cadastro de terreiro (dirigentes)
- **KR1:** Onboarding (cadastro → rascunho salvo) em ≤ 4 min mediano.
- **KR2:** Completezza média do perfil ≥ 65% no 7º dia.
- **KR3:** Taxa de conclusão do cadastro híbrido ≥ 60% e CES de cadastro ≤ 3/10 (menor melhor).

### O3. Elevar confiança e ativação da North Star
- **KR1:** Conexões Confiáveis por Mês atingem 25.000 (meta de 6 meses, doc 44).
- **KR2:** % de terreiros com Trust Score ≥ 30 sobe a 50%.
- **KR3:** Retenção D30 ≥ 10% (meta doc 43).

### O4. Entregar acessibilidade como qualidade nãonegociável
- **KR1:** Atingir 100% das rotas críticas com 0 violações AA (axe/Lighthouse em CI).
- **KR2:** 6 tarefas críticas concluídas sem ajuda por 5 perfis usuários (inclui idosos) em teste por release.
- **KR3:** Contraste AA em 100% das páginas (ver tabela da doc 95).

---

## 3. Funil Detalhado

Da aquisição à retenção, com conversões-alvo por etapa (metas consolidadas da doc 43):

| Etapa | Definição | Conversão-alvo | Salvaguarda/nota de observação |
|-------|-----------|----------------|-------------------------------|
| **Visitante** | Acessou busca ou perfil público | — | Base |
| **Cadastro** | Criou conta (e-mail/WhatsApp/OAuth) | 5% (visitante→cadastro) | Reduz atrito do step 1 (doc 50) |
| **Primeiro valor** | Salvou 1ª terreiro/ busca útil ou viu 1 perfil completo | 70% dos cadastros em ≤ 3 dias | Onboarding progressivo (doc 94) |
| **Ativação** | Fez a 1ª ação significativa (whatsApp, favoritar, avaliar) | 40% dos que tiveram primeiro valor | Clear CTA (doc 94) |
| **Retenção** | Retorne ao uso (busca, avalia) no período | D1 ≥ 40% · D7 ≥ 20% · D30 ≥ 10% | Conteúdo novo e notificações úteis |

### Conversões-alvo detalhadas (consolidado)
- Visitante → Cadastro: **≥ 5%**
- Cadastro → Primeiro valor: **≥ 70%** em 3 dias
- Primeiro valor → Ativação: **≥ 40%**
- Retenção D1/D7/D30: **≥ 40% / 20% / 10%**
- Cadastro sugerido de terreiro → Reivindicação: **≥ 20%**
- Busca → clique no WhatsApp (sessão): **≥ 12%** (reforça a North Star)

---

## 4. Métricas de Experiência

### 4.1 Tempo e conclusão de tarefa

| Tarefa | Métrica | Meta |
|--------|---------|------|
| Buscar terreiro e ver perfil | Tempo médio até resultado útil | ≤ 30s |
| Entrar em contato (perfil → WhatsApp) | Tempo até ação e nº cliques | ≤ 2 cliques |
| Cadastro de usuário | Tempo médio | ≤ 2 min (doc 94) |
| Cadastro de terreiro (rascunho) | Tempo médio (passo 1) | ≤ 3 min |
| Avaliar um terreiro | Tempo médio e comando | ≤ 1 min |
| Matrícula (evento/visita) | Tempo médio | ≤ 1,5 min |

### 4.2 Tempo até o sucesso (time-to-first-value, TTFV)
- **Definição:** tempo entre o cadastro e a **primeira Conexão Confiável** (doc 44).
- **Meta:** ≤ 3 dias para 50% dos usuários ativos.
- **Impacto:** correlação comprovada com retenção (ver hipótese 1).

### 4.3 Tarefas concluídas sem ajuda e taxa de erro

- **Definição:** % de usuários que completam tarefa crítica sem abrir suporte/ajuda e taxa de erro por campo/tela.
- **Meta:** ≥ 90% sem ajuda; taxa de erro de formulário ≤ 5%.
- **Fonte:** analytics de eventos + pesquisas pós-jornada (CSAT/assistência).

### 4.4 Métricas de satisfação

| Métrica | Definição | Meta |
|---------|-----------|------|
| **NPS** | "Recomendaria a um amigo que busca um terreiro confiável?" | > 50 (doc 43, Q4) |
| **CSAT** | "Satisfeito com X?" pós-tarefa | > 85% |
| **CES (esforço)** | "Qual o esforço para realizar X?" (1=baixo a 10=alto) | ≤ 3 (média) |
| **Churn** | Cancelamento de SaaS / abandono de uso | < 5% mensal (SaaS) |
| **Taxa de rejeição por tela** | Saídas sem interação | Busca ≤ 30%; perfil: monitorar e reduzir |

Instrumentação de feedback: micro-pesquisa discreta pós a cada ação crítica (avaliar, contato, cadastro) para CES e CSAT em linha.

---

## 5. Métricas de Confiança

| Métrica | Definição | Meta |
|---------|-----------|-----|
| **Taxa de verificação concluída** | Terreiros que iniciam vs concluem verificação | ≥ 60% |
| **Tempo de verificação** | Da solicitação à aprovação | ≤ 48h mediano (meta moderação, doc 43) |
| **Respostas a avaliações** | % de avaliações respondidas pelo terreiro em 7 dias | ≥ 40% |
| **Resolução de mediação** | % de mediações (disputa trust) resolvidas + tempo | ≥ 90% resolvidas em ≤ 5 dias |
| **Contra-score** | Não corromper: verificar meta em métricas inversas (seção 7) | — |

Métricas de confiança alimentam o driver "Elevar Trust Score" e a superfície de confiança da doc 94 (seção 3.7).

---

## 6. Instrumentação

### 6.1 Eventos obrigatórios por jornada

Legenda do modelo de evento (aplicar em `packages/api`/`apps/web`): `{event, user_id, session_id, ts, payload}`.

| Jornada | Eventos obrigatórios |
|---------|----------------------|
| **Onboarding** | `visit_landed`, `signup_started`, `signup_completed`, `first_value_reached`, `onboarding_step_completed` |
| **Busca** | `search_typed`, `search_result_click`, `search_filtered`, `search_empty_viewed`, `search_success`, `search_abandoned` |
| **Perfil** | `profile_viewed`, `profile_whatsapp_clicked`, `profile_gallery_opened`, `profile_claim_cta_viewed`, `profile_contact_completed` |
| **Avaliação** | `review_form_open`, `review_submitted`, `review_submission_error`, `review_marked_helpful` |
| **Cadastro terreiro** | `terreiro_form_started`, `terreiro_draft_saved`, `terreiro_submitted`, `terreiro_completezza_warning`, `terreiro_claim_started` |
| **Verificação** | `verification_started`, `verification_document_uploaded`, `verification_completed`, `verification_failed` |
| **Retenção/Confiança** | `session_start`, `session_end`, `first_trusted_connection`, `favorite_added`, `notification_opened` |
| **Feedback** | `posttask_csat_submitted`, `posttask_ces_submitted`, `nps_submitted` |

### 6.2 Dashboards sugeridos

| Dashboard | Componentes |
|-----------|-------------|
| **North Star** (ver doc 44) | TCPM + drivers (usuários ativos, taxa, terreiros TS≥30) |
| **Funil** | Conversões por etapa (seção 3) em tempo real |
| **Experiência** | Tempos de tarefa, CES, CSAT, tarefas sem ajuda, taxa de erro, rejeição por tela |
| **Confiança** | Verificação, respostas a avaliações, mediação |
| **Retenção** | Curvas D1/D7/D30, TTFV, cohort por mês de cadastro |
| **Qualidade** | Core Web Vitals, uptime, NPS (consolidar KPIs da doc 43) |

Ferramenta: iniciar instrumentação com PostHog/Plausible desde o dia 1 (ver doc 24) e evoluir para warehouse/BI conforme doc 71.

### 6.3 Experimentação (A/B)

- **Framework:** verificar uma hipótese por experimento, com pré-registro de métrica primária + métricas inversas.
- **Áreas-piloto:** onboarding de dirigentes, layout da busca, posicionamento do WhatsApp, proposta de avaliação, formato de selo de trust.
- **Tamanho e duração:** quantidade suficiente para poder (ex.: 50% de usuários, 2 semanas) e apenas uma hipótese de cada vez para não confundir atribuição.
- **Pré-registro:** hipótese, público, janela, métricas (primária + secundárias + reversas) aprovadas antes do go.

### 6.4 Reverse metrics (o que não pode piorar)

Ao otimizar qualquer métrica de experiência o time deve proteger estas:

| Otimização | Não pode piorar |
|------------|-----------------|
| Reduzir passos do cadastro | Taxa de rejeição de dados falsos / qualidade dos dados |
| Aumentar taxa de conexão | Denúncias de spam (contra-métrica da doc 44) |
| Reduzir fricção da avaliação | Qualidade/modação das avaliações (rejeição dentro da meta) |
| Acelerar verificação | Falsos positivos (verificação aprovada indevida) |
| Encurtar tempo de tarefa | Taxa de erro de preenchimento |
| Elevar velocidade de verificação | Churn de dirigentes / NPS de dirigentes não piorar |

Limites e gatilhos: se qualquer reverse metric ultrapassar o limite, o experimento é pausado (ver contra-métricas doc 44).

---

## 7. Consolidação com as docs

| Doc | Relação |
|-----|---------|
| 43 | KPIs de base usados como metas de 12 meses (NPS, churn, retenção, contraste) |
| 44 | North Star TCPM — base dos drivers e da O3 |
| 70/71 | Analytics e BI — infra de onde saem estes dashboards |
| 94 | Padrões de experiência que estas métricas tornam mensuráveis (Tempo de tarefa, CES) |
| 95 | Acessibilidade — base do OKR O4 e dos testes com usuários reais |

**Próximo passo:** a doc 97 (Revisão de Arquitetura de Experiência) crítica o conjunto e acrescenta Definition of Ready, validação e riscos.