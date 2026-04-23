import { Controller, Get, Post, Param, Body, Req } from '@nestjs/common';
import { StudentIdentityService } from './student-identity.service';
import type { Request } from 'express';

@Controller('students')
export class StudentIdentityController {
    constructor(private readonly studentIdentityService: StudentIdentityService) {}

    @Get(':id/passport')
    getPassport(@Param('id') id: string, @Req() req: Request) {
        const school_id = req.headers['x-school-id'] as string;
        return this.studentIdentityService.getPassport(school_id, id);
    }

    @Post(':id/transfer')
    initiateTransfer(
        @Param('id') id: string,
        @Req() req: Request,
        @Body() body: { to_school_id: string; initiated_by: string },
    ) {
        const school_id = req.headers['x-school-id'] as string;
        return this.studentIdentityService.initiateTransfer(school_id, id, body.to_school_id, body.initiated_by);
    }
}
