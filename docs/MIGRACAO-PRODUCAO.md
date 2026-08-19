# MIGRAÇÃO PARA PRODUÇÃO — AxéMap

Guia operacional, passo a passo, para colocar o AxéMap em produção (VPS + Docker).
Complementa os documentos existentes: `DEPLOYMENT.md`, `RUNBOOK.md`, `GO-LIVE-CHECKLIST.md`, `PRODUCTION-READINESS.md`, `STAGING.md`, `INFRASTRUCTURE-READINESS-REPORT.md`.

> ⚠️ **Estado atual:** código e pipeline preparados, mas a infraestrutura definitiva (VPS + nginx + TLS) **ainda não existe**. Este guia cobre exatamente o que falta fazer.

---

## Visão geral da arquitetura alvo

```
 Internet (443/80)
      │
      ▼
 ┌─────────┐   /            ┌───────────────────────┐
 │  nginx  │──▶ web (Next.js 16, porta 3000)        │
 │ reverse ├──▶ api (NestJS 11, porta 3001, /api/v1)│
 │  proxy  │──▶ storage (MinIO, porta 9000)         │
 └─────────┘   └────────────────────────────────────┘
      │              │ rede interna axemap_internal
      │              ├── postgres (PostGIS 16, 5432 — só 127.0.0.1 no host)
      │              └── redis (Redis 7, 6379 — só 127.0.0.1 no host)
```

- Stack: Next.js 16 / React 19, NestJS 11, Prisma 6, PostgreSQL 17+PostGIS (dev) / 16+PostGIS (template prod), Redis 7, MinIO/S3/R2.
- Arquitetura em `docs/05-arquitetura.md` e `docs/ARCHITECTURE.md`.

---

## FASE 0 — Pré-requisitos e bloqueios (faça ANTES de tudo)

### 0.1. Ambiente local
- Node.js **≥ 22** e pnpm **≥ 9** (`corepack enable`).
- Docker + Docker Compose **v2**.
- Git com histórico limpo e regras de commit (`commitlint` + `husky`).

### 0.2. Commit de tudo que está pendente
O repositório tem **dezenas de arquivos modificados/novos ainda não commitados** (ex.: redesign da Home, ajustes de auth, melhorias visuais). Antes de migrar:

```bash
git status                     # revisar mudanças
git add .
git commit -m "chore(release): snapshot pré-produção"
git push origin main
```

### 0.3. CI verde (gate de bloqueio)
O pipeline `.github/workflows/ci.yml` roda `lint → typecheck + test → build` em push/PR.
NÃO faça deploy se o CI não estiver verde.

```bash
# Validações locais equivalentes
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

### 0.4. Bloqueios conhecidos (corrija antes do GO-LIVE)
1. **2 testes falhando** em `apps/web/src/lib/geo/detect.spec.ts` (esperam `'WORLD'`, recebem `'BR'`). O job `test` do CI falha por causa disso. Resolver ou corrigir o teste antes de publicar.
2. **`docker/nginx/` não existe** no repositório. O `docker-compose.prod.yml` referencia `./nginx/nginx.conf` e `./nginx/certs` (relativos à pasta `docker/`). Criar antes do deploy (ver Fase 6).
3. **`NEXT_PUBLIC_API_URL` é inlined no build** do Next.js. O `Dockerfile.web` NÃO declara/aceita `ARG` — se a imagem for buildada sem a variável, o frontend apontará para `http://localhost:3001` (quebrado em produção). Ajustar o Dockerfile (ver Fase 4) **ou** rodar o `next build` com a variável no ambiente do builder.
4. **`.env.production` não está no `.gitignore`** (o padrão `.env.*.local` não o cobre). Adicionar ao `.gitignore` para nunca commitar segredos:

   ```gitignore
   .env.production
   .env.*.local
   ```

---

## FASE 1 — Infraestrutura (VPS)

