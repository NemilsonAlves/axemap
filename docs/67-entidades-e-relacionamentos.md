# 67 — Entidades e Relacionamentos do Grafo

## Catálogo Completo de Relacionamentos

### Relações Primárias (Domínio Central)

| De | Relação | Para | Cardinalidade | Descrição |
|----|---------|------|---------------|-----------|
| `Terreiro` | `:PERTENCE_A` | `Tradicao` | N:1 | Um terreiro segue uma tradição |
| `Terreiro` | `:LOCALIZADO_EM` | `Cidade` | N:1 | Um terreiro está em uma cidade |
| `Terreiro` | `:POSSUI_COMO_DIRIGENTE` | `Usuario` | N:1 | Um terreiro tem um dirigente |
| `Terreiro` | `:REALIZA` | `Evento` | 1:N | Um terreiro realiza eventos |
| `Terreiro` | `:OFERECE` | `Curso` | 1:N | Um terreiro oferece cursos |
| `Terreiro` | `:POSSUI` | `Produto` | 1:N | Um terreiro possui/vende produtos |
| `Terreiro` | `:TEM_MEMBRO` | `Usuario` | N:N | Usuários são membros de terreiros |
| `Cidade` | `:PERTENCE_A` | `Estado` | N:1 | Cidade pertence a estado |
| `Estado` | `:PERTENCE_A` | `Pais` | N:1 | Estado pertence a país |

### Relações de Usuário

| De | Relação | Para | Cardinalidade | Propriedades |
|----|---------|------|---------------|-------------|
| `Usuario` | `:AVALIOU` | `Terreiro` | N:N | `{nota, peso, data, util}` |
| `Usuario` | `:FAVORITOU` | `Terreiro` | N:N | `{data}` |
| `Usuario` | `:PARTICIPOU_DE` | `Evento` | N:N | `{data, confirmado}` |
| `Usuario` | `:FREQUENTA` | `Terreiro` | N:N | `{desde, frequencia, cargo}` |
| `Usuario` | `:SEGUE` | `Usuario` | N:N | `{data}` |
| `Usuario` | `:PARTICIPA_DE` | `Grupo` | N:N | `{role, dataEntrada}` |
| `Usuario` | `:CRIOU` | `Conteudo` | 1:N | `{data}` |
| `Usuario` | `:RECOMENDA` | `Terreiro` | N:N | `{motivo, data}` |
| `Usuario` | `:MATRICULOU_EM` | `Curso` | N:N | `{data, status}` |

### Relações de Evento

| De | Relação | Para | Cardinalidade | Propriedades |
|----|---------|------|---------------|-------------|
| `Evento` | `:RELACIONADO_A` | `LinhaEspiritual` | N:N | `{principal}` |
| `Evento` | `:RELACIONADO_A` | `Entidade` | N:N | `{homenageado}` |
| `Evento` | `:RELACIONADO_A` | `Orixa` | N:N | `{homenageado}` |
| `Evento` | `:TEM_PALESTRANTE` | `Usuario` | N:N | `{tema}` |
| `Evento` | `:PATROCINADO_POR` | `Produto` | N:N | `{valor}` |

### Relações de Conteúdo

| De | Relação | Para | Cardinalidade | Propriedades |
|----|---------|------|---------------|-------------|
| `Conteudo` | `:REFERENCIA` | `Terreiro` | N:N | `{relevancia}` |
| `Conteudo` | `:REFERENCIA` | `Tradicao` | N:N | `{relevancia}` |
| `Conteudo` | `:REFERENCIA` | `Orixa` | N:N | `{relevancia}` |
| `Conteudo` | `:REFERENCIA` | `Entidade` | N:N | `{relevancia}` |
| `Conteudo` | `:CATEGORIZADO_COMO` | `Categoria` | N:1 | — |

### Relações do Marketplace

| De | Relação | Para | Cardinalidade | Propriedades |
|----|---------|------|---------------|-------------|
| `Produto` | `:VENDIDO_POR` | `Usuario` | N:1 | `{desde, reputacao}` |
| `Produto` | `:RELACIONADO_A` | `Tradicao` | N:N | `{uso}` |
| `Produto` | `:RELACIONADO_A` | `Orixa` | N:N | `{uso}` |
| `Produto` | `:PERTENCE_A` | `CategoriaProduto` | N:1 | — |
| `Pedido` | `:CONTEM` | `Produto` | 1:N | `{quantidade, preco}` |
| `Pedido` | `:FEITO_POR` | `Usuario` | N:1 | — |

### Relações de Similaridade e Recomendação

| De | Relação | Para | Propriedades |
|----|---------|------|-------------|
| `Terreiro` | `:SIMILAR_A` | `Terreiro` | `{similaridade, baseadaEm}` |
| `Evento` | `:SIMILAR_A` | `Evento` | `{similaridade}` |
| `Usuario` | `:SIMILAR_A` | `Usuario` | `{similaridade, baseadaEm}` |
| `Terreiro` | `:RECOMENDADO_PARA` | `Usuario` | `{score, motivo, geradoPor}` |
| `Evento` | `:RECOMENDADO_PARA` | `Usuario` | `{score, motivo}` |
| `Curso` | `:RECOMENDADO_PARA` | `Usuario` | `{score, motivo}` |

### Relações de Ação Social e Impacto

