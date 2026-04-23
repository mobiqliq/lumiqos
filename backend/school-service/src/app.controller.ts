import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() { }

  @Get()
  getHello(): string {
    return 'XceliQOS School Service';
  }

  @Get('health')
  getHealth(): { service: string; status: string } {
    return {
      service: 'school',
      status: 'ok',
    };
  }
}
