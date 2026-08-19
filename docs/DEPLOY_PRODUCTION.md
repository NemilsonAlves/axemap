# DEPLOY DE PRODUÇÃO — AxéMap (VPS Contabo)

> Documento **definitivo** de deploy para produção. Substitui orientações
> parciais de `docs/DEPLOYMENT.md` e `docs/MIGRACAO-PRODUCAO.md` no que conflitar.

**Ambiente-alvo:** Ubuntu 24.04.4 · 4 vCPU · 7.8 GiB RAM · 4 GiB swap · 96 GB disco ·
Docker 29.x · Docker Compose 5.x · UFW (22/80/443) · Fail2ban.

**Domínios:** `axemap.com.br`, `www.axemap.com.br`, `api.axemap.com.br`, `storage.axemap.com.br`.
**IP:** `169.58.201.69`.

---

## 1. Arquitetura (o que roda onde)

```
Internet ──▶ nginx (80/443) ──▶ web (Next.js, 3000, interno)
                    │        └─▶ api (NestJS, 3001, interno)
                    │        └─▶ storage (MinIO, 9000, interno)
                    │        └─▶ /healthz ──▶ api
```

- **Exposto à Internet:** somente o `nginx` (80/443). Tudo o mais fica na rede
  interna `axemap_internal`.
- **postgres (5432), redis (6379), storage (9000)** estão ligados em
  `127.0.0.1` do host — permitem backup/restore e migrações a partir do host
  sem expor nada à rede pública. O console do MinIO (9001) **não é publicado**.
- **Infraestrutura dev** (`infra/docker/compose/*.yml`, agregados pelo
  `docker-compose.yml` raiz) é **somente desenvolvimento**. Produção usa
  exclusivamente `docker/docker-compose.prod.yml`.
- **Rotas de migração:** `migrate-deploy.sh` roda `prisma` no host contra
  `127.0.0.1:5432` via `MIGRATION_DATABASE_URL` (ou, sem pnpm no host, via
  `docker compose run api npx prisma`).

---

## 2. Requisitos

| Item | Obrigatório | Verificação |
|---|---|---|
| Ubuntu 24.04+ | sim | `lsb_release -a` |
| Docker Engine 24+ | sim | `docker --version` |
| Docker Compose v2/v5 | sim | `docker compose version` |
| Node 22 + pnpm 9 (para migrate no host) | opcional¹ | `node --version; pnpm --version` |
| Git | sim | `git --version` |
| Portas 80/443 liberadas (UFW) | sim | `sudo ufw status` |
| Fail2ban ativo | sim | `sudo fail2ban-client status` |
| Disco ≥ 25 GB livres | sim | `df -h /` |
| Swap ≥ 2 GB | recomendado | `free -h` |

¹ Sem pnpm no host, `migrate-deploy.sh` usa o prisma do container `api` automaticamente.

Rode `bash scripts/preflight-vps.sh` no host para checar tudo.

---

## 3. DNS

Registre os A records apontando para `169.58.201.69`:

| Nome | Tipo | Valor |
|---|---|---|
| `axemap.com.br` | A | 169.58.201.69 |
| `www.axemap.com.br` | A | 169.58.201.69 |
| `api.axemap.com.br` | A | 169.58.201.69 |
| `storage.axemap.com.br` | A | 169.58.201.69 |

Confirme antes de emitir certificado:
`dig +short axemap.com.br` deve retornar o IP da VPS.

---

## 4. Variáveis de ambiente

Crie `.env.production` na raiz do repositório (chmod 600):

```bash
cd /opt/axemap
touch .env.production && chmod 600 .env.production
nano .env.production
```

### REQUIRED ENV (obrigatórias — sem elas o boot ou o compose falham)

