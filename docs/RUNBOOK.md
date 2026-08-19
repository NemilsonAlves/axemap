# Runbook - AxéMap

## Comandos Essenciais

```bash
make doctor    # Diagnóstico completo do ambiente
make dev       # Comando único para desenvolvimento
make smoke     # Smoke tests
make reset     # Resetar banco + seed
make fresh     # Clean + reinstall + reset
```

## Diagnóstico Rápido

```bash
# API (rotas reais)
curl http://localhost:3001/api/v1/health          # Health geral (db + postgis + redis)
curl http://localhost:3001/api/v1/health/db        # DB + PostGIS (DATABASE_URL mascarado)
curl http://localhost:3001/api/v1/health/redis     # Redis ping
curl http://localhost:3001/api/v1/health/storage   # Storage (bucketExists)
curl http://localhost:3001/api/v1/health/full      # Health + latência + recursos
curl http://localhost:3001/api/v1/system/status    # Status detalhado
curl http://localhost:3001/api/v1/system/version   # Versões
curl http://localhost:3001/api/v1/system/metrics   # Métricas
curl http://localhost:3001/api/v1/system/readiness # Readiness
curl http://localhost:3001/api/v1/system/liveness  # Liveness
```

## Monitoramento (ambiente de DESENVOLVIMENTO)

Ferramentas abaixo existem apenas nos profiles de dev (`docker/docker-compose.dev.yml`).
NÃO fazem parte da stack de produção (VPS usa apenas nginx + web + api + postgres + redis + minio).

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| Grafana | http://localhost:3002 | admin / axemap_grafana |
| Prometheus | http://localhost:9090 | - |
| Adminer (DB) | http://localhost:8080 | Sistema: PostgreSQL |
| RedisInsight | http://localhost:5540 | - |
| MinIO Console | http://localhost:9001 | axemap / axemap_minio_dev |
| RabbitMQ | http://localhost:15672 | axemap / axemap_rabbitmq_dev |
| Health Dashboard | http://localhost:3000/admin/system | - |

## Recuperação

### API não responde
```bash
make doctor                          # Diagnosticar
docker compose logs api              # Ver logs
curl localhost:3001/api/v1/system/liveness  # Verificar liveness
```

### Banco corrompido
```bash
make reset      # Reset + seed
make fresh      # Clean total + reset
```

### Redis com problemas
```bash
docker compose restart redis
docker compose exec redis redis-cli FLUSHALL
```

### Storage (MinIO)
```bash
docker compose --profile storage up -d
curl http://localhost:9000/minio/health/live  # Verificar health
```

## Produção (VPS)

```bash
# Logs
docker compose -f docker/docker-compose.prod.yml --env-file .env.production logs -f api
docker compose -f docker/docker-compose.prod.yml --env-file .env.production logs -f web
docker compose -f docker/docker-compose.prod.yml --env-file .env.production logs -f nginx

# Health (via host)
curl https://api.axemap.com.br/api/v1/health
curl https://api.axemap.com.br/api/v1/health/full

# Estado dos containers (healthchecks)
docker compose -f docker/docker-compose.prod.yml --env-file .env.production ps

# Status de um serviço
docker inspect --format '{{.State.Health.Status}}' axemap-prod-api-1
```

## Backup

```bash
make backup     # Backup do banco (automático)
make restore    # Restaurar backup (interativo)
```

Backups salvos em `backups/` com política de retenção de 30 dias.
