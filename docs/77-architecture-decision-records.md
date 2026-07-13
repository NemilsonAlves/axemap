# 77 — Architecture Decision Records

---

# ADR-001 — Monorepo com Turborepo

## Contexto
O AxéMap possui múltiplos componentes (frontend Next.js, backend NestJS, shared packages de tipos, utils, e configs). Sem um monorepo, cada componente teria repositório separado, aumentando a complexidade de coordenação.

## Problema
Como organizar o código fonte para maximizar compartilhamento e consistência entre frontend e backend?

## Objetivo
Código compartilhado (tipos, DTOs, validações) sem duplicação e com versionamento sincronizado.

## Alternativas Avaliadas
- **Nx:** Poderoso, mas complexo para o tamanho atual
- **Lerna:** Manutenção reduzida, sem suporte ativo da comunidade
- **pnpm workspaces:** Simples, mas sem cache de build
- **Turborepo:** (escolhido) Cache inteligente, paralelismo, integração com Next.js

## Motivos da Decisão
1. Cache de build remoto (builds incrementais)
2. Paralelismo nativo (`turbo run test, lint, build`)
3. Suporte first-class a Next.js
4. Configuração declarativa (`turbo.json`)
5. Comunidade ativa (Vercel)

## Trade-offs
- Vantagem: build muito mais rápido com cache
- Vantagem: shared packages sem duplicação
- Desvantagem: dependência do ecossistema Vercel
- Desvantagem: curva de aprendizado para devs sem experiência em monorepo

## Impactos Futuros
Facilita a extração de packages compartilhados (UI components, SDK, client API) no futuro.

## Riscos
- Projeto crescer demais e o `turbo.json` ficar complexo → mitigação: revisar estrutura a cada 6 meses

## Quando Revisar
- Quando o monorepo ultrapassar 20 packages
- Se o Turborepo perder suporte da Vercel

---

# ADR-002 — Next.js para Frontend

## Contexto
O frontend precisa de SSR para SEO (terreiros sendo encontrados no Google), performance (core web vitals), e suporte a PWA.

## Problema
Qual framework de React oferece SSR, SSG, PWA suporte e performance nativas?

## Alternativas Avaliadas
- **Next.js:** SSR, SSG, ISR, App Router, React Server Components
- **Remix:** Bom, mas ecossistema menor
- **Vite + React Router:** Flexível, mas sem SSR nativo
- **Gatsby:** SSG excelente, mas SSR limitado

## Motivos da Decisão
1. App Router com Server Components (menos JS no cliente)
2. ISR (Incremental Static Regeneration) para perfis de terreiro
3. Image Optimization nativa
4. Ecossistema maduro e documentação extensa
5. Suporte da Vercel (mesmo ecossistema do Turborepo)

## Trade-offs
- React Server Components limitam interatividade (uso de 'use client' quando necessário)
- Bundle maior que frameworks minimalistas

## Impactos Futuros
Facilita migração para React Native no futuro (compartilhamento de hooks e tipos).

## Riscos
- Server Components podem causar confusão no time → mitigação: guideline claro no handbook

---

# ADR-003 — NestJS para Backend

## Contexto
O backend precisa ser modular, escalável e suportar múltiplos protocolos (REST, GraphQL, WebSocket).

## Problema
Qual framework Node.js oferece arquitetura modular com suporte a eventos, filas e múltiplos transportes?

## Alternativas Avaliadas
- **Express:** Muito flexível, mas sem estrutura definida
- **Fastify:** Rápido, mas ecossistema menor
- **NestJS:** (escolhido) Arquitetura modular, decorators, suporte nativo a GraphQL/WebSocket
- **AdonisJS:** Bom, mas fora do ecossistema Next.js

## Motivos da Decisão
1. Modularidade via módulos do NestJS (cada domínio é um módulo)
2. Suporte nativo a GraphQL (`@nestjs/graphql`) e WebSocket
3. Injeção de dependência nativa
4. Integração com BullMQ via `@nestjs/bull`
5. Similaridade com Angular (decorators) = padronização

## Trade-offs
- Mais opinado que Express → menos flexibilidade
- Performance ligeiramente menor que Fastify puro

## Impactos Futuros
Facilita a criação de microserviços (cada módulo pode virar um serviço independente).

## Riscos
- Desenvolvedores podem ter resistência à rigidez → mitigação: onboarding com exemplos práticos

