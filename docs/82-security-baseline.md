# 82 — Security Baseline

## Checklist Obrigatório para Cada PR

```
[ ] Segue OWASP ASVS L1
[ ] Sem secrets hardcoded
[ ] Validação de entrada em todos endpoints
[ ] Autenticação em endpoints protegidos
[ ] Autorização (RBAC) verificada
[ ] Rate limiting aplicado
[ ] Headers de segurança presentes
[ ] Sem dependências com vulnerabilidades conhecidas
```

## OWASP Top 10

| # | Risco | Mitigação no AxéMap |
|---|-------|-------------------|
| 1 | Broken Access Control | RBAC + Guards (NestJS) + testes de permissão |
| 2 | Cryptographic Failures | AES-256 em documentos, bcrypt em senhas |
| 3 | Injection | Prisma ORM (escapa queries), validação com class-validator |
| 4 | Insecure Design | Clean Architecture + DDD + revisão de security |
| 5 | Security Misconfiguration | Config centralizada, secrets via env |
| 6 | Vulnerable Components | Dependabot + Renovate + Snyk |
| 7 | Auth Failures | JWT + OAuth + refresh token + blacklist |
| 8 | Data Integrity Failures | Audit log + soft delete + versionamento |
| 9 | Logging Failures | Estrutura de logs + monitoramento |
| 10 | SSRF | Validação de URLs + whitelist de domínios |

## OWASP ASVS (Nível 1)

### V1 - Arquitetura

```
[✅] ADR-015: Event-Driven Architecture
[✅] ADR-017: Clean Architecture (isolamento de camadas)
[✅] ADR-014: RBAC (modelo de autorização)
```

### V2 - Autenticação

```
[✅] Senhas com bcrypt (salt rounds = 12)
[✅] JWT com expiração (15 min)
[✅] Refresh token (7 dias, armazenado seguro)
[✅] OAuth para login social (Google, GitHub)
[✅] Rate limit no login (5 tentativas/min)
✅ MFA (futuro - Pós-MVP)
```

### V3 - Gerenciamento de Sessão

```
[✅] JWT assinado (RS256 ou HS256)
[✅] Blacklist de tokens no Redis
[✅] Token rotacionado a cada refresh
✅ Secure + HttpOnly cookies
```

### V4 - Controle de Acesso

```
[✅] RBAC com 15 papéis
[✅] Guards por endpoint
[✅] Testes de permissão automatizados
[✅] Princípio do menor privilégio
```

### V5 - Validação

```
[✅] class-validator em todos DTOs
[✅] Sanitização de HTML (XSS)
[✅] Validação de tipos (TypeScript strict)
[✅] Tamanho máximo de inputs (MaxLength)
✅ Content Security Policy
```

## Security Headers

```typescript
// common/middleware/security-headers.middleware.ts
@Injectable()
export class SecurityHeadersMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https://*.r2.cloudflarestorage.com; connect-src 'self' https://api.axemap.app"
    );
    res.setHeader('Permissions-Policy', 'geolocation=(self), camera=none, microphone=none');
    next();
  }
}
```

## Secrets Management

```env
# .env.example (nunca commitado)
# Banco de Dados
DATABASE_URL=postgresql://user:pass@localhost:5432/axemap
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=change-me
JWT_REFRESH_SECRET=change-me

# OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Cloudflare R2
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

# API Keys
OPENAI_API_KEY=
SENTRY_DSN=

# Environment
NODE_ENV=development
```

## Rate Limiting

```typescript
// common/guards/throttler.guard.ts
@Injectable()
export class ThrottlerGuard {
  private readonly limits = {
    default: { ttl: 60000, limit: 100 },     // 100 req/min
    login: { ttl: 60000, limit: 5 },          // 5 tentativas/min
    signup: { ttl: 3600000, limit: 3 },       // 3 cadastros/hora
    api: { ttl: 60000, limit: 60 },           // 60 req/min (API pública)
  } as const;

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const key = request.ip;
    const endpoint = request.route.path;
    const limit = this.limits[endpoint] || this.limits.default;

    const current = await redis.incr(`ratelimit:${key}:${endpoint}`);
    if (current === 1) await redis.pexpire(`ratelimit:${key}:${endpoint}`, limit.ttl);

    if (current > limit.limit) {
      throw new HttpException('Too Many Requests', 429);
    }

    return true;
  }
}
```

## CSRF Protection

```typescript
// apps/web/src/middleware.ts (Next.js)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // CSRF via SameSite cookies
  const response = NextResponse.next();
  response.cookies.set('session', request.cookies.get('session')?.value || '', {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
  });
  return response;
}
```

## XSS Prevention

```typescript
// Sempre sanitizar HTML inserido
import DOMPurify from 'dompurify';

function sanitizeContent(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
    ALLOWED_ATTR: ['href'],
  });
}
```

## SQL Injection

```typescript
// Prisma já previne injection via parametrização
// Raw queries devem ser parametrizadas:

// ❌ Perigoso:
await prisma.$queryRawUnsafe(`SELECT * FROM terreiros WHERE nome = '${input}'`);

// ✅ Seguro:
await prisma.$queryRaw`SELECT * FROM terreiros WHERE nome = ${input}`;
```

## LGPD Compliance

| Requisito | Implementação |
|-----------|--------------|
| Consentimento | Checkbox no signup, revogável a qualquer momento |
| Direito de exclusão | Soft delete + purge após 90 dias |
| Portabilidade | Export CSV de todos dados do usuário |
| Criptografia | AES-256 em documentos de verificação |
| Anonimização | Dados pessoais anonimizados após 12 meses |
| Incident response | Playbook de vazamento (docs/runbook) |
| DPO | Cadastro na ANPD, canal de contato |

## Security Scan Pipeline

```yml
# .github/workflows/security-scan.yml
name: Security Scan
on:
  schedule:
    - cron: '0 6 * * 1'  # toda segunda 6h
  push:
    branches: [main]

jobs:
  sast:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with: { languages: typescript }
      - uses: github/codeql-action/analyze@v3

  dependency:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pnpm audit --audit-level=high
      - uses: snyk/actions/node@master
        env: { SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }} }

  container:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          format: 'sarif'
          output: 'trivy-results.sarif'

  secrets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Secrets Rotation

| Secret | Rotação | Método |
|--------|---------|--------|
| JWT_SECRET | A cada 90 dias | Railway dashboard |
| GOOGLE_CLIENT_SECRET | Anual | Google Cloud Console |
| R2_SECRET_ACCESS_KEY | Anual | Cloudflare Dashboard |
| DATABASE_URL | A cada 180 dias | Railway dashboard |
| OpenAI API Key | Imediato se vazar | OpenAI Dashboard |
