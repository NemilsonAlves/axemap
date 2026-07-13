# 68 — Estratégia para Busca Semântica

## Evolução da Busca em 3 Fases

```
Fase 1 (MVP)          Fase 2 (3-6 meses)     Fase 3 (12+ meses)
──────────────        ──────────────          ──────────────
Full-text search      + Embeddings            + Graph queries
+ Filtros             + pgvector              + RAG (IA)
+ PostGIS (geo)       + Similaridade          + Linguagem natural
↓                     ↓                       ↓
"terreiro em recife"  "terreiro acolhedor     "quero um terreiro
                      para LGBTQIA+ em        de umbanda perto
                      recife"                 de casa que tenha
                                              gira aberta"
```

## Fase 1: Busca Textual + Filtros (MVP)

```sql
-- Full-text search no PostgreSQL
SELECT 
  t.id, t.nome, t.slug, t.cidade, t.estado,
  ts_rank(to_tsvector('portuguese', t.nome || ' ' || t.descricao_curta || ' ' || t.tradicao), 
          plainto_tsquery('portuguese', $searchQuery)) AS relevance,
  t.trust_score,
  ST_DistanceSphere(t.geo_point, ST_MakePoint($lng, $lat)) AS distancia
FROM terreiros t
WHERE t.deleted_at IS NULL
  AND t.is_published = true
  AND to_tsvector('portuguese', t.nome || ' ' || t.descricao_curta || ' ' || t.tradicao) @@ 
      plainto_tsquery('portuguese', $searchQuery)
  AND (t.cidade ILIKE $cidade OR $cidade IS NULL)
  AND (t.estado = $estado OR $estado IS NULL)
  AND (t.tradicao = $tradicao OR $tradicao IS NULL)
  AND (t.trust_score >= $minScore OR $minScore IS NULL)
ORDER BY (t.trust_score * 0.7 + (1 - (distancia / 100000)) * 0.3) DESC
LIMIT 20;
```

## Fase 2: Embeddings Semânticos (Pós-MVP)

```sql
-- 1. Criar embeddings para terreiros
-- Executado em background (BullMQ) quando perfil é atualizado
INSERT INTO embeddings_terreiro (terreiro_id, embedding, texto_original)
VALUES (
  $terreiroId,
  openai_embed('text-embedding-3-small', $textoCompleto),
  $textoCompleto
);

-- 2. Busca semântica
SELECT 
  t.id, t.nome, t.slug,
  1 - (e.embedding <=> openai_embed('text-embedding-3-small', $query)) AS similarity,
  t.trust_score
FROM terreiros t
JOIN embeddings_terreiro e ON e.terreiro_id = t.id
WHERE t.deleted_at IS NULL AND t.is_published = true
  AND 1 - (e.embedding <=> openai_embed('text-embedding-3-small', $query)) > 0.7
ORDER BY similarity DESC
LIMIT 20;
```

### Texto para Embedding (Composição)

```typescript
function buildEmbeddingText(terreiro: Terreiro): string {
  return [
    terreiro.nome,
    terreiro.descricao_curta,
    terreiro.descricao_longa?.slice(0, 1000),
    `Tradição: ${terreiro.tradicao}`,
    terreiro.linha_espiritual ? `Linha: ${terreiro.linha_espiritual}` : '',
    terreiro.caracteristicas.join(', '),
    `Cidade: ${terreiro.cidade}, ${terreiro.estado}`,
  ].filter(Boolean).join('. ');
}
```

## Fase 3: Graph + RAG (Escala)

```
Busca do usuário: "Quero um terreiro de umbanda em Recife que tenha gira de preto velho"
  → 1. NLP: extrai entidades
     - Tradicao: Umbanda
     - Cidade: Recife
     - Evento: Gira
     - Entidade: Preto Velho
  
  → 2. Graph query
     MATCH (t:Terreiro)-[:PERTENCE_A]->(trad:Tradicao {nome:'Umbanda'}),
           (t)-[:LOCALIZADO_EM]->(c:Cidade {nome:'Recife'}),
           (t)-[:REALIZA]->(e:Evento)-[:RELACIONADO_A]->(ent:Entidade {nome:'Preto Velho'})
     WHERE e.data_inicio > now()
     RETURN t, e
  
  → 3. RAG: complementa com LLM
     "Encontrei 3 terreiros de Umbanda em Recife com gira de Preto Velho:
      1. Terreiro Pai João (Trust Score 85) - gira aos sábados
      2. ..."
```

