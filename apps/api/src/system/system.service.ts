import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { execSync } from 'child_process';
import Redis from 'ioredis';

@Injectable()
export class SystemService {
  private startTime = Date.now();

  constructor(private prisma: PrismaService) {}

  async health() {
    const db = await this.checkDatabase();
    const redis = await this.checkRedis();
    const storage = await this.checkStorage();
    const allOk = db.status === 'ok' && redis.status === 'ok';

    return {
      status: allOk ? 'healthy' : 'degraded',
      version: process.env.npm_package_version || '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      environment: process.env.NODE_ENV || 'development',
      checks: { database: db, redis, storage },
    };
  }

  async status() {
    const health = await this.health();
    const memory = process.memoryUsage();
    const cpu = process.cpuUsage();

    return {
      ...health,
      resources: {
        memory: {
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024) + 'MB',
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024) + 'MB',
          rss: Math.round(memory.rss / 1024 / 1024) + 'MB',
          external: Math.round(memory.external / 1024 / 1024) + 'MB',
        },
        cpu: {
          user: Math.round(cpu.user / 1000) + 'ms',
          system: Math.round(cpu.system / 1000) + 'ms',
        },
        uptime: Math.floor(process.uptime()) + 's',
        startTime: new Date(this.startTime).toISOString(),
      },
    };
  }

  version() {
    return {
      version: process.env.npm_package_version || '0.1.0',
      name: '@axemap/api',
      node: process.version,
      pnpm: this.exec('pnpm --version'),
      prisma: this.exec('npx prisma --version | head -1'),
      docker: this.exec('docker --version'),
      dockerCompose: this.exec('docker compose version'),
      os: process.platform + ' ' + process.arch,
      commit: this.exec('git log --oneline -1'),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  async readiness() {
    const db = await this.checkDatabase();
    return {
      status: db.status === 'ok' ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      database: db.status,
    };
  }

  liveness() {
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memoryUsage: process.memoryUsage().heapUsed,
    };
  }

  async metrics() {
    const mem = process.memoryUsage();
    const cpu = process.cpuUsage();
    const db = await this.measureDbLatency();
    const redis = await this.measureRedisLatency();

    return {
      memory: {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        rss: mem.rss,
        external: mem.external,
        heapUsedPercent: Math.round((mem.heapUsed / mem.heapTotal) * 100),
      },
      cpu: {
        user: cpu.user,
        system: cpu.system,
      },
      latency: {
        database: db,
        redis,
      },
      uptime: process.uptime(),
      pid: process.pid,
      timestamp: new Date().toISOString(),
    };
  }

  private async checkDatabase() {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', latency: `${Date.now() - start}ms` };
    } catch (e: any) {
      return { status: 'error', latency: `${Date.now() - start}ms`, message: e.message };
    }
  }

  private async checkRedis() {
    try {
      if (!process.env.REDIS_HOST) return { status: 'not_configured' };
      const start = Date.now();
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
      return { status: result === 'PONG' ? 'ok' : 'error', latency: `${Date.now() - start}ms` };
    } catch (e: any) {
      return { status: 'error', message: e.message };
    }
  }

  private async checkStorage(): Promise<{ status: string }> {
    try {
      const endpoints = [process.env.STORAGE_ENDPOINT || 'http://localhost:9000'];
      const res = await fetch(`${endpoints[0]}/minio/health/live`);
      return { status: res.ok ? 'ok' : 'error' };
    } catch {
      return { status: 'not_available' };
    }
  }

  private async measureDbLatency(): Promise<{ min: string; max: string; avg: string }> {
    const samples: number[] = [];
    for (let i = 0; i < 3; i++) {
      const start = Date.now();
      try {
        await this.prisma.$queryRaw`SELECT 1`;
        samples.push(Date.now() - start);
      } catch {}
    }
    if (samples.length === 0) return { min: '0ms', max: '0ms', avg: '0ms' };
    return {
      min: `${Math.min(...samples)}ms`,
      max: `${Math.max(...samples)}ms`,
      avg: `${Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)}ms`,
    };
  }

  private async measureRedisLatency(): Promise<{ min: string; max: string; avg: string }> {
    const samples: number[] = [];
    try {
      for (let i = 0; i < 3; i++) {
        const start = Date.now();
        const client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
          lazyConnect: true,
          maxRetriesPerRequest: 0,
          retryStrategy: () => null,
        });
        await client.connect();
        await client.ping();
        await client.quit();
        samples.push(Date.now() - start);
      }
    } catch {}
    if (samples.length === 0) return { min: '0ms', max: '0ms', avg: '0ms' };
    return {
      min: `${Math.min(...samples)}ms`,
      max: `${Math.max(...samples)}ms`,
      avg: `${Math.round(samples.reduce((a, b) => a + b, 0) / samples.length)}ms`,
    };
  }

  private exec(cmd: string): string {
    try {
      return execSync(cmd, { encoding: 'utf8', stdio: 'pipe', timeout: 5000 }).trim().split('\n')[0];
    } catch {
      return 'not_found';
    }
  }
}
