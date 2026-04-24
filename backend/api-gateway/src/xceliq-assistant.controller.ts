import { Controller, Get, Post, Param, Body, Headers, Query, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('xceliq-assistant')
export class XceliQAssistantController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
    const port = this.config.get('SCHOOL_SERVICE_PORT', '3000');
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  private fwd(headers: any) {
    return {
      'x-school-id': headers['x-school-id'],
      'x-user-id': headers['x-user-id'],
      'content-type': 'application/json',
    };
  }

  @Post('query')
  async query(@Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/xceliq-assistant/query`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Post('interactions/:id/rate')
  async rate(@Param('id') id: string, @Body() body: any, @Headers() h: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/xceliq-assistant/interactions/${id}/rate`, body, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }

  @Get('history')
  async getHistory(@Query() query: any, @Headers() h: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/xceliq-assistant/history?${params}`, { headers: this.fwd(h) })
    );
    return res.json(r.data);
  }
}
