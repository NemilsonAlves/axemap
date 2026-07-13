# 13 — APIs

## Estratégia de APIs

- **REST:** Operações CRUD padrão, operações administrativas
- **GraphQL:** Consultas flexíveis para o frontend, agregação de dados
- **WebSocket:** Notificações em tempo real, chat, eventos ao vivo
- **REST Pública:** Dados abertos para pesquisadores (rate-limited)

## REST API — Endpoints Principais

### Autenticação

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | /api/v1/auth/register | Cadastro de usuário | ❌ |
| POST | /api/v1/auth/login | Login (email+senha) | ❌ |
| POST | /api/v1/auth/refresh | Refresh token | Token |
| POST | /api/v1/auth/logout | Logout | Token |
| POST | /api/v1/auth/forgot-password | Esqueci senha | ❌ |
| POST | /api/v1/auth/reset-password | Resetar senha | Token |
| GET | /api/v1/auth/oauth/google | Login Google | ❌ |
| GET | /api/v1/auth/oauth/github | Login GitHub | ❌ |

### Usuários

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/usuarios/me | Perfil do usuário logado | Token |
| PATCH | /api/v1/usuarios/me | Atualizar perfil | Token |
| DELETE | /api/v1/usuarios/me | Solicitar exclusão (LGPD) | Token |
| GET | /api/v1/usuarios/me/favoritos | Listar favoritos | Token |
| GET | /api/v1/usuarios/me/avaliacoes | Listar avaliações | Token |

### Terreiros

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/terreiros | Listar terreiros (com filtros) | ❌ |
| GET | /api/v1/terreiros/{slug} | Perfil completo do terreiro | ❌ |
| POST | /api/v1/terreiros | Cadastrar terreiro | Token |
| PATCH | /api/v1/terreiros/{slug} | Atualizar terreiro | Owner |
| DELETE | /api/v1/terreiros/{slug} | Remover terreiro (soft delete) | Owner |
| GET | /api/v1/terreiros/{slug}/fotos | Galeria de fotos | ❌ |
| GET | /api/v1/terreiros/{slug}/avaliacoes | Avaliações aprovadas | ❌ |
| GET | /api/v1/terreiros/{slug}/eventos | Eventos do terreiro | ❌ |
| POST | /api/v1/terreiros/{slug}/favoritar | Favoritar/desfavoritar | Token |

### Busca

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/busca?q=&cidade=&estado=&tradicao=&... | Busca com filtros | ❌ |
| GET | /api/v1/busca/geo?lat=&lng=&radius= | Busca por geolocalização | ❌ |
| GET | /api/v1/busca/sugestoes?q= | Autocomplete de busca | ❌ |

### Avaliações

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| POST | /api/v1/avaliacoes | Criar avaliação | Token |
| PATCH | /api/v1/avaliacoes/{id} | Editar avaliação | Owner |
| DELETE | /api/v1/avaliacoes/{id} | Remover avaliação | Owner |
| POST | /api/v1/avaliacoes/{id}/reportar | Reportar avaliação | Token |

### Eventos

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/eventos | Listar eventos públicos | ❌ |
| GET | /api/v1/eventos/{id} | Detalhes do evento | ❌ |
| POST | /api/v1/eventos | Criar evento | Owner |
| PATCH | /api/v1/eventos/{id} | Editar evento | Owner |
| DELETE | /api/v1/eventos/{id} | Remover evento | Owner |

### SaaS (Painel do Terreiro)

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/terreiros/{slug}/membros | Listar membros | Owner |
| POST | /api/v1/terreiros/{slug}/membros | Adicionar membro | Owner |
| PATCH | /api/v1/terreiros/{slug}/membros/{id} | Atualizar cargo | Owner |
| DELETE | /api/v1/terreiros/{slug}/membros/{id} | Remover membro | Owner |
| GET | /api/v1/terreiros/{slug}/financeiro | Extrato financeiro | Owner |
| POST | /api/v1/terreiros/{slug}/financeiro | Registrar transação | Owner |
| GET | /api/v1/terreiros/{slug}/agenda | Agenda do terreiro | Owner |

