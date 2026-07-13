# 72 — Estratégia de Data Science

## Escopo do Data Science no AxéMap

O time de Data Science não constrói pipelines de produção (isso é ML Engineering). O DS foca em:

1. **Análise exploratória** — entender o comportamento de usuários e terreiros
2. **Modelagem estatística** — hipóteses, correlações, causalidade
3. **Experimentos** — A/B tests, testes de hipótese
4. **Definição de features** — que features usar no ML, como calcular
5. **Validação de métricas** — o que medir e como interpretar
6. **Segmentação** — clusters de usuários, personas comportamentais

## Framework de Experimentação

```
Hipótese → Definição da Métrica → Design do Experimento →
Coleta → Análise → Decisão → Documentação
```

### Template de Hipótese

```markdown
## Hipótese DS-001
**Título:** Perfis com fotos recebem mais visitas
**Data:** 2026-07-01
**Autor:** DS Team

**Hipótese (H1):** Terreiros com foto de perfil têm 30% mais visualizações 
que terreiros sem foto.

**Métrica Primária:** Visualizações de perfil por semana
**Métrica Secundária:** Taxa de contato (whatsapp click)

**Tamanho do Efeito Mínimo:** 15%
**Poder Estatístico:** 80%
**Nível de Significância:** 95%

**Método:** Regressão linear controlando por:
- Trust Score
- Cidade
- Tradição
- Tempo na plataforma

**Resultado:** [Aguardando]
**Decisão:** [Aguardando]
```

## Modelos Estatísticos no MVP

### 1. Correlação Trust Score × Engajamento

```sql
-- Analisar correlação entre Trust Score e métricas de engajamento
SELECT 
  CORR(t.trust_score, v.visualizacoes_semana) as corr_trust_views,
  CORR(t.trust_score, a.media_nota) as corr_trust_rating,
  CORR(t.trust_score, c.total_contatos) as corr_trust_contacts
FROM terreiros t
LEFT JOIN (
  SELECT terreiro_id, 
         COUNT(*) as visualizacoes_semana
  FROM page_views 
  WHERE page_type = 'profile' 
    AND timestamp > NOW() - INTERVAL '7 days'
  GROUP BY terreiro_id
) v ON v.terreiro_id = t.id
LEFT JOIN (
  SELECT terreiro_id, 
         AVG(nota) as media_nota
  FROM avaliacoes
  WHERE deleted_at IS NULL
  GROUP BY terreiro_id
) a ON a.terreiro_id = t.id
LEFT JOIN (
  SELECT terreiro_id, 
         COUNT(*) as total_contatos
  FROM contatos_terreiro
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY terreiro_id
) c ON c.terreiro_id = t.id
WHERE t.deleted_at IS NULL AND t.is_published = true;
```

### 2. Segmentação de Usuários (RFM)

```typescript
// RFM: Recency, Frequency, Monetary (adaptado para plataforma)
interface RFMScore {
  recency: number;   // dias desde última ação
  frequency: number; // ações nos últimos 30 dias
  monetary: number;  // contribuições (avaliações, conteúdo, etc)
}

function calculateRFM(userId: string): RFMSegment {
  const actions = getLast30DaysActions(userId);
  const lastAction = actions[0];

  const recency = daysSince(lastAction.createdAt);
  const frequency = actions.length;
  const monetary = actions.filter(a => a.isContributive).length;

  // Quintis (1-5)
  const r = quintil(recency, [1, 2, 3, 5, 10, Infinity]);
  const f = quintil(frequency, [0, 1, 3, 7, 15, Infinity]);
  const m = quintil(monetary, [0, 0, 1, 3, 7, Infinity]);

  return {
    segment: getSegmentLabel(r, f, m),
    rScore: r,
    fScore: f,
    mScore: m,
  };
}

// Segmentos
// 555: Champions (melhores usuários)
// 554: Loyal Members
// 544: Potential Loyalists
// 311: At-Risk (em risco)
// 111: Lost (perdidos)
// 415: New Champions (novos promissores)
```

### 3. Lifetime Value (LTV) Preliminar

```typescript
interface LTVEstimate {
  predictedLTV: number;  // receita esperada em 12 meses
  confidence: 'high' | 'medium' | 'low';
  factors: {
    tier: 'gratuito' | 'premium';  
    engagementScore: number;
    daysOnPlatform: number;
    terreiroCount: number;  // usuário que cadastrou terreiros
  };
}

function estimateLTV(user: User): LTVEstimate {
  let baseLTV = user.tier === 'premium' ? 600 : 0;  // R$ 50/mês * 12 meses
  let confidence: 'high' | 'medium' | 'low' = 'low';

  // Usuários com alta frequência têm maior LTV
  if (user.totalAvaliacoes > 10 || user.terreirosCadastrados > 0) {
    baseLTV *= 1.5;
    confidence = 'medium';
  }

  // Usuários verificados e com trust score alto
  if (user.isVerified && user.trustScore > 50) {
    baseLTV *= 1.3;
    confidence = 'medium';
  }

  // Usuários com marketplace ativo
  if (user.marketplaceOrders > 0) {
    baseLTV += user.marketplaceOrders * 120;  // ticket médio R$ 100 * 12 meses
    confidence = 'high';
  }

  return { predictedLTV: Math.round(baseLTV), confidence, factors: {} };
}
```

