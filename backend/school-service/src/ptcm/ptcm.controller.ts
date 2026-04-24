import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { PTCMService } from './ptcm.service';
import { PTCMeetingStatus } from '@xceliqos/shared/src/entities/ptc-meeting.entity';
import { CommitmentOwner } from '@xceliqos/shared/src/entities/ptc-meeting-commitment.entity';

@Controller('ptcm')
export class PTCMController {
  constructor(private readonly service: PTCMService) {}

  @Post('meetings')
  schedule(@Body() dto: any, @Headers('x-user-id') userId: string) {
    return this.service.scheduleMeeting(dto, userId);
  }

  @Get('meetings')
  list(
    @Headers('x-user-id') userId: string,
    @Headers('x-user-role') role: string,
    @Query('academic_year_id') academicYearId?: string,
  ) {
    return this.service.listMeetings(userId, role, academicYearId);
  }

  @Get('meetings/:id')
  get(@Param('id') id: string) {
    return this.service.getMeeting(id);
  }

  @Get('meetings/:id/teacher-brief')
  teacherBrief(@Param('id') id: string) {
    return this.service.getTeacherBrief(id);
  }

  @Get('meetings/:id/parent-brief')
  parentBrief(@Param('id') id: string) {
    return this.service.getParentBrief(id);
  }

  @Post('meetings/:id/notes')
  addNote(
    @Param('id') id: string,
    @Body() dto: { text: string; timestamp?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.addNote(id, dto, userId);
  }

  @Post('meetings/:id/commitments')
  addCommitments(
    @Param('id') id: string,
    @Body('commitments') commitments: {
      commitment_text: string;
      owner: CommitmentOwner;
      owner_user_id: string;
      due_date?: string;
    }[],
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.addCommitments(id, commitments, userId);
  }

  @Patch('meetings/:id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: PTCMeetingStatus,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.updateStatus(id, status, userId);
  }

  @Get('commitments')
  getCommitments(@Headers('x-user-id') userId: string) {
    return this.service.getCommitments(userId);
  }

  @Patch('commitments/:id')
  completeCommitment(
    @Param('id') id: string,
    @Body('notes') notes: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.completeCommitment(id, notes, userId);
  }
}
