import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { CurriculumCalendarService } from './curriculum-calendar.service';
import { RegulatoryFramework } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';

@Controller('curriculum-calendar')
export class CurriculumCalendarController {
  constructor(private readonly service: CurriculumCalendarService) {}

  @Post('generate')
  generate(
    @Body() dto: {
      academic_year_id: string;
      class_id: string;
      subject_id: string;
      regulatory_framework?: RegulatoryFramework;
      timezone?: string;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.generateCalendar(dto, userId);
  }

  @Get()
  getCalendar(
    @Query('academic_year_id') academicYearId: string,
    @Query('class_id') classId: string,
    @Query('subject_id') subjectId: string,
  ) {
    return this.service.getCalendar(academicYearId, classId, subjectId);
  }

  @Patch(':id/publish')
  publish(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return this.service.publishCalendar(id, userId);
  }

  @Post('entries/:id/mark-taught')
  markTaught(
    @Param('id') id: string,
    @Body() dto: { notes?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.markTaught(id, dto, userId);
  }

  @Post(':id/rebalance')
  rebalance(
    @Param('id') calendarId: string,
    @Body('lost_dates') lostDates: string[],
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.rebalance(calendarId, lostDates, userId);
  }

  @Post(':id/rebalance/apply')
  applyRebalance(
    @Param('id') calendarId: string,
    @Body() dto: {
      scenario: 'compress' | 'extend' | 'drop';
      lost_dates: string[];
      proposed_dates?: string[];
      drop_entry_ids?: string[];
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.applyRebalanceScenario(calendarId, dto, userId);
  }

  @Get('coverage')
  getCoverage(
    @Query('academic_year_id') academicYearId: string,
    @Query('class_id') classId: string,
    @Query('subject_id') subjectId: string,
  ) {
    return this.service.getCoverage(academicYearId, classId, subjectId);
  }
}
