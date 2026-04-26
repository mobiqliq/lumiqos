import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  getHello(): string {
    return 'XceliQOS School Service';
  }

  @Get('health/live')
  getLiveness() {
    return {
      service: 'school',
      status: 'ok',
      mode: 'liveness',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health/ready')
  getReadiness() {
    return {
      service: 'school',
      status: 'ok',
      mode: 'readiness',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('health')
  getHealth() {
    return this.getReadiness();
  }
}
