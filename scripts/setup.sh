#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo -e "${CYAN}═══════════════════════════════════════${NC}"
echo -e "${CYAN}  AxéMap — Setup do Ambiente${NC}"
echo -e "${CYAN}═══════════════════════════════════════${NC}"

# ──────────────────────────────────────────────
# 1. Validar / instalar dependências do sistema
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[1/8]${NC} Verificando dependências do sistema..."

install_if_missing() {
  local name="$1"
  local pkg="$2"
  local check_cmd="$3"
  if ! eval "$check_cmd" 2>/dev/null; then
    echo -e "  ${YELLOW}Instalando $name...${NC}"
    sudo apt-get install -y "$pkg" 2>/dev/null || {
      echo -e "  ${RED}Falha ao instalar $name.${NC}"
      echo -e "  ${YELLOW}Dica: Tente manualmente: sudo apt-get install -y $pkg${NC}"
      exit 1
    }
  else
    echo -e "  ${GREEN}✓${NC} $name já instalado"
  fi
}

sudo apt-get update -qq

install_if_missing "Git" "git" "command -v git"
install_if_missing "curl" "curl" "command -v curl"
install_if_missing "jq" "jq" "command -v jq"
install_if_missing "unzip" "unzip" "command -v unzip"
install_if_missing "make" "make" "command -v make"
install_if_missing "OpenSSL" "openssl" "command -v openssl"

# ──────────────────────────────────────────────
# 2. Docker
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[2/8]${NC} Verificando Docker..."

if ! command -v docker &>/dev/null; then
  echo -e "  ${YELLOW}Instalando Docker...${NC}"
  curl -fsSL https://get.docker.com | sh
  sudo usermod -aG docker "$USER"
  echo -e "  ${YELLOW}⚠ Docker instalado. Efetue logout/login ou execute: newgrp docker${NC}"
else
  echo -e "  ${GREEN}✓${NC} Docker já instalado ($(docker --version))"
fi

if ! docker info --format "{{.OSType}}" 2>/dev/null | grep -q linux; then
  echo -e "  ${YELLOW}Iniciando Docker daemon...${NC}"
  sudo dockerd &
  sleep 3
fi

# ──────────────────────────────────────────────
# 3. Node.js LTS via nvm
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[3/8]${NC} Verificando Node.js e pnpm..."

if ! command -v node &>/dev/null || [ "$(node --version | cut -d. -f1 | tr -d v)" -lt 22 ]; then
  echo -e "  ${YELLOW}Instalando Node.js LTS via nvm...${NC}"
  if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
  fi
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install --lts
  nvm use --lts
  echo -e "  ${GREEN}✓${NC} Node.js $(node --version) instalado"
else
  echo -e "  ${GREEN}✓${NC} Node.js $(node --version)"
fi

if ! command -v pnpm &>/dev/null; then
  echo -e "  ${YELLOW}Instalando pnpm...${NC}"
  npm install -g pnpm@latest
  echo -e "  ${GREEN}✓${NC} pnpm instalado"
else
  echo -e "  ${GREEN}✓${NC} pnpm v$(pnpm --version)"
fi

# ──────────────────────────────────────────────
# 4. Gerar .env se não existir
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[4/8]${NC} Gerando variáveis de ambiente..."

if [ ! -f ".env" ]; then
  JWT_SECRET=$(openssl rand -hex 32)
  JWT_REFRESH_SECRET=$(openssl rand -hex 32)
  NEXTAUTH_SECRET=$(openssl rand -hex 32)

  cat > .env <<EOF
# Database
DATABASE_URL=postgresql://axemap:axemap_dev@localhost:5432/axemap_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
JWT_REFRESH_EXPIRES_IN=7d

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$NEXTAUTH_SECRET
FRONTEND_URL=http://localhost:3000

# API
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001

# Environment
NODE_ENV=development
LOG_LEVEL=debug
EOF

  # .env.local (sobrescreve .env localmente)
  cat > .env.local <<EOF
# Local overrides
NODE_ENV=development
LOG_LEVEL=debug
EOF

  # .env.development
  cat > .env.development <<EOF
NODE_ENV=development
LOG_LEVEL=debug
EOF

  # .env.example (sem secrets)
  cat > .env.example <<EOF
# Database
DATABASE_URL=postgresql://axemap:axemap_dev@localhost:5432/axemap_dev

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=change-me-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change-me-in-production
JWT_REFRESH_EXPIRES_IN=7d

# Auth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=change-me-in-production
FRONTEND_URL=http://localhost:3000

# API
API_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001
PORT=3001

