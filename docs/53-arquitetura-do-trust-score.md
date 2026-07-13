# 53 — Arquitetura do Trust Score

## Visão Geral

O Trust Score é um **módulo independente** dentro do backend, consumindo eventos de domínio e expondo APIs REST + GraphQL. Sua arquitetura é modular, extensível e completamente transparente.

## Componentes da Arquitetura

```
┌────────────────────────────────────────────────────────────┐
│                   TRUST SCORE MODULE                        │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 TRUST SCORE CALCULATOR                │   │
│  │                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │ Completeza   │  │ Verificação  │                   │   │
│  │  │ Calculator   │  │ Calculator   │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │ Atualização  │  │ Reputação    │                   │   │
│  │  │ Calculator   │  │ Calculator   │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │ Histórico    │  │ Social       │                   │   │
│  │  │ Calculator   │  │ Calculator   │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────┐ ┌────────────────────────┐     │
│  │   Event Handler        │ │   Score Orquestrator   │     │
│  │   (escuta eventos)     │ │   (coordena cálculos)  │     │
│  └────────────────────────┘ └────────────────────────┘     │
│                                                             │
│  ┌────────────────────────┐ ┌────────────────────────┐     │
│  │   Trust Score Logger   │ │   Notification Sender  │     │
│  │   (audit trail)        │ │   (alerta mudanças)    │     │
│  └────────────────────────┘ └────────────────────────┘     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│ │  API (REST + GraphQL)                                │   │
│ │  - GET /trust-score/:id                              │   │
│ │  - GET /trust-score/:id/historico                    │   │
│ │  - GET /trust-score/:id/ranking                      │   │
│ │  - POST /trust-score/recalcular (admin)              │   │
│ └─────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

## Cada Calculator como Módulo Independente

### Interface do Calculator

```typescript
interface TrustScoreCalculator {
  /** Nome único do calculador */
  name: string;
  
  /** Peso no score final (0.0 - 1.0) */
  weight: number;
  
  /** Calcula o score do componente (0.0 - 1.0) */
  calculate(terreiroId: string, metrics: TerreiroMetrics): Promise<ComponentResult>;
  
  /** Retorna os fatores que compõem este cálculo */
  getFactors(terreiroId: string): Promise<Factor[]>;
  
  /** Retorna dicas de melhoria para o dirigente */
  getImprovementTips(terreiroId: string): Promise<Tip[]>;
}

interface ComponentResult {
  score: number;          // 0.0 - 1.0
  factors: Factor[];      // Fatores individuais
  metadata: Record<string, any>;
}

interface Factor {
  name: string;
  value: number;
  weight: number;
  max: number;
  tip?: string;           // Dica contextual
}
```

### Calculador 1: Completeza

```typescript
class CompletezaCalculator implements TrustScoreCalculator {
  name = 'completeza';
  weight = 0.25;

  async calculate(terreiroId: string, metrics: TerreiroMetrics) {
    const todosCampos = this.getAllProfileFields();
    const preenchidos = await this.countFilledFields(terreiroId);
    const completeza = preenchidos / todosCampos.length;
    return {
      score: completeza,
      factors: [
        { name: 'Informações básicas', value: camposBasicos, weight: 0.3, max: 10 },
        { name: 'Contato e redes', value: camposContato, weight: 0.2, max: 8 },
        { name: 'Endereço', value: endereco ? 1 : 0, weight: 0.15, max: 6 },
        { name: 'Fotos', value: fotos.length, weight: 0.2, max: 10 },
        { name: 'Horários', value: horarios.length, weight: 0.15, max: 6 },
      ],
      metadata: { totalFields: todosCampos.length, filled: preenchidos }
    };
  }

  getImprovementTips(terreiroId: string) {
    return [
      { factor: 'fotos', tip: 'Adicione pelo menos 3 fotos do terreiro para aumentar a confiança' },
      { factor: 'horarios', tip: 'Preencha os horários de funcionamento para visitantes' },
    ];
  }
}
```

### Calculador 2: Verificação

```typescript
class VerificacaoCalculator implements TrustScoreCalculator {
  name = 'verificacao';
  weight = 0.25;

  async calculate(terreiroId: string) {
    const selos = await this.getSelos(terreiroId);
    const selosPossiveis = ['whatsapp', 'email', 'endereco', 'identidade', 'fotos', 'premium'];
    const score = selos.length / selosPossiveis.length;
    return {
      score,
      factors: selosPossiveis.map(selo => ({
        name: selo,
        value: selos.includes(selo) ? 1 : 0,
        weight: 1 / selosPossiveis.length,
        max: 1
      }))
    };
  }
}
```

### Calculador 3: Atualização

```typescript
class AtualizacaoCalculator implements TrustScoreCalculator {
  name = 'atualizacao';
  weight = 0.15;

  async calculate(terreiroId: string, metrics: TerreiroMetrics) {
    const diasDesdeAtualizacao = metrics.diasDesdeUltimaAtualizacao;
    const diasDesdeUltimoEvento = metrics.diasDesdeUltimoEvento;
    const diasDesdeLogin = metrics.diasDesdeUltimoLogin;
    
    // Penalidade progressiva
    const scoreAtualizacao = Math.max(0, 1 - (diasDesdeAtualizacao / 180));
    const scoreEvento = diasDesdeUltimoEvento < 30 ? 1 : Math.max(0, 1 - (diasDesdeUltimoEvento - 30) / 150);
    const scoreLogin = Math.max(0, 1 - (diasDesdeLogin / 90));
    
    const finalScore = (scoreAtualizacao * 0.4) + (scoreEvento * 0.35) + (scoreLogin * 0.25);
    return { score: finalScore, factors: [...] };
  }
}
```

### Calculador 4: Reputação

```typescript
class ReputacaoCalculator implements TrustScoreCalculator {
  name = 'reputacao';
  weight = 0.20;

