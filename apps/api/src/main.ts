import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { PinoLoggerService } from './common/logger/pino-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const logger = app.get(PinoLoggerService);
  app.useLogger(logger);

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