## Pipelines de Data Science

### Pipeline de Análise Exploratória

```
[Evento: Nova funcionalidade lançada]
  → 1. Coleta dados 7 dias antes do lançamento (baseline)
  → 2. Coleta dados 7 dias após o lançamento (tratamento)
  → 3. Gera relatório automático:
     a. Distribuição de uso
     b. Segmentos que mais usaram
     c. Correlação com retention
     d. Anomalias detectadas
  → 4. Publica no Metabase (dashboard da feature)
```

### Pipeline de Segmentação

```
[Batch semanal]
  → 1. Carrega dados de atividades (PostgreSQL)
  → 2. Calcula features (RFM, engajamento, preferências)
  → 3. Aplica K-Means (scikit-learn) para 5 clusters:
     a. Visitantes casuais
     b. Praticantes engajados
     c. Dirigentes ativos
     d. Líderes comunitários
     e. Power users (curadores, verificadores)
  → 4. Salva segmentação na tabela user_segments
  → 5. Dispara jobs de recomendação personalizada
```

## Ferramentas de DS

| Ferramenta | Uso | Fase |
|-----------|-----|------|
| Python + Jupyter | Análise exploratória, experimentos | MVP |
| Pandas + NumPy | Manipulação de dados | MVP |
| Scikit-learn | Clustering, regressão, classificação | MVP |
| Statsmodels | Testes estatísticos, hipóteses | MVP |
| Plotly + Seaborn | Visualização para apresentações | MVP |
| MLflow (futuro) | Rastreamento de experimentos | Pós-MVP |
| Optuna (futuro) | Otimização de hiperparâmetros | Pós-MVP |

## Repositório de Experimentos

```python
# experiments/hipoteses/h001_foto_perfil.py

import pandas as pd
import numpy as np
from scipy import stats
import statsmodels.api as sm
from statsmodels.formula.api import ols

# Carregar dados (via view materializada)
df = pd.read_sql("""
    SELECT 
        t.id,
        t.has_photo,
        pv.visualizacoes_7dias,
        t.trust_score,
        t.cidade,
        t.tradicao,
        EXTRACT(DAY FROM NOW() - t.created_at) as dias_plataforma
    FROM terreiros t
    LEFT JOIN (
        SELECT terreiro_id, COUNT(*) as visualizacoes_7dias
        FROM page_views
        WHERE page_type = 'profile'
          AND timestamp > NOW() - INTERVAL '7 days'
        GROUP BY terreiro_id
    ) pv ON pv.terreiro_id = t.id
    WHERE t.deleted_at IS NULL AND t.is_published = true
""", con=connection)

# Teste t: terreiros com foto vs sem foto
com_foto = df[df['has_photo']]['visualizacoes_7dias'].dropna()
sem_foto = df[~df['has_photo']]['visualizacoes_7dias'].dropna()

t_stat, p_value = stats.ttest_ind(com_foto, sem_foto)
print(f"T-test: t={t_stat:.3f}, p={p_value:.4f}")
print(f"Média com foto: {com_foto.mean():.1f}")
print(f"Média sem foto: {sem_foto.mean():.1f}")

# Regressão linear controlando por confounders
model = ols('visualizacoes_7dias ~ C(has_photo) + trust_score + C(cidade) + C(tradicao) + dias_plataforma', data=df).fit()
print(model.summary())

# Efeito: terreiros com foto têm X% mais visualizações
effect = model.params['C(has_photo)[T.True]']
print(f"Efeito da foto: {effect:.2f} visualizações a mais (controlando por confounders)")
```

## Documentação de Experimentos

Cada experimento é documentado em `docs/experimentos/`:

```markdown
# Experimento: Foto de Perfil e Visualizações
**ID:** EXP-001
**Data:** 2026-08-01
**Autor:** DS Team

## Contexto
Terreiros com foto de perfil parecem receber mais visitas, mas será que é 
causal? Terreiros mais engajados podem ter mais fotos E mais visitas.

## Método
Regressão linear múltipla controlando por: trust score, cidade, tradição, 
tempo de plataforma.

## Resultados
- Efeito bruto: +45% visualizações
- Efeito líquido (controlando): +22% (p < 0.001)
- Correlação foto × trust score: r = 0.31 (moderada)

## Conclusão
Foto de perfil tem efeito causal na atração de visitas. Recomendamos:
1. Tornar upload de foto obrigatório no onboarding
2. Criar campanha "Seu terreiro merece uma foto"
3. Oferecer ajuda para tirar foto (guia de fotografia)

## Ações
- [ ] Product: adicionar prompt de foto no wizard de criação
- [ ] Marketing: campanha de email para terreiros sem foto
- [ ] DS: reavaliar em 3 meses
```
