import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { SetMetadata } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.user || null;
    },
);

export const RequirePermissions = (...permissions: string[]) => SetMetadata('permissions', permissions);
export const RequireRoles = (...roles: string[]) => SetMetadata('roles', roles);
