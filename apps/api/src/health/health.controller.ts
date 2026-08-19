import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import Redis from 'ioredis';
import { STORAGE_PROVIDER } from '../common/storage/storage.constants';
import type { StorageProvider } from '@axemap/shared';

@Controller('health')
export class HealthController {
  constructor(
    private prisma: PrismaService,
    @Inject(STORAGE_PROVIDER) private storage: StorageProvider,
  ) {}

  @Get()
  async check() {
    const db = await this.checkDatabase();
    const postgis = await this.checkPostgis();
    const redis = await this.checkRedis();
    return {
      status: db === 'ok' && postgis === 'ok' && redis === 'ok' ? 'ok' : 'degraded',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: { status: db },
        postgis: { status: postgis },
        redis: { status: redis },
      },
    };
  }

  @Get('db')
  async checkDb() {
    const status = await this.checkDatabase();
    const postgis = await this.checkPostgis();
    return {
      status: postgis === 'ok' && status === 'ok' ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL?.replace(/\/\/.*@/, '//***@'),
      postgis: { status: postgis },
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
    const bucket = process.env.STORAGE_BUCKET || 'axemap';
    try {
      const exists = await this.storage.bucketExists(bucket);
      return {
        status: exists ? 'ok' : 'degraded',
        bucket,
        timestamp: new Date().toISOString(),
        message: exists ? 'Storage acessível' : `Bucket "${bucket}" não encontrado`,
      };
    } catch (e: any) {
      return {
        status: 'error',
        bucket,
        timestamp: new Date().toISOString(),
        message: e?.name || 'Falha ao acessar storage',
      };
    }
  }

  @Get('full')
  async checkFull() {
    const db = await this.checkDatabase();
    const postgis = await this.checkPostgis();
    const redis = await this.checkRedis();
    const uptime = process.uptime();
    const memory = process.memoryUsage();

    const allOk = db === 'ok' && postgis === 'ok' && redis === 'ok';

    return {
      status: allOk ? 'ok' : 'degraded',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime,
      environment: process.env.NODE_ENV || 'development',
      checks: {
        database: { status: db, latency: await this.measureLatency('db') },
        postgis: { status: postgis },
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

  private async checkPostgis(): Promise<'ok' | 'error'> {
    try {
      const rows = await this.prisma.$queryRaw<
        Array<{ extversion: string }>
      >`SELECT extversion FROM pg_extension WHERE extname = 'postgis'`;
      return rows.length > 0 ? 'ok' : 'error';
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
      try {
        await this.prisma.$queryRaw`SELECT 1`;
      } catch {}
    }
    return `${Date.now() - start}ms`;
  }
}
