import { Controller, Get, Post, Body, Param, Req, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Request } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('finance')
export class FinanceController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get('SCHOOL_SERVICE_HOST', 'school-service');
    const port = this.configService.get('SCHOOL_SERVICE_PORT', '3000');
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Get('overview')
  async getFinanceOverview(@Req() req: Request) {
    return this.proxyGet('/finance/overview', req);
  }

  private async proxyGet(path: string, req: Request) {
    try {
      const headers = {
        'x-school-id': req.headers['x-school-id'] || '',
        'authorization': req.headers['authorization'] || '',
      };
      const response = await firstValueFrom(
        this.httpService.get(`${this.schoolServiceUrl}${path}`, { headers })
      );
      return response.data;
    } catch (error) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data || error.message;
      throw new HttpException(message, status);
    }
  }
}