## Arquitetura da Busca

```
┌────────────────────────────────────────────────────────────┐
│                        FRONTEND                            │
│  [Input de busca] → [Query Processor] → [Resultados]       │
└──────────────────────────┬─────────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────────┐
│                    API GATEWAY                              │
│  /api/v1/busca?q=&filters=&lat=&lng=                       │
└────┬────────────────────┬──────────────────┬────────────────┘
     │                    │                  │
     ▼                    ▼                  ▼
┌────────────┐    ┌──────────────┐   ┌──────────────┐
│ Search     │    │ Graph        │   │ Embeddings   │
│ Service    │    │ Service      │   │ Service      │
│ (FTS)      │    │ (relações)   │   │ (pgvector)   │
├────────────┤    ├──────────────┤   ├──────────────┤
│ PostgreSQL │    │ PostgreSQL   │   │ PostgreSQL   │
│ tsvector   │    │ CTEs recurs. │   │ pgvector     │
└────────────┘    └──────────────┘   └──────────────┘
```

## Pipeline de Indexação

```
[Evento: PerfilAtualizado]
  → BullMQ: search-index-queue
    → 1. Atualiza tsvector no PostgreSQL
    → 2. Recalcula embedding (text-embedding-3-small)
    → 3. Atualiza pgvector
    → 4. (futuro) Atualiza Neo4j
```

## Scoring da Busca

```
Score Final = (FullTextScore × 0.20) + 
              (EmbeddingScore × 0.25) + 
              (GraphScore × 0.15) + 
              (GeoScore × 0.10) + 
              (TrustScore × 0.30)

Onde:
  FullTextScore: relevância do texto (ts_rank)
  EmbeddingScore: similaridade semântica (cosseno)
  GraphScore: relevância baseada em conexões no grafo
  GeoScore: proximidade geográfica (inversamente proporcional)
  TrustScore: confiabilidade do terreiro (0-100 normalizado)
```

## Autocomplete e Sugestões

```typescript
// Sugestões baseadas em:
// 1. Histórico de buscas populares (Redis)
// 2. Nomes de terreiros (PostgreSQL LIKE)
// 3. Cidades e estados
// 4. Tradições e entidades

async function getSuggestions(prefix: string): Promise<Suggestion[]> {
  const cache = await redis.get(`suggestions:${prefix}`);
  if (cache) return JSON.parse(cache);

  const results = await prisma.$queryRaw`
    (SELECT nome, 'terreiro' as tipo FROM terreiros WHERE nome ILIKE ${prefix + '%'} LIMIT 5)
    UNION ALL
    (SELECT nome, 'cidade' as tipo FROM cidades WHERE nome ILIKE ${prefix + '%'} LIMIT 3)
    UNION ALL
    (SELECT nome, 'tradicao' as tipo FROM tradicoes WHERE nome ILIKE ${prefix + '%'} LIMIT 3)
    LIMIT 10
  `;

  await redis.set(`suggestions:${prefix}`, JSON.stringify(results), 'EX', 300);
  return results;
}
```

## Métricas de Busca

| Métrica | Fase 1 | Fase 2 | Fase 3 |
|---------|--------|--------|--------|
| Precisão (relevância dos top 5) | 70% | 85% | 92% |
| Recall (encontrou o que busca?) | 65% | 80% | 90% |
| Tempo médio de resposta | < 200ms | < 500ms | < 1s |
| Taxa de clique no primeiro resultado | 35% | 40% | 45% |
| Zero results rate (buscas sem resultado) | < 15% | < 10% | < 5% |
