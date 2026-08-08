# Arquitetura do AxéMap

## Visão Geral

Monorepo com Turborepo contendo:

```
axemap/
├── apps/
│   ├── api/        # NestJS 11 (backend)
│   └── web/        # Next.js 16 (frontend)
├── packages/
│   ├── config/     # TypeScript config compartilhado
│   ├── database/   # Prisma ORM + schema + migrations
│   └── shared/     # Types, enums, validators (Zod), interfaces
├── infra/          # Docker Compose (serviços de infraestrutura)
└── scripts/        # Scripts de automação
```

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + React 19 |
| Backend | NestJS 11 + Express |
| ORM | Prisma 6 + PostgreSQL + PostGIS |
| Cache | Redis 7 (via ioredis) |
| Queue | BullMQ |
| Storage | MinIO / S3-compatible |
| Auth | JWT + Passport |
| Validação | Zod + class-validator |
| Logs | Pino |
| Monitoramento | Prometheus + Grafana + Loki + Tempo |
| Search | Meilisearch |
| Mensageria | RabbitMQ |
| Analytics | ClickHouse |
| AI | Ollama |

## Fluxo de Dados

```
Browser → Next.js (SSR/CSR) → REST API → NestJS → Prisma → PostgreSQL
                              ↓
                           Redis (cache)
                              ↓
                           MinIO (files)
```

## Módulos da API

| Módulo | Prefixo | Descrição |
|--------|---------|-----------|
| System | `/system` | Health checks, status, versão, métricas |
| Auth | `/auth` | Login, signup, refresh, logout |
| Terreiros | `/terreiros` | CRUD de terreiros, busca, perfis |
| Geo | `/geo` | Busca geográfica, raio, bounding box |
| Evolution | `/evolution` | Gamificação, missões, conquistas, AxScore |
| Growth | `/growth` | Seguir, favoritar, presença, indicações |
| Onboarding | `/onboarding` | Wizard de cadastro, reivindicação |
| Analytics | `/analytics` | Métricas AARRR, funil |
| Feedback | `/feedback` | Feedbacks dos usuários |
| Feature Flags | `/feature-flags` | Feature flags com overrides |
| Storage | via provider | Upload/download S3-compatível |
| Landing | `/landing` | Páginas SEO para estados/cidades/tradições |
| Recommendation | via provider | Engine de recomendação ponderada |
| Discovery | `/discovery` | Trending, explore |
| Ranking | `/ranking` | Top lists |

## Banco de Dados

31 modelos principais usando PostgreSQL + PostGIS para dados geoespaciais.

## Rede (WSL2)

Configuração `networkingMode=mirrored` no `.wslconfig` para acesso direto via localhost.
