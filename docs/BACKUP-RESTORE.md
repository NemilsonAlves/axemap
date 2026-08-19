# BACKUP & RESTORE — AxéMap

Estratégia de backup e restauração do PostgreSQL.

> Status: 🟡 backup local funcional; **backup externo de produção pendente (VPS)**.

---

## 1. Objetivo

- Backup frequente + retenção.
- **Nunca** armazenar backup apenas dentro da própria VPS (perda total da VPS = perda do backup).
- Conceito: **VPS + BACKUP EXTERNO**.

---

## 2. Backup Local (funcional)

```bash
bash scripts/backup-db.sh
```

O que faz:
1. Usa container `docker/docker-compose.dev.yml` se `postgres` estiver `Up`.
2. Fallback: `pg_dump "$DATABASE_URL"` (lê `.env` da raiz).
3. Gera `backups/<timestamp>.sql.gz`.
4. Valida integridade (`gzip -t`).
5. Retenção: mantém os **30 backups mais recentes**.

Backup existente (schema+dados íntegros):
`backups/pre-taxonomia-2026-08-15-0835.sql` (e variante PG16 `.fix16.sql`).

---

## 3. Restore Local

```bash
bash scripts/restore-db.sh
```

Fluxo interativo:
1. Lista backups em `backups/`.
2. Pede confirmação digitando `restaurar`.
3. Cria `pre-restore` automático do estado atual.
4. Restaura via `gunzip -c | psql`.

---

## 4. Estratégia de Produção (quando VPS ativa)

| Item | Definição proposta |
|---|---|
| **Frequência** | Diário automático + pré-migração (migrate-deploy) |
| **Retenção** | 30 backups diários + 4 semanais + 1 mensal |
| **Local** | Externo à VPS: S3 compatível (ex: Cloudflare R2) ou outro host |
| **Criptografia** | Criptografar backup (ex: `gpg`/`age`) antes do upload externo |
| **Restauração** | Documentada abaixo; testada em staging antes de prod |

Backup PostgreSQL (produção):
```bash
pg_dump "postgresql://user:pass@host:5432/axemap" | gzip | gpg --symmetric > backup.sql.gz.gpg
```

---

## 5. Processo de Restore (produção — quando testar)

```
backup
  → nova instância PostgreSQL
  → restore
  → habilitar PostGIS
  → aplicar migrations
  → health check
  → application
```

Passos concretos:
1. Prover instância PostgreSQL nova (container/VM).
2. `CREATE EXTENSION postgis;` (superuser).
3. Descompactar e descriptografar backup.
4. `psql "$DATABASE_URL" < backup.sql` (ou `gunzip -c | psql`).
5. `bash scripts/migrate-deploy.sh` (aplica migrations pendentes + health).
6. Validar `/api/v1/health/db` e `scripts/smoke.sh`.

> **Atenção PG16 × pg_dump mais novo**: parâmetros do dumper (ex: `transaction_timeout`)
> podem não existir no servidor antigo. Nesse caso, remover a linha incompatível do dump
> antes do restore (já ocorrido em 15/08/2026 — ver `*.fix16.sql`).

---

## 6. Cenários

| Cenário | Ação |
|---|---|
| Corrupção de dados | Restore do último backup diário |
| Migração falha | Restore do backup pré-migração |
| Perda da VPS | Backup externo + provisionar nova VPS + restore |
| Erro em deploy | Rollback de código + restore se necessário |

---

## 7. Testes

- Restore testado **antes do GO-LIVE** (FASE 26 checklist).
- Teste de restore periódico em staging (ex: mensal).
- Validar integridade dos backups (`gzip -t`) no próprio script de backup.