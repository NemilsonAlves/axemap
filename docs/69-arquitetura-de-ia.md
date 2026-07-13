# 69 — Arquitetura de IA Baseada no Grafo

## Princípios

1. **Graph-first**: toda feature de IA parte do knowledge graph como fonte de verdade
2. **Event-driven**: recomendações e predições são acionadas por eventos, não por polling
3. **Privacy by design**: algoritmos rodam preferencialmente no dispositivo ou em dados anonimizados
4. **LGPD compliance**: usuários podem opt-out de recomendações personalizadas

## Stack de IA

```
┌─────────────────────────────────────────────────────────────────────┐
│                       SERVIÇOS DE IA                                │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐        │
│  │ Recomendação  │  │ Moderação     │  │ Chatbot / RAG     │        │
│  │ Engine        │  │ Automática    │  │ (FAQ + docs)      │        │
│  └──────────────┘  └───────────────┘  └───────────────────┘        │
│                                                                     │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────────────┐        │
│  │ Classificação │  │ Similaridade  │  │ NLP / NER         │        │
│  │ de Conteúdo   │  │ (Text/Graph)  │  │ (entidades)       │        │
│  └──────────────┘  └───────────────┘  └───────────────────┘        │
└────────────────────────┬────────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────────┐
│                    KNOWLEDGE GRAPH + DADOS                          │
│                                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐       │
│  │ PostgreSQL │  │ pgvector  │  │ Redis     │  │ S3/R2     │       │
│  │ (grafos)   │  │ (embedd.) │  │ (cache)   │  │ (docs)    │       │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘       │
└─────────────────────────────────────────────────────────────────────┘
```

## Componente 1: Recommendation Engine

### Tipos de Recomendação

| Tipo | Algoritmo | Dados | Fase |
|------|-----------|-------|------|
| Similaridade de terreiro | Graph-based + Embeddings | Tradição, local, trust score, entidades | MVP |
| Conteúdo personalizado | Collaborative filtering | Histórico de visitas, favoritos, avaliações | Pós-MVP |
| Eventos próximos | Geo + Graph | Localização, tradição do usuário, trust score | MVP |
| Cursos recomendados | Content-based | Progresso, interesses declarados, nível | Pós-MVP |
| "Quem visitou também visitou" | Co-visitation | Logs de visualização | Pós-MVP |
| Marketplace cross-sell | Association rules | Histórico de compras, entidades associadas | Escala |

### Arquitetura da Recommendation Engine

```typescript
// Cada recomendação é um job no BullMQ
interface RecommendationJob {
  userId: string;
  type: 'SIMILAR_TERREIRO' | 'PERSONALIZED_CONTENT' | 'NEARBY_EVENTS' | 'COURSE_SUGGESTION';
  context?: {
    location?: { lat: number; lng: number };
    currentTerreiroId?: string;
    limit?: number;
  };
}

// Processador genérico
class RecommendationProcessor {
  private strategies: Map<RecommendationType, RecommendationStrategy>;

  constructor() {
    this.strategies = new Map();
    this.strategies.set('SIMILAR_TERREIRO', new SimilarTerreiroStrategy());
    this.strategies.set('PERSONALIZED_CONTENT', new PersonalizedContentStrategy());
    this.strategies.set('NEARBY_EVENTS', new NearbyEventsStrategy());
  }

  async process(job: RecommendationJob): Promise<Recommendation[]> {
    const strategy = this.strategies.get(job.type);
    if (!strategy) throw new Error(`Unknown strategy: ${job.type}`);
    return strategy.recommend(job.userId, job.context);
  }
}

interface RecommendationStrategy {
  recommend(userId: string, context?: any): Promise<Recommendation[]>;
}

class SimilarTerreiroStrategy implements RecommendationStrategy {
  async recommend(userId: string, context?: any): Promise<Recommendation[]> {
    // 1. Pega terreiros que o usuário já visitou/avaliou bem
    const positiveTerreiroIds = await this.getPositiveTerreiroIds(userId);

    // 2. Busca terreiros similares (mesma tradição, mesma cidade, trust score alto)
    const similar = await prisma.$queryRaw`
      SELECT t.id, t.nome, t.slug, t.tradicao, t.trust_score,
             1 - (e1.embedding <=> e2.embedding) as similarity
      FROM terreiros t
      JOIN embeddings_terreiro e1 ON e1.terreiro_id = t.id
      JOIN embeddings_terreiro e2 ON e2.terreiro_id = ANY(${positiveTerreiroIds})
      WHERE t.deleted_at IS NULL
        AND t.is_published = true
        AND t.id NOT IN (${positiveTerreiroIds})
      GROUP BY t.id, t.nome, t.slug, t.tradicao, t.trust_score, e1.embedding
      ORDER BY similarity DESC, t.trust_score DESC
      LIMIT 10
    `;

    return similar.map(s => ({
      type: 'TERREIRO',
      id: s.id,
      score: s.similarity * 0.6 + (s.trust_score / 100) * 0.4,
      metadata: { nome: s.nome, slug: s.slug, tradicao: s.tradicao },
    }));
  }
}
```

