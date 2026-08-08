import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface RouteMetric {
  method: string;
  route: string;
  count: number;
  totalLatency: number;
  minLatency: number;
  maxLatency: number;
  errors: number;
}

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  private metrics = new Map<string, RouteMetric>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const route = request.route?.path || request.url;
    const key = `${method}:${route}`;
    const start = Date.now();

    if (!this.metrics.has(key)) {
      this.metrics.set(key, {
        method,
        route,
        count: 0,
        totalLatency: 0,
        minLatency: Infinity,
        maxLatency: 0,
        errors: 0,
      });
    }

    return next.handle().pipe(
      tap({
        next: () => {
          const metric = this.metrics.get(key)!;
          const latency = Date.now() - start;
          metric.count++;
          metric.totalLatency += latency;
          metric.minLatency = Math.min(metric.minLatency, latency);
          metric.maxLatency = Math.max(metric.maxLatency, latency);
        },
        error: () => {
          const metric = this.metrics.get(key)!;
          metric.errors++;
        },
      }),
    );
  }

  getMetrics(): RouteMetric[] {
    return Array.from(this.metrics.values()).map((m) => ({
      ...m,
      avgLatency: m.count > 0 ? Math.round(m.totalLatency / m.count) : 0,
    }));
  }

  reset() {
    this.metrics.clear();
  }
}
