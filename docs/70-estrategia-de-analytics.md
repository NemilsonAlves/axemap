# 70 — Estratégia de Analytics

## Stack de Analytics

```
┌─────────────────────────────────────────────────────────────────────┐
│                     CAMADA DE APRESENTAÇÃO                          │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Metabase (self-hosted)                                    │     │
│  │  • Dashboards executivos                                   │     │
│  │  • Relatórios semanais/mensais                             │     │
│  │  • Alertas configuráveis                                   │     │
│  │  • Embed via iframe no admin                               │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────┐  ┌────────────────────────────┐     │
│  │  Backend (NestJS)          │  │  Frontend (Next.js)        │     │
│  │  • Analytics Module        │  │  • PostHog (events)        │     │
│  │  • Eventos de domínio      │  │  • Dashboards internos     │     │
│  │  • Export CSV/JSON         │  │  • Métricas de uso         │     │
│  └────────────────────────────┘  └────────────────────────────┘     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      CAMADA DE PROCESSAMENTO                        │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  PostgreSQL (agregações via materialized views)            │     │
│  │  • Refresh automático (cron 5-60 min)                     │     │
│  │  • Histórico retido por 24 meses                          │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  Redis (contadores em tempo real)                          │     │
│  │  • Usuários online                                         │     │
│  │  • Visualizações do dia                                    │     │
│  │  • Buscas recentes                                         │     │
│  └────────────────────────────────────────────────────────────┘     │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐     │
│  │  BullMQ (processamento assíncrono)                         │     │
│  │  • analytics-queue: agrega eventos em lote                 │     │
│  │  • export-queue: gera relatórios CSV                      │     │
│  └────────────────────────────────────────────────────────────┘     │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
┌────────────────────────────────▼────────────────────────────────────┐
│                      CAMADA DE COLETA                               │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ PostHog      │  │ Domínio      │  │ Server Logs  │              │
│  │ (frontend)   │  │ Events       │  │ (API)        │              │
│  │ • Page views │  │ • Domain     │  │ • 4xx/5xx   │              │
│  │ • Cliques    │  │   Events     │  │ • Latência  │              │
│  │ • Sessions   │  │ • Audit log  │  │ • Erros     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────────────────────────────────────────┘
```

## Eventos de Analytics

### Eventos de Frontend (PostHog)

```typescript
// Todos os eventos de frontend seguem o padrão:
// [ação]_[entidade]
// Ex: page_viewed, terreiro_searched, profile_clicked

const FRONTEND_EVENTS = {
  PAGE_VIEW: 'page_viewed',
  SEARCH: 'terreiro_searched',
  SEARCH_FILTER: 'search_filter_applied',
  PROFILE_VIEW: 'profile_viewed',
  PROFILE_FAVORITE: 'profile_favorited',
  PROFILE_SHARE: 'profile_shared',
  REVIEW_CREATED: 'review_created',
  EVENT_RSVP: 'event_rsvp',
  COURSE_ENROLL: 'course_enrolled',
  MARKETPLACE_VIEW: 'product_viewed',
  MARKETPLACE_CART: 'product_added_to_cart',
  MARKETPLACE_PURCHASE: 'purchase_completed',
  CONTENT_READ: 'content_read',
  GROUP_JOIN: 'group_joined',
  USER_SIGNUP: 'user_signed_up',
  USER_LOGIN: 'user_logged_in',
  MAP_INTERACTION: 'map_interaction',
} as const;
```

### Eventos de Domínio (Backend → BullMQ → Analytics)

```typescript
// Eventos de backend disparam jobs de analytics
const ANALYTICS_EVENTS = {
  TERREIRO_CREATED: 'analytics.terreiro.created',
  TERREIRO_VERIFIED: 'analytics.terreiro.verified',
  USER_MILESTONE: 'analytics.user.milestone',     // ex: 100ª avaliação
  MARKETPLACE_ORDER: 'analytics.marketplace.order',
  TRUST_SCORE_CHANGE: 'analytics.trustscore.changed',
  ENGAGEMENT_PEAK: 'analytics.engagement.peak',   // horário de pico
} as const;
```

## Views Materializadas (Agregações)