## Componente 2: Moderação Automática (IA)

### Pipeline de Moderação

```
[Conteúdo Criado]
  → BullMQ: moderation-queue
    → 1. Filtro de spam (regras + ML)
    → 2. Detecção de discurso de ódio (classifier)
    → 3. Verificação de violação LGPD (regex + NER)
    → 4. Sentiment analysis
    → 5. Score final (0-100)
      → > 90: Publicar automaticamente
      → 70-89: Marcar para revisão humana
      → < 70: Bloquear + notificar moderador
```

### Classificadores

```typescript
interface ContentModerationResult {
  spamScore: number;         // 0-1
  hateSpeechScore: number;   // 0-1
  lgpdViolationScore: number;// 0-1
  sentiment: 'positive' | 'negative' | 'neutral';
  overallScore: number;      // 0-100 (quanto maior, mais seguro)
  suggestedAction: 'publish' | 'review' | 'block';
  reasons: string[];
}

// Estratégia: 80% automático, 15% revisão comunidade, 5% revisão humana
class ContentModerator {
  async moderate(content: string): Promise<ContentModerationResult> {
    const [
      spamResult,
      hateSpeechResult,
      lgpdResult,
      sentimentResult,
    ] = await Promise.all([
      this.spamDetector.analyze(content),
      this.hateSpeechClassifier.analyze(content),
      this.lgpdDetector.analyze(content),
      this.sentimentAnalyzer.analyze(content),
    ]);

    const overallScore = this.calculateOverallScore({
      spam: spamResult.score,
      hateSpeech: hateSpeechResult.score,
      lgpd: lgpdResult.score,
    });

    return {
      spamScore: spamResult.score,
      hateSpeechScore: hateSpeechResult.score,
      lgpdViolationScore: lgpdResult.score,
      sentiment: sentimentResult.sentiment,
      overallScore,
      suggestedAction: this.classifyAction(overallScore),
      reasons: [...spamResult.reasons, ...hateSpeechResult.reasons, ...lgpdResult.reasons],
    };
  }

  private classifyAction(score: number): 'publish' | 'review' | 'block' {
    if (score >= 90) return 'publish';
    if (score >= 70) return 'review';
    return 'block';
  }
}
```

## Componente 3: Chatbot (RAG)

### Arquitetura

```
[Usuário pergunta]
  → 1. Embed query (text-embedding-3-small)
  → 2. Busca similaridade em:
     a. pgvector: docs, FAQ, guias
     b. Graph: terreiros, tradições, entidades
  → 3. Concatena contexto (top 5 chunks + top 3 graph nodes)
  → 4. LLM responde com contexto
  → 5. Cita fontes (URIs axemap://)
```

### Tópicos do Chatbot (Fases)

