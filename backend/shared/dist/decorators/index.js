"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequireRoles = exports.RequirePermissions = exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user || null;
});
const RequirePermissions = (...permissions) => (0, common_2.SetMetadata)('permissions', permissions);
exports.RequirePermissions = RequirePermissions;
const RequireRoles = (...roles) => (0, common_2.SetMetadata)('roles', roles);
exports.RequireRoles = RequireRoles;
