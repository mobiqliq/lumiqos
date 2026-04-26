import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { promises as fs } from 'fs';
import { connect } from 'net';

@Controller('health')
export class HealthController {
  constructor(private readonly httpService: HttpService) {}

  @SkipThrottle({ default: true, tenant: true })
  @Get('live')
  getLiveness() {
    return {
      status: 'ok',
      service: 'api-gateway',
      mode: 'liveness',
      timestamp: new Date().toISOString(),
    };
  }

  @SkipThrottle({ default: true, tenant: true })
  @Get('ready')
  async getReadiness() {
    const [db, auth, school, ai, disk] = await Promise.all([
      this.checkTcp('db', process.env.DB_HOST || 'xceliqos_db', Number(process.env.DB_PORT || 5432)),
      this.checkHttp('auth', `http://${process.env.AUTH_SERVICE_HOST || 'auth-service'}:${process.env.AUTH_SERVICE_PORT || 3002}/health`),
      this.checkHttp('school', `http://${process.env.SCHOOL_SERVICE_HOST || 'school-service'}:${process.env.SCHOOL_SERVICE_PORT || 3000}/health`),
      this.checkTcp('ai', process.env.AI_SERVICE_HOST || 'ai-service', Number(process.env.AI_SERVICE_PORT || 3005)),
      this.checkDisk(),
    ]);

    const checks = { db, auth, school, ai, disk };
    const status = Object.values(checks).every((c) => c.status === 'up') ? 'ok' : 'degraded';

    return {
      status,
      service: 'api-gateway',
      mode: 'readiness',
      timestamp: new Date().toISOString(),
      checks,
    };
  }

  @SkipThrottle({ default: true, tenant: true })
  @Get()
  async getHealth() {
    return this.getReadiness();
  }

  private async checkHttp(_name: string, url: string) {
    try {
      const response: any = await lastValueFrom(this.httpService.get(url, { timeout: 2000 }));
      return { status: response.status === 200 ? 'up' : 'down' };
    } catch {
      return { status: 'down' };
    }
  }

  private async checkTcp(name: string, host: string, port: number) {
    try {
      await new Promise<void>((resolve, reject) => {
        const socket = connect({ host, port, timeout: 2000 }, () => {
          socket.end();
          resolve();
        });
        socket.on('error', reject);
        socket.on('timeout', () => reject(new Error(`${name} timeout`)));
      });
      return { status: 'up' };
    } catch {
      return { status: 'down' };
    }
  }

  private async checkDisk() {
    try {
      const stats = await fs.statfs('/tmp');
      const freeBytes = stats.bavail * stats.bsize;
      const minFreeBytes = Number(process.env.HEALTH_MIN_DISK_FREE_BYTES || 500 * 1024 * 1024);
      return { status: freeBytes >= minFreeBytes ? 'up' : 'down', freeBytes, minFreeBytes };
    } catch {
      return { status: 'down' };
    }
  }
}
