# 71 — Estratégia de BI e Relatórios

## Diferença Analytics vs BI

| Analytics | BI |
|-----------|-----|
| Métricas operacionais em tempo real | Relatórios históricos e estratégicos |
| Consumido por produto/engenharia | Consumido por gestão/diretoria |
| Dashboards curtos (dias/semanas) | Relatórios longos (meses/trimestres) |
| Foco em action items | Foco em tendências e decisões |
| Autoatendimento (Metabase) | Curadoria (relatórios preparados) |

## Estrutura de Relatórios de BI

### Relatório Semanal de Operações

```markdown
**Para:** Equipe operacional e produto
**Quando:** Toda segunda-feira 8h
**Formato:** Email + link Metabase
**Conteúdo:**
1. Resumo executivo (3 KPIs principais com variação semanal)
2. Novos terreiros na semana (top 5 cidades)
3. Trust Score médio da base (distribuição por nível)
4. Avaliações pendentes de moderação
5. Bugs e incidentes (últimos 7 dias)
6. Top 10 terreiros mais visitados
```

### Relatório Mensal de Crescimento

```markdown
**Para:** Diretoria e investidores
**Quando:** Dia 5 de cada mês
**Formato:** PDF + deck
**Conteúdo:**
1. Crescimento de base (terreiros e usuários - YoY e MoM)
2. Distribuição geográfica (mapa de calor)
3. Receita (MRR, ticket médio, churn)
4. Trust Score (evolução mensal, distribuição)
5. Engajamento (WAU, MAU, taxa de retenção)
6. Marketplace (GMV, top categorias, top sellers)
7. Comparativo com metas do trimestre
8. Previsão para próximo mês
```

### Relatório Trimestral de Governança

```markdown
**Para:** Conselho e comunidade
**Quando:** Dias 15 de jan/abr/jul/out
**Formato:** PDF público (transparência)
**Conteúdo:**
1. Transparência de moderação (conteúdos removidos, appeals)
2. Impacto social (ações sociais registradas, beneficiados)
3. Trust Score (evolução, denúncias, verificações)
4. Financeiro resumido (receita, despesas, investimento)
5. Privacidade (solicitações LGPD, tempo de resposta)
6. Metas do trimestre anterior vs realizado
7. Metas para próximo trimestre
```

## Modelo de Dados para BI

### Star Schema para Data Warehouse

```sql
-- Tabela Fato: Avaliações
CREATE TABLE fact_avaliacoes (
  id UUID PRIMARY KEY,
  terreiro_id UUID REFERENCES dim_terreiros(id),
  usuario_id UUID REFERENCES dim_usuarios(id),
  data_id INTEGER REFERENCES dim_data(id),
  nota DECIMAL(2,1),
  peso_avaliador DECIMAL(3,2),
  util_count INTEGER,
  created_at TIMESTAMP
);

-- Dimensão: Terreiro
CREATE TABLE dim_terreiros (
  id UUID PRIMARY KEY,
  nome VARCHAR(255),
  slug VARCHAR(255),
  tradicao VARCHAR(100),
  linha_espiritual VARCHAR(100),
  cidade VARCHAR(100),
  estado VARCHAR(50),
  regiao VARCHAR(50),
  trust_score DECIMAL(5,2),
  nivel_trust VARCHAR(20),
  is_verified BOOLEAN,
  is_premium BOOLEAN,
  data_cadastro DATE,
  tempo_plataforma_dias INTEGER
);

-- Dimensão: Usuário
CREATE TABLE dim_usuarios (
  id UUID PRIMARY KEY,
  role VARCHAR(50),
  trust_score DECIMAL(5,2),
  data_cadastro DATE,
  cidade VARCHAR(100),
  estado VARCHAR(50),
  is_verified BOOLEAN,
  total_avaliacoes INTEGER,
);

-- Dimensão: Data
CREATE TABLE dim_data (
  id INTEGER PRIMARY KEY,
  data_completa DATE,
  dia INTEGER,
  mes INTEGER,
  ano INTEGER,
  nome_mes VARCHAR(20),
  trimestre INTEGER,
  semana_ano INTEGER,
  dia_semana INTEGER,
  nome_dia_semana VARCHAR(20),
  is_feriado BOOLEAN,
  feriado_nome VARCHAR(100)
);
```

### Queries de BI Essenciais

