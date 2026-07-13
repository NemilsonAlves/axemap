# 74 — Roadmap da Plataforma Inteligente

## Visão 36 Meses

```
Fase 0 (1-3 meses)      Fase 1 (3-6 meses)      Fase 2 (6-12 meses)     Fase 3 (12-36 meses)
─────────────            ─────────────            ─────────────            ─────────────
Operacional              Conectada                Inteligente              Autônoma

[Catálogo]               [Grafo reativo]          [IA em produção]         [Plataforma adaptativa]
• CRUD terreiros         • Recomendação           • Chatbot RAG            • Moderação autônoma
• Busca textual          • Trust Score            • Moderação IA           • Curadoria automática
• Avaliações             • Eventos                • ML em produção         • Marketplace preditivo
• Cadastro               • Gamificação            • Analytics avançado     • Ecossistema aberto
• Busca por localização   • Marketplace v1         • BI estratégico         • API pública para devs
```

## Roadmap Detalhado

### Fase 0 — Operacional (Sprint 1-12, ~3 meses)

**Objetivo:** MVP funcional com cadastro, busca, avaliações e trust score.

| Sprint | Atividades | Marcos |
|--------|-----------|--------|
| 1 | Monorepo + Docker + CI/CD + Postgres + Prisma | Ambiente dev rodando |
| 2 | Auth (RBAC + OAuth) + Cadastro de usuário | Login funcional |
| 3 | CRUD de terreiro + wizard de criação | Primeiro terreiro criado |
| 4 | Busca textual (PostgreSQL tsvector) + Filtros | Busca funcional |
| 5 | Avaliações + Sistema de verificação básico | Reviews funcionando |
| 6 | Trust Score (versão simplificada) + Níveis | Trust Score visível |
| 7 | Mapa (Leaflet + PostGIS) + Geo-search | Mapa com terreiros |
| 8 | Perfil público de terreiro + Compartilhar | Perfil completo |
| 9 | Dashboard do dirigente + Controle de acesso | Dirigente gerencia perfil |
| 10 | Documentação + Guias + Glossário inicial | Primeiro conteúdo |
| 11 | Testes E2E + QA + Ajustes | Plataforma estável |
| 12 | **Lançamento Beta** (cidade piloto: Recife) | Beta fechado |

### Fase 1 — Conectada (Sprint 13-24, ~3 meses)

**Objetivo:** Conectar usuários e terreiros através do grafo.

| Sprint | Atividades | Marcos |
|--------|-----------|--------|
| 13 | Graph Abstraction Layer (PostgreSQL) | Primeira query de grafo |
| 14 | Eventos de domínio + BullMQ + Audit log | 28 eventos implementados |
| 15 | Recomendação de terreiros (similaridade) | "Você também pode gostar" |
| 16 | Gamificação (níveis + badges + pontos) | Usuários com nível |
| 17 | Eventos (criação + RSVP + calendário) | Calendário de eventos |
| 18 | Marketplace v1 (produtos + pedidos) | Primeira venda |
| 19 | Sistema de verificação (5 níveis + docs) | Documentos enviados |
| 20 | Anti-fraude (regras + primeiros modelos) | Proteção ativa |
| 21 | Comunidades (grupos temáticos + fóruns) | Primeiro grupo criado |
| 22 | Gamificação avançada (missões + rankings) | Rankings ativos |
| 23 | Embeds de terreiros (widget para sites) | Terreiro fora da plataforma |
| 24 | **Lançamento público** (5 cidades) | Público geral |

### Fase 2 — Inteligente (Sprint 25-48, ~6 meses)

**Objetivo:** IA e ML em produção.

| Sprint | Atividades | Marcos |
|--------|-----------|--------|
| 25 | Embeddings (pgvector) + busca semântica | "Busca inteligente" |
| 26 | Moderação automática (spam + hate speech) | 80% automático |
| 27 | Chatbot RAG (FAQ + documentação) | Chatbot no ar |
| 28 | Trust Score Predictor (ML inference) | Score preditivo |
| 29 | Analytics (Metabase + dashboards) | Métricas visíveis |
| 30 | BI (relatórios automáticos semanais) | Relatórios no email |
| 31 | Feature Store + MLflow | Primeiro modelo em prod |
| 32 | Churn Predictor (pilot) | Retenção monitorada |
| 33 | Content Tagger (auto-tagging de terreiros) | Tags automáticas |
| 34 | Segmentação dinâmica de usuários | Experiência personalizada |
| 35 | Recomendação híbrida (graph + ML + embeddings) | Recomendação precisa |
| 36 | **Lançamento nacional** (27 estados) | Brasil inteiro |

