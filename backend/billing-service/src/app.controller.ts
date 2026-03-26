import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get('health')
    getHealth(): { service: string; status: string } {
        return {
            service: 'billing',
            status: 'ok',
        };
    }
}