| Variável | Exemplo | Observação |
|---|---|---|
| `NODE_ENV` | `production` | |
| `PORT` | `3001` | Porta interna da API |
| `DATABASE_URL` | `postgresql://axemap:SENHA@postgres:5432/axemap` | Hostname interno `postgres` (dentro do container) |
| `SHADOW_DATABASE_URL` | `postgresql://axemap:SENHA@127.0.0.1:5432/axemap_shadow` | **NUNCA** igual a `DATABASE_URL` (migrations) |
| `MIGRATION_DATABASE_URL` | `postgresql://axemap:SENHA@127.0.0.1:5432/axemap` | Usada por migrate-deploy no host |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | `axemap` / gerada / `axemap` | Credenciais do container postgres |
| `JWT_SECRET` | gerado (64 hex) | Boot aborta com valor fraco |
| `JWT_REFRESH_SECRET` | gerado (64 hex) | Boot aborta com valor fraco |
| `FRONTEND_URL` | `https://axemap.com.br,https://www.axemap.com.br` | CORS (vírgula = múltiplas origens) |
| `APP_URL` | `https://axemap.com.br` | Base de links em e-mails (reset de senha) |
| `NEXT_PUBLIC_API_URL` | `https://api.axemap.com.br` | **SEM `/api/v1`** — inlined no `next build` (ARG) |
| `REDIS_HOST` / `REDIS_PORT` | `redis` / `6379` | Hostname interno |
| `STORAGE_TYPE` | `minio` | |
| `STORAGE_ENDPOINT` | `http://storage:9000` | Endpoint interno |
| `STORAGE_ACCESS_KEY` / `STORAGE_SECRET_KEY` | geradas | Vão como `MINIO_ROOT_USER/PASSWORD` do compose |
| `STORAGE_BUCKET` | `axemap` | |
| `STORAGE_PUBLIC_URL` | `https://storage.axemap.com.br` | Origem pública dos arquivos |

### OPTIONAL ENV (opcionais / com default)

`JWT_EXPIRES_IN` (default `15m`), `NEXT_PUBLIC_TV_MUSIC_URL` (áudio da TV),
`STORAGE_REGION` (default `auto`), `STORAGE_FORCE_PATH_STYLE` (default `true`),
`MAIL_PROVIDER` (default `console`), `MAIL_API_URL` + `MAIL_API_KEY` (se
`MAIL_PROVIDER=http`), `LOG_LEVEL` (default `info`).

### GENERATED SECRETS (gerar e colar — nunca versionar)

```bash
openssl rand -hex 32        # JWT_SECRET
openssl rand -hex 32        # JWT_REFRESH_SECRET
openssl rand -hex 24        # STORAGE_SECRET_KEY (MinIO root password)
openssl rand -hex 12        # POSTGRES_PASSWORD
```

> ⚠️ A API **aborta o boot** se `JWT_SECRET`/`JWT_REFRESH_SECRET` estiverem
> ausentes ou com placeholder (`change-this`, `development-secret`,
> `axemap_minio_dev`, etc.). Isso é proposital.

---

## 5. Preparação do host

```bash
# Docker (se ainda não instalado)
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER" && newgrp docker

# Node/pnpm (OPCIONAL — só para migrate no host; sem eles o script usa docker)
# curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
# sudo apt-get install -y nodejs && sudo npm i -g pnpm@9

# UFW (já ativo por padrão no Contabo)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw status
```

Clone o repositório (versão de produção):

```bash
sudo mkdir -p /opt/axemap && sudo chown "$USER" /opt/axemap
git clone <seu-remote> /opt/axemap
cd /opt/axemap
git checkout master && git pull
```

> **Atenção (discrepância conhecida):** os arquivos `infra/docker/compose/*.yml`
> fazem parte do commit `7f91347` (e posteriores). Se `core.yml`/`storage.yml`
> não existirem no checkout da VPS, o clone está desatualizado — `git pull`
> (ou re-clone) resolve. Eles são usados **só em dev** (agregados pelo
> `docker-compose.yml` raiz).

---

## 6. Build das imagens

```bash
cd /opt/axemap
docker compose -f docker/docker-compose.prod.yml \
  --env-file .env.production build --no-cache
```