---

# ADR-004 — PostgreSQL como Banco Principal

## Contexto
Precisamos de um banco relacional com suporte a dados geoespaciais, buscas textuais e embeddings vetoriais.

## Problema
Qual banco oferece ACID, extensões geoespaciais e preparação para grafos?

## Alternativas Avaliadas
- **MySQL:** Sem suporte nativo a PostGIS e pgvector
- **SQLite:** Ótimo para testes, mas sem concorrência para produção
- **PostgreSQL:** (escolhido) PostGIS, pgvector, CTEs recursivas, índices GIN para JSONB

## Motivos da Decisão
1. PostGIS: consultas geoespaciais nativas
2. pgvector: embeddings sem banco separado
3. CTEs recursivas: queries de grafo até 3 níveis
4. Índices GIN: busca textual + JSONB
5. LGPD compliant: backup criptografado, point-in-time recovery

## Trade-offs
- Escrita ligeiramente mais lenta que MySQL em benchmarks simples
- Manutenção mais complexa que SQLite

## Impactos Futuros
Migração para Neo4j será facilitada pelo mapeamento 1:1 tabela → nó.

## Riscos
- Performance de queries de grafo com muitos níveis → mitigação: views materializadas + índices

---

# ADR-005 — Prisma como ORM

## Contexto
Precisamos de um ORM que gere tipos TypeScript automaticamente, suporte migrações e tenha boa DX.

## Problema
Qual ORM oferece type safety, migrations e integração com NestJS?

## Alternativas Avaliadas
- **TypeORM:** Maduro, mas com bugs de migração frequentes
- **Drizzle ORM:** Moderno, mas ecossistema novo
- **Prisma:** (escolhido) Geração automática de tipos, migrations seguras, studio integrado
- **Knex:** Query builder apenas, sem ORM

## Motivos da Decisão
1. Tipos gerados automaticamente do schema
2. Migrations com validação (prisma migrate dev)
3. Prisma Studio para administração visual
4. Suporte a PostgreSQL, PostGIS (raw queries) e pgvector (raw queries)
5. DX superior (autocomplete, intellisense)

## Trade-offs
- Queries complexas exigem raw SQL (não há suporte a CTEs ou PostGIS no Prisma Client)
- Performance marginalmente inferior a Drizzle em queries simples

## Impactos Futuros
Facilita a migração para múltiplos bancos (Prisma suporta MongoDB, MySQL, SQLite).

## Riscos
- Raw queries para PostGIS e pgvector aumentam complexidade → mitigação: repositórios especializados

---

# ADR-006 — Redis para Cache e Filas

## Contexto
Precisamos de cache rápido para buscas frequentes e suporte a filas de processamento assíncrono.

## Problema
Qual tecnologia oferece cache em memória + suporte a filas?

## Alternativas Avaliadas
- **Memcached:** Cache apenas, sem filas
- **Redis:** (escolhido) Cache + Pub/Sub + Filas (via BullMQ)
- **KeyDB:** Drop-in replacement do Redis, mas menos testado

## Motivos da Decisão
1. Cache com TTL configurável (buscas, sessões, recomendações)
2. Pub/Sub para eventos em tempo real (WebSocket)
3. Integração nativa com BullMQ
4. Persistência opcional (RDB/AOF) para recuperação
5. Ecossistema maduro e documentado

## Trade-offs
- Consumo de memória (dados em RAM)
- Persistência não é ACID (pode perder dados em falha)

## Impactos Futuros
Base para implementação de rate limiting, sessões distribuídas e leaderboards.

## Riscos
- Uso excessivo de memória → mitigação: limites de cache + monitoramento

---

# ADR-007 — BullMQ para Job Queue

## Contexto
Operações assíncronas (cálculo de Trust Score, moderação, notificações) precisam de filas robustas.

## Problema
Qual biblioteca de filas oferece suporte a Redis, agendamento e retry?

## Alternativas Avaliadas
- **Bee-Queue:** Leve, mas sem scheduler
- **BullMQ:** (escolhido) Redis-based, agendamento, retry, rate limit, eventos
- **RabbitMQ:** Poderoso, mas infra adicional desnecessária
- **AWS SQS:** Vendor lock-in

## Motivos da Decisão
1. Integração nativa com Redis (já escolhido)
2. Suporte a agendamento (`bullmq schedule`)
3. Retry com backoff exponencial
4. Rate limiting (evitar sobrecarga)
5. UI de monitoramento (Bull Board)