### Marketplace

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/produtos | Listar produtos | ❌ |
| GET | /api/v1/produtos/{slug} | Detalhes do produto | ❌ |
| POST | /api/v1/produtos | Cadastrar produto | Seller |
| PATCH | /api/v1/produtos/{slug} | Atualizar produto | Seller |
| DELETE | /api/v1/produtos/{slug} | Remover produto | Seller |
| GET | /api/v1/categorias | Listar categorias | ❌ |

### Administração

| Método | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | /api/v1/admin/terreiros/pendentes | Terreiros pendentes | Admin |
| POST | /api/v1/admin/terreiros/{id}/aprovar | Aprovar terreiro | Admin |
| POST | /api/v1/admin/terreiros/{id}/rejeitar | Rejeitar terreiro | Admin |
| GET | /api/v1/admin/avaliacoes/pendentes | Avaliações pendentes | Admin |
| POST | /api/v1/admin/avaliacoes/{id}/moderar | Moderar avaliação | Admin |
| GET | /api/v1/admin/relatorios | Relatórios gerenciais | SuperAdmin |

## GraphQL API

```graphql
type Query {
  terreiro(slug: String!): Terreiro
  terreiros(filters: TerreiroFilters): [Terreiro!]!
  buscaGeografica(lat: Float!, lng: Float!, radius: Int, filters: TerreiroFilters): [Terreiro!]!
  eventos(dataInicio: Date, dataFim: Date, cidade: String): [Evento!]!
  busca(query: String!, filters: BuscaFilters): BuscaResult!
  produtos(categoria: String, busca: String): [Produto!]!
  usuario: Usuario
}

type Mutation {
  login(email: String!, password: String!): AuthPayload
  register(data: RegisterInput!): AuthPayload
  criarAvaliacao(terreiroId: UUID!, nota: Int!, titulo: String, comentario: String!): Avaliacao
  favoritarTerreiro(terreiroId: UUID!): Boolean
  criarEvento(data: EventoInput!): Evento
  criarProduto(data: ProdutoInput!): Produto
}

type Subscription {
  novaAvaliacao(terreiroId: UUID!): Avaliacao
  novoEvento(cidade: String): Evento
  notificacoes: Notificacao
}
```

## WebSocket Events

| Evento | Direção | Descrição |
|--------|---------|-----------|
| notification:new | Server → Client | Nova notificação |
| avaliação:new | Server → Client | Nova avaliação no terreiro (owner) |
| evento:update | Server → Client | Atualização de evento |
| chat:message | Bidirectional | Mensagem de chat |
| status:online | Client → Server | Usuário online |

## API Pública (Enterprise/Dados Abertos)

| Método | Endpoint | Descrição | Rate Limit |
|--------|----------|-----------|------------|
| GET | /api/v1/public/terreiros | Lista paginada de terreiros (dados básicos) | 100/min |
| GET | /api/v1/public/estatisticas | Estatísticas agregadas (total por estado, tradição) | 1000/min |
| GET | /api/v1/public/mapa | Dados georreferenciados para GIS | 100/min |
| GET | /api/v1/public/intolerancia | Dados agregados de intolerância (anonimizados) | 100/min |

### Requisitos para API Pública
- API Key via cadastro (gratuito para pesquisadores, pago para uso comercial)
- Rate limiting por key
- Dados agregados e anonimizados
- Atribuição obrigatória (citação do AxéMap)
- Suporte a GeoJSON para integração GIS

## Padrão de Respostas

### Sucesso
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Erro
```json
{
  "success": false,
  "error": {
    "code": "TERREIRO_NOT_FOUND",
    "message": "Terreiro não encontrado",
    "details": null
  }
}
```

### Códigos de Erro

| Código | HTTP | Descrição |
|--------|------|-----------|
| VALIDATION_ERROR | 422 | Erro de validação (Zod) |
| UNAUTHORIZED | 401 | Token ausente/inválido |
| FORBIDDEN | 403 | Sem permissão |
| NOT_FOUND | 404 | Recurso não encontrado |
| RATE_LIMITED | 429 | Muitas requisições |
| CONFLICT | 409 | Conflito (ex: email duplicado) |
| INTERNAL_ERROR | 500 | Erro interno do servidor |
