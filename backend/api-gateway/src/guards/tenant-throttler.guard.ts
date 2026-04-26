import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request } from 'express';

@Injectable()
export class TenantThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    const request = req as Request & { user?: { school_id?: string } };

    const schoolIdFromUser = request.user?.school_id;
    const schoolIdFromHeader = request.headers['x-school-id'];

    if (typeof schoolIdFromUser === 'string' && schoolIdFromUser.trim().length > 0) {
      return `tenant:${schoolIdFromUser}`;
    }

    if (typeof schoolIdFromHeader === 'string' && schoolIdFromHeader.trim().length > 0) {
      return `tenant:${schoolIdFromHeader}`;
    }

    if (Array.isArray(schoolIdFromHeader) && schoolIdFromHeader.length > 0) {
      return `tenant:${schoolIdFromHeader[0]}`;
    }

    const ips = request.ips?.filter(Boolean);
    if (ips && ips.length > 0) {
      return `ip:${ips[0]}`;
    }

    return `ip:${request.ip}`;
  }

  protected generateKey(context: ExecutionContext, tracker: string, throttlerName: string): string {
    const handlerName = context.getHandler().name;
    const controllerName = context.getClass().name;

    return `${throttlerName}:${controllerName}:${handlerName}:${tracker}`;
  }
}
