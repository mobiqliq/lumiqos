import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @Get('overview')
    getOverview() {
        return this.adminService.getOverview();
    }

    @Get('schools')
    getSchools() {
        return this.adminService.getSchools();
    }

    @Get('analytics/usage')
    getUsage() {
        return this.adminService.getUsageAnalytics();
    }

    @Get('analytics/engagement')
    getEngagement() {
        return this.adminService.getEngagementAnalytics();
    }

    @Get('finance/overview')
    getFinance() {
        return this.adminService.getFinanceOverview();
    }

    @Get('system/health')
    getHealth() {
        return this.adminService.getSystemHealth();
    }
}
