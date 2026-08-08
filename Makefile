.PHONY: setup dev dev-full start stop restart up down logs shell migrate seed migrate-seed reset
.PHONY: fresh clean rebuild prisma-generate prisma-studio backup restore
.PHONY: lint typecheck test test-coverage build health doctor smoke security-check
.PHONY: core admin observability storage messaging search analytics ai all infra-up infra-down infra-logs
.PHONY: help

# ───── Setup ─────
setup: ## Instalação completa (dependências, docker, banco, build)
	@echo "=== AxéMap Setup ==="
	@chmod +x scripts/*.sh scripts/wait-for-services.sh
	@./scripts/setup.sh

dev: ## Comando único: containers + migrate + seed + servidores
	@echo "=== AxéMap Dev ==="
	@./scripts/wait-for-services.sh docker-compose.yml && \
		cd packages/database && npx prisma migrate dev && npx prisma db seed && \
		echo -e "\n\033[0;36mIniciando servidores...\033[0m" && \
		pnpm dev

dev-full: ## Setup completo + servidores
	@make setup && make start

# ───── Gerenciamento ─────
start: ## Iniciar servidores (containers + API + Web)
	@./scripts/start.sh

stop: ## Parar servidores e containers
	@./scripts/stop.sh

restart: stop start ## Reiniciar servidores

# ───── Reset Inteligente ─────
reset: ## Resetar banco + rebuild Prisma + seed
	@echo "=== AxéMap Reset ==="
	@echo "  Parando servidores..."
	@-pkill -f "nest start" 2>/dev/null || true
	@-pkill -f "next dev" 2>/dev/null || true
	@echo "  Resetando banco..."
	cd packages/database && npx prisma migrate reset --force && npx prisma db seed
	@echo "  \033[0;32m✓\033[0m Reset concluído. Execute 'make start' para iniciar."

fresh: ## Reset completo + clean install + rebuild
	@echo "=== AxéMap Fresh ==="
	@make stop
	@make clean
	pnpm install
	@make reset

clean: ## Limpar builds, caches e dependências
	@echo "=== AxéMap Clean ==="
	rm -rf apps/api/dist apps/web/.next packages/*/dist
	rm -f apps/api/tsconfig.tsbuildinfo apps/web/tsconfig.tsbuildinfo
	rm -rf .turbo apps/*/.turbo packages/*/.turbo
	rm -rf apps/api/node_modules apps/web/node_modules packages/*/node_modules
	rm -rf node_modules
	@echo "  \033[0;32m✓\033[0m Limpeza concluída. Execute 'pnpm install' para reinstalar."

rebuild: ## Rebuild completo do projeto
	@echo "=== AxéMap Rebuild ==="
	pnpm build
	@echo "  \033[0;32m✓\033[0m Build concluído."

# ───── Docker Compose Profiles ─────
COMPOSE_FILE := -f docker-compose.yml

core: ## Iniciar apenas serviços essenciais (PG + Redis)
	docker compose $(COMPOSE_FILE) --profile core up -d

admin: ## Iniciar ferramentas administrativas (Adminer, RedisInsight, PgAdmin)
	docker compose $(COMPOSE_FILE) --profile admin up -d

observability: ## Iniciar stack de monitoramento (Prometheus, Grafana, Loki, Tempo, OTEL)
	docker compose $(COMPOSE_FILE) --profile observability up -d

storage: ## Iniciar armazenamento S3-compatível (MinIO)
	docker compose $(COMPOSE_FILE) --profile storage up -d

messaging: ## Iniciar mensageria (RabbitMQ)
	docker compose $(COMPOSE_FILE) --profile messaging up -d

search: ## Iniciar mecanismo de busca (Meilisearch)
	docker compose $(COMPOSE_FILE) --profile search up -d

analytics: ## Iniciar banco analítico (ClickHouse)
	docker compose $(COMPOSE_FILE) --profile analytics up -d

ai: ## Iniciar ambiente de IA (Ollama)
	docker compose $(COMPOSE_FILE) --profile ai up -d

all: ## Iniciar todos os serviços
	docker compose $(COMPOSE_FILE) --profile core --profile admin --profile observability --profile storage --profile messaging --profile search --profile analytics --profile ai up -d

infra-up: ## Subir containers com todos os profiles ativos
	docker compose $(COMPOSE_FILE) --profile "*" up -d

infra-down: ## Parar todos os containers
	docker compose $(COMPOSE_FILE) down

infra-logs: ## Ver logs de todos os containers
	docker compose $(COMPOSE_FILE) logs -f

up: core ## Subir containers (alias para core)
down: infra-down ## Parar containers
logs: infra-logs ## Ver logs

shell: ## Acessar shell do banco de dados
	docker compose -f docker-compose.yml exec postgres psql -U axemap -d axemap_dev

# ───── Banco de Dados ─────
migrate: ## Executar migrations do Prisma
	cd packages/database && npx prisma migrate dev

seed: ## Executar seed do banco
	cd packages/database && npx prisma db seed

migrate-seed: ## Migrate + Seed
	cd packages/database && npx prisma migrate dev && npx prisma db seed

# ───── Backup ─────
backup: ## Criar backup do banco de dados
	@./scripts/backup-db.sh

restore: ## Restaurar backup do banco de dados
	@./scripts/restore-db.sh

# ───── Prisma ─────
prisma-generate: ## Gerar Prisma Client
	cd packages/database && npx prisma generate

prisma-studio: ## Abrir Prisma Studio
	cd packages/database && npx prisma studio

# ───── Qualidade ─────
lint: ## Executar linter em todos os pacotes
	pnpm lint

typecheck: ## Verificar tipos TypeScript
	pnpm typecheck

test: ## Executar testes
	pnpm test

test-coverage: ## Executar testes com cobertura
	pnpm test:coverage

build: ## Compilar todos os pacotes
	pnpm build

# ───── Utilitários ─────
health: ## Verificar health check da API
	@echo "=== Health Check ==="
	@curl -s http://localhost:3001/api/v1/system/health | jq . || curl -s http://localhost:3001/api/v1/system/health

doctor: ## Diagnosticar ambiente completo (Doctor 2.0)
	@./scripts/check.sh

smoke: ## Executar smoke tests
	@bash scripts/smoke.sh

security-check: ## Verificar segurança do ambiente
	@bash scripts/security-check.sh

# ───── Help ─────
help: ## Mostrar esta ajuda
	@echo "AxéMap — Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""
	@echo "Primeira execução:"
	@echo "  1. make setup   — Instala tudo"
	@echo "  2. make dev     — Desenvolvimento (comando único)"
	@echo ""
	@echo "Reset Inteligente:"
	@echo "  make reset      — Reset banco + rebuild + seed"
	@echo "  make fresh      — Clean + reinstall + reset"
	@echo "  make rebuild    — Rebuild completo"
	@echo ""
	@echo "Diagnóstico:"
	@echo "  make doctor     — Diagnóstico completo"
	@echo "  make smoke      — Smoke tests"
	@echo "  make health     — Health check da API"
	@echo ""
	@echo "Docker Profiles:"
	@echo "  make core       — PG + Redis (essencial)"
	@echo "  make all        — Todos os serviços"

.DEFAULT_GOAL := help
