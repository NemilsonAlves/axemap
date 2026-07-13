# 62 — Plano de Escalabilidade para 1 Milhão de Usuários

## Premissas de Escala

| Métrica | Hoje (MVP) | 6 meses | 12 meses | 24 meses (1M) |
|---------|-----------|---------|----------|----------------|
| Usuários registrados | 1k | 50k | 500k | 1M |
| Terreiros | 100 | 1k | 5k | 20k |
| Avaliações | 500 | 10k | 100k | 500k |
| Buscas/dia | 100 | 5k | 50k | 200k |
| Eventos/mês | 50 | 1k | 10k | 50k |
| Fotos armazenadas | 500 | 5k | 50k | 500k |
| Requests API/dia | 1k | 100k | 1M | 10M |
| Logs auditoria/dia | 100 | 1k | 10k | 100k |

## Arquitetura de Escala

### Fase 1: Monolito + Réplica (0 — 50k usuários)

```
[Vercel (Next.js)] ←→ [API NestJS] ←→ [PostgreSQL Primary + Read Replica]
                         ↕
                    [Redis (Cache + Queue)]
                         ↕
                    [Cloudflare R2 (Storage)]
```

**Capacidade:** 50k usuários, 500 req/s
**Custo estimado:** ~R$ 500-1k/mês

### Fase 2: Microserviços Iniciais (50k — 250k usuários)

```
[Vercel (Next.js)] ←→ [API Gateway (Traefik)]
                         │
              ┌──────────┼──────────┐
              ▼          ▼          ▼
         [Auth]    [Terreiros]   [Busca]
         [Svc]      [Svc]        [Svc]
              │          │          │
              ▼          ▼          ▼
         ┌─────────────────────────────┐
         │     PostgreSQL Cluster      │
         │  (Primary + 2 Read Replicas)│
         └─────────────────────────────┘
                   ↕
         [Redis Cluster]
                   ↕
         [BullMQ Workers × 3]
```

**Capacidade:** 250k usuários, 2k req/s
**Custo estimado:** ~R$ 3-5k/mês

### Fase 3: Microserviços Completos + CQRS (250k — 1M usuários)

```
[Vercel (Next.js)] ←→ [Cloudflare CDN]
                         │
                    [API Gateway]
                         │
         ┌──────────┬────┼────┬──────────┐
         ▼          ▼    ▼    ▼          ▼
      [Auth]  [Terreiros] [Busca]  [Avaliacoes]
      [Svc]    [Svc]     [Svc]     [Svc]
         │          │      │        │
         ▼          ▼      ▼        ▼
    ┌──────────────────────────────────────┐
    │        Write DB (PostgreSQL)          │
    │        + Event Bus (Redis)           │
    └──────────────────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │     Read DB (PostgreSQL Replicas)    │
    │     + Meilisearch (Texto)            │
    │     + pgvector (Semântica)           │
    └──────────────────────────────────────┘
                    │
                    ▼
    ┌──────────────────────────────────────┐
    │     Workers (BullMQ × 10)            │
    │     Trust Score, Notificações, IA,   │
    │     Analytics, Email, Moderação      │
    └──────────────────────────────────────┘
```

**Capacidade:** 1M+ usuários, 10k+ req/s
**Custo estimado:** ~R$ 15-25k/mês

## Estratégias de Escala por Componente

### Banco de Dados (PostgreSQL)

| Técnica | Quando | Impacto |
|---------|--------|---------|
| **Índices** | MVP | Essencial |
| **Read Replicas** | 10k usuários | Leituras 10x mais rápidas |
| **Connection Pooling** (PgBouncer) | 5k usuários | Evita conexões esgotadas |
| **Particionamento** (por cidade/estado) | 100k terreiros | Queries locais mais rápidas |
| **Sharding** (por região) | 500k+ | Escala horizontal |
| **Citus (distributed Postgres)** | 1M+ | Sharding automático |

### Busca

| Fase | Tecnologia | Motivo |
|------|-----------|--------|
| MVP | PostgreSQL full-text search | Zero infra adicional |
| 10k terreiros | PostgreSQL + índices GIN | Suficiente para 50k |
| 50k terreiros | Meilisearch (self-hosted) | Typos tolerance, faceting, velocidade |
| 500k+ | Meilisearch cluster + Elasticsearch (logs) | Escala horizontal |

### Cache (Redis)

