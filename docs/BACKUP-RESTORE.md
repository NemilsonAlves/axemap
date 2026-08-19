# BACKUP & RESTORE — AxéMap

Estratégia de backup e restauração do PostgreSQL.

> Status: 🟡 backup local funcional; **backup externo de produção pendente (VPS)**.

---

## 1. Objetivo

- Backup frequente + retenção.
- **Nunca** armazenar backup apenas dentro da própria VPS (perda total da VPS = perda do backup).
- Conceito: **VPS + BACKUP EXTERNO**.

---

## 2. Backup (local e VPS — mesmo script)

```bash
bash scripts/backup-db.sh
```

O que faz:
1. Detecta o compose file com o container `postgres` em execução
   (`prod` > `dev` > root) e faz `pg_dump` via `docker exec` (não precisa de
   cliente PostgreSQL no host).
2. Fallback: `pg_dump` direto usando `DATABASE_URL` ou `MIGRATION_DATABASE_URL`
   (na VPS, `MIGRATION_DATABASE_URL` aponta para `127.0.0.1:5432` — o postgres
   exposto apenas no host).
3. Lê credenciais do `.env.production` (VPS) ou `.env` (dev) **sem imprimir senhas**.
4. Gera `backups/<timestamp>.sql.gz`.
5. Valida integridade (`gzip -t`).
6. Retenção: mantém os **30 backups mais recentes**.

> O script nunca imprime `DATABASE_URL`/senha em logs. Exit code ≠ 0 em falha.

Backup existente (schema+dados íntegros):
`backups/pre-taxonomia-2026-08-15-0835.sql` (e variante PG16 `.fix16.sql`).

---

## 3. Restore (local e VPS)

```bash
bash scripts/restore-db.sh
```

Fluxo interativo:
1. Lista backups em `backups/`.
2. Valida o arquivo escolhido (`gzip -t`).
3. Pede confirmação digitando **`restaurar`** (restore é destrutivo).
4. Cria `pre-restore` automático do estado atual.
5. Restaura via `gunzip -c | psql` (via `docker exec` ou direto com
   `DATABASE_URL`/`MIGRATION_DATABASE_URL`).

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