import { Controller, Get, Post, Patch, Param, Body, Headers, Query } from '@nestjs/common';
import { ComplianceService } from './compliance.service';
import { ComplianceStatus } from '@xceliqos/shared/src/entities/compliance-record.entity';

@Controller('compliance')
export class ComplianceController {
  constructor(private readonly service: ComplianceService) {}

  @Post('seed/nep')
  seedNEP(@Headers('x-user-id') userId: string) {
    return this.service.seedNEPIndicators(userId);
  }

  @Get('indicators')
  getIndicators(@Query('framework_id') frameworkId: string) {
    return this.service.getIndicators(frameworkId);
  }

  @Post('assess')
  assess(
    @Body('academic_year_id') academicYearId: string,
    @Body('framework_id') frameworkId: string,
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.assess(academicYearId, frameworkId, userId);
  }

  @Patch('records/:id')
  updateRecord(
    @Param('id') id: string,
    @Body() dto: {
      status: ComplianceStatus;
      current_value?: number;
      evidence?: string;
      corrective_action?: string;
      is_manually_overridden?: boolean;
      override_justification?: string;
    },
    @Headers('x-user-id') userId: string,
  ) {
    return this.service.updateRecord(id, dto, userId);
  }

  @Get('report')
  getReport(
    @Query('academic_year_id') academicYearId: string,
    @Query('framework_id') frameworkId: string,
  ) {
    return this.service.getReport(academicYearId, frameworkId);
  }

  @Get('report/export')
  exportReport(
    @Query('academic_year_id') academicYearId: string,
    @Query('framework_id') frameworkId: string,
    @Query('format') format: string,
  ) {
    return this.service.exportReport(academicYearId, frameworkId, format ?? 'json');
  }
}
