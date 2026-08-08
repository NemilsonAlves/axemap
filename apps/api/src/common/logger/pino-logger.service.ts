import { Injectable, LoggerService } from '@nestjs/common';
import pino from 'pino';

@Injectable()
export class PinoLoggerService implements LoggerService {
  private logger: pino.Logger;

  constructor() {
    this.logger = pino({
      level: process.env.LOG_LEVEL || 'debug',
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { colorize: true } }
          : undefined,
      serializers: {
        req: (req) => ({
          method: req.method,
          url: req.url,
          requestId: req.requestId,
          userId: req.user?.id,
        }),
        err: pino.stdSerializers.err,
        error: pino.stdSerializers.err,
      },
    });
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.info(message, ...optionalParams);
  }

  error(message: any, ...optionalParams: any[]) {
    this.logger.error(message, ...optionalParams);
  }

  warn(message: any, ...optionalParams: any[]) {
    this.logger.warn(message, ...optionalParams);
  }

  debug(message: any, ...optionalParams: any[]) {
    this.logger.debug(message, ...optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]) {
    this.logger.trace(message, ...optionalParams);
  }

  getPino(): pino.Logger {
    return this.logger;
  }
}
