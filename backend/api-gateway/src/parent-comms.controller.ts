import { Controller, Get, Post, Patch, Param, Body, Headers, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Controller('parent-comms')
export class ParentCommsController {
  private readonly schoolServiceUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const host = this.config.get('SCHOOL_SERVICE_HOST', 'school-service');
    const port = this.config.get('SCHOOL_SERVICE_PORT', '3000');
    this.schoolServiceUrl = `http://${host}:${port}`;
  }

  @Post('threads')
  async createThread(@Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/parent-comms/threads`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('threads')
  async listThreads(@Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/parent-comms/threads`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('threads/:id')
  async getThread(@Param('id') id: string, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/parent-comms/threads/${id}`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Post('threads/:id/messages')
  async sendMessage(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/parent-comms/threads/${id}/messages`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Patch('threads/:id/status')
  async updateStatus(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.patch(`${this.schoolServiceUrl}/parent-comms/threads/${id}/status`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Post('broadcasts')
  async createBroadcast(@Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/parent-comms/broadcasts`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('broadcasts')
  async listBroadcasts(@Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/parent-comms/broadcasts`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Post('broadcasts/:id/read')
  async markRead(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${this.schoolServiceUrl}/parent-comms/broadcasts/${id}/read`, body, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  @Get('broadcasts/:id/receipts')
  async getReceipts(@Param('id') id: string, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${this.schoolServiceUrl}/parent-comms/broadcasts/${id}/receipts`, { headers: this.fwd(headers) })
    );
    return res.json(r.data);
  }

  private fwd(headers: any) {
    return {
      'x-school-id': headers['x-school-id'],
      'x-user-id': headers['x-user-id'],
      'x-user-role': headers['x-user-role'],
      'content-type': 'application/json',
    };
  }
}
