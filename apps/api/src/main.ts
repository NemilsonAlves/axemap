import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { PinoLoggerService } from './common/logger/pino-logger.service';

const isDev = process.env.NODE_ENV !== 'production';

// ─── Fail-fast de configuração em produção ─────────────────────────────────
// Se um segredo obrigatório estiver ausente (ou usar valor placeholder), a
// aplicação deve falhar explicitamente no boot — nunca rodar com fallback
// inseguro. Em desenvolvimento, fallbacks locais continuam válidos.
const REQUIRED_SECRETS = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
const WEAK_VALUES = [
  'change-this',
  'change-this-in-production',
  'placeholder',
  'development-secret',
  'axemap_minio_dev',
];

function assertProductionConfig() {
  if (isDev) return;

  const missing = REQUIRED_SECRETS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `[config] Segredos obrigatórios ausentes em produção: ${missing.join(', ')}`,
    );
  }

  for (const key of REQUIRED_SECRETS) {
    const value = process.env[key]!.toLowerCase();
    if (WEAK_VALUES.some((w) => value.includes(w))) {
      throw new Error(
        `[config] ${key} usa um valor inseguro em produção (placeholder detectado).`,
      );
    }
  }

  const requiredUrls = ['APP_URL', 'FRONTEND_URL'];
  const missingUrls = requiredUrls.filter((key) => !process.env[key]);
  if (missingUrls.length > 0) {
    throw new Error(
      `[config] URLs obrigatórias ausentes em produção: ${missingUrls.join(', ')}`,
    );
  }
}

assertProductionConfig();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  // Shutdown gracioso: SIGTERM/SIGINT disparam os lifecycle hooks
  // (fecha HTTP server, encerra Prisma/Redis — onModuleDestroy).
  app.enableShutdownHooks();

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);

  app.use(helmet({
    // CSP da API (JSON API — não serve HTML, mas headers de segurança são aplicados)
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"],
        formAction: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    // Headers explícitos de segurança
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' },
    // HSTS: somente em produção (HTTPS). Em dev evita warnings no HTTP localhost.
    strictTransportSecurity: isDev ? false : {
      maxAge: 31536000,
      includeSubDomains: true,
    },
  }));

  app.setGlobalPrefix('api/v1', { exclude: ['/'] });

  const frontendUrls = (process.env.FRONTEND_URL || 'http://localhost:3000')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const isLocal = !origin
        || origin.startsWith('http://localhost')
        || origin.startsWith('http://127.0.0.1');
      if (isLocal || frontendUrls.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`API rodando em http://localhost:${port}`);
}

bootstrap();
