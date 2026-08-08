# Ambiente de Desenvolvimento Local — AxéMap

## Stack

| Tecnologia | Versão Mínima |
|---|---|
| Windows 11 | 23H2 (Build 22631) |
| WSL 2 | 2.1.0+ |
| Ubuntu | 24.04+ |
| Docker | 29+ |
| Node.js | 22+ |
| pnpm | 9+ |

---

## Sumário

1. [Instalação](#1-instalação)
2. [Execução](#2-execução)
3. [Comandos Úteis](#3-comandos-úteis)
4. [Arquitetura de Rede](#4-arquitetura-de-rede)
5. [Troubleshooting](#5-troubleshooting)

---

## 1. Instalação

### 1.1 WSL2 — Mirrored Networking (Recomendado)

Edite `%USERPROFILE%\.wslconfig`:

```ini
[wsl2]
memory=12GB
networkingMode=mirrored
dnsTunneling=true
firewall=false
autoProxy=true
```

> **O que isso faz?** [Mirrored Networking](https://learn.microsoft.com/en-us/windows/wsl/networking#mirrored-mode-networking) faz o WSL2 compartilhar o mesmo endereço IP da máquina Windows. Isso elimina a camada NAT e faz com que todas as portas do WSL fiquem acessíveis diretamente via `localhost` no Windows.

Reinicie o WSL:

```powershell
wsl --shutdown
wsl
```

Verifique se está ativo:

```bash
make doctor
# ou
cat /proc/sys/net/ipv4/ip_forward  # deve retornar 1
```

### 1.2 Docker

O Docker deve estar instalado **dentro do WSL** (Ubuntu).

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Efetue logout/login ou execute: newgrp docker
```

Verifique:
```bash
docker --version
docker compose version
```

### 1.3 Node.js e pnpm

```bash
# Via nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
nvm install --lts
nvm use --lts

# pnpm
npm install -g pnpm@latest
```

### 1.4 Projeto

```bash
# Clone
git clone <repo-url> ~/axemap
cd ~/axemap

# Setup completo (uma vez só)
make setup
```

O `make setup`:
1. Instala dependências do sistema (curl, jq, openssl, git, make)
2. Verifica Docker
3. Verifica Node.js/pnpm
4. Gera `.env` com `localhost` (nunca IP do WSL)
5. Sobe containers (PostgreSQL + Redis)
6. Aguarda banco ficar saudável
7. Instala dependências do projeto
8. Executa `prisma generate`, `prisma migrate dev`, `prisma db seed`
9. Executa build e lint

---

## 2. Execução

### Windows nativo (sem WSL/Docker) — PostgreSQL portátil

Se você desenvolve direto no Windows (sem WSL), use os scripts PowerShell — **não** o `make` (que é Linux/WSL):

```powershell
# Sobe PostgreSQL portátil (.pgdata) + Redis + migrate + seed + API + Web
powershell scripts\dev-local.ps1

# Apenas infraestrutura (sem iniciar servidores)
powershell scripts\dev-local.ps1 -SkipStart

# Apenas servidores (API/Web já buildados)
powershell scripts\start-api.ps1   # porta 3001
powershell scripts\start-web.ps1   # porta 3000
powershell scripts\stop-local.ps1  # para tudo (use -KeepDb para manter o banco)
```

Requisitos Windows: PostgreSQL portátil em `.pgportable\` e `redis-server` via chocolatey (fallback: segue sem Redis, health degradado).

> **Atenção porta 3000:** se outro projeto (ex: NutriScan) estiver rodando via Docker dentro do WSL, a porta fica invisível no netstat do Windows. Pare o container antes: `wsl -e sh -c "docker stop nutriscan-frontend"`.

### Desenvolvimento com Docker (Linux/WSL)

```bash
make dev
```

Este comando:
1. Sobe containers Docker (PostgreSQL + Redis)
2. Aguarda serviços ficarem saudáveis
3. Executa migrations pendentes
4. Executa seed
5. Inicia API (NestJS) na porta 3001
6. Inicia Web (Next.js) na porta 3000

### OU (passo a passo)

```bash
# Apenas containers
make core

# Migrations
make migrate

# Seed
make seed

# Servidores
make start
```

### Acessar

| Serviço | URL |
|---|---|
| Web (Frontend) | http://localhost:3000 |
| API (Backend) | http://localhost:3001 |
| Health Check | http://localhost:3001/api/v1/health |
| Adminer (DB) | http://localhost:8080 (Sistema: PostgreSQL) |
| RedisInsight | http://localhost:5540 |
| MinIO Console | http://localhost:9001 |
| RabbitMQ | http://localhost:15672 |

> **Nota:** Todas as URLs usam `localhost`. **Nunca** utilize o IP do WSL.

---

## 3. Comandos Úteis

### Desenvolvimento
```bash
make dev           # Comando único (containers + migrate + seed + servidores)
make start         # Iniciar servidores
make stop          # Parar servidores
make restart       # Reiniciar servidores
make logs          # Ver logs dos containers
```

### Reset Inteligente
```bash
make reset         # Reset banco + rebuild + seed
make fresh         # Clean + pnpm install + reset (do zero)
make clean         # Limpar builds, caches, node_modules
make rebuild       # Rebuild completo do projeto
```

### Diagnóstico
```bash
make doctor        # Diagnóstico completo (Doctor 2.0)
make smoke         # Smoke tests (signup, login, terreiros, feedback, etc)
make health        # Health check da API (/system/health)
make security-check # Verificar segurança do ambiente
```

### Banco de Dados
```bash
make migrate       # Executar migrations do Prisma
make seed          # Executar seed do banco
make migrate-seed  # Migrate + Seed
make shell         # Acessar PSQL do banco
make backup        # Backup do banco
make restore       # Restaurar backup
```

### Prisma
```bash
make prisma-generate  # Gerar Prisma Client
make prisma-studio    # Abrir Prisma Studio
```

### Qualidade
```bash
make lint          # Executar linter
make typecheck     # Verificar tipos TypeScript
make test          # Executar testes
make build         # Compilar projeto
```

### Docker Profiles
```bash
make core           # PG + Redis (essencial)
make admin          # Adminer + RedisInsight + PgAdmin
make storage        # MinIO (S3-compatível)
make observability  # Prometheus + Grafana + Loki + Tempo
make messaging      # RabbitMQ
make search         # Meilisearch
make analytics      # ClickHouse
make ai             # Ollama
make all            # Todos os serviços
```

---

## 4. Arquitetura de Rede

### Problema Original

O WSL2, por padrão, usa **modo NAT**. Isso significa que:

- WSL2 recebe um IP próprio (ex: `172.29.192.243`)
- Windows roteia portas automaticamente para WSL2 via `localhost`
- **MAS**: se uma aplicação no WSL bindar apenas em `127.0.0.1`, ela fica inacessível do Windows
- **MAS**: se o `.env` usar IP do WSL (`172.xx.xx.xx`), ele muda após reboot

### Solução

1. **Mirrored Networking** (`.wslconfig`): WSL2 compartilha o IP do Windows
2. **Bind explícito em `0.0.0.0`**: NestJS e Next.js escutam em todas as interfaces
3. **`localhost` nos `.env`**: Docker expõe portas em `0.0.0.0`, então `localhost` funciona de dentro do WSL
4. **Docker Compose unificado**: todos os serviços no mesmo arquivo e rede

### Diagrama de Rede

```
Windows (localhost)
  │
  ├── :3000 → Next.js (WSL)       — bind 0.0.0.0
  ├── :3001 → NestJS (WSL)        — bind 0.0.0.0
  ├── :5432 → PostgreSQL (Docker)  — bind 0.0.0.0
  ├── :6379 → Redis (Docker)       — bind 0.0.0.0
  └── :9000 → MinIO (Docker)       — bind 0.0.0.0
```

Tudo acessível via `http://localhost:<porta>` do navegador no Windows.

### Por que não usar IP do WSL?

- IP muda após reboot do WSL
- IP muda se você reiniciar o container Docker
- IP é diferente para cada máquina
- IP quebra commits (ninguém mais consegue rodar o projeto)
- `localhost` é universal e funciona em qualquer ambiente

---

## 5. Troubleshooting

### Diagnóstico Rápido

```bash
make doctor
```

### Porta 3000 já está em uso

```bash
# Descobrir o que está usando
sudo ss -tlnp "sport = :3000"
# ou
sudo lsof -i :3000

# Se for outro container, pare-o:
docker stop <container-name>
```

### WSL perdeu conectividade de rede

```powershell
# PowerShell (Admin)
wsl --shutdown
# Aguarde 5 segundos
wsl
```

### Docker não sobe

```bash
# Verificar status
sudo dockerd &
# OU
sudo service docker start

# Ver logs
docker compose logs
```

### Banco não conecta

```bash
# Verificar se o container está rodando
docker ps | grep axemap-postgres

# Verificar se a porta está bindada em 0.0.0.0
ss -tlnp "sport = :5432"

# Testar conexão
docker exec -it axemap-postgres pg_isready -U axemap -d axemap_dev
```

### Redis não conecta

```bash
docker exec -it axemap-redis redis-cli ping
# Deve retornar: PONG
```

### Prisma Client não encontrado

```bash
cd packages/database && npx prisma generate
```

### Porta não acessível do Windows

1. Verifique se o serviço está bindado em `0.0.0.0`:
   ```bash
   ss -tlnp "sport = :3000"
   # Deve mostrar: 0.0.0.0:3000
   ```
2. Verifique se o Windows consegue alcançar:
   ```powershell
   # PowerShell
   Test-NetConnection -ComputerName localhost -Port 3000
   ```
3. Se estiver usando VPN (Tailscale, etc.), desative temporariamente para testar
4. Se nada funcionar, reinicie o WSL:
   ```powershell
   wsl --shutdown
   wsl
   ```

### Mirrored Networking não funciona

Verifique os requisitos:
- Windows 11 22H2+ (Build 22621+)
- WSL 2.1.0+
- Virtual Machine Platform ativada

```powershell
# PowerShell (Admin)
dism /online /enable-feature /featurename:VirtualMachinePlatform /all
```

Se ainda assim não funcionar, o modo NAT com port forwarding automático do WSL2 deve funcionar contanto que todos os serviços bindem em `0.0.0.0`.

### "Porta 3000 already in use" (nutriscan-frontend)

Há outro projeto (NutriScan) usando a porta 3000. Pare-o:

```bash
docker stop nutriscan-frontend
```

Ou configure o AxéMap Web para outra porta:

```bash
# apps/web/.env.local
PORT=3002
```

---

## Atualização

```bash
git pull
pnpm install
make migrate
make seed
```

---

## Referências

- [WSL Networking (Microsoft)](https://learn.microsoft.com/en-us/windows/wsl/networking)
- [Docker Compose](https://docs.docker.com/compose/)
- [Next.js](https://nextjs.org/docs)
- [NestJS](https://docs.nestjs.com/)
- [Prisma](https://www.prisma.io/docs)
