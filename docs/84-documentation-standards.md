# 84 — Documentation Standards

## Repository README

```markdown
# AxéMap 🌿

Plataforma digital para religiões afro-brasileiras. Conecte-se com terreiros,
eventos, conteúdos e comunidade.

## Stack

- **Frontend:** Next.js 16 (App Router) + TypeScript + Tailwind
- **Backend:** NestJS + Prisma + PostgreSQL + Redis
- **Infra:** Docker + Railway + Vercel + Cloudflare

## Quick Start

```bash
git clone https://github.com/axemap/axemap.git
cd axemap
pnpm install
cp .env.example .env
docker compose up -d
pnpm dev
```

Acesse http://localhost:3000

## Documentação

- `docs/` - Arquitetura, ADRs, decisões
- [Architecture Handbook](docs/78-engineering-handbook.md)
- [ADR Index](docs/76-adr-index.md)
- [Coding Standards](docs/79-coding-standards.md)

## Projetos no Monorepo

| Pasta | Descrição |
|-------|-----------|
| `apps/web` | Next.js frontend |
| `apps/api` | NestJS backend |
| `packages/shared` | Types, DTOs, enums |
| `packages/ui` | Design system |
| `packages/config` | ESLint, Prettier configs |
| `packages/database` | Prisma schema + client |
```

## README de Cada Módulo (NestJS)

```markdown
# Módulo: [Nome]

## Responsabilidade
O que este módulo faz.

## Dependências
- Módulo A (para usar X)
- Módulo B (para usar Y)

## Eventos Publicados
| Evento | Quando | Payload |
|--------|--------|---------|
| `module.acao` | Descrição do trigger | `{ id, data }` |

## Eventos Consumidos
| Evento | Handler | Ação |
|--------|---------|------|
| `outro.evento` | `HandlerName` | O que faz |

## Endpoints
| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/api/v1/modulo` | Listar | - |
| POST | `/api/v1/modulo` | Criar | ADMIN, DIRIGENTE |

## Variáveis de Ambiente
| Variável | Obrigatória | Padrão |
|----------|-------------|--------|
| `MODULE_CONFIG` | Não | `default-value` |
```

## Contribution Guide

```markdown
# Contribution Guide

## Fluxo

1. Crie uma branch: `feat/nome-da-feature` ou `fix/descricao-do-bug`
2. Faça commits com [Conventional Commits](docs/79-coding-standards.md)
3. Abra um Pull Request para `develop`
4. Aguarde review (mínimo 1 approval)
5. Merge para `develop` → CI/CD → Staging
6. Release → tag `v*` → Produção

## Antes do PR

- [ ] `pnpm lint` passou
- [ ] `pnpm typecheck` passou
- [ ] `pnpm test` passou
- [ ] Testes novos para a funcionalidade
- [ ] Documentação atualizada (se aplicável)
- [ ] ADR criado (se decisão arquitetural)
- [ ] Sem secrets no código

## Code Review

### Para o autor:
- PRs pequenos (< 400 linhas ideal)
- Descrição clara do que faz e por que
- Screenshots se UI change

### Para o reviewer:
- Respeite o autor
- Critique o código, não a pessoa
- Aprove rápido se estiver bom
- Questione se não entender
```

## Code of Conduct

```markdown
# Code of Conduct

## Compromisso
Construir um ambiente acolhedor, respeitoso e produtivo para todos.

## Comportamento Esperado
- Uso de linguagem inclusiva e respeitosa
- Críticas construtivas e profissionais
- Respeito a diferentes religiões, culturas e backgrounds
- Foco no que é melhor para a comunidade e plataforma

## Comportamento Inaceitável
- Assédio, discriminação ou comentários ofensivos
- Trolling, comentários insultuosos
- Publicação de informações privadas sem consentimento
- Qualquer outra conduta antiética

## Reporte
Entre em contato com [email] ou abra uma issue confidencial.

## Aplicação
Violações podem resultar em:
1. Advertência
2. Remoção temporária
3. Banimento permanente
```

## Architecture Handbook

```markdown
# Architecture Handbook

