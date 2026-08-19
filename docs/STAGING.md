# STAGING — AxéMap

Ambiente de staging proposto.

> Status: 🟡 PENDENTE — será criado quando a VPS estiver disponível (FASE 17).

---

## 1. Objetivo

Ambiente que espelha produção, separado de dev e prod, para validar
deploys, migrations, E2E e infraestrutura **antes** do GO-LIVE.

---

## 2. Isolamento (FASE 17)

| Recurso | Dev | Staging | Produção |
|---|---|---|---|
| **Banco** | `axemap_dev` (local) | `axemap_staging` | `axemap` |
| **Shadow DB** | `axemap_shadow` | `axemap_shadow_staging` | `axemap_shadow` |
| **Storage** | MinIO local | MinIO/R2 staging | R2/S3 prod |
| **Email** | console | http provider (sandbox) | http provider real |
| **Secrets** | `.env` | `.env.staging` | `.env.production` |
| **Dados** | seed dev | seed anônimo/mock | reais |

**Regra**: nunca usar dados reais de produção em staging sem necessidade;
se importar dados, documentar origem/destino/transformação/sanitização (FASE 19).

---

## 3. Acesso

- URL: subdomínio separado (ex: `staging.<dominio>`) com HTTP Auth do nginx.
- Banco/Redis/Storage acessíveis apenas na rede interna.
- Não usar dados sensíveis reais.

---

## 4. Pipeline

```
CI (tests+build)
  → Deploy staging
  → Migrations (migrate-deploy.sh)
  → Health checks
  → E2E (suíte real contra staging)
  → Smoke test
```

Fluxo sugerido quando VPS ativa:
1. `bash scripts/migrate-deploy.sh` apontando `DATABASE_URL` de staging.
2. `pnpm --filter @axemap/api test:e2e` com `E2E_API_URL=https://staging.<dominio>/api/v1`.
3. Validar health: `/api/v1/health/full`.

---

## 5. Orquestração

- Recomendado: Docker no mesmo modelo de produção (`docker-compose.prod.yml` como base),
  com `.env.staging` e nome de projeto `axemap-staging`.
- Opcional: mesmo padrão do nginx com HTTPS staging.