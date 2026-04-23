import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { XceliQChatService } from './xceliq-chat.service';
import { ChatChannelType } from '@xceliqos/shared/src/entities/chat-channel.entity';
import { ChatMemberStatus } from '@xceliqos/shared/src/entities/chat-member.entity';

@Controller('chat')
export class XceliQChatController {
  constructor(private readonly chatService: XceliQChatService) {}

  // ── Channels ──────────────────────────────────────────────────────────────

  @Get('channels')
  listChannels(@Headers('x-user-id') userId: string) {
    return this.chatService.listChannels(userId);
  }

  @Post('channels')
  createChannel(
    @Body() dto: {
      name: string;
      type: ChatChannelType;
      description?: string;
      class_id?: string;
      subject_id?: string;
      department?: string;
      requires_acknowledgment?: boolean;
      member_user_ids?: string[];
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.chatService.createChannel(dto, userId);
  }

  // ── Members ───────────────────────────────────────────────────────────────

  @Get('channels/:id/members')
  listMembers(@Param('id') channelId: string) {
    return this.chatService.listMembers(channelId);
  }

  @Post('channels/:id/members')
  addMember(
    @Param('id') channelId: string,
    @Body('user_id') targetUserId: string,
    @Headers('x-user-id') addedBy: string,
  ) {
    return this.chatService.addMember(channelId, targetUserId, addedBy);
  }

  @Patch('channels/:id/members/:userId/status')
  updateMemberStatus(
    @Param('id') channelId: string,
    @Param('userId') userId: string,
    @Body('status') status: ChatMemberStatus,
  ) {
    return this.chatService.updateMemberStatus(channelId, userId, status);
  }

  // ── Messages ──────────────────────────────────────────────────────────────

  @Get('channels/:id/messages')
  getMessages(
    @Param('id') channelId: string,
    @Headers('x-user-id') userId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.getMessages(channelId, userId, limit ? parseInt(limit) : 50, before);
  }

  @Post('channels/:id/messages')
  sendMessage(
    @Param('id') channelId: string,
    @Body() dto: {
      content: string;
      parent_message_id?: string;
      attachment_url?: string;
      attachment_name?: string;
      is_ai_response?: boolean;
      poll_id?: string;
    },
    @Headers('x-user-id') senderId: string,
  ) {
    return this.chatService.sendMessage(channelId, dto, senderId);
  }

  // ── Polls ─────────────────────────────────────────────────────────────────

  @Post('channels/:id/polls')
  createPoll(
    @Param('id') channelId: string,
    @Body() dto: { question: string; options: string[] },
    @Headers('x-user-id') userId: string,
  ) {
    return this.chatService.createPoll(channelId, dto, userId);
  }

  @Post('channels/:id/polls/:messageId/vote')
  castVote(
    @Param('messageId') messageId: string,
    @Body('option_id') optionId: number,
    @Headers('x-user-id') userId: string,
  ) {
    return this.chatService.castVote(messageId, optionId, userId);
  }

  // ── Acknowledgment & Read ─────────────────────────────────────────────────

  @Post('channels/:id/acknowledge')
  acknowledge(
    @Param('id') channelId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.chatService.acknowledgeChannel(channelId, userId);
  }

  @Post('channels/:id/read')
  markRead(
    @Param('id') channelId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.chatService.markRead(channelId, userId);
  }
}
