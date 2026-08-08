# AxéMap

Plataforma de Religiões Afro-Brasileiras — Conecte-se com terreiros, eventos e comunidade.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 + React 19 |
| Backend | NestJS 11 |
| ORM | Prisma 6 |
| Banco | PostgreSQL 17 + PostGIS |
| Cache | Redis 7 |
| Mapas | Leaflet + React-Leaflet |
| Monitoria | Sentry + OpenTelemetry |

## Requisitos

- **Docker** + **Docker Compose v2**
- **Node.js** >= 22 LTS
- **pnpm** >= 9
- **Make** (opcional, mas recomendado)

## Primeira Execução

```bash
# 1. Clone o repositório
git clone https://github.com/anomalyco/axemap.git
cd axemap

# 2. Setup completo (instala dependências, sobe Docker, cria banco, executa migrations, seed, build)
make setup

# 3. Iniciar servidores
make start
```

Após iniciar, acesse:

| Serviço | URL |
|---------|-----|
| Aplicação Web | http://localhost:3000 |
| API | http://localhost:3001 |
| Health Check | http://localhost:3001/api/v1/health |
| Adminer (DB) | http://localhost:8080 |
| RedisInsight | http://localhost:5540 |

## Comandos

### Docker Compose Profiles

| Comando | Serviços |
|---------|----------|
| `make core` | PostgreSQL 17 + PostGIS + Redis |
| `make admin` | Adminer (`:8080`) + RedisInsight (`:5540`) + PgAdmin (`:5050`) |
| `make observability` | Prometheus (`:9090`) + Grafana (`:3002`) + Loki + Tempo + OTEL Collector |
| `make storage` | MinIO S3-compatible (`:9000` API, `:9001` Console) |
| `make messaging` | RabbitMQ (`:5672`, `:15672` Management) |
| `make search` | Meilisearch (`:7700`) |
| `make analytics` | ClickHouse (`:8123`) |
| `make ai` | Ollama (`:11434`) |
| `make all` | Todos os serviços acima |

Exemplos de combinações:

```bash
# Desenvolvimento mínimo
make core

# Desenvolvimento completo
make core && make admin && make storage

# Toda a infraestrutura
make all
```

### Gerenciamento

| Comando | Descrição |
|---------|-----------|
| `make setup` | Setup completo do ambiente |
| `make start` | Iniciar servidores |
| `make stop` | Parar servidores |
| `make restart` | Reiniciar servidores |
| `make logs` | Ver logs dos containers |
| `make shell` | Acessar PSQL no banco |

### Banco de Dados

| Comando | Descrição |
|---------|-----------|
| `make migrate` | Executar migrations |
| `make seed` | Popular banco com dados iniciais |
| `make reset` | Resetar banco (com confirmação) |
| `make backup` | Backup do banco (`.sql.gz`) |
| `make restore` | Restaurar backup |

### Qualidade

| Comando | Descrição |
|---------|-----------|
| `make lint` | Linter |
| `make typecheck` | Verificação de tipos |
| `make test` | Testes |
| `make build` | Compilar projeto |

### Diagnóstico

| Comando | Descrição |
|---------|-----------|
| `make doctor` | Verificar saúde do ambiente |
| `make health` | Health check da API |

### Utilitários

| Comando | Descrição |
|---------|-----------|
| `make clean` | Limpar builds e dependências |
| `make prisma-studio` | Abrir Prisma Studio |

## Estrutura

```
axemap/
├── apps/
│   ├── api/          # NestJS API
│   └── web/          # Next.js Frontend
├── packages/
│   ├── database/     # Prisma schema + client
│   ├── shared/       # Tipos, interfaces e validadores
│   └── config/       # Configs base do TypeScript
├── infra/
│   ├── docker/
│   │   └── compose/  # Compose files por profile
│   │       ├── core.yml
│   │       ├── admin.yml
│   │       ├── observability.yml
│   │       ├── storage.yml
│   │       ├── messaging.yml
│   │       ├── search.yml
│   │       ├── analytics.yml
│   │       └── ai.yml
│   ├── monitoring/
│   │   ├── prometheus/     # prometheus.yml + regras
│   │   ├── grafana/        # dashboards + datasources
│   │   ├── loki/           # loki.yml + promtail.yml
│   │   ├── otel/           # opentelemetry-collector.yml
│   │   └── tempo/          # tempo.yml
│   └── storage/
│       └── minio/          # init.sh (cria buckets)
├── docker/
│   ├── Dockerfile.api
│   └── Dockerfile.web
├── docker-compose.yml       # Orquestrador principal (include dos profiles)
├── scripts/
│   ├── setup.sh      # Setup automatizado
│   ├── start.sh      # Iniciar servidores
│   ├── stop.sh       # Parar servidores
│   ├── check.sh      # Diagnóstico (make doctor)
│   ├── backup-db.sh  # Backup do banco
│   ├── restore-db.sh # Restauração de backup
│   └── reset-db.sh   # Reset do banco
├── backups/          # Backups do banco (.sql.gz)
├── .github/          # GitHub Actions (CI/CD)
└── Makefile          # Comandos principais
```

