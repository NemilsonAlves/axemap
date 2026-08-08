import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    const db = await this.checkDatabase();
    const redis = await this.checkRedis();
    return {
      status: db === 'ok' && redis === 'ok' ? 'ok' : 'degraded',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: db },
        redis: { status: redis },
      },
    };
  }

  @Get('db')
  async checkDb() {
    const status = await this.checkDatabase();
    return {
      status,
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@'),
    };
  }

  @Get('redis')
  async checkRedisEndpoint() {
    const status = await this.checkRedis();
    return {
      status,
      timestamp: new Date().toISOString(),
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    };
  }

  @Get('storage')
  async checkStorage() {
    return {
      status: 'not_implemented',
      timestamp: new Date().toISOString(),
      message: 'Storage health check will be implemented when R2 is configured',
    };
  }

  @Get('full')
  async checkFull() {
    const db = await this.checkDatabase();
    const redis = await this.checkRedis();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    const allOk = db === 'ok' && redis === 'ok';

    return {
      status: allOk ? 'ok' : 'degraded',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime,
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: db, latency: await this.measureLatency('db') },
        redis: { status: redis },
      },
      resources: {
        memory: {
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
          rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
        },
        uptime: Math.floor(uptime) + 's',
      },
    };
  }

  private async checkDatabase(): Promise<'ok' | 'error'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<'ok' | 'error' | 'not_configured'> {
    try {
      if (!process.env.REDIS_HOST) return 'not_configured';
      const client = new Redis({
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT || '6379'),
        lazyConnect: true,
        maxRetriesPerRequest: 0,
        retryStrategy: () => null,
      });
      await client.connect();
      const result = await client.ping();
      await client.quit();
      return result === 'PONG' ? 'ok' : 'error';
    } catch {
      return 'error';
    }
  }

  private async measureLatency(target: 'db' | 'redis'): Promise<string> {
    const start = Date.now();
    if (target === 'db') {
      try { await this.prisma.$queryRaw`SELECT 1`; } catch {}
    }
    return `${Date.now() - start}ms`;
  }
}
