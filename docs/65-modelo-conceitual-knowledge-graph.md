# 65 — Modelo Conceitual do Knowledge Graph

## Visão Geral

O Knowledge Graph (KG) do AxéMap é a **memória institucional** da plataforma. Ele representa não apenas dados, mas os **significados e relacionamentos** entre cada entidade do ecossistema.

> "Não queremos apenas armazenar dados. Queremos entender como todo o ecossistema se relaciona."

## Princípios Arquiteturais

1. **Graph-First Thinking:** Toda entidade é um nó. Toda relação é uma aresta. Mesmo que o armazenamento atual seja relacional (PostgreSQL), o modelo mental é de grafo.
2. **Evolução Preparada:** O schema relacional é uma projeção do grafo. Quando a escala exigir, a migração para Neo4j/Memgraph será natural.
3. **Imutabilidade de Relações:** Uma vez criada, uma relação nunca é apagada — apenas marcada como inativa (soft delete). O histórico de relacionamentos é parte do conhecimento.
4. **Contexto Rico:** Cada relação pode ter propriedades (peso, timestamp, contexto, confiança).

## Camadas do Knowledge Graph

```
┌─────────────────────────────────────────────────────────┐
│                 APLICAÇÕES (Consumidores)                │
│  Busca     Recomendação    IA       Analytics    BI     │
│  Semântica                    Chatbot                     │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│                  KNOWLEDGE GRAPH                         │
│                                                          │
│  ┌───────────────┐          ┌───────────────┐            │
│  │  Nós (Nodes)  │◄────────►│ Arestas (Edges)│           │
│  │               │          │               │            │
│  │ 22 tipos de   │          │ 40+ tipos de  │            │
│  │  entidades    │          │  relações     │            │
│  └───────────────┘          └───────────────┘            │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │            PROPRIEDADES (Properties)              │    │
│  │  Cada nó e aresta pode ter atributos             │    │
│  └──────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────┐
│               ARMAZENAMENTO (Físico)                     │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                    │
│  │  PostgreSQL   │    │   Neo4j      │  (futuro)          │
│  │  (atual)      │───►│  (escala)    │                    │
│  │               │    │               │                    │
│  │  • Tabelas    │    │  • Nós       │                    │
│  │  • Índices    │    │  • Relações  │                    │
│  │  • Views      │    │  • Queries   │                    │
│  └──────────────┘    └──────────────┘                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐    │
│  │  Camada de Abstração (Graph Abstraction Layer)    │    │
│  │  GraphQL + Views PostgreSQL + PGQ (futuro)        │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

## Por que Graph-First no PostgreSQL?

| Razão | Explicação |
|-------|-----------|
| **Zero infra adicional no MVP** | PostgreSQL com índices e CTEs já suporta queries de grafo |
| **Consistência transacional** | Relacionamentos críticos (ex: ownership) precisam de ACID |
| **Migração suave** | Dados relacionais bem normalizados são fáceis de exportar para grafos |
| **pgvector** | Embeddings direto no banco para busca semântica |
| **PGQ (futuro)** | Extensão de grafos do PostgreSQL (em desenvolvimento) |

## Graph Abstraction Layer (GAL)

Para que o código não dependa diretamente do banco, criamos uma camada de abstração:

```typescript
interface GraphNode {
  id: string;
  type: NodeType;    // 'terreiro', 'usuario', 'tradicao', ...
  labels: string[];  // ['terreiro', 'verificado', 'recife']
  properties: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface GraphEdge {
  id: string;
  type: EdgeType;    // 'FREQUENTA', 'REALIZA', 'PERTENCE_A', ...
  sourceId: string;   // node id
  targetId: string;   // node id
  properties: Record<string, any>;  // { peso: 0.8, desde: '2024-01-01' }
  createdAt: Date;
}

interface GraphQuery {
  match: {
    source?: { type: NodeType; conditions?: Record<string, any> };
    target?: { type: NodeType; conditions?: Record<string, any> };
    edge?: { type: EdgeType; conditions?: Record<string, any> };
    maxDepth?: number;
  };
  return: string[];  // campos a retornar
  orderBy?: string;
  limit?: number;
}

interface GraphRepository {
  getNode(id: string): Promise<GraphNode>;
  getNeighbors(nodeId: string, edgeTypes?: EdgeType[]): Promise<GraphNode[]>;
  findPath(sourceId: string, targetId: string, maxDepth: number): Promise<GraphEdge[]>;
  query(query: GraphQuery): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  createNode(node: GraphNode): Promise<GraphNode>;
  createEdge(edge: GraphEdge): Promise<GraphEdge>;
}
```

## Visualização do Grafo (Conceitual)

```
                         ┌─────────────┐
                         │   USUÁRIO   │
                         └──────┬──────┘
                                │ AVALIOU
                                ▼
              ┌───────────────────────────────────────┐
              │              TERREIRO                  │
              └──┬───────┬───────┬───────┬────────────┘
                 │       │       │       │
       PERTENCE_A│   REALIZA │  LOCALIZADO_EM  │ OFERECE
                 ▼       ▼       ▼            ▼
          ┌─────────┐ ┌───────┐ ┌────────┐ ┌──────────┐
          │TRADIÇÃO │ │EVENTO │ │CIDADE  │ │  CURSO   │
          └─────────┘ └───────┘ └────────┘ └──────────┘
                               │
                        PERTENCE_AO_ESTADO
                               ▼
                          ┌─────────┐
                          │ ESTADO  │
                          └─────────┘
```

## Estratégia de População do Grafo

### Fase 1: PostgreSQL (MVP)
- Tabelas relacionais com chaves estrangeiras
- CTEs recursivas (WITH RECURSIVE) para queries de até 2 níveis
- Views materializadas para caminhos frequentes
- Índices GIN para JSONB (propriedades flexíveis)

### Fase 2: Híbrido (Pós-MVP)
- PostgreSQL para dados transacionais (escrita)
- Neo4j para queries de leitura do grafo (réplica eventualmente consistente)
- Sincronização via eventos de domínio (BullMQ)

### Fase 3: Graph Native (Escala)
- Neo4j como banco primário para dados de relacionamento
- PostgreSQL para dados transacionais e financeiros
- API unificada via GraphQL Federation

## Casos de Uso do Grafo

| Caso | Query no Grafo | Fase |
|------|---------------|------|
| "Terreiros de Umbanda em Recife" | `MATCH (t:Terreiro)-[:PERTENCE_A]->(trad:Tradicao {nome:'Umbanda'}), (t)-[:LOCALIZADO_EM]->(c:Cidade {nome:'Recife'})` | MVP |
| "Eventos de Caboclo Pena Branca" | `MATCH (e:Evento)-[:RELACIONADO_A]->(ent:Entidade {nome:'Caboclo Pena Branca'})` | MVP |
| "Cursos de desenvolvimento mediúnico no RJ" | `MATCH (c:Curso)-[:PERTENCE_A]->(t:Terreiro)-[:LOCALIZADO_EM]->(cid:Cidade)-[:PERTENCE_AO]->(est:Estado {sigla:'RJ'})` | Pós-MVP |
| "Caminho de um usuário na plataforma" | `MATCH path = (u:Usuario {id:'X'})-[:AVALIOU|FAVORITOU|PARTICIPOU*1..3]->() RETURN path` | Pós-MVP |
| "Comunidade em torno de uma tradição" | `MATCH (t:Tradicao {nome:'Jurema'})<-[:PERTENCE_A]-(terreiro)<-[:FREQUENTA]-(u:Usuario) RETURN u, terreiro` | Escala |
| "Recomendação: terreiros similares" | `MATCH (t:Terreiro {id:'X'})-[:PERTENCE_A]->(trad:Tradicao)<-[:PERTENCE_A]-(similar:Terreiro) WHERE similar.id <> 'X' RETURN similar ORDER BY similar.trust_score DESC` | MVP |