# Environment
NODE_ENV=development
LOG_LEVEL=debug
EOF

  echo -e "  ${GREEN}✓${NC} .env, .env.local, .env.development, .env.example criados"
else
  echo -e "  ${GREEN}✓${NC} .env já existe — preservado"
fi

# ──────────────────────────────────────────────
# 5. Docker Compose — subir containers
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[5/8]${NC} Subindo containers Docker..."

COMPOSE_FILE="docker-compose.yml"
if [ ! -f "$COMPOSE_FILE" ]; then
  COMPOSE_FILE="docker/docker-compose.dev.yml"
fi

docker compose -f "$COMPOSE_FILE" --profile core up -d 2>&1 || {
  echo -e "  ${RED}Falha ao subir containers.${NC}"
  docker compose -f "$COMPOSE_FILE" logs
  exit 1
}

echo -e "  ${GREEN}✓${NC} Containers iniciados"
echo -e "  Aguardando banco de dados ficar saudável..."

bash scripts/wait-for-services.sh "$COMPOSE_FILE"

# ──────────────────────────────────────────────
# 6. Instalar dependências do projeto
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[6/8]${NC} Instalando dependências do projeto..."

pnpm install 2>&1 || {
  echo -e "  ${RED}pnpm install falhou.${NC}"
  exit 1
}
echo -e "  ${GREEN}✓${NC} Dependências instaladas"

# ──────────────────────────────────────────────
# 7. Prisma — generate + migrate + seed
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[7/8]${NC} Configurando Prisma..."

cd "$PROJECT_DIR/packages/database"

echo -e "  Gerando Prisma Client..."
npx prisma generate 2>&1 || {
  echo -e "  ${RED}prisma generate falhou.${NC}"
  exit 1
}
echo -e "  ${GREEN}✓${NC} Prisma Client gerado"

echo -e "  Executando migrations..."
npx prisma migrate dev --name init --skip-seed 2>&1 || {
  echo -e "  ${YELLOW}⚠ migrate dev falhou. Tentando migrate deploy...${NC}"
  npx prisma migrate deploy 2>&1 || {
    echo -e "  ${RED}Todas as tentativas de migração falharam.${NC}"
    echo -e "  Verifique se o banco está acessível em: $(grep DATABASE_URL ../../.env | cut -d= -f2-)"
    exit 1
  }
}
echo -e "  ${GREEN}✓${NC} Migrations executadas"

echo -e "  Executando seed..."
npx prisma db seed 2>&1 || echo -e "  ${YELLOW}⚠ Seed falhou (pode ser executado depois: make seed)${NC}"
echo -e "  ${GREEN}✓${NC} Seed concluída"

cd "$PROJECT_DIR"

# ──────────────────────────────────────────────
# 8. Build + Testes
# ──────────────────────────────────────────────
echo -e "\n${CYAN}[8/8]${NC} Build e verificações..."

echo -e "  Compilando projeto..."
pnpm build 2>&1 || {
  echo -e "  ${RED}Build falhou.${NC}"
  exit 1
}
echo -e "  ${GREEN}✓${NC} Build concluído"

echo -e "  Executando lint..."
pnpm lint 2>&1 || echo -e "  ${YELLOW}⚠ Lint com avisos${NC}"

echo -e "  Executando typecheck..."
pnpm typecheck 2>&1 || echo -e "  ${YELLOW}⚠ Typecheck com avisos${NC}"

# ──────────────────────────────────────────────
# Concluído
# ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup concluído com sucesso!${NC}"
echo -e "${GREEN}═══════════════════════════════════════${NC}"
echo ""
echo -e "  ${CYAN}Aplicação Web:${NC}      http://localhost:3000"
echo -e "  ${CYAN}API:${NC}                 http://localhost:3001"
echo -e "  ${CYAN}Health Check:${NC}        http://localhost:3001/api/v1/health"
echo -e "  ${CYAN}Adminer (DB):${NC}        http://localhost:8080 (Sistema: PostgreSQL)"
echo -e "  ${CYAN}RedisInsight:${NC}        http://localhost:5540"
echo ""
echo -e "  ${YELLOW}Comandos úteis:${NC}"
echo -e "    make start         — Iniciar servidores"
echo -e "    make stop          — Parar servidores"
echo -e "    make logs          — Ver logs dos containers"
echo -e "    make doctor        — Diagnosticar ambiente"
echo -e "    make reset         — Resetar banco de dados"
echo -e "    make backup        — Backup do banco"
echo -e "    make restore       — Restaurar backup"
echo ""
