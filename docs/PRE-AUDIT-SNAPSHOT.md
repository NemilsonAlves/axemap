# PRE-AUDIT-SNAPSHOT — AxéMap (Prompt 13)

> Congelamento do estado real do ecossistema antes da auditoria funcional.
> Data: 2026-08-16. **Nada aqui foi alterado deliberadamente durante a captura**
> (apenas a API foi reiniciada em modo build porque o processo dev caiu).

## 1. Controle de versão

| Item | Valor |
|------|-------|
| Branch | `master` |
| Commit HEAD | `393001f8be09a4f32da641442614b8ab498b16ec` |
| Último commit | `feat(admin): implement superadmin console and RBAC controls` |
| Working tree | **143 arquivos modificados / não commitados** (92 arquivos, +2671/−548) |
| Repo | `C:\Users\pc\Desktop\Programacao\AxeMap` (git, Windows) |

> ⚠️ A auditoria começa com working tree **sujo**. As modificações não
> commitadas afetam o snapshot funcional (o comportamento testado pode
> divergir do HEAD). Isso é registrado como fator de risco na FASE 41.

## 2. Versões de runtime

| Ferramenta | Versão |
|------------|--------|
| Node.js | v24.16.0 |
| pnpm | 9.15.4 |
| Next.js (instalado) | 16.2.10 |
| React | 19.2.7 |
| @nestjs/core | 11.1.28 |
| Prisma / @prisma/client | 6.19.3 |
| PostgreSQL (servidor) | 16.14 (portátil `.pgportable`, porta 5432) |
| psql (cliente) | 16.14 |
| PostGIS | 3.6.2 (extensão instalada) |
| Redis | rodando na porta 6379 (chocolatey `redis-server`) |
| Docker | **NÃO instalado/disponível** (comando ausente) |

## 3. Stack / infraestrutura local

- **API**: NestJS 11 em `http://localhost:3001`, prefixo global `api/v1`.
  Rodava em dev (`--watch`); o processo caiu durante a auditoria e foi
  reiniciado a partir de `apps/api/dist/main.js` (build).
- **Web**: Next.js 16 em `http://localhost:3000` — **OFFLINE** no momento da
  captura (timeout; nenhum processo escutando a porta).
- **Banco**: PostgreSQL 16.14 local (`.pgdata`), banco `axemap_dev`,
  usuário `axemap`, senha `axemap_dev` (dev only).
- **Redis**: porta 6379, sem senha (dev).
- **Storage (MinIO/S3)**: endpoint default `http://localhost:9000` —
  **OFFLINE** (health/storage retornou `status: error`, `AggregateError`).
- **Docker**: indisponível (não instalado) — MinIO não pode subir via Docker.

## 4. Estado do banco — migrations e schema

- `prisma migrate status` → **"Database schema is up to date!"**
- `prisma validate` → **"The schema at prisma\schema.prisma is valid"**
- 15 migrations em `packages/database/prisma/migrations`:

| Migration |
|-----------|
| `20260802185502_init` |
| `20260802220442_add_denuncias` |
| `20260806172220_add_impacto` |
| `20260807013448_add_trust_ecosystem` |
| `20260808011745_add_saas_planos` |
| `20260812120000_rede_axemap_2_0` |
| `20260813100000_rede_axemap_2_1_graph` |
| `20260813120000_add_usuarios_bloqueio` |
| `20260813130000_add_reset_senha` |
| `20260813140000_denuncia_publica` |
| `20260813150000_org_tipos_lideranca` |
| `20260813160000_niveis_privacidade` |
| `20260813170000_mapa_global` |
| `20260814120000_add_taxonomy_multidimensional` |
| `20260815090000_add_sources_provenance` |

## 5. Estado do seed

- `packages/database/prisma/seed.ts` existe (839 linhas) e limpa + recria
  dados (`createUsers`, `createTerreiros`, `createEvents`, `createCourses`,
  `createSocialActions`, `createReviews`, `createFeedback`,
  `createFeatureFlags`, `createMissions`, `createAchievements`,
  `createAnalyticsEvents`, `createInstituicoes`, `createCampaigns`,
  `createHubContent`, `createPlanos`, `createAxegraph`).
- O banco atual contém dados do seed + dados de testes E2E + usuários de
  bloqueio criados por testes.

## 6. Contagem real de registros (PG, schema public)

| Tabela | Registros |
|--------|----------|
| usuarios | 23 |
| terreiros | 17 |
| eventos | 17 |
| campanhas | 6 |
| denuncias | 8 |
| avaliacoes | 26 |
| organizacoes | 8 |
| conteudos_culturais | 3 |
| planos_saas | 4 |
| audit_logs | 22 |
| notificacoes | 0 |
| graph_entidades | 88 |
| graph_relacionamentos | 63 |
| instituicoes | 2 |
| sources | 0 |

## 7. Roles reais no banco (usuarios.role)

VISITOR (14) · PRACTITIONER (2) · DIRIGENTE (2) · FILHO_DE_SANTO (1) ·
MEMBER (1) · MODERATOR (1) · ADMIN (1) · SUPER_ADMIN (1)

Contas conhecidas: `superadmin@axemap.com.br`, `admin@axemap.com.br`,
`moderador@axemap.com.br`, `fernanda@axemap.com`, `maria@candomble.com`,
etc. (senhas no seed).

## 8. Health check real (2026-08-16)

| Endpoint | Resultado |
|----------|-----------|
| `GET /api/v1/health` | ✅ `status: ok` — database ok · postgis ok · redis ok |
| `GET /api/v1/health/full` | ✅ `status: ok`, db latency 2ms |
| `GET /api/v1/health/db` | (a validar na FASE 25) |
| `GET /api/v1/health/redis` | (a validar na FASE 27) |
| `GET /api/v1/health/storage` | 🔴 `status: error` — `AggregateError` (MinIO/S3 offline) |

## 9. Estado dos testes (baseline antes da auditoria)

- Web unit (vitest): 29/29 ✅ (4 suites: geo/detect, geo/countries,
  geo/region, cn) — executado na sessão anterior (Prompt 12).
- API unit (jest): 57/57 ✅ (6 suites).
- API E2E (jest): 20/20 ✅ (1 suite, 10 fluxos).
- Typecheck web: ✅ · Lint web: 0 erros / 5 warnings.
- Build web: ✅ (49 páginas).

> A revalidação completa será reexecutada na FASE 43 desta auditoria.

## 10. Observações de risco imediatas

1. **Storage/MinIO offline** → uploads, avatares, fotos, documentos e
   campanhas com upload estão com risco BLOCKED (FASE 24).
2. **Web offline** no momento do snapshot → testes de frontend exigem
   subir o web server.
3. **Working tree sujo (143 arquivos)** → divergência HEAD × runtime.
4. **Notificações = 0 registros**, **sources = 0 registros** → validar se
   funcionalidades de notificação/proveniência estão realmente operantes.