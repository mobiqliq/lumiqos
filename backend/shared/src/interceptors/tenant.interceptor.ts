import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Development fallback: use x-school-id header if no user
    let schoolId = user?.schoolId;
    const userId = user?.userId;

    if (!schoolId) {
      const headerSchoolId = request.headers['x-school-id'];
      if (headerSchoolId) {
        schoolId = Array.isArray(headerSchoolId) ? headerSchoolId[0] : headerSchoolId;
      }
    }

    if (schoolId) {
      return new Observable(subscriber => {
        TenantContext.run(
          { schoolId, userId },
          () => {
            next.handle().subscribe(subscriber);
          }
        );
      });
    }

    return next.handle();
  }
}