### Fase 3 — Autônoma (Sprint 49+, ~12-36 meses)

**Objetivo:** Plataforma auto-adaptativa e ecossistema aberto.

| Trimestre | Atividades | Marcos |
|-----------|-----------|--------|
| T1 | Migração para Neo4j (dados de relacionamento) + GraphQL Federation | Grafo nativo |
| T2 | Moderação autônoma (95% automática) + Curadoria automática | Moderação sem humanos |
| T3 | Marketplace preditivo (estoque sugerido, precificação dinâmica) | Marketplace inteligente |
| T4 | API pública para desenvolvedores + SDK | Ecossistema aberto |
| T5 | Expansão internacional (Portugal, África lusófona) | Global |
| T6 | Integração com sistemas de terreiro (gestão financeira, membresia) | SaaS completo |
| T7 | Aplicativo mobile nativo (React Native) | Mobile |
| T8 | Realidade aumentada (guias espirituais no espaço) + Voice interface | Inovação |

## Marcos de Inteligência

```
Trust Score em produção          │ ████░░░░░░░░  (Fase 0)
Grafo reativo                    │ ██████░░░░░░  (Fase 1)
Recomendação semântica           │ ████████░░░░  (Fase 2)
Moderação automática             │ ██████████░░  (Fase 2)
Chatbot com RAG                  │ ██████████░░  (Fase 2)
ML em produção (4+ modelos)      │ ██████████░░  (Fase 2)
Grafo nativo (Neo4j)             │ ████████████  (Fase 3)
API pública                      │ ████████████  (Fase 3)
Moderação autônoma               │ ████████████  (Fase 3)
```

## Dependencies Técnicas por Fase

### Fase 0 → Fase 1
- **Pré-requisito:** Todos os 28 eventos de domínio implementados
- **Pré-requisito:** Sistema de filas (BullMQ) operacional
- **Pré-requisito:** Dados históricos de avaliações para popular o grafo

### Fase 1 → Fase 2
- **Pré-requisito:** Base de dados com 100+ terreiros e 1000+ avaliações
- **Pré-requisito:** Feature Store implementada
- **Pré-requisito:** Infraestrutura de CI/CD para deploy de modelos

### Fase 2 → Fase 3
- **Pré-requisito:** Maturidade dos modelos (acurácia validada)
- **Pré-requisito:** Volume de dados justifica Neo4j
- **Pré-requisito:** Time de ML estabelecido

## Backlog Priorizado para Fase 0

| Prioridade | Feature | Esforço | Impacto | Dependência |
|-----------|---------|---------|---------|-------------|
| P0 | Auth + RBAC | 5 | 100 | — |
| P0 | CRUD Terreiro | 8 | 100 | Auth |
| P0 | Busca textual | 5 | 90 | CRUD |
| P0 | Avaliações | 5 | 85 | Auth, CRUD |
| P0 | Trust Score (simplificado) | 8 | 85 | Avaliações |
| P0 | Mapa (Leaflet + PostGIS) | 5 | 80 | CRUD |
| P1 | Cadastro de eventos | 5 | 70 | CRUD |
| P1 | Galeria de fotos | 3 | 65 | CRUD |
| P1 | Verificação de perfil | 5 | 70 | Trust Score |
| P1 | Dashboard dirigente | 8 | 75 | CRUD |
| P2 | Gamificação | 8 | 60 | Auth |
| P2 | Marketplace v1 | 13 | 50 | CRUD |
| P2 | Comunidades | 8 | 55 | Auth |

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|--------------|---------|-----------|
| Adesão baixa de terreiros | Alta | Crítico | Onboarding presencial nas federações |
| Qualidade baixa dos dados | Alta | Alto | Wizard guiado + curadoria |
| Performance de queries de grafo no PostgreSQL | Média | Alto | CTEs otimizadas + índices + views materializadas |
| Modelos de ML sem dados suficientes | Alta | Médio | Regras manuais até volume adequado |
| Complexidade do Trust Score | Média | Alto | Versão simplificada no MVP |
| Resistência religiosa à plataforma | Média | Crítico | Neutralidade + transparência documentada |
| Concorrência de apps genéricas | Média | Médio | Nicho + conhecimento especializado |
| LGPD (dados sensíveis religiosos) | Alta | Crítico | Consultoria jurídica desde o dia 1 |
