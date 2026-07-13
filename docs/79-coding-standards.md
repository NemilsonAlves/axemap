# 79 — Coding Standards

## ESLint

```jsonc
// packages/config/eslint/base.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    '@rocketseat/eslint-config/node',
    'plugin:prettier/recommended',
  ],
  plugins: ['simple-import-sort', 'unused-imports'],
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'unused-imports/no-unused-imports': 'error',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prettier/prettier': 'error',
  },
};
```

## Prettier

```jsonc
// .prettierrc
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "bracketSpacing": true,
  "endOfLine": "lf"
}
```

## EditorConfig

```ini
# .editorconfig
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true

[*.md]
trim_trailing_whitespace = false
```

## Husky

```shell
# .husky/pre-commit
npx lint-staged
```

```jsonc
// package.json (root)
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,yaml,yml}": ["prettier --write"],
    "*.prisma": ["prisma format"]
  }
}
```

## Commitlint

```shell
# .husky/commit-msg
npx --no -- commitlint --edit $1
```

```jsonc
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nova funcionalidade
        'fix',      // Correção de bug
        'refactor', // Refatoração
        'style',    // Formatação, estilos
        'test',     // Testes
        'docs',     // Documentação
        'chore',    // Manutenção
        'perf',     // Performance
        'ci',       // CI/CD
        'build',    // Build
        'revert',   // Reversão
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        'web', 'api', 'shared', 'config', 'docs', 'infra', 'db', 'deps',
      ],
    ],
  },
};
```

## Conventional Commits

```
Formato: <type>(<scope>): <description>

<type>: feat | fix | refactor | style | test | docs | chore | perf | ci | build | revert
<scope>: web | api | shared | config | docs | infra | db | deps

Exemplos:
feat(api): add trust score recalculation on new review
fix(web): correct map marker clustering on mobile
refactor(api): extract graph query logic into GAL
docs(api): update auth flow documentation
test(api): add integration tests for terreiro creation
ci(infra): add security scan to CI pipeline
```

## Semantic Versioning

```jsonc
// packages/shared/package.json
{
  "version": "0.1.0",    // MVP: 0.x.x
  // Pós-MVP: 1.x.x
  // Regras:
  // MAJOR: breaking changes na API pública
  // MINOR: novas features compatíveis
  // PATCH: bug fixes compatíveis
}
```

## Dependabot

```yml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "automerge"
    
  - package-ecosystem: "docker"
    directory: "/docker"
    schedule:
      interval: "monthly"
```

## Renovate

```jsonc
// renovate.json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:base"],
  "labels": ["dependencies", "automerge"],
  "packageRules": [
    {
      "matchUpdateTypes": ["patch"],
      "automerge": true
    },
    {
      "matchDepTypes": ["devDependencies"],
      "automerge": true
    }
  ]
}
```

## TypeScript Strict Mode

```jsonc
// tsconfig.base.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
  }
}
```

## Imports (Ordenação)

```typescript
// Ordem de imports:
// 1. Node built-in
// 2. Third-party (npm)
// 3. Internal modules (packages/shared)
// 4. Relative imports (./)
// 5. CSS/Assets

import { randomUUID } from 'node:crypto';

import { Injectable } from '@nestjs/common';
import { z } from 'zod';

import { TerreiroEntity } from '@axemap/shared';
import { CriarTerreiroDto } from './dto/criar-terreiro.dto';

import styles from './styles.module.css';
```

## Naming Conventions (Banco)

```typescript
// Tabelas: snake_case plural
// Colunas: snake_case
// Chaves estrangeiras: tabela_id
// Timestamps: created_at, updated_at, deleted_at

model Terreiros {
  id         String   @id @default(uuid())
  nome       String
  slug       String   @unique
  tradicao   String
  trust_score Float   @default(0)
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  deleted_at DateTime?
}
```

## Error Handling

```typescript
// Nunca usar throw new Error()
// Sempre usar DomainError ou HttpException

// ❌
throw new Error('Terreiro não encontrado');

// ✅
throw new TerreiroNaoEncontradoError(id);
```
