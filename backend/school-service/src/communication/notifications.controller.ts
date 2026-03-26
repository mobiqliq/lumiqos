import { Controller, Post, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { CommunicationService } from './communication.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';
import { RbacGuard } from '@lumiqos/shared/index';
import { RequirePermissions } from '@lumiqos/shared/index';
import { CurrentUser } from '@lumiqos/shared/index';

@Controller('notifications')
@UseGuards(JwtAuthGuard, RbacGuard)
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
