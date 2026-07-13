# 81 — Test Strategy

## Test Pyramid (AxéMap)

```
        ╱╲
       ╱ E2E ╲               ~5% - fluxos críticos (Puppeteer/Playwright)
      ╱────────╲
     ╱Integration╲           ~20% - módulos + API (Supertest + Test Containers)
    ╱──────────────╲
   ╱   Unit Tests    ╲       ~75% - use cases, services, entities (Jest)
  ╱────────────────────╲
```

## 1. Unit Tests

### Escopo
- Entities (regras de negócio)
- Use Cases (orquestração)
- Services (cálculos, transformações)
- DTOs (validação)
- Utils, helpers, mappers

### Frameworks
- **Jest** (runner + assertions)
- **ts-jest** (TypeScript)
- **jest-mock-extended** (mocks tipados)

### Coverage Targets

| Camada | Mínimo |
|--------|--------|
| Entities | 100% |
| Use Cases | 100% |
| Services | 90% |
| Controllers | 80% |
| Overall | 80% |

### Exemplo

```typescript
// modules/trust-score/spec/trust-score.service.spec.ts
describe('TrustScoreService', () => {
  let service: TrustScoreService;
  let repo: DeepMockProxy<ITrustScoreRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TrustScoreService,
        { provide: ITrustScoreRepository, useValue: mockDeep<ITrustScoreRepository>() },
      ],
    }).compile();

    service = module.get(TrustScoreService);
    repo = module.get(ITrustScoreRepository);
  });

  describe('calcular', () => {
    it('deve calcular score com todos os componentes', async () => {
      const resultado = await service.calcular('terreiro-id');

      expect(resultado.score).toBeGreaterThanOrEqual(0);
      expect(resultado.score).toBeLessThanOrEqual(100);
      expect(resultado.components).toHaveLength(6);
    });

    it('deve retornar score 0 se terreiro não existe', async () => {
      repo.findById.mockResolvedValue(null);
      await expect(service.calcular('inexistente')).rejects.toThrow(TerreiroNaoEncontradoError);
    });
  });
});
```

## 2. Integration Tests

### Escopo
- Repositories (Prisma)
- Graph queries (GAL)
- Event handlers (BullMQ)
- Cache operations (Redis)

### Setup

```typescript
// test/setup/integration.ts
import { TestContainers } from 'testcontainers';

beforeAll(async () => {
  // Sobe PostgreSQL + Redis em containers Docker
  const postgres = await new PostgresContainer('postgis/postgis:16-3.4').start();
  const redis = await new RedisContainer('redis:7').start();

  process.env.DATABASE_URL = postgres.getConnectionUri();
  process.env.REDIS_URL = redis.getConnectionUri();

  // Roda migrations
  await execSync('pnpm prisma migrate deploy');
});

afterAll(async () => {
  await postgres.stop();
  await redis.stop();
});
```

### Exemplo

```typescript
// modules/gal/spec/postgres-graph.repository.int-spec.ts
describe('PostgresGraphRepository (Integration)', () => {
  let repo: PostgresGraphRepository;
  let prisma: PrismaService;

  beforeAll(async () => {
    prisma = new PrismaService();
    repo = new PostgresGraphRepository(prisma);
  });

  it('deve criar nó e buscar por tipo', async () => {
    const node = await repo.createNode({
      id: 'test-id',
      type: 'Terreiro',
      labels: ['terreiro', 'verificado'],
      properties: { nome: 'Teste' },
    });

    const found = await repo.getNode('test-id');
    expect(found).toBeDefined();
    expect(found!.type).toBe('Terreiro');
  });

  it('deve buscar vizinhos de um nó', async () => {
    const neighbors = await repo.getNeighbors('terreiro-id', ['PERTENCE_A']);
    expect(Array.isArray(neighbors)).toBe(true);
  });
});
```

## 3. E2E Tests

### Escopo
- Fluxos completos de usuário
- Critical user journeys

### Ferramenta
- **Playwright** (cross-browser, mobile emulation)

### Fluxos Testados

