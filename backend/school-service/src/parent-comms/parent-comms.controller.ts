import { Controller, Get, Post, Patch, Param, Body, Headers } from '@nestjs/common';
import { ParentCommsService } from './parent-comms.service';
import { ParentMessageThreadRecipientType, ParentMessageThreadStatus } from '@xceliqos/shared/src/entities/parent-message-thread.entity';
import { ParentMessageSenderType } from '@xceliqos/shared/src/entities/parent-message.entity';
import { BroadcastAudienceType, BroadcastTriggerType } from '@xceliqos/shared/src/entities/broadcast-announcement.entity';

@Controller('parent-comms')
export class ParentCommsController {
  constructor(private readonly service: ParentCommsService) {}

  // ── Threads ───────────────────────────────────────────────────────────────

  @Post('threads')
  createThread(
    @Body() dto: {
      student_id: string;
      recipient_type: ParentMessageThreadRecipientType;
      assigned_to_user_id?: string;
      subject: string;
      initial_message: string;
      sla_hours?: number;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.createThread(dto, userId);
  }

  @Get('threads')
  listThreads(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
  ) {
    return this.service.listThreads(userId, role);
  }

  @Get('threads/:id')
  getThread(
    @Param('id') threadId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.getThread(threadId, userId);
  }

  @Post('threads/:id/messages')
  sendMessage(
    @Param('id') threadId: string,
    @Body() dto: {
      content: string;
      attachment_url?: string;
      attachment_name?: string;
      sender_type: ParentMessageSenderType;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.sendMessage(threadId, dto, userId, dto.sender_type);
  }

  @Patch('threads/:id/status')
  updateStatus(
    @Param('id') threadId: string,
    @Body() dto: { status: ParentMessageThreadStatus; escalate_to?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.updateThreadStatus(threadId, dto.status, userId, dto.escalate_to);
  }

  // ── Broadcasts ────────────────────────────────────────────────────────────

  @Post('broadcasts')
  createBroadcast(
    @Body() dto: {
      title: string;
      body: string;
      audience_type: BroadcastAudienceType;
      trigger_type?: BroadcastTriggerType;
      target_class_id?: string;
      target_section_id?: string;
      recipient_count?: number;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.createBroadcast(dto, userId);
  }

  @Get('broadcasts')
  listBroadcasts() {
    return this.service.listBroadcasts();
  }

  @Post('broadcasts/:id/read')
  markRead(
    @Param('id') announcementId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.markBroadcastRead(announcementId, userId);
  }

  @Get('broadcasts/:id/receipts')
  getReceipts(@Param('id') announcementId: string) {
    return this.service.getBroadcastReceipts(announcementId);
  }
}
