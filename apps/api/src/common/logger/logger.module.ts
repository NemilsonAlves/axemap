import { Module, Global } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PinoLoggerService } from './pino-logger.service';
import { LoggingInterceptor } from '../interceptors/logging.interceptor';
import { MetricsInterceptor } from '../interceptors/metrics.interceptor';

@Global()
@Module({
  providers: [
    PinoLoggerService,
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
  exports: [PinoLoggerService],
})
export class LoggerModule {}
