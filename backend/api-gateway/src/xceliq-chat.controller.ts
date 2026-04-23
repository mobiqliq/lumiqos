import { Controller, Get, Post, Patch, Param, Body, Headers, Query, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import type { Response } from 'express';
import { firstValueFrom } from 'rxjs';

const SCHOOL_SERVICE = 'http://school-service:3000';

@Controller('chat')
export class XceliQChatController {
  constructor(private readonly http: HttpService) {}

  @Get('channels')
  async listChannels(@Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${SCHOOL_SERVICE}/chat/channels`, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels')
  async createChannel(@Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Get('channels/:id/members')
  async listMembers(@Param('id') id: string, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.get(`${SCHOOL_SERVICE}/chat/channels/${id}/members`, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels/:id/members')
  async addMember(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels/${id}/members`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Patch('channels/:id/members/:userId/status')
  async updateMemberStatus(@Param('id') id: string, @Param('userId') userId: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.patch(`${SCHOOL_SERVICE}/chat/channels/${id}/members/${userId}/status`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Get('channels/:id/messages')
  async getMessages(@Param('id') id: string, @Query() query: any, @Headers() headers: any, @Res() res: Response) {
    const params = new URLSearchParams(query).toString();
    const r = await firstValueFrom(
      this.http.get(`${SCHOOL_SERVICE}/chat/channels/${id}/messages?${params}`, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels/:id/messages')
  async sendMessage(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels/${id}/messages`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels/:id/polls')
  async createPoll(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels/${id}/polls`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels/:id/polls/:messageId/vote')
  async castVote(@Param('id') id: string, @Param('messageId') messageId: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels/${id}/polls/${messageId}/vote`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels/:id/acknowledge')
  async acknowledge(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels/${id}/acknowledge`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  @Post('channels/:id/read')
  async markRead(@Param('id') id: string, @Body() body: any, @Headers() headers: any, @Res() res: Response) {
    const r = await firstValueFrom(
      this.http.post(`${SCHOOL_SERVICE}/chat/channels/${id}/read`, body, { headers: this.forward(headers) })
    );
    return res.json(r.data);
  }

  private forward(headers: any) {
    return {
      'x-school-id': headers['x-school-id'],
      'x-user-id': headers['x-user-id'],
      'content-type': 'application/json',
    };
  }
}