> Alternativa gerenciada (Railway + Vercel) já existe no `.github/workflows/cd.yml`. Este guia segue o caminho **VPS + Docker** do `docker-compose.prod.yml`.

### 1.1. Contratar VPS
- **Mínimo recomendado:** Ubuntu 24.04 LTS, 2 vCPU, 4 GB RAM, 40 GB SSD.
- Firewall da cloud liberando apenas **80 e 443** (e 22 para SSH).

### 1.2. DNS
Aponte os registros (A/AAAA) para o IP da VPS:

| Host | Tipo | Valor |
|---|---|---|
| `@` (domínio raiz) | A | IP da VPS |
| `api.` | A | IP da VPS |
| `storage.` | A | IP da VPS (ou CDN) |

### 1.3. Hardening inicial
```bash
# usuário de deploy (sem sudo desnecessário no dia a dia)
adduser deploy
usermod -aG docker deploy

# SSH por chave (copie sua pubkey)
mkdir -p /home/deploy/.ssh
cat > /home/deploy/.ssh/authorized_keys
chmod 700 /home/deploy/.ssh && chmod 600 /home/deploy/.ssh/authorized_keys

# Firewall
ufw allow OpenSSH
ufw allow 80,443/tcp
ufw enable
```

### 1.4. Instalar Docker + Compose v2
```bash
apt update && apt install -y ca-certificates curl
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update && apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
docker --version && docker compose version
```

### 1.5. Clonar o repositório
```bash
cd /opt
git clone https://github.com/anomalyco/axemap.git
cd axemap
```

---

## FASE 2 — Secrets e variáveis de ambiente

Crie o arquivo **`/opt/axemap/.env.production`** na VPS (nunca commitado):

```bash
cd /opt/axemap
touch .env.production && chmod 600 .env.production
nano .env.production
```

### 2.1. Gerar segredos fortes
```bash
openssl rand -base64 48   # → JWT_SECRET
openssl rand -base64 48   # → JWT_REFRESH_SECRET
openssl rand -base64 48   # → NEXTAUTH_SECRET
openssl rand -base64 24   # → STORAGE_SECRET_KEY (e POSTGRES_PASSWORD)
```

### 2.2. Modelo do arquivo (preencha cada valor)
```dotenv
# ── Ambiente ──
NODE_ENV=production
LOG_LEVEL=info
PORT=3001

# ── Domínio / CORS ──
FRONTEND_URL=https://axemap.com.br
NEXTAUTH_URL=https://axemap.com.br

# ── Banco de dados ──
POSTGRES_USER=axemap
POSTGRES_PASSWORD=<gerar-acima>
POSTGRES_DB=axemap

# Usada DENTRO do container da api → host DNS interno "postgres"
DATABASE_URL=postgresql://axemap:<POSTGRES_PASSWORD>@postgres:5432/axemap
# Usada em MIGRAÇÕES rodadas no HOST → host 127.0.0.1 (porta exposta)
MIGRATION_DATABASE_URL=postgresql://axemap:<POSTGRES_PASSWORD>@127.0.0.1:5432/axemap
SHADOW_DATABASE_URL=postgresql://axemap:<POSTGRES_PASSWORD>@127.0.0.1:5432/axemap_shadow

# ── Redis ──
REDIS_HOST=redis
REDIS_PORT=6379

# ── JWT ──
JWT_SECRET=<gerar-acima>
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=<gerar-acima>
JWT_REFRESH_EXPIRES_IN=7d
NEXTAUTH_SECRET=<gerar-acima>

# ── API ──
API_URL=https://api.axemap.com.br
NEXT_PUBLIC_API_URL=https://api.axemap.com.br

# ── Storage (MinIO na VPS / ou S3/R2) ──
STORAGE_TYPE=minio
STORAGE_REGION=auto
STORAGE_ENDPOINT=http://storage:9000
STORAGE_ACCESS_KEY=axemap
STORAGE_SECRET_KEY=<gerar-acima>
STORAGE_BUCKET=axemap
STORAGE_PUBLIC_URL=https://storage.axemap.com.br
STORAGE_FORCE_PATH_STYLE=true

# ── E-mail (Resend ou SMTP) — opcional, necessário para envio transacional ──
# MAIL_PROVIDER=http
# MAIL_API_URL=https://api.resend.com/emails
# MAIL_API_KEY=re_xxxxx
# SMTP_HOST=smtp.example.com
# SMTP_PORT=587
# SMTP_USER=user@example.com
# SMTP_PASS=<gerar-acima>

# ── Serviços opcionais (descomente conforme uso) ──
# WHATSAPP_API_URL=
# WHATSAPP_API_KEY=
# GOOGLE_MAPS_API_KEY=
# MAPBOX_TOKEN=
# OPENAI_API_KEY=
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# ASAAS_API_KEY=
# MERCADO_PAGO_TOKEN=
# STRIPE_SECRET_KEY=
# SENTRY_DSN=https://xxxxx@sentry.io/xxxxx

# ── TV AxéMap (mídia em CDN/Storage; verificar direitos de uso) ──
# NEXT_PUBLIC_TV_MUSIC_URL=https://storage.axemap.com.br/audio/de-volta.mp3
```

