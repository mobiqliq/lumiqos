import { Controller, Get, Post, Param, Body, Headers, Query } from '@nestjs/common';
import { XceliQAssistantService } from './xceliq-assistant.service';
import { AssistantPersona } from '@xceliqos/shared/src/entities/assistant-interaction.entity';

@Controller('xceliq-assistant')
export class XceliQAssistantController {
  constructor(private readonly service: XceliQAssistantService) {}

  @Post('query')
  query(
    @Body() dto: {
      persona: AssistantPersona;
      query: string;
      context?: Record<string, any>;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.query({ ...dto, user_id: userId });
  }

  @Post('interactions/:id/rate')
  rate(
    @Param('id') id: string,
    @Body('rating') rating: number,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.rateInteraction(id, rating, userId);
  }

  @Get('history')
  getHistory(
    @Headers('x-user-id') userId: string,
    @Query('persona') persona?: AssistantPersona,
    @Query('limit') limit?: string,
  ) {
    return this.service.getHistory(userId, persona, limit ? parseInt(limit) : 20);
  }
}
