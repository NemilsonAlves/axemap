# 78 — Engineering Handbook

## 1. Estrutura do Projeto

```
axemap/
├── apps/
│   ├── web/                    # Next.js 16 (App Router)
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, cadastro
│   │   │   ├── (search)/       # Busca, resultados
│   │   │   ├── terreiro/       # Perfil público
│   │   │   ├── dashboard/      # Painel do dirigente
│   │   │   └── admin/          # Admin
│   │   ├── components/
│   │   │   ├── ui/             # Design system (shadcn/ui)
│   │   │   ├── layout/         # Header, footer, sidebar
│   │   │   ├── terreiro/       # Terreiro-specific components
│   │   │   ├── mapa/           # Leaflet components
│   │   │   └── shared/         # Shared across features
│   │   ├── hooks/
│   │   ├── lib/
│   │   │   ├── api-client.ts   # API client (fetch wrapper)
│   │   │   └── utils.ts
│   │   ├── providers/
│   │   └── styles/
│   │
│   └── api/                    # NestJS
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   │   ├── auth.module.ts
│       │   │   │   ├── auth.controller.ts
│       │   │   │   ├── auth.service.ts
│       │   │   │   ├── dto/
│       │   │   │   ├── entities/
│       │   │   │   └── strategies/
│       │   │   ├── terreiro/
│       │   │   ├── usuario/
│       │   │   ├── avaliacao/
│       │   │   ├── trust-score/
│       │   │   ├── evento/
│       │   │   ├── marketplace/
│       │   │   ├── busca/
│       │   │   ├── moderacao/
│       │   │   ├── notificacao/
│       │   │   ├── analytics/
│       │   │   ├── gal/            # Graph Abstraction Layer
│       │   │   └── shared/
│       │   ├── common/
│       │   │   ├── decorators/
│       │   │   ├── filters/
│       │   │   ├── guards/
│       │   │   ├── interceptors/
│       │   │   ├── middleware/
│       │   │   └── pipes/
│       │   ├── config/
│       │   ├── database/
│       │   │   ├── prisma/
│       │   │   └── migrations/
│       │   └── main.ts
│       └── test/
│
├── packages/
│   ├── shared/                 # Tipos, DTOs, enums
│   │   ├── src/
│   │   │   ├── types/
│   │   │   ├── enums/
│   │   │   ├── interfaces/
│   │   │   └── validators/
│   │   └── package.json
│   ├── config/                 # ESLint, Prettier, TS configs
│   │   └── package.json
│   ├── ui/                     # Design system
│   │   └── package.json
│   └── database/              # Prisma schema + client
│       ├── prisma/
│       │   └── schema.prisma
│       └── package.json
│
├── docker/
│   ├── Dockerfile.web
│   ├── Dockerfile.api
│   └── docker-compose.yml
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── cd.yml
│
├── docs/
├── turbo.json
├── package.json (root)
└── pnpm-workspace.yaml
```

## 2. Organização dos Módulos (NestJS)

Cada módulo segue a estrutura:

```
modulo/
├── modulo.module.ts       # @Module({ imports, controllers, providers, exports })
├── modulo.controller.ts   # @Controller('/api/v1/modulo')
├── modulo.service.ts      # @Injectable() - regras de negócio
├── dto/
│   ├── criar-modulo.dto.ts
│   ├── atualizar-modulo.dto.ts
│   └── filtrar-modulo.dto.ts
├── entities/
│   └── modulo.entity.ts   # Representação da entidade
├── interfaces/
│   └── modulo.repository.ts  # Interface do repositório
├── repositories/
│   └── modulo.repository.ts  # Implementação (Prisma)
├── events/
│   ├── modulo.criado.event.ts
│   └── modulo.handler.ts   # BullMQ consumer
├── strategies/             # (quando aplicável)
├── mappers/                # (quando aplicável)
└── spec/
    ├── modulo.service.spec.ts
    └── modulo.controller.spec.ts
```

## 3. Convenções de Nomenclatura

| Elemento | Padrão | Exemplo |
|----------|--------|---------|
| Pastas | `kebab-case` | `trust-score/` |
| Arquivos | `kebab-case` | `criar-terreiro.dto.ts` |
| Classes | `PascalCase` | `TerreiroService` |
| Interfaces | `PascalCase` | `ITerreiroRepository` |
| Types | `PascalCase` | `TerreiroResponse` |
| Enums | `PascalCase` | `TerreiroStatus` |
| Enum values | `UPPER_SNAKE_CASE` | `EM_ANALISE` |
| Funções | `camelCase` | `calcularTrustScore()` |
| Métodos | `camelCase` | `getTerreiroById()` |
| Variáveis | `camelCase` | `terreiroAtual` |
| Constantes | `UPPER_SNAKE_CASE` | `MAX_TRUST_SCORE` |
| Arquivos de teste | `*.spec.ts` | `terreiro.service.spec.ts` |
| Arquivos de módulo | `*.module.ts` | `terreiro.module.ts` |
| Decorators | `camelCase` | `@CurrentUser()` |
| Guards | `PascalCase` | `RolesGuard` |
| Filters | `PascalCase` | `HttpExceptionFilter` |
| Interceptors | `PascalCase` | `LoggingInterceptor` |
| Middleware | `PascalCase` | `AuthMiddleware` |
| Pipes | `PascalCase` | `ValidationPipe` |
| DTOs | `[Verbo][Entidade]Dto` | `CriarTerreiroDto` |
| Entities | `[Entidade]Entity` | `TerreiroEntity` |
| Events | `[Entidade].[Acao].event` | `terreiro.criado` |

