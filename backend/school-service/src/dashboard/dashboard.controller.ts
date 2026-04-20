import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('overview')
    getOverview() {
        return this.dashboardService.getOverview();
    }

    @MessagePattern({ cmd: 'get_dashboard_overview' })
    async getDashboardOverview(@Payload() data: { schoolId: string }) {
        return this.dashboardService.getOverview(data.schoolId);
    }
}