## Docker Compose Profiles

O AxéMap utiliza **Docker Compose Profiles** para infraestrutura modular. Cada profile agrupa serviços relacionados:

| Profile | Conteúdo | Portas |
|---------|----------|--------|
| **core** | PostgreSQL 17 + PostGIS, Redis 7 | 5432, 6379 |
| **admin** | Adminer, RedisInsight, PgAdmin | 8080, 5540, 5050 |
| **observability** | Prometheus, Grafana, Loki, Promtail, OTEL Collector, Tempo | 9090, 3002, 3100 |
| **storage** | MinIO (S3-compatible) | 9000, 9001 |
| **messaging** | RabbitMQ | 5672, 15672 |
| **search** | Meilisearch | 7700 |
| **analytics** | ClickHouse | 8123 |
| **ai** | Ollama | 11434 |

O arquivo `docker-compose.yml` na raiz orquestra todos os profiles via `include`. Para subir combinações:

```bash
docker compose --profile core --profile admin up -d
```

## Storage Provider

O AxéMap utiliza uma **abstração de Storage Provider** (DIP) para desacoplar o armazenamento de arquivos do fornecedor:

```
StorageProvider (interface)
  ├── S3StorageProvider  → AWS S3 / MinIO / Cloudflare R2
  ├── LocalStorageProvider (futuro)
  └── GCStorageProvider (futuro)
```

A interface está em `packages/shared/src/interfaces/storage-provider.ts` e a implementação S3 em `apps/api/src/common/storage/`. A configuração é feita via variáveis de ambiente:

| Variável | Default | Descrição |
|----------|---------|-----------|
| `STORAGE_TYPE` | `minio` | `minio`, `s3`, `r2`, `gcs` |
| `STORAGE_ENDPOINT` | `http://localhost:9000` | Endpoint do servidor S3 |
| `STORAGE_REGION` | `auto` | Região AWS (usar `auto` para R2/MinIO) |
| `STORAGE_ACCESS_KEY` | `axemap` | Access Key |
| `STORAGE_SECRET_KEY` | `axemap_minio_dev` | Secret Key |
| `STORAGE_BUCKET` | `axemap` | Bucket padrão |

## Backup e Restore

```bash
# Backup manual
make backup
# Arquivos em: backups/YYYY-MM-DD-HHMM.sql.gz

# Restaurar (lista backups disponíveis)
make restore
```

A política de retenção mantém os 30 backups mais recentes.

## Health Checks

```bash
# Básico (DB + Redis)
curl http://localhost:3001/api/v1/health

# Banco de dados específico
curl http://localhost:3001/api/v1/health/db

# Redis específico
curl http://localhost:3001/api/v1/health/redis

# Armazenamento
curl http://localhost:3001/api/v1/health/storage

# Completo (inclui recursos: memória, latência, uptime)
curl http://localhost:3001/api/v1/health/full
```

## Troubleshooting

### "Can't reach database server"

Verifique se o container do PostgreSQL está rodando:

```bash
docker compose --profile core ps
make doctor
```

### "Porta já em uso"

```bash
# Verificar qual processo está usando a porta
sudo lsof -i :3000
sudo lsof -i :3001
sudo lsof -i :5432
```

### Reset do ambiente

```bash
make stop
make clean
make setup
```

### Docker sem permissão

```bash
sudo usermod -aG docker $USER
# Efetue logout e login novamente
```

## Ambientes

| Ambiente | Infraestrutura | Objetivo |
|----------|---------------|----------|
| Development | Local (Docker Compose profiles) | Desenvolvimento |
| Staging | Railway/Vercel | Homologação |
| Production | Railway/Vercel | Produção |

## Licença

MIT