> `NEXT_PUBLIC_API_URL` e `NEXT_PUBLIC_TV_MUSIC_URL` são passados como
> **build args** no `Dockerfile.web` (inlined no `next build`). Não são
> variáveis de runtime — se mudar, rebuild é obrigatório.

---

## 7. Subir containers

```bash
docker compose -f docker/docker-compose.prod.yml \
  --env-file .env.production up -d
```

Aguardar saúde:

```bash
docker compose -f docker/docker-compose.prod.yml ps
docker compose -f docker/docker-compose.prod.yml logs -f nginx
```

---

## 8. Migrações

> **NUNCA** use `prisma migrate reset`/`db push` em produção.
> Backup automático é feito antes de migrar.

```bash
# Com pnpm no host (recomendado):
bash scripts/migrate-deploy.sh --no-smoke

# Sem pnpm no host (usa o prisma do container api):
bash scripts/migrate-deploy.sh --no-smoke
#  (o script detecta e usa docker compose run automaticamente)
```

O script:
1. valida `SHADOW_DATABASE_URL ≠ DATABASE_URL` (`check-shadow-db.sh`);
2. faz backup pré-migração (`backup-db.sh`);
3. `prisma migrate status` → `prisma migrate deploy` → `prisma generate`;
4. health check em `https://api.axemap.com.br/api/v1/health/db` (override: `HEALTH_URL=...`);
5. smoke test (pule com `--no-smoke` em produção).

---

## 9. Health checks

Endpoints públicos (sem auth):

| Endpoint | Uso |
|---|---|
| `GET /api/v1/health` | status agregado (db+postgis+redis) |
| `GET /api/v1/health/db` | db + postgis |
| `GET /api/v1/health/redis` | redis |
| `GET /api/v1/health/storage` | bucket MinIO |
| `GET /api/v1/health/full` | tudo + recursos |
| `GET /api/v1/system/health` \| `liveness` \| `readiness` | k8s-style |

Endpoints ADMIN (exigem token de admin): `system/status`, `system/version`, `system/metrics`.

Healthchecks de contêiner (Docker): api `GET /api/v1/health`; web asset
`/manifest.webmanifest`; nginx `wget http://127.0.0.1/healthz` (HTTP);
postgres `pg_isready`; redis `redis-cli ping`; minio `mc ready local`.

---

## 10. HTTPS (Let's Encrypt / Certbot)

1. Emitir o certificado (webroot, via volume `./nginx/www`):

```bash
cd /opt/axemap
sudo certbot certonly --webroot -w docker/nginx/www \
  -d axemap.com.br -d www.axemap.com.br \
  -d api.axemap.com.br -d storage.axemap.com.br \
  --email seu-email@dominio.com --agree-tos --no-eff-email
```

2. Copiar para onde o nginx espera (fora do Git):

```bash
mkdir -p docker/nginx/certs
sudo cp -L /etc/letsencrypt/live/axemap.com.br/fullchain.pem docker/nginx/certs/
sudo cp -L /etc/letsencrypt/live/axemap.com.br/privkey.pem  docker/nginx/certs/
sudo chmod 644 docker/nginx/certs/fullchain.pem docker/nginx/certs/privkey.pem
docker compose -f docker/docker-compose.prod.yml --env-file .env.production restart nginx
```

3. Renovação automática:

```bash
sudo crontab -e
# 0 3 * * * certbot renew --webroot -w /opt/axemap/docker/nginx/www --post-hook "cp -L /etc/letsencrypt/live/axemap.com.br/fullchain.pem /opt/axemap/docker/nginx/certs/ && cp -L /etc/letsencrypt/live/axemap.com.br/privkey.pem /opt/axemap/docker/nginx/certs/ && docker compose -f /opt/axemap/docker/docker-compose.prod.yml --env-file /opt/axemap/.env.production restart nginx"
```

