# Deployment - AxéMap

## Ambiente Local

```bash
git clone <repo>
cd axemap
make setup    # Instalação completa
make dev      # Desenvolvimento
```

## Variáveis de Ambiente Essenciais

```env
DATABASE_URL=postgresql://axemap:axemap_dev@localhost:5432/axemap_dev
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=<generated>
JWT_REFRESH_SECRET=<generated>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generated>
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001
NODE_ENV=development
LOG_LEVEL=debug
```

## Health Checks

A API expõe endpoints padrão para health checks em container orchestration:

| Endpoint | Uso | Resposta Esperada |
|----------|-----|-------------------|
| `/api/v1/system/liveness` | Liveness probe | `{"status":"alive"}` |
| `/api/v1/system/readiness` | Readiness probe | `{"status":"ready"}` |
| `/api/v1/system/health` | Health check | `{"status":"healthy"}` |

## Docker

```bash
# Construir imagens
docker build -f docker/Dockerfile.api -t axemap-api .
docker build -f docker/Dockerfile.web -t axemap-web .

# Executar com Docker Compose
docker compose --profile core up -d
```

## CI/CD

O pipeline deve executar:

1. `pnpm install`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm build`
5. `make smoke` (se ambiente de teste disponível)
6. `pnpm test`
