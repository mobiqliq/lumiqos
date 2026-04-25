import { Controller, Get } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Controller('health')
export class HealthController {
    constructor(private readonly httpService: HttpService) { }

    @Get()
    getHealth() {
        return {
            status: 'ok',
            service: 'api-gateway',
            timestamp: new Date().toISOString(),
        };
    }

    @Get('services')
    async getServicesHealth() {
        const services = [
            { name: 'auth', url: `http://${process.env.AUTH_SERVICE_HOST || 'auth-service'}:${process.env.AUTH_SERVICE_PORT || 3002}/auth/health` },
            { name: 'school', url: `http://${process.env.SCHOOL_SERVICE_HOST || 'school-service'}:${process.env.SCHOOL_SERVICE_PORT || 3000}/api/health` },
            { name: 'billing', url: `http://${process.env.BILLING_SERVICE_HOST || '127.0.0.1'}:3006/health` },
        ];

        const results: { [key: string]: string } = {
            gateway: 'up',
            auth: 'down',
            school: 'down',
            billing: 'down',
        };

        await Promise.all(
            services.map(async (service) => {
                try {
                    const response: any = await lastValueFrom(this.httpService.get(service.url, { timeout: 2000 }));
                    if (response.status === 200) {
                        results[service.name] = 'up';
                    }
                } catch (error) {
                    results[service.name] = 'down';
                }
            }),
        );

        return results;
    }
}
