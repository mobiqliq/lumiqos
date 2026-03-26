import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequireRoles } from '@lumiqos/shared/index';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    @UseGuards(JwtAuthGuard, RbacGuard)
    @RequireRoles('principal', 'school_admin', 'school_owner')
    getOverview() {
        return this.dashboardService.getOverview();
    }

    @MessagePattern({ cmd: 'get_dashboard_overview' })
    async getDashboardOverview(@Payload() data: { schoolId: string }) {
        return this.dashboardService.getOverview(data.schoolId);
    }
}