| Fluxo | Prioridade | Descrição |
|-------|-----------|-----------|
| Signup → Busca → Perfil | P0 | Usuário se cadastra, busca terreiro, vê perfil |
| Criação de terreiro | P0 | Dirigente cria perfil completo |
| Avaliação | P0 | Usuário avalia terreiro |
| Trust Score visível | P0 | Score aparece no perfil |
| Marketplace compra | P1 | Usuário compra produto |
| Moderação | P1 | Conteúdo é moderado |

### Exemplo

```typescript
// e2e/fluxos/busca-terreiro.spec.ts
import { test, expect } from '@playwright/test';

test('usuário busca terreiro por tradição e cidade', async ({ page }) => {
  await page.goto('/busca');

  await page.fill('[data-testid="search-input"]', 'Umbanda');
  await page.fill('[data-testid="city-input"]', 'Recife');

  await page.click('[data-testid="search-button"]');

  await expect(page.locator('[data-testid="result-card"]')).toHaveCount.atLeast(1);
  await expect(page.locator('[data-testid="result-card"]').first()).toContainText('Umbanda');
});
```

## 4. Contract Tests

### Escopo
- API REST endpoints
- GraphQL resolvers
- Event schemas

### Ferramenta
- **Pact** (CDC - Consumer Driven Contracts)

### Exemplo

```typescript
// test/contracts/api/terreiro-api.pact.ts
describe('Terreiro API contract', () => {
  it('deve retornar terreiro por slug', async () => {
    await pact
      .given('um terreiro existe')
      .uponReceiving('uma requisição GET /api/v1/terreiros/:slug')
      .withRequest({
        method: 'GET',
        path: '/api/v1/terreiros/terreiro-teste',
      })
      .willRespondWith({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: {
          id: like('uuid'),
          nome: like('Terreiro Teste'),
          slug: like('terreiro-teste'),
          trustScore: like(75),
        },
      });

    await pact.executeTest(async (mockServer) => {
      const response = await fetch(`${mockServer.url}/api/v1/terreiros/terreiro-teste`);
      expect(response.status).toBe(200);
    });
  });
});
```

## 5. Performance Tests

### Escopo
- Endpoints críticos (busca, perfil)
- Queries de grafo
- Cálculo de Trust Score

### Ferramenta
- **k6** (Grafana)

### Thresholds

```javascript
// test/performance/search.k6.js
export const options = {
  stages: [
    { duration: '1m', target: 10 },   // Rampa para 10 usuários
    { duration: '3m', target: 50 },   // Rampa para 50 usuários
    { duration: '1m', target: 0 },    // Rampa para 0
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das requests < 500ms
    http_req_failed: ['rate<0.01'],    // < 1% de falha
  },
};

export default function () {
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  http.get('https://api.axemap.app/api/v1/busca?q=umbanda&cidade=Recife', params);
}
```

## 6. Security Tests

### Escopo
- SQL Injection
- XSS
- JWT tampering
- RBAC bypass

### Ferramenta
- **OWASP ZAP** (integração CI)
- **Snyk** (dependências)

### Pipeline

```yml
# .github/workflows/security-test.yml
security-test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - run: pnpm install
    - run: pnpm dlx zap-cli quick-scan --self-contained \
           --start-options '-config api.disablekey=true' \
           http://localhost:3001
```

## 7. Visual Regression

### Escopo
- Componentes do design system
- Páginas principais (busca, perfil, dashboard)

### Ferramenta
- **Playwright Visual Comparisons**
- **Chromatic** (Storybook)

### Comando

```bash
pnpm exec playwright test --project=visual
```

## 8. Smoke Tests

### Escopo
- Health checks pós-deploy
- Endpoints principais respondendo

### Exemplo

```typescript
// test/smoke/post-deploy.spec.ts
describe('Smoke Tests - Produção', () => {
  it('GET /health deve retornar 200', async () => {
    const response = await fetch('https://api.axemap.app/health');
    expect(response.status).toBe(200);
  });

  it('GET /api/v1/terreiros deve retornar lista', async () => {
    const response = await fetch('https://api.axemap.app/api/v1/terreiros?limit=1');
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });
});
```

## Test Commands

```jsonc
// package.json
{
  "scripts": {
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.ts",
    "test:e2e": "playwright test",
    "test:performance": "k6 run test/performance/*.k6.js",
    "test:smoke": "jest test/smoke",
    "test:all": "pnpm test && pnpm test:integration && pnpm test:e2e"
  }
}
```