### 2.3. Regras de segurança
- **NUNCA** commitar o `.env.production` (adicione ao `.gitignore` — ver 0.4).
- `chmod 600` no arquivo.
- Não usar os valores de exemplo (`change-this`, `axemap_minio_dev`).

---

## FASE 3 — Banco de dados

### 3.1. Subir a infraestrutura (banco + redis + storage) sem as aplicações
```bash
cd /opt/axemap
docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d postgres redis storage
```

### 3.2. Criar o shadow database
```bash
docker compose -f docker/docker-compose.prod.yml --env-file .env.production exec -T postgres \
  psql -U axemap -d postgres -c 'CREATE DATABASE axemap_shadow;'
```

### 3.3. Rodar a migração oficial (7 passos com guardas)
```bash
cd /opt/axemap
export DATABASE_URL=$MIGRATION_DATABASE_URL
bash scripts/migrate-deploy.sh
```
O script executa: **1/7** guard de `SHADOW_DATABASE_URL` (aborta se igual à de produção) → **2/7** backup pré-migração → **3/7** `prisma migrate status` → **4/7** `prisma migrate deploy` → **5/7** `prisma generate` → **6/7** health check `/api/v1/health/db` → **7/7** smoke test.

> ⚠️ **NUNCA** use `prisma migrate reset` ou `prisma db push` em produção.

### 3.4. Seed (opcional)
Se o banco for novo e você quiser dados iniciais:
```bash
cd /opt/axemap/packages/database
DATABASE_URL=$MIGRATION_DATABASE_URL npx prisma db seed
```

### 3.5. Validar
```bash
curl -fsS http://127.0.0.1:3001/api/v1/health/db   # esperado: status "ok" + postgis ok
```

---

## FASE 4 — Build das imagens

### 4.1. Ajuste prévio do `Dockerfile.web` (obrigatório)
`NEXT_PUBLIC_*` são inlined pelo Next.js no `next build`. O `Dockerfile.web` precisa aceitar `ARG`:

```dockerfile
# no estágio builder
ARG NEXT_PUBLIC_API_URL=https://api.axemap.com.br
ARG NEXT_PUBLIC_TV_MUSIC_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_TV_MUSIC_URL=$NEXT_PUBLIC_TV_MUSIC_URL
```

### 4.2. Build das imagens
```bash
cd /opt/axemap
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.axemap.com.br \
  --build-arg NEXT_PUBLIC_TV_MUSIC_URL= \
  -f docker/Dockerfile.web -t axemap-web:latest .

docker build -f docker/Dockerfile.api -t axemap-api:latest .
```

### 4.3. Verificar o build
```bash
docker images | grep axemap
```

---

## FASE 5 — Reverse proxy (nginx) e TLS