## Trade-offs
- Dependente do Redis (se Redis cair, filas param)
- Mais complexo que Bee-Queue para casos simples

## Impactos Futuros
Base para event sourcing e processamento de streams.

## Riscos
- Jobs podem ficar órfãos → mitigação: monitoramento + dead-letter queue

---

# ADR-008 — Docker para Containerização

## Contexto
Ambientes de desenvolvimento e produção precisam ser reproduzíveis.

## Problema
Como garantir que o ambiente de todos os desenvolvedores seja idêntico ao de produção?

## Alternativas Avaliadas
- **Docker Compose:** (escolhido) Simples, multi-container
- **Podman:** Alternativa ao Docker, mas menor adoção
- **Vagrant:** Máquina virtual completa, mas pesado

## Motivos da Decisão
1. Docker Compose define toda a stack (PostgreSQL, Redis, app)
2. Isolamento de dependências por container
3. Facilidade de onboarding (docker compose up)
4. Railway usa containers nativamente

## Trade-offs
- Consumo de recursos (cada container tem overhead)
- Complexidade de debug em redes de containers

---

# ADR-009 — Cloudflare para CDN e DNS

## Contexto
Precisamos de CDN global, proteção DDoS e DNS rápido.

## Problema
Qual provedor de edge oferece CDN, DNS e segurança integrados?

## Alternativas Avaliadas
- **Cloudflare:** (escolhido) CDN + DNS + DDoS + WAF + R2
- **Akamai:** Caro para o tamanho atual
- **Fastly:** Bom, mas sem R2 (storage)

## Motivos da Decisão
1. Plano gratuito generoso para MVP
2. Cloudflare R2 (S3-compatible, sem taxa de egress)
3. WAF para proteção contra ataques
4. DNS rápido com proxy global

---

# ADR-010 — Railway para Infraestrutura

## Contexto
O backend (NestJS + PostgreSQL + Redis) precisa de infraestrutura gerenciada.

## Problema
Qual PaaS oferece deploy simplificado com boa relação custo-benefício?

## Alternativas Avaliadas
- **Railway:** (escolhido) Deploy simplificado, PostgreSQL + Redis gerenciados
- **Fly.io:** Bom, mas mais caro
- **DigitalOcean App Platform:** Mais caro para o mesmo
- **Heroku:** Preços proibitivos atualmente
- **AWS ECS:** Complexo demais para o MVP

## Motivos da Decisão
1. Deploy a partir do GitHub (push to deploy)
2. PostgreSQL e Redis gerenciados (zero manutenção)
3. Volumes persistentes para uploads
4. Preço competitivo ($5-20/mês no MVP)
5. Logs integrados

---

# ADR-011 — Vercel para Deploy do Frontend

## Contexto
Next.js tem deploy otimizado na Vercel (SSR, ISR, Image Optimization).

## Problema
Onde hospedar o frontend para melhor performance e simplicidade?

## Alternativas Avaliadas
- **Vercel:** (escolhido) Deploy nativo Next.js, ISR, preview deployments
- **Netlify:** Bom, mas suporte a Next.js inferior
- **Railway:** Hospeda Next.js, mas sem ISR otimizado

## Motivos da Decisão
1. ISR funciona nativamente (perfis de terreiro com cache)
2. Preview deployments para cada PR
3. Analytics de performance integrado
4. Mesmo ecossistema do Turborepo

---

# ADR-012 — JWT para Autenticação

## Contexto
Usuários precisam de autenticação stateless para múltiplos serviços (frontend, API, WebSocket).

## Problema
Qual mecanismo de autenticação oferece stateless, seguro e escalável?

## Alternativas Avaliadas
- **JWT:** (escolhido) Stateless, assinado, self-contained
- **Session-based:** Stateful, requer banco de sessões
- **PASETO:** Mais seguro que JWT, mas ecossistema menor

## Motivos da Decisão
1. Stateless: não requer banco de sessões
2. Suporte universal (bibliotecas em todas as linguagens)
3. Refresh token para renovação segura
4. Blacklist no Redis para revogação

## Trade-offs
- JWT não pode ser revogado (depende de blacklist)
- Payload visível (não colocar dados sensíveis)

---

# ADR-013 — OAuth para Login Social

