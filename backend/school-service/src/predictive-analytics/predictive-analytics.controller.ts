import { Controller, Get, Post, Param, Body, Headers, Query } from '@nestjs/common';
import { PredictiveAnalyticsService } from './predictive-analytics.service';
import { PredictionType, RiskLevel } from '@xceliqos/shared/src/entities/predictive-alert.entity';

@Controller('predictive-analytics')
export class PredictiveAnalyticsController {
  constructor(private readonly service: PredictiveAnalyticsService) {}

  @Post('run/dropout-risk')
  runDropout(
    @Body('academic_year_id') academicYearId: string,
    @Body('class_id') classId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.runDropoutRisk(academicYearId, classId, userId);
  }

  @Post('run/assessment-failure')
  runAssessmentFailure(
    @Body('academic_year_id') academicYearId: string,
    @Body('class_id') classId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.runAssessmentFailure(academicYearId, classId, userId);
  }

  @Post('run/fee-default')
  runFeeDefault(
    @Body('academic_year_id') academicYearId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.runFeeDefault(academicYearId, userId);
  }

  @Post('run/curriculum-shortfall')
  runCurriculumShortfall(
    @Body('academic_year_id') academicYearId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.runCurriculumShortfall(academicYearId, userId);
  }

  @Post('run/all')
  runAll(
    @Body('academic_year_id') academicYearId: string,
    @Body('class_id') classId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.runAll(academicYearId, classId, userId);
  }

  @Get('alerts')
  getAlerts(
    @Query('prediction_type') prediction_type?: PredictionType,
    @Query('risk_level') risk_level?: RiskLevel,
    @Query('subject_id') subject_id?: string,
    @Query('academic_year_id') academic_year_id?: string,
    @Query('unacknowledged_only') unacknowledged_only?: string,
  ) {
    return this.service.getAlerts({
      prediction_type,
      risk_level,
      subject_id,
      academic_year_id,
      unacknowledged_only: unacknowledged_only === 'true',
    });
  }

  @Post('alerts/:id/acknowledge')
  acknowledge(
    @Param('id') id: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.acknowledgeAlert(id, userId);
  }
}
