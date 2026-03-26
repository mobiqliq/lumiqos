export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
export declare const RequirePermissions: (...permissions: string[]) => import("@nestjs/common").CustomDecorator<string>;
export declare const RequireRoles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