## Contexto
Usuários esperam login com Google e redes sociais.

## Problema
Como permitir login social de forma segura?

## Alternativas Avaliadas
- **NextAuth.js:** (escolhido) Integração nativa com Next.js, suporte a múltiplos providers
- **Passport.js:** Bom, mas configuração manual
- **Supabase Auth:** Excelente, mas lock-in

## Motivos da Decisão
1. Integração nativa com Next.js App Router
2. Suporte a Google, GitHub, Apple (futuro)
3. Sessão JWT ou banco (configurável)
4. Callbacks para customização (RBAC)

---

# ADR-014 — RBAC como Modelo de Autorização

## Contexto
Usuários têm diferentes permissões (admin, dirigente, usuário comum).

## Problema
Como modelar permissões de forma flexível e auditável?

## Alternativas Avaliadas
- **RBAC:** (escolhido) Papéis fixos, permissões por papel
- **ABAC:** Atributos, mais flexível mas complexo
- **ReBAC:** Baseado em relações, ideal para grafo mas overengineering no MVP

## Motivos da Decisão
1. Simplicidade de implementação e auditoria
2. 15 papéis fixos bem definidos
3. Checklist por papel (cada papel tem permissões explícitas)
4. Evolução para ReBAC quando migrar para Neo4j

---

# ADR-015 — Event-Driven Architecture

## Contexto
Operações como cálculo de Trust Score, notificações e moderação são assíncronas.

## Problema
Como desacoplar operações síncronas de assíncronas?

## Alternativas Avaliadas
- **Event-Driven:** (escolhido) 28 eventos de domínio, 11 filas BullMQ
- **Request-Response:** Simples, mas acoplamento temporal
- **CQRS:** Separar leitura/escrita, overengineering para MVP

## Motivos da Decisão
1. Desacoplamento entre serviços
2. Resiliência (falha na fila não quebra o request)
3. Escalabilidade (workers independentes)
4. Rastreabilidade (cada evento é logado)

---

# ADR-016 — Domain-Driven Design

## Contexto
O domínio (religiões afro-brasileiras) é complexo e cheio de nuances.

## Problema
Como modelar software que reflita a complexidade do domínio?

## Alternativas Avaliadas
- **DDD:** (escolhido) Bounded contexts, ubiquitous language, aggregates
- **CRUD simples:** Rápido, mas não captura regras de negócio
- **Anemic Model:** Dados sem comportamento, anti-pattern

## Motivos da Decisão
1. Linguagem ubíqua (termos do domínio no código)
2. Bounded contexts (Terreiro, Usuário, Marketplace, Trust)
3. Aggregates garantem consistência

---

# ADR-017 — Clean Architecture

## Contexto
O código precisa ser testável, independente de framework e evoluível.

## Problema
Como estruturar o código para máxima independência de camadas?

## Alternativas Avaliadas
- **Clean Architecture:** (escolhido) Entities → Use Cases → Adapters → Frameworks
- **Layered:** Controller → Service → Repository (acoplamento)
- **Hexagonal:** Similar, portas e adaptadores

## Motivos da Decisão
1. Independência de frameworks (trocar Express por Fastify sem reescrever regras)
2. Testabilidade (use cases testados sem HTTP)
3. Dependência invertida (infra depende do domínio)

---

# ADR-018 — Leaflet + OpenStreetMap

## Contexto
Terreiros precisam ser exibidos em mapa com busca por localização.

## Problema
Qual biblioteca de mapas oferece gratuidade e sem licenciamento?

## Alternativas Avaliadas
- **Google Maps:** Caro, requer licença
- **Mapbox:** Bom, mas caro para escala
- **Leaflet + OSM:** (escolhido) Gratuito, open source, leve
- **MapLibre:** Moderno, mas ecossistema menor

## Motivos da Decisão
1. 100% gratuito (sem custo por requisição)
2. Open source (sem lock-in)
3. Plugin rico (clustering, geocoding com Nominatim)
4. Comunidade ativa

---

# ADR-019 — Cloudflare R2 para Storage

## Contexto
Fotos, documentos de verificação e conteúdo precisam de armazenamento de objetos.

## Problema
Qual storage oferece S3-compatibility sem taxa de egress?

## Alternativas Avaliadas
- **AWS S3:** Padrão da indústria, mas taxa de egress
- **Cloudflare R2:** (escolhido) S3-compatible, zero taxa de egress
- **DigitalOcean Spaces:** Barato, mas sem CDN integrado