### 5.1. Criar a pasta e o arquivo de configuração
O compose monta `./nginx/nginx.conf` **relativo a `docker/`**:

```bash
mkdir -p /opt/axemap/docker/nginx/certs
nano /opt/axemap/docker/nginx/nginx.conf
```

Conteúdo de referência (`docker/nginx/nginx.conf`):

```nginx
server {
    listen 80;
    server_name axemap.com.br api.axemap.com.br storage.axemap.com.br;
    # redirect para HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name axemap.com.br;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location / {
        proxy_pass http://web:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name api.axemap.com.br;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    client_max_body_size 25m;

    location / {
        proxy_pass http://api:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 443 ssl http2;
    server_name storage.axemap.com.br;

    ssl_certificate     /etc/nginx/certs/fullchain.pem;
    ssl_certificate_key /etc/nginx/certs/privkey.pem;

    location / {
        proxy_pass http://storage:9000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5.2. Emitir certificados (Let's Encrypt)
Com o nginx ainda só na porta 80 (ou usando `webroot`):
```bash
apt install -y certbot
certbot certonly --standalone -d axemap.com.br -d api.axemap.com.br -d storage.axemap.com.br
cp /etc/letsencrypt/live/axemap.com.br/fullchain.pem /opt/axemap/docker/nginx/certs/
cp /etc/letsencrypt/live/axemap.com.br/privkey.pem   /opt/axemap/docker/nginx/certs/
chmod 644 /opt/axemap/docker/nginx/certs/*
```
> Renovação: agende um cron (`certbot renew` + recopiar + `docker compose restart nginx`).

---

## FASE 6 — Deploy completo

### 6.1. Subir todos os serviços
```bash
cd /opt/axemap
docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d --build
docker compose -f docker/docker-compose.prod.yml ps
```
O compose inicia na ordem com healthchecks: `postgres` e `redis` saudáveis → `api` → `web` → `nginx` (80/443 públicos; banco/redis/minio **não** expostos publicamente).

### 6.2. Verificar logs
```bash
docker compose -f docker/docker-compose.prod.yml logs -f api web nginx
```

---

## FASE 7 — Verificação pós-deploy

### 7.1. Health checks
| Endpoint | Esperado |
|---|---|
| `https://api.axemap.com.br/api/v1/health` | `status: ok` (db + postgis + redis) |
| `https://api.axemap.com.br/api/v1/health/db` | `status: ok` + postgis ok |
| `https://api.axemap.com.br/api/v1/health/redis` | `status: ok` |
| `https://api.axemap.com.br/api/v1/health/storage` | `status: ok` (bucket existe) |
| `https://api.axemap.com.br/api/v1/health/full` | `status: ok` + recursos |

```bash
curl -fsS https://api.axemap.com.br/api/v1/health | jq .
```

### 7.2. Smoke test
```bash
cd /opt/axemap
bash scripts/smoke.sh
```

### 7.3. Checklist funcional (navegador)
- [ ] Home carrega em 1920 / 1440 / 1366 / 1024 / 768 / 390 / 375 (sem overflow horizontal)
- [ ] Login (`/auth/login`), recuperação de senha e cadastro (`/auth/cadastro`) funcionam
- [ ] Botão "Cadastrar Casa de Axé" vai para o cadastro (não para login)
- [ ] Mapa, busca, casas de axé, tradições, eventos e o restante da navegação
- [ ] Upload de imagens persiste no storage (URL pública `storage.axemap.com.br`)
- [ ] Headers de segurança presentes (`curl -I`): `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, CSP

### 7.4. Validação de segurança
```bash
cd /opt/axemap
bash scripts/security-check.sh   # se existir, rodar
bash scripts/check.sh            # doctor 2.0
```

---

## FASE 8 — Observabilidade e continuidade

### 8.1. Logs e erros
- `LOG_LEVEL=info` (produção) — logs pino no stdout do container (`docker compose logs`).
- Configurar **Sentry** (`SENTRY_DSN`) para web e api, se disponível.
- Opcional: reativar o profile `observability` (Prometheus/Grafana/Loki/Tempo) apenas se houver capacity na VPS.

### 8.2. Backups agendados (cron)
Crie `/etc/cron.d/axemap-backup`:
```cron
30 3 * * * deploy cd /opt/axemap && DATABASE_URL=$MIGRATION_DATABASE_URL bash scripts/backup-db.sh >> /var/log/axemap-backup.log 2>&1
```
- Backups em `backups/` (`.sql.gz`), retenção automática de **30**.
- Teste de restauração periódica: `bash scripts/restore-db.sh`.

### 8.3. Uptime e reinício automático
- `restart: unless-stopped` já configurado no compose.
- Adicionar monitor de uptime externo (ex.: UptimeRobot) nos endpoints `/api/v1/health`.

### 8.4. Renovação TLS (certbot)
Adicione ao cron:
```cron
0 3 1,15 * * certbot renew --quiet && cp /etc/letsencrypt/live/axemap.com.br/{fullchain.pem,privkey.pem} /opt/axemap/docker/nginx/certs/ && docker compose -f /opt/axemap/docker/docker-compose.prod.yml --env-file /opt/axemap/.env.production restart nginx
```

---

## FASE 9 — Rollback

1. **Código:** volte para a release anterior:
   ```bash
   git checkout <tag-anterior>
   docker compose -f docker/docker-compose.prod.yml --env-file .env.production up -d --build
   ```
2. **Banco:** se uma migration causou o problema, restaure o backup pré-deploy:
   ```bash
   bash scripts/restore-db.sh   # escolha o backup mais recente
   ```
3. Re-validar: health checks + smoke test.
4. Investigar a causa antes de tentar novo deploy.

---

## FASE 10 — Checklist final de GO-LIVE

Antes de anunciar produção, confira:

- [ ] CI verde (`lint`, `typecheck`, `test`, `build`) — sem os 2 testes de `lib/geo` falhando
- [ ] Todos os arquivos commitados e em `main`
- [ ] `.env.production` criado na VPS, `chmod 600`, **não** commitado
- [ ] `.env.production` adicionado ao `.gitignore`
- [ ] `docker/nginx/nginx.conf` + certificados criados
- [ ] `Dockerfile.web` ajustado com `ARG NEXT_PUBLIC_API_URL`
- [ ] Shadow database criado e diferente de `DATABASE_URL`
- [ ] Migração aplicada via `scripts/migrate-deploy.sh` (7/7 passos)
- [ ] Health checks todos `ok`
- [ ] Smoke test aprovado
- [ ] Checklist funcional (7.3) aprovado nos navegadores/breakpoints
- [ ] Cron de backup e de renovação TLS configurados
- [ ] Firewall: apenas 22/80/443 abertos
- [ ] Domínios DNS resolvendo (`axemap.com.br`, `api.`, `storage.`)
- [ ] Storage público acessível e upload testado
- [ ] E-mail transacional configurado (se aplicável)

---

## Referências

- Deploy e rollback: `docs/DEPLOYMENT.md`, `docs/RUNBOOK.md`
- Checklist de lançamento: `docs/GO-LIVE-CHECKLIST.md`
- Prontidão: `docs/PRODUCTION-READINESS.md`, `docs/FINAL-PRODUCTION-READINESS.md`, `docs/INFRASTRUCTURE-READINESS-REPORT.md`
- Infra: `docs/INFRASTRUCTURE.md`
- Backup/restore: `docs/BACKUP-RESTORE.md`
- Segurança: `docs/SECURITY.md`, `docs/SECURITY-MODEL.md`, `docs/PRIVACY-SECURITY-AUDIT.md`
- Arquitetura: `docs/05-arquitetura.md`, `docs/ARCHITECTURE.md`
- Pipeline CI/CD: `.github/workflows/ci.yml`, `.github/workflows/cd.yml`