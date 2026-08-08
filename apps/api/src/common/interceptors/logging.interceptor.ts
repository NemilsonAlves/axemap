import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PinoLoggerService } from '../logger/pino-logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: PinoLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const requestId = crypto.randomUUID();
    const userId = request.user?.id;
    const start = Date.now();

    request.requestId = requestId;

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse();
          const latency = Date.now() - start;
          this.logger.log({
            msg: 'request completed',
            requestId,
            method,
            url,
            status: response.statusCode,
            latency: `${latency}ms`,
            userId,
          });
        },
        error: (error) => {
          const latency = Date.now() - start;
          this.logger.error({
            msg: 'request failed',
            requestId,
            method,
            url,
            latency: `${latency}ms`,
            userId,
            error: error.message,
            stack: error.stack,
          });
        },
      }),
    );
  }
}