  async calculate(terreiroId: string, metrics: TerreiroMetrics) {
    const avaliacoes = await this.getAvaliacoes(terreiroId);
    if (avaliacoes.length === 0) return { score: 0, factors: [{ name: 'sem_avaliacoes', value: 0, weight: 1, max: 0 }] };
    
    // Média ponderada pelo peso do avaliador
    let somaPonderada = 0;
    let somaPesos = 0;
    for (const av of avaliacoes) {
      somaPonderada += av.nota * av.pesoAvaliador;
      somaPesos += av.pesoAvaliador;
    }
    const mediaPonderada = somaPonderada / somaPesos;
    const score = mediaPonderada / 5; // Normaliza para 0-1
    
    // Bônus por volume de avaliações
    const volumeBonus = Math.min(avaliacoes.length / 50, 1) * 0.1; // Até +10%
    
    return {
      score: Math.min(score + volumeBonus, 1),
      factors: [
        { name: 'media_avaliacoes', value: mediaPonderada, weight: 0.6, max: 5 },
        { name: 'volume_avaliacoes', value: avaliacoes.length, weight: 0.4, max: 50 },
      ]
    };
  }
}
```

## Score Orquestrator

```typescript
class TrustScoreOrquestrator {
  private calculators: TrustScoreCalculator[];

  async recalcular(terreiroId: string, motivo: string): Promise<TrustScoreResult> {
    const metrics = await this.loadMetrics(terreiroId);
    
    let scoreFinal = 0;
    const components: ComponentResult[] = [];

    for (const calc of this.calculators) {
      const result = await calc.calculate(terreiroId, metrics);
      scoreFinal += result.score * calc.weight;
      components.push(result);
    }

    // Aplica penalidades se houver
    const penalties = await this.calculatePenalties(terreiroId);
    scoreFinal = Math.max(0, scoreFinal - penalties);

    // Arredonda para 2 casas
    scoreFinal = Math.round(scoreFinal * 100);
    
    // Determina nível
    const nivel = this.determineLevel(scoreFinal);

    // Salva log
    await this.saveLog(terreiroId, scoreFinal, components, nivel, motivo);

    // Verifica mudança de nível
    const nivelAnterior = await this.getPreviousLevel(terreiroId);
    if (nivel !== nivelAnterior) {
      await this.eventEmitter.emit('NivelConfiancaAlterado', { terreiroId, nivelAnterior, nivel });
    }

    return { score: scoreFinal, nivel, components };
  }
}
```

## Penalidades

```typescript
async calculatePenalties(terreiroId: string): Promise<number> {
  const denunciasConfirmadas = await this.countDenunciasConfirmadas(terreiroId);
  const sinalizacoesAtivas = await this.countSinalizacoesAtivas(terreiroId);
  
  // Cada denúncia confirmada: -0.05 (5 pontos no score 0-100)
  // Cada sinalização ativa: -0.02
  return (denunciasConfirmadas * 0.05) + (sinalizacoesAtivas * 0.02);
}
```

## Cache e Performance

| Estratégia | Detalhe |
|-----------|---------|
| **Score em cache** | `terreiros.trust_score` é atualizado no recalculo |
| **Métricas em cache** | `metricas_terreiro` evita consultas pesadas |
| **Recalculo em fila** | BullMQ fila dedicada, sem bloquear requests |
| **Batch processing** | Recalculo em lote (manutenção, 1x/dia) para consistência |
| **Redis** | Score e nível cacheados por 5 minutos (consulta rápida) |

## Transparência (Endpoint)

```json
GET /api/v1/terreiros/{slug}/trust-score

{
  "terreiro": "terreiro-pai-joao",
  "trustScore": 72,
  "nivel": "confiavel",
  "nivelAnterior": "estabelecido",
  "ultimoRecalculo": "2026-07-13T15:00:00Z",
  "components": {
    "completeza": { "score": 85, "peso": 0.25, "contribuicao": 21.25, "fatores": [...] },
    "verificacao": { "score": 70, "peso": 0.25, "contribuicao": 17.50, "fatores": [...] },
    "atualizacao": { "score": 60, "peso": 0.15, "contribuicao": 9.00, "fatores": [...] },
    "reputacao": { "score": 80, "peso": 0.20, "contribuicao": 16.00, "fatores": [...] },
    "historico": { "score": 65, "peso": 0.10, "contribuicao": 6.50, "fatores": [...] },
    "social": { "score": 50, "peso": 0.05, "contribuicao": 2.50, "fatores": [...] }
  },
  "penalidades": { "total": -0.25, "denuncias": 1, "sinalizacoes": 0 },
  "dicas": [
    "Adicione fotos do terreiro para aumentar a completeza",
    "Publique eventos para melhorar o score de atualização",
    "Participe de ações sociais para o componente social"
  ],
  "algoritmoUrl": "https://axemap.com.br/transparencia/trust-score"
}
```