```sql
-- Growth Accounting
WITH meses AS (
  SELECT 
    DATE_TRUNC('month', created_at) as mes,
    COUNT(*) as novos_terreiros
  FROM terreiros
  WHERE deleted_at IS NULL
  GROUP BY 1
)
SELECT 
  mes,
  novos_terreiros,
  SUM(novos_terreiros) OVER (ORDER BY mes) as total_acumulado,
  novos_terreiros - LAG(novos_terreiros) OVER (ORDER BY mes) as dif_mes_anterior,
  ROUND(
    (novos_terreiros - LAG(novos_terreiros) OVER (ORDER BY mes))::numeric / 
    NULLIF(LAG(novos_terreiros) OVER (ORDER BY mes), 0) * 100, 1
  ) as crescimento_percentual
FROM meses
ORDER BY mes DESC;

-- Cohort de retenção (usuários que voltam após cadastro)
WITH cohorts AS (
  SELECT 
    DATE_TRUNC('month', u.created_at) as cohort_month,
    u.id as user_id,
    DATE_TRUNC('month', a.created_at) as activity_month
  FROM usuarios u
  LEFT JOIN analytics_acoes a ON a.usuario_id = u.id
  WHERE u.deleted_at IS NULL
)
SELECT 
  cohort_month,
  COUNT(DISTINCT user_id) as cohort_size,
  ROUND(
    COUNT(DISTINCT CASE WHEN activity_month = cohort_month THEN user_id END)::numeric / 
    COUNT(DISTINCT user_id) * 100, 1
  ) as mes_0,
  ROUND(
    COUNT(DISTINCT CASE WHEN activity_month = cohort_month + INTERVAL '1 month' THEN user_id END)::numeric / 
    COUNT(DISTINCT user_id) * 100, 1
  ) as mes_1,
  ROUND(
    COUNT(DISTINCT CASE WHEN activity_month = cohort_month + INTERVAL '2 month' THEN user_id END)::numeric / 
    COUNT(DISTINCT user_id) * 100, 1
  ) as mes_2,
  ROUND(
    COUNT(DISTINCT CASE WHEN activity_month = cohort_month + INTERVAL '3 month' THEN user_id END)::numeric / 
    COUNT(DISTINCT user_id) * 100, 1
  ) as mes_3
FROM cohorts
GROUP BY cohort_month
ORDER BY cohort_month DESC;
```

## Alertas Automáticos (Metabase + Webhook)

| Alerta | Condição | Canal | Destinatário |
|--------|----------|-------|-------------|
| Queda de tráfego | WAU < -20% vs semana anterior | Slack | Produto |
| Pico de denúncias | Denúncias > 5x a média | Slack + Email | Moderação |
| Queda de Trust Score | Média da base < 30 | Slack | Curadores |
| Bug crítico | Erros 5xx > 1% das requisições | PagerDuty | Engenharia |
| Crescimento suspeito | Novos cadastros > 10x a média | Slack | Anti-fraude |
| Meta atingida | Número de terreiros verificados ≥ meta trimestral | Slack + Email | Todos |

## ETL Simples (Sem Ferramenta Externa)

Para evitar complexidade de ferramentas externas no MVP:

```typescript
@Cron(CronExpression.EVERY_HOUR)
async function refreshMaterializedViews(): Promise<void> {
  const views = [
    'mv_terreiros_por_cidade',
    'mv_engajamento_semanal',
    'mv_crescimento_base',
    'mv_funil_conversao',
  ];

  for (const view of views) {
    await prisma.$executeRawUnsafe(
      `REFRESH MATERIALIZED VIEW CONCURRENTLY ${view}`
    );
  }
}

@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async function generateDailyMetrics(): Promise<void> {
  // 1. Computa métricas do dia anterior
  // 2. Salva em tabela de métricas históricas
  // 3. Dispara alertas se thresholds forem atingidos
  // 4. Atualiza dashboards
}

@Cron('0 8 * * 1') // toda segunda 8h
async function generateWeeklyReport(): Promise<void> {
  // 1. Coleta dados da view materializada
  // 2. Monta relatório em formato estruturado
  // 3. Envia para fila de email
  // 4. Publica no Metabase
}
```

## Ferramentas por Fase

| Fase | Ferramenta | Capacidade |
|------|-----------|-----------|
| MVP | Metabase (self-hosted) | Dashboards PostgreSQL + alertas |
| Pós-MVP | Metabase + dbt | Transformações, linhagem, testes |
| Escala | Metabase + dbt + ClickHouse (opcional) | OLAP para grandes volumes |
