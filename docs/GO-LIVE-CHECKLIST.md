# GO-LIVE CHECKLIST — AxéMap

Checklist de liberação para produção. **NÃO executar agora** — preenchido quando
cada infraestrutura estiver disponível (FASE 26).

> Status atual: 🟡 VPS pendente. Nenhum item de infraestrutura real concluído.

---

## 1. Infraestrutura

- [ ] VPS ativa (contratada, acessível, atualizada)
- [ ] `bash scripts/preflight-vps.sh` sem falhas críticas (CPU/RAM/disco/Docker/UFW/fail2ban/portas)
- [ ] PostgreSQL produção ativo
- [ ] PostGIS ativo (`CREATE EXTENSION postgis`)
- [ ] Redis validado (quando necessário)
- [ ] Storage produção ativo (MinIO/S3 compatível + `health/storage` ok)
- [ ] Email produção ativo (provider real configurado)
- [ ] Domain configurado (DNS → Cloudflare → VPS → Nginx)
- [ ] HTTPS ativo (certificado válido, HTTP→HTTPS redirect)
- [ ] Firewall configurado (portas mínimas)
- [ ] Secrets configurados (`.env.production` na VPS, não no git)
- [ ] Backup configurado (diário + externo à VPS)
- [ ] Restore testado (ver `docs/BACKUP-RESTORE.md`)

## 2. Banco / Migrations

- [ ] `DATABASE_URL` != `SHADOW_DATABASE_URL` (guard `check-shadow-db.sh` ok)
- [ ] Migrations testadas (`migrate-deploy.sh` executado limpo em staging)
- [ ] PostGIS habilitado e health `postgis=ok`
- [ ] Seed NÃO executado automaticamente em prod (ou validado)

## 3. Funcionalidades / Segurança

- [ ] RBAC testado (admin/superadmin/moderador/user)
- [ ] Auth testado (login, refresh, forgot-password, reset)
- [ ] E2E testado contra staging/prod (`pnpm --filter @axemap/api test:e2e`)
- [ ] Upload testado (upload → storage → db → URL → download)
- [ ] Campanhas testadas
- [ ] Denúncias testadas
- [ ] Auditoria testada
- [ ] Rate limiting / Helmet headers validados via curl

## 4. Operação

- [ ] Health checks OK (`/api/v1/health`, `/db`, `/storage`, `/full`)
- [ ] Monitoring configurado (logs, alertas — ver `docs/SECURITY.md`)
- [ ] Rollback documentado (código anterior + restore do backup pré-deploy)
- [ ] Smoke test executado pós-deploy (`scripts/smoke.sh`)

---

## 2. Ordem de execução recomendada

```
1. VPS + hardening
2. PostgreSQL + PostGIS + backup
3. Redis
4. Storage
5. Email
6. Domain + Cloudflare + Nginx + HTTPS
7. Deploy staging → migrations → testes
8. Deploy produção → smoke → health
9. GO
```

## 3. Critérios de bloqueio

Bloquear GO-LIVE se:
- Build falhar;
- Testes críticos falharem;
- Migration falhar;
- Health check falhar;
- Restore não testado;
- Backup externo não configurado.