# 12 — Estrutura de Pastas

## Monorepo (Turborepo)

```
axemap/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── deploy-frontend.yml
│       └── deploy-backend.yml
│
├── apps/
│   ├── web/                          # Next.js 16 (Frontend)
│   │   ├── public/
│   │   │   ├── images/
│   │   │   ├── fonts/
│   │   │   ├── sitemap.xml
│   │   │   └── robots.txt
│   │   ├── src/
│   │   │   ├── app/                  # App Router
│   │   │   │   ├── (home)/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── (auth)/
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── register/
│   │   │   │   │   └── callback/
│   │   │   │   ├── (search)/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── mapa/
│   │   │   │   ├── terreiro/
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx
│   │   │   │   ├── evento/
│   │   │   │   │   └── [id]/
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── (protected)/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       ├── membros/
│   │   │   │   │       ├── agenda/
│   │   │   │   │       ├── financeiro/
│   │   │   │   │       ├── eventos/
│   │   │   │   │       └── configuracoes/
│   │   │   │   ├── comunidade/
│   │   │   │   ├── marketplace/
│   │   │   │   ├── sobre/
│   │   │   │   ├── contato/
│   │   │   │   ├── privacidade/
│   │   │   │   └── termos/
│   │   │   ├── components/
│   │   │   │   ├── ui/               # Shadcn components
│   │   │   │   ├── layout/           # Header, Footer, Sidebar, Nav
│   │   │   │   ├── terreiro/         # TerreiroCard, TerreiroProfile
│   │   │   │   ├── busca/            # SearchBar, FilterPanel, MapView
│   │   │   │   ├── avaliacao/        # RatingStars, ReviewCard
│   │   │   │   ├── evento/           # EventCard, EventCalendar
│   │   │   │   ├── auth/             # LoginForm, RegisterForm
│   │   │   │   ├── dashboard/        # DashboardCards, Charts
│   │   │   │   └── shared/           # Loading, Empty, Error
│   │   │   ├── lib/
│   │   │   │   ├── api/              # API client helpers
│   │   │   │   ├── hooks/            # useGeolocation, useDebounce
│   │   │   │   ├── utils/            # cn(), formatDate, formatters
│   │   │   │   └── validations/      # Zod schemas
│   │   │   ├── stores/               # Zustand stores
│   │   │   ├── types/                # TypeScript types
│   │   │   ├── providers/            # React providers (Auth, Query, Theme)
│   │   │   └── styles/               # Global CSS, Tailwind config
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── mobile/                       # React Native (future)
│       ├── app/
│       ├── components/
│       └── package.json
│
├── packages/
│   ├── api/                          # NestJS Backend
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── common/
│   │   │   │   ├── decorators/       # @CurrentUser, @Roles, @Public
│   │   │   │   ├── guards/           # JwtGuard, RolesGuard
│   │   │   │   ├── interceptors/     # Logging, Transform, Audit
│   │   │   │   ├── filters/          # Exception filters
│   │   │   │   ├── pipes/            # Validation pipe
│   │   │   │   ├── middleware/       # RateLimit, Logger
│   │   │   │   └── dto/             # Shared DTOs
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   │   ├── auth.module.ts
│   │   │   │   │   ├── auth.controller.ts
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   ├── dto/
│   │   │   │   │   ├── strategies/   # JWT, Google, GitHub
│   │   │   │   │   └── guards/
│   │   │   │   ├── usuarios/
│   │   │   │   │   ├── usuarios.module.ts
│   │   │   │   │   ├── usuarios.controller.ts
│   │   │   │   │   ├── usuarios.service.ts
│   │   │   │   │   └── dto/
│   │   │   │   ├── terreiros/
│   │   │   │   ├── avaliacoes/
│   │   │   │   ├── eventos/
│   │   │   │   ├── fotos/
│   │   │   │   ├── videos/
│   │   │   │   ├── favoritos/
│   │   │   │   ├── busca/
│   │   │   │   ├── membros/
│   │   │   │   ├── financeiro/
│   │   │   │   ├── produtos/
│   │   │   │   ├── pedidos/
│   │   │   │   ├── comunidade/
│   │   │   │   ├── notificacoes/
│   │   │   │   ├── pagamentos/
│   │   │   │   ├── planos/
│   │   │   │   ├── administracao/
│   │   │   │   └── analytics/
│   │   │   └── domain/              # Domain Layer (DDD)
│   │   │       ├── entities/
│   │   │       ├── value-objects/
│   │   │       ├── aggregates/
│   │   │       ├── domain-events/
│   │   │       ├── repository-interfaces/
│   │   │       └── specifications/
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   ├── test/
│   │   │   ├── unit/
│   │   │   ├── integration/
│   │   │   └── e2e/
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   ├── shared/                       # Shared types, schemas, utils
│   │   ├── types/
│   │   ├── constants/
│   │   ├── enums/
│   │   └── utils/
│   │
│   └── database/                     # DB migrations, seeds, scripts
│       ├── prisma/
│       │   ├── schema.prisma         # Full schema
│       │   └── migrations/
│       └── scripts/
│
├── docker/
│   ├── Dockerfile.api
│   ├── Dockerfile.web
│   ├── docker-compose.yml
│   ├── docker-compose.prod.yml
│   └── .dockerignore
│
├── infra/
│   ├── nginx/
│   │   └── default.conf
│   ├── traefik/
│   │   └── traefik.yml
│   └── monitoring/
│       ├── prometheus.yml
│       └── loki-config.yml
│
├── docs/                             # Documentation
│   ├── 01-visao-do-produto.md
│   ├── ...
│   └── assets/
│
├── scripts/
│   ├── seed.ts
│   ├── backup.sh
│   └── migrate.sh
│
├── .env.example
├── .gitignore
├── turbo.json
├── package.json
└── README.md
```

## Responsabilidades por Camada

### Camada Domain (DDD)
- `entities/` — Entidades ricas com comportamento de negócio
- `value-objects/` — Objetos imutáveis (CPF, Email, Telefone, etc.)
- `aggregates/` — Grupos de entidades com consistência transacional
- `domain-events/` — Eventos de domínio desacoplados
- `repository-interfaces/` — Contratos para acesso a dados
- `specifications/` — Regras de negócio reutilizáveis

### Camada Application (NestJS Modules)
- **Controllers:** Recebem requisições HTTP, delegam para services
- **Services:** Orquestram regras de negócio, usam repositórios
- **DTOs:** Objetos de transferência com validação (Zod/class-validator)
- **Guards:** Proteção de rotas (autenticação, autorização)
- **Interceptors:** Logging, transformação de resposta, auditoria
- **Filters:** Tratamento de exceções global

### Camada Infrastructure
- **PrismaService:** Acesso a banco de dados
- **RedisService:** Cache e filas
- **BullMQService:** Processamento assíncrono
- **S3Service:** Storage de arquivos (Cloudflare R2)
- **EmailService:** Envio de emails transacionais
- **WhatsAppService:** Integração WhatsApp API
- **GeolocationService:** Geocoding (Nominatim/OpenStreetMap)