| De | Relação | Para | Propriedades |
|----|---------|------|-------------|
| `Terreiro` | `:REALIZA` | `AcaoSocial` | `{data, tipo, alcance}` |
| `AcaoSocial` | `:BENEFICIA` | `Cidade` | `{publicoEstimado}` |
| `AcaoSocial` | `:EM_PARCEIRA_COM` | `Instituicao` | `{tipo}` |
| `Terreiro` | `:TEM_PROJETO` | `Projeto` | `{inicio, status}` |

## Índices de Grafo no PostgreSQL

```sql
-- Índices para acelerar queries de grafo (CTEs recursivas)

-- 1. Relações N:N (tabelas de junção) com índices compostos
CREATE INDEX idx_favoritos_usuario_terreiro ON favoritos(usuario_id, terreiro_id);
CREATE INDEX idx_membros_terreiro_usuario ON membros_terreiro(terreiro_id, usuario_id);

-- 2. Índices para navegação no grafo
CREATE INDEX idx_terreiros_tradicao_cidade ON terreiros(tradicao, cidade) WHERE deleted_at IS NULL;
CREATE INDEX idx_eventos_terreiro_data ON eventos(terreiro_id, data_inicio) WHERE deleted_at IS NULL;

-- 3. Índices para busca por propriedades de relacionamento
CREATE INDEX idx_avaliacoes_nota_peso ON avaliacoes(nota DESC, peso_avaliador DESC) WHERE deleted_at IS NULL;

-- 4. Índices para recomendação (trust score + tradição + cidade)
CREATE INDEX idx_terreiros_recomendacao ON terreiros(trust_score DESC, tradicao, cidade) WHERE deleted_at IS NULL AND is_published = true;
```

## Queries de Exemplo (Cypher — Preparação para Neo4j)

### Query: Terreiros recomendados para um usuário

```cypher
MATCH (u:Usuario {id: $userId})
MATCH (u)-[:AVALIOU {nota: 5}]->(t:Terreiro)-[:PERTENCE_A]->(trad:Tradicao)
MATCH (similar:Terreiro)-[:PERTENCE_A]->(trad)
WHERE similar.id <> t.id
  AND similar.trustScore > 30
  AND similar.status = 'publicado'
OPTIONAL MATCH (u)-[:AVALIOU]->(similar)
WITH similar, trad, COUNT(similar) as matches, AVG(similar.trustScore) as score
WHERE similar IS NOT NULL
RETURN similar.nome, similar.slug, similar.trustScore, trad.nome as tradicao
ORDER BY score DESC
LIMIT 10
```

### Query: Engajamento comunitário em uma cidade

```cypher
MATCH (c:Cidade {nome: 'Recife'})
MATCH (t:Terreiro)-[:LOCALIZADO_EM]->(c)
MATCH (t)<-[:AVALIOU]-(a:Avaliacao)
MATCH (t)-[:REALIZA]->(e:Evento)
RETURN t.nome, 
       COUNT(DISTINCT a) as totalAvaliacoes,
       AVG(a.nota) as mediaAvaliacoes,
       COUNT(DISTINCT e) as totalEventos,
       t.trustScore
ORDER BY totalAvaliacoes DESC
```

### Query: Caminho de aprendizado (usuário → cursos → terreiros)

```cypher
MATCH (u:Usuario {id: $userId})
MATCH (u)-[:MATRICULOU_EM]->(curso:Curso)
MATCH (curso)<-[:OFERECE]-(t:Terreiro)
MATCH (t)-[:PERTENCE_A]->(trad:Tradicao)
RETURN curso.titulo, t.nome, trad.nome
ORDER BY curso.dataInicio DESC
```

## Matriz de Adjacência (Simplificada)

Para visualizar a densidade de conexões entre tipos de entidade:

```
          T  U  E  C  Tr O  En G  P  Pd S  Co  Av
Terreiro  S  M  R  L  P  -  -  P  P  R  -  -   R
Usuario   M  S  P  -  -  -  -  P  P  -  -  C   C
Evento    P  P  -  -  R  R  R  -  -  -  -  -   -
Cidade    L  -  -  S  P  -  -  -  -  -  -  -   -
Tradicao  P  -  R  -  S  -  -  -  -  -  -  -   -
Orixa     -  -  R  -  -  S  -  -  -  -  -  R   -
Entidade  -  -  R  -  -  -  S  -  -  -  -  R   -
Grupo     P  P  -  -  -  -  -  S  -  -  -  -   -
Produto   P  P  -  -  -  -  -  -  S  -  -  -   -
Pedido    R  P  -  -  -  -  -  -  C  S  -  -   -
Conteudo  -  C  -  -  -  R  R  -  -  -  S  -   -
Avaliacao R  C  -  -  -  -  -  -  -  -  -  S   -

Legenda: S=próprio, P=possui, R=referencia, C=criado_por, 
         M=membro, L=localizado_em, O=oferece
```

## Considerações sobre Performance

| Padrão de Query | Estratégia PostgreSQL | Estratégia Neo4j |
|-----------------|---------------------|-------------------|
| 1 salto (terreiro → tradição) | JOIN simples | Match direto |
| 2 saltos (usuário → avaliação → terreiro) | JOIN + índice | Match 2 arestas |
| 3+ saltos (usuário → terreiro → eventos → entidades) | CTE recursiva (lenta) | Match nativo (rápido) |
| Caminho variável (usuário → * → terreiro) | Muito lento | Nativo (Otimizado) |
| Recomendação por similaridade | pgvector (bom) | Node similarity (excelente) |
| Centralidade (nós mais conectados) | Complexo | Nativo grafo |