## 4. Padrão para DTOs

```typescript
// packages/shared/src/types/terreiro/dto/criar-terreiro.dto.ts
import { IsString, IsOptional, IsUUID, IsLatitude, IsLongitude, MinLength, MaxLength } from 'class-validator';

export class CriarTerreiroDto {
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  nome!: string;

  @IsString()
  @MinLength(3)
  @MaxLength(100)
  tradicao!: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  descricaoCurta?: string;

  @IsUUID()
  cidadeId!: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;
}

// DTO de resposta
export class TerreiroResponse {
  id!: string;
  nome!: string;
  slug!: string;
  tradicao!: string;
  trustScore!: number;
  cidade!: string;
  estado!: string;
  createdAt!: Date;
}
```

## 5. Padrão para Entities

```typescript
// entities/terreiro.entity.ts
export class TerreiroEntity {
  constructor(
    public readonly id: string,
    public nome: string,
    public slug: string,
    public tradicao: string,
    public trustScore: number,
    public isPublished: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(nome: string, tradicao: string): TerreiroEntity {
    return new TerreiroEntity(
      crypto.randomUUID(),
      nome,
      slugify(nome),
      tradicao,
      0,        // trust score inicial
      false,    // não publicado até revisão
      new Date(),
      new Date(),
      null,
    );
  }

  public publish(): void {
    this.isPublished = true;
    this.updatedAt = new Date();
  }

  public atualizarTrustScore(novoScore: number): void {
    this.trustScore = Math.max(0, Math.min(100, novoScore));
    this.updatedAt = new Date();
  }
}
```

## 6. Padrão para Repositories

```typescript
// interfaces/terreiro.repository.ts
export interface ITerreiroRepository {
  findById(id: string): Promise<TerreiroEntity | null>;
  findBySlug(slug: string): Promise<TerreiroEntity | null>;
  findMany(filters: TerreiroFilters): Promise<TerreiroEntity[]>;
  save(terreiro: TerreiroEntity): Promise<void>;
  softDelete(id: string): Promise<void>;
}

// repositories/impl/prisma-terreiro.repository.ts
@Injectable()
export class PrismaTerreiroRepository implements ITerreiroRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<TerreiroEntity | null> {
    const raw = await this.prisma.terreiro.findUnique({ where: { id } });
    return raw ? this.toEntity(raw) : null;
  }

  async save(terreiro: TerreiroEntity): Promise<void> {
    await this.prisma.terreiro.upsert({
      where: { id: terreiro.id },
      create: this.toPrisma(terreiro),
      update: this.toPrisma(terreiro),
    });
  }

  private toEntity(raw: PrismaTerreiro): TerreiroEntity {
    return new TerreiroEntity(
      raw.id, raw.nome, raw.slug, raw.tradicao,
      raw.trustScore, raw.isPublished,
      raw.createdAt, raw.updatedAt, raw.deletedAt,
    );
  }

  private toPrisma(entity: TerreiroEntity): PrismaTerreiroCreateInput {
    return { id: entity.id, nome: entity.nome, slug: entity.slug, /* ... */ };
  }
}
```

## 7. Padrão para Services

```typescript
// use-cases/criar-terreiro.use-case.ts
@Injectable()
export class CriarTerreiroUseCase {
  constructor(
    private readonly terreiroRepo: ITerreiroRepository,
    private readonly eventBus: EventBusService,
  ) {}

  async execute(dto: CriarTerreiroDto): Promise<TerreiroResponse> {
    const entity = TerreiroEntity.create(dto.nome, dto.tradicao);

    await this.terreiroRepo.save(entity);

    this.eventBus.emit('terreiro.criado', new TerreiroCriadoEvent(entity.id));

    return TerreiroMapper.toResponse(entity);
  }
}
```

## 8. Padrão para Controllers

```typescript
@ApiTags('Terreiros')
@Controller('api/v1/terreiros')
export class TerreiroController {
  constructor(private readonly criarTerreiro: CriarTerreiroUseCase) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'DIRIGENTE')
  async criar(@Body() dto: CriarTerreiroDto): Promise<TerreiroResponse> {
    return this.criarTerreiro.execute(dto);
  }

  @Get(':slug')
  async buscarPorSlug(@Param('slug') slug: string): Promise<TerreiroResponse> {
    return this.buscarTerreiro.execute(slug);
  }
}
```

