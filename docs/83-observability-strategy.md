# 83 — Observability Strategy

## Pillars

```
                            OBSERVABILITY
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
     LOGS                    METRICS                 TRACING
  • Estruturados           • Prometheus           • OpenTelemetry
  • JSON (stdout)          • Grafana              • Jaeger
  • Elasticsearch (futuro)  • Dashboards           • Distributed tracing
```

## 1. Logs

### Estrutura de Log

```typescript
interface LogEntry {
  timestamp: string;        // ISO 8601
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  service: string;          // 'api' | 'web' | 'worker'
  requestId: string;        // correlation id
  userId?: string;
  module: string;           // 'terreiro' | 'auth' | etc
  action: string;           // 'criar' | 'buscar' | etc
  duration?: number;        // ms
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
}
```

### Log Levels

| Level | Uso | Exemplo |
|-------|-----|---------|
| `debug` | Desenvolvimento | "Cache miss for key X" |
| `info` | Operação normal | "Terreiro criado: X" |
| `warn` | Recuperável | "Rate limit approaching for IP X" |
| `error` | Erro operacional | "Database connection failed" |
| `fatal` | Irrecuperável | "App failed to start" |

### Logger Service

```typescript
// common/logger/logger.service.ts
import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger = pino({
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url, requestId: req.id }),
      res: (res) => ({ statusCode: res.statusCode }),
      err: pino.stdSerializers.err,
    },
  });

  log(message: string, context?: string) { this.logger.info({ context }, message); }
  warn(message: string, context?: string) { this.logger.warn({ context }, message); }
  error(message: string, trace?: string, context?: string) {
    this.logger.error({ context, trace }, message);
  }
  debug(message: string, context?: string) { this.logger.debug({ context }, message); }
}
```

## 2. Metrics (Prometheus + Grafana)

### Métricas Coletadas

```typescript
// common/metrics/metrics.service.ts
@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total HTTP requests',
    labelNames: ['method', 'path', 'status'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_ms',
    help: 'HTTP request duration in ms',
    labelNames: ['method', 'path'],
    buckets: [10, 50, 100, 200, 500, 1000, 2000, 5000],
  });

  private readonly trustScoreDistribution = new Gauge({
    name: 'trust_score_distribution',
    help: 'Distribution of trust scores across terreiros',
    labelNames: ['level'],
  });

  private readonly activeUsers = new Gauge({
    name: 'active_users',
    help: 'Number of active users',
    labelNames: ['type'], // 'wau' | 'mau'
  });

  private readonly queueSize = new Gauge({
    name: 'bullmq_queue_size',
    help: 'BullMQ queue size',
    labelNames: ['queue'],
  });

  private readonly dbQueryDuration = new Histogram({
    name: 'db_query_duration_ms',
    help: 'Database query duration',
    labelNames: ['operation', 'table'],
    buckets: [1, 5, 10, 50, 100, 500],
  });

  // Event bus metrics
  private readonly eventsTotal = new Counter({
    name: 'domain_events_total',
    help: 'Domain events emitted',
    labelNames: ['event'],
  });
}
```

### Dashboards (Grafana)

| Dashboard | Métricas | Público |
|-----------|----------|---------|
| **API Overview** | Request rate, latency p50/p95/p99, error rate, active users | Engenharia |
| **Database** | Query duration, connection pool, slow queries | DBAs |
| **Queues** | Queue size, processing time, failed jobs, dead letters | Engenharia |
| **Business** | Trust score distribution, new terreiros, evaluations | Produto |
| **Infrastructure** | CPU, memory, disk, network | DevOps |

## 3. Tracing (OpenTelemetry)

```typescript
// common/tracing/tracing.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

@Injectable()
export class TracingService implements OnModuleInit {
  onModuleInit() {
    const sdk = new NodeSDK({
      resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'axemap-api',
        [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
      }),
      traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
      }),
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
  }
}
```

## 4. Health Checks

