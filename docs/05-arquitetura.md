# 05 — Arquitetura do Sistema

## Filosofia Arquitetural

- **Clean Architecture** com separação clara de camadas (domain, application, infrastructure, presentation)
- **DDD (Domain-Driven Design)** com aggregates, entities, value objects e domain events
- **SOLID** em todos os níveis
- **Event-Driven** para operações assíncronas (notificações, auditoria, indexação)
- **Multi-tenant** preparado desde o início (cada terreiro é um tenant no SaaS)
- **API-first** com GraphQL (consultas complexas) + REST (operações CRUD) + gRPC (serviços internos)
- **Serverless-ready** para funções de borda (Cloudflare Workers, AWS Lambda)

## Stack Tecnológica

### Frontend (Web)

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| Next.js | 16 | SSR, SSG, ISR, App Router |
| React | 19 | UI Components |
| TypeScript | 5.x | Tipagem estática |
| TailwindCSS | 4.x | Estilização utilitária |
| Shadcn/ui | — | Componentes acessíveis e customizáveis |
| React Query (TanStack Query) | 5.x | Gerenciamento de estado server-side |
| Leaflet + OpenStreetMap | — | Mapas gratuitos sem dependência Google |
| Zustand | 5.x | Estado global leve |
| React Hook Form + Zod | — | Formulários performáticos com validação |
| next-intl | — | Internacionalização (futuro) |

### Backend

| Tecnologia | Versão | Finalidade |
|------------|--------|------------|
| NestJS | 11 | Framework Node.js enterprise |
| TypeScript | 5.x | Tipagem |
| Prisma | 6.x | ORM com type-safety |
| PostgreSQL | 17 | Banco relacional principal |
| Redis | 7.x | Cache + filas + sessão |
| BullMQ | — | Filas de processamento assíncrono |
| GraphQL (code-first) | — | API pública flexível |
| REST (NestJS controllers) | — | CRUD operations |
| Passport.js | — | Autenticação (JWT + OAuth) |
| Zod | — | Validação de schemas |
| Swagger / OpenAPI | — | Documentação REST |
| Playground GraphQL | — | Documentação GraphQL |

### Infraestrutura

| Componente | Tecnologia |
|------------|-----------|
| Containerização | Docker + Docker Compose |
| Orquestração | Docker Swarm (início) → Kubernetes (escala) |
| Proxy Reverso | Traefik (HTTP) + Nginx (assets) |
| CDN | Cloudflare |
| Storage | Cloudflare R2 (S3-compatible) |
| CI/CD | GitHub Actions |
| Deploy Frontend | Vercel |
| Deploy Backend | Railway / VPS dedicado |
| Monitoramento | Sentry + Grafana + Prometheus |
| Logs | Loki + Grafana |
| Email | Resend / AWS SES |
| SMS/WhatsApp | API oficial WhatsApp Business / Twilio |

## Visão Geral da Arquitetura

