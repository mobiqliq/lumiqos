import { Controller, Post, Get, Put, Body, Param } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { RequirePermissions } from '@xceliqos/shared/index';
import { CurrentUser } from '@xceliqos/shared/index';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly communicationService: CommunicationService) { }

    @Post()
    @RequirePermissions('notifications:write')
    createNotification(
        @Body() dto: { title: string; message: string; type: string; target_class_id?: string; target_section_id?: string },
        @CurrentUser() user: any
    ) {
        return this.communicationService.createNotification(dto, user.userId);
    }

    @Get()
    @RequirePermissions('notifications:read')
    getNotifications(@CurrentUser() user: any) {
        return this.communicationService.getNotifications(user.userId);
    }

    @Put('read')
    @RequirePermissions('notifications:read')
    markNotificationRead(@Body() dto: { notification_id: string }, @CurrentUser() user: any) {
        return this.communicationService.markNotificationRead(dto.notification_id, user.userId);
    }
}