## Stack
Ver ADR-001 a ADR-021 em [ADR Index](docs/76-adr-index.md)

## Camadas (Clean Architecture)

```
┌─────────────────────────────────────────────────┐
│  Interface (Controllers, Resolvers)             │
├─────────────────────────────────────────────────┤
│  Application (Use Cases, DTOs, Mappers)         │
├─────────────────────────────────────────────────┤
│  Domain (Entities, Value Objects, Events)       │
├─────────────────────────────────────────────────┤
│  Infrastructure (Repositories, Queue, Cache)    │
└─────────────────────────────────────────────────┘
```

## Fluxo de Dados

```
Request → Controller → Use Case → Entity → Repository → DB
                            ↓
                        Event Bus → Workers
                            ↓
                        Notificações, Trust Score, Analytics
```

## Padrões de Projeto
- Repository Pattern (acesso a dados)
- Observer Pattern (eventos)
- Strategy Pattern (recomendação)
- Factory Pattern (criação de entidades)
```

## Runbook

```markdown
# Runbook

## Acesso aos Serviços

| Serviço | URL | Acesso |
|---------|-----|--------|
| Railway Dashboard | https://railway.app/dashboard | Email corporativo |
| Vercel Dashboard | https://vercel.com/axemap | GitHub OAuth |
| Cloudflare | https://dash.cloudflare.com | Email corporativo |
| Grafana | https://grafana.axemap.app | SSO |
| Sentry | https://sentry.io/axemap | GitHub OAuth |

## Procedimentos Comuns

### Reiniciar API
```bash
flyctl restart --app axemap-api
```

### Rollback de versão
```bash
# Frontend
vercel rollback --token $VERCEL_TOKEN

# Backend
flyctl deploy --app axemap-api --image ghcr.io/axemap/api:vX.Y.Z
```

### Verificar logs
```bash
flyctl logs --app axemap-api --tail
```

### Executar migration manual
```bash
flyctl ssh console --app axemap-api -C "pnpm prisma migrate deploy"
```

## Contatos de Emergência
| Papel | Pessoa | Contato |
|-------|--------|---------|
| Tech Lead | [Nome] | [Telefone] |
| DevOps | [Nome] | [Telefone] |
| DPO | [Nome] | [Email] |
```

## Playbook de Incidentes

```markdown
# Incident Response Playbook

## Severidades

| Severidade | Exemplo | Resposta |
|-----------|---------|----------|
| 🔴 Crítica | Site fora do ar, dados expostos | Imediata (24/7) |
| 🟡 Alta | Funcionalidade principal quebrada | < 1 hora |
| 🟢 Média | Funcionalidade secundária quebrada | < 4 horas |
| 🔵 Baixa | Bug cosmético, melhoria | < 1 semana |

## Fluxo

1. **Detecção** (alerta ou reporte de usuário)
2. **Classificação** (severidade, impacto)
3. **Comunicação** (Slack #incidentes)
4. **Investigação** (logs, métricas, tracing)
5. **Mitigação** (rollback, fix, workaround)
6. **Resolução** (confirmar que voltou ao normal)
7. **Pós-Mortem** (documentar em 48h)
```

## Onboarding Checklist

```markdown
# Onboarding — Novo Desenvolvedor

## Dia 1
- [ ] Acesso ao GitHub (repo axemap)
- [ ] Acesso ao Railway, Vercel, Cloudflare
- [ ] Leitura: docs/ (especialmente 78 - Handbook)
- [ ] Leitura: ADRs (77)
- [ ] Setup do ambiente local
- [ ] `pnpm dev` rodando

## Semana 1
- [ ] Criar primeiro PR (bug fix)
- [ ] Code review (como reviewer)
- [ ] Conhecer domínio (religiões afro-brasileiras)
- [ ] Conhecer o time e canais de comunicação

## Mês 1
- [ ] Implementar feature completa (CRUD)
- [ ] Participar de incidente (se houver)
- [ ] Escrever/atualizar documentação
- [ ] Conhecer o roadmap
```
