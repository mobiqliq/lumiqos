import { HttpService } from '@nestjs/axios';
export declare class HealthController {
    private readonly httpService;
    constructor(httpService: HttpService);
    getHealth(): {
        status: string;
        service: string;
        timestamp: string;
    };
    getServicesHealth(): Promise<{
        [key: string]: string;
    }>;
}