## 9. Padrão para Events e Handlers

```typescript
// events/terreiro.criado.event.ts
export class TerreiroCriadoEvent {
  constructor(
    public readonly terreiroId: string,
    public readonly timestamp: Date = new Date(),
  ) {}
}

// handlers/trust-score.handler.ts
@Processor('trust-score-queue')
export class TrustScoreHandler {
  @Process('terreiro.criado')
  async handle(job: Job<TerreiroCriadoEvent>): Promise<void> {
    await this.trustScoreService.calcularInicial(job.data.terreiroId);
  }

  @Process('avaliacao.criada')
  async handleAvaliacao(job: Job<AvaliacaoCriadaEvent>): Promise<void> {
    await this.trustScoreService.recalcular(job.data.terreiroId);
  }
}
```

## 10. Padrão para Hooks (React)

```typescript
// hooks/use-terreiro.ts
export function useTerreiro(slug: string) {
  return useQuery({
    queryKey: ['terreiro', slug],
    queryFn: () => api.get(`/terreiros/${slug}`),
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

// hooks/use-avaliacao.ts
export function useCriarAvaliacao() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CriarAvaliacaoDto) => api.post('/avaliacoes', data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['terreiro', variables.terreiroId] });
      queryClient.invalidateQueries({ queryKey: ['avaliacoes', variables.terreiroId] });
    },
  });
}
```

## 11. Padrão para Components (Next.js)

```typescript
// components/terreiro/terreiro-card.tsx
interface TerreiroCardProps {
  terreiro: TerreiroResumo;
  variant?: 'default' | 'compact' | 'featured';
}

export function TerreiroCard({ terreiro, variant = 'default' }: TerreiroCardProps) {
  return (
    <Link href={`/terreiro/${terreiro.slug}`} className={styles.card}>
      <TrustScoreBadge score={terreiro.trustScore} />
      <h3>{terreiro.nome}</h3>
      <p>{terreiro.tradicao} - {terreiro.cidade}, {terreiro.estado}</p>
    </Link>
  );
}
```

## 12. Padrão para Providers

```typescript
// providers/session.provider.tsx
'use client';

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <SessionProviderWrapper>
      <ThemeProvider attribute="class" defaultTheme="light">
        {children}
      </ThemeProvider>
    </SessionProviderWrapper>
  );
}
```

## 13. Padrão para Errors

```typescript
// common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : 500;

    const message = exception instanceof HttpException
      ? exception.message
      : 'Erro interno do servidor';

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      requestId: ctx.getRequest().id,
    });
  }
}

// Custom domain error
export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 400,
  ) {
    super(message);
  }
}

export class TerreiroNaoEncontradoError extends DomainError {
  constructor(id: string) {
    super(`Terreiro ${id} não encontrado`, 'TERREIRO_NOT_FOUND', 404);
  }
}
```

## 14. Padrão para Middleware

```typescript
// common/middleware/request-id.middleware.ts
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.id = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('x-request-id', req.id);
    next();
  }
}
```

## 15. Padrão para Logs

```typescript
// common/interceptors/logging.interceptor.ts
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: Logger) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, id } = request;
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => this.logger.log(`${method} ${url} ${id} ${Date.now() - now}ms`),
        error: () => this.logger.error(`${method} ${url} ${id} ${Date.now() - now}ms`),
      }),
    );
  }
}
```

## 16. Padrão para Config

```typescript
// config/configuration.ts
export default () => ({
  port: parseInt(process.env.PORT!, 10) || 3001,
  database: {
    url: process.env.DATABASE_URL!,
  },
  redis: {
    host: process.env.REDIS_HOST!,
    port: parseInt(process.env.REDIS_PORT!, 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  },
  r2: {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucket: process.env.R2_BUCKET!,
  },
});
```

## 17. Padrão para Testes

```typescript
// modules/terreiro/spec/terreiro.service.spec.ts
describe('CriarTerreiroUseCase', () => {
  let useCase: CriarTerreiroUseCase;
  let repo: jest.Mocked<ITerreiroRepository>;
  let eventBus: jest.Mocked<EventBusService>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CriarTerreiroUseCase,
        { provide: ITerreiroRepository, useValue: mockRepo },
        { provide: EventBusService, useValue: mockEventBus },
      ],
    }).compile();

    useCase = module.get(CriarTerreiroUseCase);
  });

  it('deve criar terreiro e emitir evento', async () => {
    const dto = new CriarTerreiroDto();
    dto.nome = 'Terreiro Teste';
    dto.tradicao = 'Umbanda';

    const result = await useCase.execute(dto);

    expect(repo.save).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith('terreiro.criado', expect.any(Object));
    expect(result.nome).toBe('Terreiro Teste');
  });
});
```