## Motivos da Decisão
1. Zero taxa de egress (download gratuito)
2. S3-compatible (migração fácil)
3. Cache via Cloudflare CDN
4. Preço previsível

---

# ADR-020 — PostGIS para Dados Geoespaciais

## Contexto
O AxéMap precisa de busca por proximidade (terreiros próximos), raio de distância e mapas.

## Problema
Como armazenar e consultar dados geoespaciais?

## Alternativas Avaliadas
- **PostGIS:** (escolhido) Extensão PostgreSQL, SQL nativo
- **MongoDB GeoJSON:** Menos preciso que PostGIS
- **Elasticsearch Geo:** Infra adicional

## Motivos da Decisão
1. SQL nativo (CTE, índices espaciais)
2. Precisão (cálculo de distância real com ST_DistanceSphere)
3. Mesmo banco (sem replicação de dados)

---

# ADR-021 — Graph Abstraction Layer (GAL)

## Contexto
O AxéMap modela relacionamentos como grafo, mas armazena em PostgreSQL. Futuramente será Neo4j.

## Problema
Como escrever código que funcione em PostgreSQL hoje e Neo4j amanhã sem reescrever?

## Alternativas Avaliadas
- **GAL:** (escolhido) Interface abstrata entre domínio e banco
- **Neo4j direto:** Overengineering no MVP
- **Apenas PostgreSQL:** Refatoração cara no futuro

## Motivos da Decisão
1. Abstração permite trocar banco sem alterar use cases
2. Interfaces GraphNode, GraphEdge, GraphRepository
3. Implementação concreta: PostgresGraphRepository
4. Futura implementação: Neo4jGraphRepository

## Trade-offs
- Abstração adiciona complexidade inicial
- Performance ligeiramente menor (overhead da interface)

## Impactos Futuros
Migração para Neo4j será trocar a implementação concreta.

## Riscos
- Abstração pode vazar detalhes de implementação → mitigação: testes de integração

---

# ADR-022 — Map Provider Abstraction

## Contexto
O AxéMap utiliza mapas para localizar terreiros. Diferentes provedores (Leaflet, MapLibre, Google Maps) têm APIs distintas. Acoplar a aplicação a um provedor específico dificulta a migração futura.

## Problema
Como implementar mapas sem depender de um provedor específico?

## Objetivo
Trocar o provedor de mapas apenas por configuração, sem alterar código de negócio.

## Alternativas Avaliadas
- **Leaflet direto:** Simples, mas acoplamento
- **MapLibre direto:** Moderno, mas menos maduro que Leaflet
- **Map Provider Abstraction:** (escolhido) Interface genérica, implementações plugáveis

## Motivos da Decisão
1. Provedor de mapa é detalhe de infraestrutura, não de domínio
2. MapLibre GL JS é a implementação preferencial futura
3. Leaflet é aceitável no MVP se simplificar
4. Google Maps pode ser necessário apenas em cenários específicos

## Trade-offs
- Abstração adiciona uma camada extra
- Leaflet e MapLibre têm APIs diferentes — a abstração precisa ser genérica o suficiente

## Impactos Futuros
Trocar de Leaflet para MapLibre será apenas trocar o componente importado.

## Riscos
- Abstração muito genérica perde poder da API específica → mitigação: interface enxuta com escape hatch (`getNativeMap()`)

---

# ADR-023 — Data Trust Metadata

## Contexto
Os dados geográficos vêm de múltiplas fontes (cadastro oficial, colaborativo, importação, OSM, IA). Cada fonte tem nível de confiança diferente. O Trust Score depende da procedência.

## Problema
Como rastrear a origem e confiabilidade de cada dado?

## Alternativas Avaliadas
- **Sem metadados:** Perde rastreabilidade
- **Metadados em tabela separada:** (escolhido) `data_trust_metadata` vinculado a cada registro
- **Metadados no próprio registro:** Polui a tabela principal

## Motivos da Decisão
1. Cada dado precisa de origem, responsável, método de validação e nível de confiança
2. Metadados alimentam diretamente o Trust Score
3. Histórico de alterações preservado

## Trade-offs
- Tabela adicional = mais joins
- Complexidade em manter metadados para cada campo

## Impactos Futuros
Base de conhecimento auditável e confiável — ativo estratégico da plataforma.