```sql
-- 1. Visão geral de terreiros por cidade
CREATE MATERIALIZED VIEW mv_terreiros_por_cidade AS
SELECT 
  cidade,
  estado,
  COUNT(*) as total_terreiros,
  COUNT(*) FILTER (WHERE is_verified) as terreiros_verificados,
  ROUND(AVG(trust_score), 1) as media_trust_score,
  COUNT(*) FILTER (WHERE trust_score >= 70) as top_terreiros
FROM terreiros
WHERE deleted_at IS NULL AND is_published = true
GROUP BY cidade, estado;

REFRESH MATERIALIZED VIEW mv_terreiros_por_cidade;

-- 2. Engajamento semanal
CREATE MATERIALIZED VIEW mv_engajamento_semanal AS
SELECT 
  DATE_TRUNC('week', created_at) as semana,
  COUNT(DISTINCT usuario_id) as usuarios_ativos,
  COUNT(*) as total_acoes,
  COUNT(*) FILTER (WHERE tipo = 'avaliacao') as avaliacoes,
  COUNT(*) FILTER (WHERE tipo = 'favorito') as favoritos,
  COUNT(*) FILTER (WHERE tipo = 'visualizacao') as visualizacoes
FROM analytics_acoes
WHERE created_at >= NOW() - INTERVAL '6 meses'
GROUP BY DATE_TRUNC('week', created_at)
ORDER BY semana DESC;

-- 3. Crescimento de base
CREATE MATERIALIZED VIEW mv_crescimento_base AS
SELECT 
  DATE_TRUNC('month', created_at) as mes,
  COUNT(*) as novos_terreiros,
  COUNT(*) FILTER (WHERE is_verified) as novos_verificados,
  SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as total_acumulado
FROM terreiros
WHERE deleted_at IS NULL
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY mes DESC;

-- 4. Funil de conversão
CREATE MATERIALIZED VIEW mv_funil_conversao AS
WITH visitantes AS (
  SELECT 
    DATE_TRUNC('day', timestamp) as dia,
    COUNT(DISTINCT user_id) as visitantes_unicos
  FROM page_views
  WHERE page_type = 'search'
  GROUP BY 1
),
visualizacoes AS (
  SELECT 
    DATE_TRUNC('day', pv.timestamp) as dia,
    COUNT(DISTINCT pv.user_id) as perfis_vistos
  FROM page_views pv
  JOIN pages p ON pv.page_id = p.id
  WHERE p.page_type = 'profile'
  GROUP BY 1
),
contato AS (
  SELECT 
    DATE_TRUNC('day', created_at) as dia,
    COUNT(DISTINCT usuario_id) as entrou_em_contato
  FROM contatos_terreiro
  GROUP BY 1
)
SELECT 
  v.dia,
  v.visitantes_unicos,
  COALESCE(vs.perfis_vistos, 0) as perfis_vistos,
  COALESCE(c.entrou_em_contato, 0) as entrou_em_contato,
  CASE WHEN v.visitantes_unicos > 0 
       THEN ROUND(COALESCE(vs.perfis_vistos, 0)::numeric / v.visitantes_unicos * 100, 1) 
       ELSE 0 END as taxa_visualizacao,
  CASE WHEN COALESCE(vs.perfis_vistos, 0) > 0 
       THEN ROUND(COALESCE(c.entrou_em_contato, 0)::numeric / vs.perfis_vistos * 100, 1) 
       ELSE 0 END as taxa_contato
FROM visitantes v
LEFT JOIN visualizacoes vs ON v.dia = vs.dia
LEFT JOIN contato c ON v.dia = c.dia
ORDER BY v.dia DESC;
```

## Dashboards por Perfil

| Perfil | Dashboard | Frequência de Refresh |
|--------|-----------|----------------------|
| Super Admin | Visão geral (crescimento, receita, engajamento, trust score) | 5 min |
| Moderador | Conteúdo reportado, fila de moderação, terreiros pendentes | 1 min |
| Curator | Qualidade de perfis, completude, distribuição geográfica | 15 min |
| Dirigente | Visitas ao perfil, avaliações, engajamento, conversões | 1h |
| Equipe Produto | Funil, retenção, features mais usadas, NPS | 24h |
| Financeiro | Receita, MRR, churn, LTV, cobranças | 24h |
| Marketing | CAC, canais de aquisição, SEO, conversão | 1h |

## Métricas de Produto (OKR Tracking)

```typescript
const PRODUCT_METRICS = {
  // North Star
  TCPM: 'trusted_connections_per_month',

  // Aquisição
  NOVOS_TERREIROS: 'novos_terreiros_por_semana',
  NOVOS_USUARIOS: 'novos_usuarios_por_semana',
  TAXA_CONVERSION_SIGNUP: 'taxa_conversao_signup',

  // Ativação
  PERFIL_COMPLETO: 'taxa_perfil_completo',           // % com descrição + foto + contato
  PRIMEIRA_AVALIACAO: 'dias_para_primeira_avaliacao',

  // Engajamento
  USUARIOS_ATIVOS_SEMANAIS: 'wau',
  AVALIACOES_POR_TERREIRO: 'avaliacoes_por_terreiro',
  TEMPO_MEDIO_SESSAO: 'tempo_medio_sessao',

  // Receita
  MRR: 'mrr',
  TICKET_MEDIO: 'ticket_medio_marketplace',
  TAXA_CONVERSAO_PREMIUM: 'taxa_conversao_premium',

  // Satisfação
  NPS: 'nps',
  TAXA_RECOMENDACAO: 'taxa_recomendacao',
};
```

## Exportação de Dados

```typescript
@Injectable()
class AnalyticsExportService {
  async exportCSV({
    table,
    filters,
    dateRange,
  }: ExportRequest): Promise<Buffer> {
    const job = await this.bullQueue.add('analytics-export', {
      table, filters, dateRange,
      format: 'csv',
    });

    // Job processa em background e salva no R2
    // Usuário recebe notificação quando pronto
    return job.finished();
  }

  // Relatórios automáticos
  async scheduleWeeklyReports(): Promise<void> {
    // Segunda 8h: relatório semanal para admin
    // Dia 1 do mês: relatório mensal para dirigentes premium
    // Trimestral: relatório de governança
  }
}
```

## Privacidade e Retenção

| Dado | Retenção | Anonimização |
|------|----------|-------------|
| Eventos de página (PostHog) | 12 meses | Anonimizado após 30 dias |
| Eventos de domínio | 24 meses | Agregado após 12 meses |
| Dados financeiros | 60 meses (LGPD) | Mantido completo |
| Logs de acesso | 6 meses | Anonimizado após 3 meses |
| Agregações (MV) | Permanente | Apenas dados agregados |
| Exportações de relatórios | 90 dias | Auto-delete via R2 lifecycle |
