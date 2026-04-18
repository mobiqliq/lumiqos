import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext } from '../context/tenant.context';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (user) {
      return new Observable(subscriber => {
        TenantContext.run(
          { schoolId: user.schoolId, userId: user.userId },
          () => {
            next.handle().subscribe(subscriber);
          }
        );
      });
    }

    return next.handle();
  }
}
