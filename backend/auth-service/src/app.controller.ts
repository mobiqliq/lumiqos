import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() { }

  @Get()
  getHello(): string {
    return 'LumiqOS Auth Service';
  }

  @Get('health')
  getHealth(): { service: string; status: string } {
    return {
      service: 'auth',
      status: 'ok',
    };
  }
}