```typescript
// common/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
    private bull: BullService,
  ) {}

  @Get()
  async check(): Promise<HealthResult> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkBullMQ(),
    ]);

    const status = checks.every(c => c.status === 'ok') ? 'ok' : 'degraded';

    return {
      status,
      version: process.env.APP_VERSION || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: Object.fromEntries(checks.map(c => [c.name, c])),
    };
  }

  private async checkDatabase(): Promise<HealthCheck> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { name: 'database', status: 'ok' };
    } catch (error) {
      return { name: 'database', status: 'error', error: (error as Error).message };
    }
  }

  private async checkRedis(): Promise<HealthCheck> {
    try {
      await this.redis.ping();
      return { name: 'redis', status: 'ok' };
    } catch (error) {
      return { name: 'redis', status: 'error', error: (error as Error).message };
    }
  }

  private async checkBullMQ(): Promise<HealthCheck> {
    try {
      const queues = await this.bull.getQueues();
      return { name: 'bullmq', status: 'ok', detail: { queues: queues.length } };
    } catch (error) {
      return { name: 'bullmq', status: 'error', error: (error as Error).message };
    }
  }
}

interface HealthResult {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  timestamp: string;
  uptime: number;
  checks: Record<string, HealthCheck>;
}

interface HealthCheck {
  name: string;
  status: 'ok' | 'error';
  error?: string;
  detail?: Record<string, unknown>;
}
```

## 5. Error Tracking

```typescript
// common/sentry/sentry.filter.ts
@Catch()
export class SentryFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(exception);
    }

    // Forward to HTTP exception filter
    const nextFilter = host.getArgs()[2];
    if (nextFilter) nextFilter(exception);
  }
}
```

## 6. Audit Logs

```typescript
// common/audit/audit.service.ts
@Injectable()
export class AuditService {
  async log(action: AuditAction): Promise<void> {
    await this.prisma.auditLogs.create({
      data: {
        usuarioId: action.usuarioId,
        acao: action.acao,
        entidadeTipo: action.entidadeTipo,
        entidadeId: action.entidadeId,
        antes: action.antes || undefined,
        depois: action.depois || undefined,
        ip: action.ip,
        userAgent: action.userAgent,
      },
    });
  }
}

interface AuditAction {
  usuarioId: string;
  acao: 'CRIAR' | 'ATUALIZAR' | 'DELETAR' | 'VERIFICAR' | 'PUBLICAR';
  entidadeTipo: 'TERREIRO' | 'USUARIO' | 'AVALIACAO' | 'EVENTO' | 'PRODUTO';
  entidadeId: string;
  antes?: Record<string, unknown>;
  depois?: Record<string, unknown>;
  ip: string;
  userAgent: string;
}
```

## 7. Alertas

| Alerta | Condição | Canal | Severidade |
|--------|----------|-------|-----------|
| API Down | Health check falha > 3x | PagerDuty | 🔴 Crítico |
| High Error Rate | 5xx > 5% em 5 min | Slack + Email | 🔴 Crítico |
| High Latency | p95 > 1s em 5 min | Slack | 🟡 Alto |
| Database Slow | Queries > 500ms frequentes | Slack | 🟡 Alto |
| Queue Backlog | Fila com > 1000 jobs | Slack | 🟡 Alto |
| Disk Space | < 20% disponível | Slack | 🟢 Médio |
| Certificate Expiry | < 30 dias | Email | 🟢 Médio |
| Trust Score Drop | Média < 30 | Slack | 🟢 Médio |
| Suspicious Activity | Login failures > 100/h | Slack + Email | 🔴 Crítico |

## 8. Pós-Mortem Template

```markdown
# Pós-Mortem: [Título do Incidente]

**Data:** YYYY-MM-DD
**Duração:** Xh Ym
**Severidade:** Crítica / Alta / Média / Baixa
**Impacto:** [Descrever usuários afetados, funcionalidades]

## Timeline
- HH:MM - Evento inicial
- HH:MM - Detecção
- HH:MM - Ação tomada
- HH:MM - Resolução

## Causa Raiz
[Descrição detalhada]

## Ações
- [ ] Ação corretiva 1 (responsável, prazo)
- [ ] Ação corretiva 2 (responsável, prazo)

## Lições Aprendidas
1. Lição 1
2. Lição 2
```