> O `nginx.conf` resolve `axemap.com.br` (web), redireciona `www` → apex,
> encaminha `api.axemap.com.br` → API e `storage.axemap.com.br` → MinIO.
> O desafio ACME é servido em `/.well-known/acme-challenge/` no bloco HTTP.

---

## 11. Backup

```bash
bash scripts/backup-db.sh
```

- Detecta o compose em execução (prod > dev > root) e faz `pg_dump` via
  `docker exec`; fallback para `pg_dump` direto com
  `MIGRATION_DATABASE_URL`.
- Saída: `backups/<timestamp>.sql.gz` + validação `gzip -t` + retenção dos 30
  mais recentes.
- **Nunca imprime senha/URL.**

Agende off-site (ex.: `rclone` para object storage) e um cron diário:

```bash
# 0 2 * * * cd /opt/axemap && bash scripts/backup-db.sh >> backups/cron.log 2>&1
```

---

## 12. Restore

```bash
bash scripts/restore-db.sh
```

- Lista os backups disponíveis, exige digitar `restaurar` para confirmar.
- Faz **backup de segurança** dos dados atuais antes de restaurar.
- Restaura via `docker exec psql` (ou `psql` direto).
- Depois de restaurar, se houver migrations novas desde o backup:
  `bash scripts/migrate-deploy.sh --no-smoke`.

---

## 13. Logs e observabilidade mínima

```bash
docker compose -f docker/docker-compose.prod.yml logs -f api
docker compose -f docker/docker-compose.prod.yml logs --tail 200 web
docker compose -f docker/docker-compose.prod.yml logs -f nginx
```

- Rotação de logs ativa no compose (`max-size: 10m`, `max-file: 5`) — evita
  disco cheio.
- A API loga via **pino** no stdout (`LOG_LEVEL`). O nível default é `info`.
- Métricas de sistema: `GET /api/v1/system/metrics` (admin).

---

## 14. Troubleshooting

| Sintoma | Ação |
|---|---|
| `api` reiniciando em loop | `docker compose logs api` — provável segredo ausente/fraco (boot fail-fast) |
| Sitemap/mapa vazios | `NEXT_PUBLIC_API_URL` sem `/api/v1`? Rebuild do web (é inlined) |
| CORS 403 no browser | `FRONTEND_URL` precisa incluir a origem exata (incluir www) |
| Migração falha no host | Confirmar `MIGRATION_DATABASE_URL` com `127.0.0.1` e `docker compose ps postgres` saudável |
| Certificado expirado | Ver cron de renewal; recopiar para `docker/nginx/certs` e `restart nginx` |
| Disco cheio | `docker system df`; limpar volumes/backups antigos |

---

## 15. Rollback

1. **App (código):** `git checkout <commit-anterior>` no `api`/`web` e rebuild +
   `up -d` (nova imagem). A imagem anterior continua disponível como
   `<nome>:<sha>`.
2. **Banco (dados):** restauração do backup pré-migração:
   `bash scripts/restore-db.sh` (escolher o backup `pre-migração` ou o mais
   recente antes da falha).
3. **Ambiente:** `docker compose -f docker/docker-compose.prod.yml --env-file .env.production down`
   para parar tudo (volumes preservados).

> Regra: **sempre** tenha um backup válido (`gzip -t` ok) antes de qualquer
> migração ou alteração de schema.

---

## Checklist final pré go-live

- [ ] DNS dos 4 domínios apontando para `169.58.201.69`
- [ ] `.env.production` completo (REQUIRED + secrets gerados), chmod 600
- [ ] `preflight-vps.sh` sem falhas
- [ ] Imagens buildadas sem erros
- [ ] `docker compose up -d` com todos os healthchecks `healthy`
- [ ] `migrate-deploy.sh --no-smoke` OK
- [ ] Certificado emitido e renovação agendada
- [ ] Backup manual testado + restore testado
- [ ] `https://axemap.com.br`, `https://api.axemap.com.br/healthz`,
      `https://storage.axemap.com.br` respondendo
- [ ] UFW: apenas 22/80/443 · Fail2ban ativo