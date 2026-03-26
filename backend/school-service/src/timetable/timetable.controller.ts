import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { JwtAuthGuard } from '@lumiqos/shared/index';

@Controller('timetable')
@UseGuards(JwtAuthGuard)
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @Post('generate')
    async generateTimetable(@Req() req: any, @Body() body: { schoolId: string, constraints: any[] }) {
        // Fallback to tenant context schoolId if not provided
        const schoolId = body.schoolId || req.user?.schoolId || 'demo-school';
        return this.timetableService.generateTimetable(schoolId, body.constraints);
    }
}
