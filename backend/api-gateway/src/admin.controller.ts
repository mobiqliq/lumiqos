import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Controller('admin')
export class AdminController {
    constructor(
        private readonly http: HttpService,
        private readonly config: ConfigService,
    ) {}

    private url(path: string): string {
        const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
        const port = this.config.get('SCHOOL_SERVICE_PORT', 3000);
        return `http://${host}:${port}/admin/${path}`;
    }

    @Get('overview')
    async getOverview() {
        const { data } = await firstValueFrom(this.http.get(this.url('overview')));
        return data;
    }

    @Get('schools')
    async getSchools() {
        const { data } = await firstValueFrom(this.http.get(this.url('schools')));
        return data;
    }

    @Get('analytics/usage')
    async getUsage() {
        const { data } = await firstValueFrom(this.http.get(this.url('analytics/usage')));
        return data;
    }

    @Get('analytics/engagement')
    async getEngagement() {
        const { data } = await firstValueFrom(this.http.get(this.url('analytics/engagement')));
        return data;
    }

    @Get('finance/overview')
    async getFinance() {
        const { data } = await firstValueFrom(this.http.get(this.url('finance/overview')));
        return data;
    }

    @Get('system/health')
    async getHealth() {
        const { data } = await firstValueFrom(this.http.get(this.url('system/health')));
        return data;
    }
}
