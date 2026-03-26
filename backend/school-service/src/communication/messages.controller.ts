import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequirePermissions } from '@lumiqos/shared/index';
import { CurrentUser } from '@lumiqos/shared/index';

@Controller('messages')
@UseGuards(JwtAuthGuard, RbacGuard)
export class MessagesController {
    constructor(private readonly communicationService: CommunicationService) { }

    @Post('thread')
    @RequirePermissions('messages:write')
    createThread(
        @Body() dto: { student_id: string; teacher_id: string },
        @CurrentUser() user: any
    ) {
        return this.communicationService.createThread(dto.student_id, dto.teacher_id, user);
    }

    @Post('send')
    @RequirePermissions('messages:write')
    sendMessage(
        @Body() dto: { thread_id: string; message_text: string },
        @CurrentUser() user: any
    ) {
        return this.communicationService.sendMessage(dto.thread_id, dto.message_text, user);
    }

    @Get('thread/:thread_id')
    @RequirePermissions('messages:read')
    getThreadMessages(
        @Param('thread_id') threadId: string,
        @CurrentUser() user: any
    ) {
        return this.communicationService.getThreadMessages(threadId, user);
    }
}
