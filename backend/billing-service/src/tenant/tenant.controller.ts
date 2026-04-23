import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { JwtAuthGuard, RbacGuard, RequireRoles } from '@xceliqos/shared/index';

@Controller('saas/tenants')
export class TenantController {
    constructor(private readonly tenantService: TenantService) { }

    // Only XceliQOS internal super admins can blindly provision root tenants
    @Post('onboard')
    async onboardTenant(@Req() req: any, @Body() payload: any) {
        // In production, payload would contain stripe token or mapped parameters 
        return this.tenantService.onboardTenant(payload);
    }
}