```

┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Web App     │  │  Mobile App  │  │  PWA         │          │
│  │  (Next.js)   │  │  (React Nat.)│  │  (Next.js)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼────────────────┘
          │                  │                  │
     ┌────┴──────────────────┴──────────────────┴────┐
     │              CDN / Cloudflare                  │
     │         (Cache, DDoS, SSL, Workers)            │
     └────┬──────────────────┬──────────────────┬────┘
          │                  │                  │
┌─────────┼──────────────────┼──────────────────┼────────────────┐
│         ▼                  ▼                  ▼                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    API GATEWAY (NestJS)                   │   │
│  │  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐   │   │
│  │  │ REST    │  │ GraphQL  │  │ WebSocket│  │ gRPC    │   │   │
│  │  │ Controll│  │ Resolver │  │ Gateway  │  │ Server  │   │   │
│  │  └────┬────┘  └────┬─────┘  └────┬─────┘  └────┬────┘   │   │
│  └───────┼────────────┼──────────────┼─────────────┼────────┘   │
│          │            │              │             │            │
│  ┌───────┴────────────┴──────────────┴─────────────┴────────┐   │
│  │                 APPLICATION LAYER                        │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ Auth     │ │ Terreiro │ │ Usuário  │ │ Busca    │   │   │
│  │  │ Module   │ │ Module   │ │ Module   │ │ Module   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │ Eventos  │ │ Avaliação│ │ SaaS     │ │ Mktplace │   │   │
│  │  │ Module   │ │ Module   │ │ Module   │ │ Module   │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                          │                                     │
│  ┌───────────────────────┴─────────────────────────────────┐   │
│  │                 DOMAIN LAYER (Core)                      │   │
│  │  Entities, Value Objects, Aggregates, Domain Events,    │   │
│  │  Repository Interfaces, Service Interfaces, Specs       │   │
│  └───────────────────────┬─────────────────────────────────┘   │
│                          │                                     │
│  ┌───────────────────────┴─────────────────────────────────┐   │
│  │               INFRASTRUCTURE LAYER                       │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │   │
│  │  │Prisma    │ │ Redis    │ │ BullMQ   │ │ S3/R2    │   │   │
│  │  │(Postgres)│ │ (Cache)  │ │ (Queues) │ │(Storage) │   │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐               │   │
│  │  │Email     │ │ WhatsApp │ │ OpenSt.  │               │   │
│  │  │Provider  │ │ API      │ │ Map      │               │   │
│  │  └──────────┘ └──────────┘ └──────────┘               │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Estratégia de Cache

| Camada | Tecnologia | TTL | Uso |
|--------|-----------|-----|-----|
| Browser | Service Worker | Variável | Assets estáticos, páginas SSR |
| CDN | Cloudflare | 1h-24h | Páginas públicas, imagens |
| API | Redis | 5min-1h | Perfis de terreiro, resultados de busca |
| Banco | PostgreSQL | — | Query optimization, índices |
| App | React Query | Variável | Cache de queries no frontend |

## Estratégia de Filas (BullMQ)

| Fila | Processamento | Prioridade | Uso |
|------|--------------|-----------|-----|
| email-queue | Imediato | Alta | Emails transacionais |
| notification-queue | Imediato | Alta | Notificações push |
| search-index-queue | Delay 30s | Média | Reindexação de busca |
| image-processing | Delay 10s | Baixa | Redimensionamento de imagens |
| audit-log-queue | Lote a cada 5min | Baixa | Logs de auditoria |
| analytics-queue | Lote a cada 15min | Baixa | Métricas e analytics |

## Estratégia de Escalabilidade

### Horizontal Scaling
- API Gateway: stateless, múltiplas réplicas atrás do Traefik
- Workers BullMQ: réplicas independentes processando filas
- Redis Cluster: sharding para cache e filas
- Read Replicas PostgreSQL: leitura em réplicas, escrita no primário

### Vertical Scaling (fases iniciais)
- VPS com 4-8 vCPUs, 16-32GB RAM
- PostgreSQL tuning (shared_buffers, work_mem, effective_cache_size)
- Redis com persistência AOF

### Estratégia Multi-Tenant

```
Opção escolhida: Row-Level Tenancy (discriminador por coluna tenant_id)

Motivos:
1. Compartilhamento de schema = manutenção simplificada
2. Um banco de dados = backup e restore mais simples
3. Row-Level Security (RLS) do PostgreSQL = isolamento nativo
4. Custo inicial menor (sem múltiplos bancos)

Migração futura: Schema-per-tenant para clientes Enterprise

Discriminador: tenant_id UUID em todas as tabelas multi-tenant
Tabelas single-tenant: configurações globais, categorias, etc.
```

## Estratégia de Segurança

| Camada | Medida |
|--------|--------|
| **Rede** | Cloudflare WAF, HTTPS forçado, DDoS protection |
| **API** | Rate limiting (express-rate-limiter + Redis), Helmet, CORS |
| **Auth** | JWT (access + refresh token), OAuth2 (Google, GitHub), MFA (futuro) |
| **RBAC** | Roles: admin, visitante, praticante, dirigente, ogã, ekedi, filho-de-santo |
| **Dados** | Criptografia em repouso (AES-256), em trânsito (TLS 1.3) |
| **Banco** | Row-Level Security, prepared statements, validação de input |
| **Auditoria** | Audit logs imutáveis para todas as operações críticas |
| **LGPD** | Consentimento explícito, direito ao esquecimento, portabilidade |
| **Captcha** | Turnstile (Cloudflare) — gratuito e privacy-friendly |
| **Backup** | Automático diário com retenção de 30 dias + backup incremental |

## Considerações de Performance

- **Imagens:** Cloudflare Images para otimização automática (WebP/AVIF)
- **Mapas:** Leaflet + OpenStreetMap com tile caching no service worker
- **Busca:** PostgreSQL full-text search (início) → Meilisearch/Typesense (escala)
- **Páginas:** Next.js ISR com revalidação sob demanda
- **Bundle:** Code-splitting automático do Next.js, dynamic imports para mapa
- **Fontes:** Variable fonts + font-display: swap

## Observabilidade

- **Sentry:** Erros em tempo real (frontend + backend)
- **Grafana + Prometheus:** Métricas do sistema (CPU, memória, requests, latência)
- **Loki:** Agregação de logs centralizada
- **Health checks:** Endpoints /health e /ready em cada serviço
- **APM:** OpenTelemetry para tracing distribuído