| Fase | Capacidade | Base de Conhecimento |
|------|-----------|---------------------|
| MVP | FAQ básico | Documentos estáticos (100+ Q&As) |
| Pós-MVP | Perguntas sobre terreiros | Graph + Perfis + Avaliações |
| Escala | Assistente completo | Todo o conhecimento da plataforma |

### Exemplo de Query RAG

```typescript
async function answerQuestion(query: string): Promise<Answer> {
  // 1. Embed da pergunta
  const queryEmbedding = await openai.embed(query);

  // 2. Busca chunks relevantes
  const relevantDocs = await prisma.$queryRaw`
    SELECT texto, fonte, 
           1 - (embedding <=> ${queryEmbedding}::vector) as similarity
    FROM document_chunks
    WHERE deleted_at IS NULL
    ORDER BY embedding <=> ${queryEmbedding}::vector
    LIMIT 5
  `;

  // 3. Busca entidades no grafo
  const relevantEntities = await graphService.query({
    match: {
      target: { type: 'Terreiro', conditions: { is_published: true } },
      edge: { type: 'PERTENCE_A', conditions: {} },
    },
    return: ['nome', 'slug', 'descricao_curta'],
    limit: 3,
  });

  // 4. Monta contexto
  const context = [
    ...relevantDocs.map(d => `[${d.fonte}]: ${d.texto}`),
    ...relevantEntities.nodes.map(n => `[Terreiro]: ${n.properties.nome} - ${n.properties.descricao_curta}`),
  ].join('\n\n');

  // 5. Gera resposta
  const response = await openai.chat({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: `Você é um assistente sobre religiões afro-brasileiras. Use apenas o contexto fornecido. Cite fontes. Contexto:\n${context}` },
      { role: 'user', content: query },
    ],
  });

  return {
    text: response,
    sources: relevantDocs.map(d => ({ text: d.texto, source: d.fonte })),
  };
}
```

## Modelos de Embedding

| Dado | Modelo | Dimensão | Banco |
|------|--------|----------|-------|
| Perfil de terreiro | text-embedding-3-small | 1536 | pgvector |
| Avaliações | text-embedding-3-small | 1536 | pgvector |
| Conteúdo educacional | text-embedding-3-small | 1536 | pgvector |
| Mensagens de chat (anonimizadas) | text-embedding-3-small | 1536 | pgvector |
| Imagens (futuro) | CLIP | 512 | pgvector |

## Feature Store (Pós-MVP)

```typescript
// Cache de features para ML
interface FeatureStore {
  // Features de usuário
  userFeatures(userId: string): Promise<{
    totalAvaliacoes: number;
    mediaNotas: number;
    tradicoesVisitadas: string[];
    cidadesFrequentes: string[];
    engajamentoScore: number;  // 0-100
    tempoDesdeUltimoLogin: number;
  }>;

  // Features de terreiro
  terreiroFeatures(terreiroId: string): Promise<{
    trustScore: number;
    totalReviews: number;
    mediaReviews: number;
    totalEventosUltimoMes: number;
    idadeNaPlataforma: number; // dias
    diversidadeLinhas: number; // count de linhas espirituais
    temMarketplace: boolean;
    engajamentoSocial: number; // ações sociais ativas
  }>;

  // Features de contexto
  contextFeatures(userId: string): Promise<{
    horaDoDia: number;
    diaDaSemana: number;
    feriadoProximo: boolean;
    estacao: string;
  }>;
}
```

## Maturidade da IA

```
Fase 1 (MVP)         Fase 2 (3-6m)          Fase 3 (12m+)
─────────────        ────────────            ─────────────
Recomendação         Recomendação            Recomendação
simples (grafos)     + embeddings             + ML híbrido
                     Moderação               Chatbot RAG
Moderação            automática              Predição de
manual               (regras + IA)           churn
                     Chatbot FAQ             Fraude via ML
                     Feature store           NLP avançado
                                              Análise de
                                              sentimentos
                                              Matches
                                              automáticos
```
