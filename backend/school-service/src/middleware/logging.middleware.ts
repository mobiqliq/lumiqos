import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const schoolId = (req as any).school_id || req.headers['x-school-id'] || 'unknown';
    const startTime = Date.now();

    console.log(`➡️ ${method} ${originalUrl} | school=${schoolId} | ${ip}`);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      console.log(`⬅️ ${method} ${originalUrl} | ${res.statusCode} | ${duration}ms`);
    });

    next();
  }
}
