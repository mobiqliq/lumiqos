import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CORRELATION_ID_HEADER } from '@xceliqos/shared/src/logger/correlation.middleware';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const schoolId = (req as any).school_id || req.headers['x-school-id'] || 'unknown';
    const correlationId = req.headers[CORRELATION_ID_HEADER] || '-';
    const startTime = Date.now();

    this.logger.log(
      `→ ${method} ${originalUrl} | school=${schoolId} | cid=${correlationId} | ${ip}`,
    );

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'log';
      this.logger[level](
        `← ${method} ${originalUrl} | ${res.statusCode} | ${duration}ms | cid=${correlationId}`,
      );
    });

    next();
  }
}
