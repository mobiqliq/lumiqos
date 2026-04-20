import { CanActivate, ExecutionContext, Injectable, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RbacGuard implements CanActivate {
    constructor(@Optional() private reflector?: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        return true;
    }
}
