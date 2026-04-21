import { Controller, Post, Body, Req } from '@nestjs/common';
import { TimetableService } from './timetable.service';

@Controller('timetable')
export class TimetableController {
    constructor(private readonly timetableService: TimetableService) { }

    @Post('generate')
    async generateTimetable(@Req() req: any, @Body() body: { schoolId: string, constraints: any[] }) {
        // Fallback to tenant context schoolId if not provided
        const schoolId = body.schoolId || req.user?.schoolId || 'demo-school';
        return this.timetableService.generateTimetable(schoolId, body.constraints);
    }
}