| Uso | Estratégia | TTL |
|-----|-----------|-----|
| Sessões | Redis cluster | 7 dias |
| Cache de busca | Cache por query + invalidação por evento | 5-30 min |
| Rate limiting | Redis sorted sets | 1 hora |
| BullMQ filas | Redis persistente (AOF) | Até processar |
| Trust Score | Cache do score (evita recalculo) | 5 min |

### Storage (Cloudflare R2)

| Tipo de Arquivo | Tamanho Máx | Otimização | CDN |
|----------------|-------------|-----------|-----|
| Fotos perfil | 10MB | WebP + AVIF via Cloudflare Images | ✅ |
| Documentos verificação | 20MB | Criptografados, sem CDN | ❌ |
| Vídeos | 100MB | HLS streaming via Cloudflare Stream | ✅ |
| Logs auditoria | Texto | Comprimido (gzip), arquivado após 30 dias | ❌ |

### Workers (BullMQ)

| Worker | Instâncias | Prioridade | Consumo CPU |
|--------|-----------|-----------|-------------|
| Trust Score | 2 | Alta | Médio |
| Email | 2 | Alta | Baixo |
| Notificação Push | 2 | Alta | Baixo |
| Moderação IA | 3 | Média | Alto (GPU?) |
| Processamento de Imagem | 2 | Média | Alto |
| Auditoria | 1 | Baixa | Baixo |
| Analytics | 1 | Baixa | Médio |
| Anti-fraude | 1 | Média | Médio |

## Estratégia de Cache para Trust Score

```
Request → API Gateway
  → Verifica cache (Redis): "trust_score:{terreiro_id}"
    ├── HIT → retorna score cached (TTL: 5min)
    └── MISS → recalcula score
        → Atualiza Redis
        → Retorna score

Invalidação:
  → Evento de domínio (PerfilAtualizado, NovaAvaliacao, etc.)
    → Remove chave do Redis
    → Próxima request recalcula
```

## Rate Limiting por Escala

| Endpoint | MVP (100 req/s) | 50k users (1k req/s) | 1M users (10k req/s) |
|----------|----------------|---------------------|---------------------|
| Públicos (busca, perfil) | 100/min/IP | 500/min/IP | 1000/min/IP + CDN cache |
| Autenticação (login) | 10/min/IP | 20/min/IP | 50/min/IP |
| Escrita (avaliações) | 30/min/user | 60/min/user | 100/min/user |
| Upload de fotos | 10/min/user | 20/min/user | 50/min/user |
| API Pública | 1000/min/key | 5000/min/key | 10000/min/key |

## Monitoramento de Escala

| Métrica | Alerta | Ação |
|---------|--------|------|
| CPU do banco > 70% | 🔴 Crítico | Adicionar réplica |
| P95 latency > 500ms | 🟠 Alerta | Verificar índices, cache |
| Redis memory > 80% | 🟠 Alerta | Aumentar cluster |
| Connection pool > 80% | 🟠 Alerta | Aumentar pool / réplicas |
| Worker queue backlog > 10k | 🟠 Alerta | Adicionar workers |
| Storage usado > 80% | 🟢 Aviso | Limpar/arquivar |

## Testes de Carga

| Fase | Cenário | Ferramenta | Meta |
|------|---------|-----------|------|
| MVP | 100 usuários simultâneos | k6 (locust) | P95 < 500ms |
| Crescimento | 1k simultâneos | k6 | P95 < 1s |
| Escala | 10k simultâneos | k6 + Gatling | P95 < 2s |

## Custo Projetado de Infraestrutura

| Componente | MVP | 50k | 250k | 1M |
|-----------|-----|-----|------|-----|
| Vercel (Frontend) | Grátis | $20/mês | $200/mês | $1000/mês |
| API Servers | $50/mês | $200/mês | $1000/mês | $5000/mês |
| PostgreSQL | $50/mês | $200/mês | $1000/mês | $3000/mês |
| Redis | $20/mês | $50/mês | $200/mês | $500/mês |
| Storage (R2) | $5/mês | $20/mês | $100/mês | $500/mês |
| Workers | $0 (mesmo server) | $100/mês | $500/mês | $2000/mês |
| Cloudflare | Grátis | $20/mês | $50/mês | $200/mês |
| Email/SMS | $10/mês | $50/mês | $200/mês | $1000/mês |
| **Total** | **~$135/mês** | **~$660/mês** | **~$3.250/mês** | **~$13.200/mês** |
| | ~R$ 700/mês | ~R$ 3.500/mês | ~R$ 17k/mês | ~R$ 70k/mês |
