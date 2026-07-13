# 80 — CI/CD Strategy

## Pipeline Overview

```
[Push] → [CI: Lint + Build + Test + Coverage + Security]
  → [PR aberto] → [Preview Deploy]
  → [Merge na Main] → [CD: Deploy Staging]
  → [Tag] → [CD: Deploy Produção]
  → [Rollback] (se necessário)
```

## GitHub Actions Workflows

### CI Pipeline

```yml
# .github/workflows/ci.yml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm format:check

  typecheck:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    needs: lint
    services:
      postgres:
        image: postgis/postgis:16-3.4
        env:
          POSTGRES_PASSWORD: test
          POSTGRES_DB: axemap_test
        ports: ['5432:5432']
      redis:
        image: redis:7
        ports: ['6379:6379']
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with: { token: ${{ secrets.CODECOV_TOKEN }} }

  build:
    runs-on: ubuntu-latest
    needs: [typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: pnpm install
      - run: pnpm build
      - uses: actions/upload-artifact@v4
        with:
          name: build
          path: apps/*/.next
          retention-days: 1

  security:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - run: pnpm dlx audit-ci --high
      - run: pnpm dlx trivy fs .

  sonar:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: sonarsource/sonarcloud-github-action@v2
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### CD Pipeline

```yml
# .github/workflows/cd.yml
name: CD
on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  deploy-api:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
        working-directory: apps/api

  deploy-web:
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'

  preview:
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

  docker:
    runs-on: ubuntu-latest
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/bake-action@v4
        with:
          push: true
          files: docker/docker-bake.hcl
```

## Quality Gates

| Gate | Obrigatório? | Ação se Falhar |
|------|-------------|----------------|
| ESLint | Sim | ❌ Bloqueia PR |
| TypeScript check | Sim | ❌ Bloqueia PR |
| Unit tests passando | Sim | ❌ Bloqueia PR |
| Cobertura ≥ 80% | Sim | ⚠️ Alerta (não bloqueia) |
| Build | Sim | ❌ Bloqueia PR |
| Security scan (alto) | Sim | ❌ Bloqueia PR |
| Dependabot alertas | Sim (crítico) | ❌ Bloqueia PR |
| Sonar quality gate | Sim | ❌ Bloqueia PR |

## Deploy Environments

| Ambiente | URL | Deploy | Banco | Dados |
|----------|-----|--------|-------|-------|
| Local | localhost:3000 | Manual | Local Docker | Seed |
| Preview | {pr}.axemap.vercel.app | Automático (PR) | Preview Railway | Seed |
| Staging | staging.axemap.app | Automático (main) | Staging Railway | Anonimizado |
| Produção | axemap.app | Manual (tag) | Produção Railway | Real |

## Rollback

```yml
# .github/workflows/rollback.yml
name: Rollback
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options: [staging, production]

jobs:
  rollback:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: |
          if [ "${{ github.event.inputs.environment }}" = "production" ]; then
            vercel rollback --token ${{ secrets.VERCEL_TOKEN }}
            flyctl rollback --app axemap-api
          else
            vercel rollback --token ${{ secrets.VERCEL_TOKEN }} --environment=preview
          fi
```

## Scripts

```jsonc
// package.json (root)
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "lint:fix": "turbo lint -- --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "turbo test",
    "test:coverage": "turbo test:coverage",
    "test:e2e": "turbo test:e2e",
    "typecheck": "turbo typecheck",
    "prisma:generate": "pnpm --filter @axemap/database prisma generate",
    "prisma:migrate": "pnpm --filter @axemap/database prisma migrate dev",
    "prisma:seed": "pnpm --filter @axemap/database prisma db seed",
    "prepare": "husky"
  }
}
```
