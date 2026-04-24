import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComplianceIndicator } from '@xceliqos/shared/src/entities/compliance-indicator.entity';
import { ComplianceRecord, ComplianceStatus } from '@xceliqos/shared/src/entities/compliance-record.entity';
import { CurriculumCalendar } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { TenantContext } from '@xceliqos/shared/index';

// NEP 2020 default indicators — seeded for Indian schools
// Framework-agnostic: same structure works for Ofsted, CBSE, IB etc.
export const NEP_INDICATORS = [
  // Domain: Curriculum
  { domain: 'Curriculum', code: 'NEP_CURR_01', name: 'Mother tongue/regional language instruction in foundational stage', mandatory: true, data_source: 'manual' },
  { domain: 'Curriculum', code: 'NEP_CURR_02', name: 'Coding and computational thinking from Grade 6', mandatory: false, data_source: 'curriculum' },
  { domain: 'Curriculum', code: 'NEP_CURR_03', name: 'Vocational education integrated from Grade 6', mandatory: false, data_source: 'manual' },
  { domain: 'Curriculum', code: 'NEP_CURR_04', name: 'Art education integrated across all subjects', mandatory: false, data_source: 'manual' },
  { domain: 'Curriculum', code: 'NEP_CURR_05', name: 'Physical education as core subject all grades', mandatory: true, data_source: 'curriculum' },
  { domain: 'Curriculum', code: 'NEP_CURR_06', name: 'Bagless days implemented (minimum 10 per year)', mandatory: false, data_source: 'manual' },
  // Domain: Assessment
  { domain: 'Assessment', code: 'NEP_ASMT_01', name: 'Competency-based assessment (not rote)', mandatory: true, data_source: 'manual' },
  { domain: 'Assessment', code: 'NEP_ASMT_02', name: 'Formative assessment used regularly', mandatory: true, data_source: 'exam' },
  { domain: 'Assessment', code: 'NEP_ASMT_03', name: 'Student portfolio maintained', mandatory: false, data_source: 'manual' },
  { domain: 'Assessment', code: 'NEP_ASMT_04', name: 'No high-stakes exam before Grade 5', mandatory: true, data_source: 'manual' },
  { domain: 'Assessment', code: 'NEP_ASMT_05', name: 'Board exams offered twice per year (Grade 10/12)', mandatory: false, data_source: 'manual' },
  // Domain: Pedagogy
  { domain: 'Pedagogy', code: 'NEP_PED_01', name: 'Experiential and inquiry-based learning implemented', mandatory: false, data_source: 'manual' },
  { domain: 'Pedagogy', code: 'NEP_PED_02', name: 'Play-based learning in Foundational Stage', mandatory: true, data_source: 'manual' },
  { domain: 'Pedagogy', code: 'NEP_PED_03', name: 'Multilingual approach used in classroom', mandatory: false, data_source: 'manual' },
  // Domain: Teacher Development
  { domain: 'Teacher Development', code: 'NEP_TD_01', name: 'Teachers complete 50 hours CPD per year', mandatory: true, data_source: 'hr' },
  { domain: 'Teacher Development', code: 'NEP_TD_02', name: 'Teacher performance appraisal system in place', mandatory: true, data_source: 'hr' },
  { domain: 'Teacher Development', code: 'NEP_TD_03', name: 'Subject-specialist teachers in middle/secondary stage', mandatory: false, data_source: 'hr' },
  // Domain: Inclusion
  { domain: 'Inclusion', code: 'NEP_INC_01', name: 'RTE 25% reservation tracked and reported', mandatory: true, data_source: 'manual' },
  { domain: 'Inclusion', code: 'NEP_INC_02', name: 'Students with special needs have IEP/support plan', mandatory: true, data_source: 'manual' },
  { domain: 'Inclusion', code: 'NEP_INC_03', name: 'Gender-neutral facilities and policies', mandatory: true, data_source: 'manual' },
  { domain: 'Inclusion', code: 'NEP_INC_04', name: 'Socio-economically disadvantaged students supported', mandatory: false, data_source: 'manual' },
  // Domain: Infrastructure
  { domain: 'Infrastructure', code: 'NEP_INF_01', name: 'Safe drinking water available', mandatory: true, data_source: 'manual' },
  { domain: 'Infrastructure', code: 'NEP_INF_02', name: 'Functional toilets (separate for boys/girls)', mandatory: true, data_source: 'manual' },
  { domain: 'Infrastructure', code: 'NEP_INF_03', name: 'Library with adequate books', mandatory: true, data_source: 'manual' },
  { domain: 'Infrastructure', code: 'NEP_INF_04', name: 'Digital infrastructure (computers/tablets) available', mandatory: false, data_source: 'manual' },
  { domain: 'Infrastructure', code: 'NEP_INF_05', name: 'Barrier-free access for differently-abled', mandatory: true, data_source: 'manual' },
  // Domain: Governance
  { domain: 'Governance', code: 'NEP_GOV_01', name: 'School Management Committee (SMC) active', mandatory: true, data_source: 'manual' },
  { domain: 'Governance', code: 'NEP_GOV_02', name: 'Annual school development plan prepared', mandatory: true, data_source: 'manual' },
  { domain: 'Governance', code: 'NEP_GOV_03', name: 'Financial accounts audited annually', mandatory: true, data_source: 'finance' },
  { domain: 'Governance', code: 'NEP_GOV_04', name: 'Grievance redressal mechanism in place', mandatory: false, data_source: 'manual' },
  // Domain: Wellbeing
  { domain: 'Wellbeing', code: 'NEP_WB_01', name: 'School counselor available', mandatory: false, data_source: 'hr' },
  { domain: 'Wellbeing', code: 'NEP_WB_02', name: 'Anti-bullying policy implemented and communicated', mandatory: true, data_source: 'manual' },
  { domain: 'Wellbeing', code: 'NEP_WB_03', name: 'Student wellbeing monitoring system active', mandatory: false, data_source: 'manual' },
  { domain: 'Wellbeing', code: 'NEP_WB_04', name: 'Mental health awareness program conducted', mandatory: false, data_source: 'manual' },
  // Domain: Community
  { domain: 'Community', code: 'NEP_COM_01', name: 'Parent engagement activities held regularly', mandatory: false, data_source: 'manual' },
  { domain: 'Community', code: 'NEP_COM_02', name: 'Local community/alumni involvement', mandatory: false, data_source: 'manual' },
];

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(ComplianceIndicator) private readonly indicatorRepo: Repository<ComplianceIndicator>,
    @InjectRepository(ComplianceRecord) private readonly recordRepo: Repository<ComplianceRecord>,
    @InjectRepository(CurriculumCalendar) private readonly calendarRepo: Repository<CurriculumCalendar>,
    @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Seed NEP Indicators (operator action) ─────────────────────────────────

  async seedNEPIndicators(createdBy: string) {
    const schoolId = this.getSchoolId();
    let seeded = 0;

    for (let i = 0; i < NEP_INDICATORS.length; i++) {
      const ind = NEP_INDICATORS[i];
      const existing = await this.indicatorRepo.findOne({
        where: { school_id: schoolId, framework_id: 'NEP', indicator_code: ind.code },
      });
      if (existing) continue;

      const indicator = this.indicatorRepo.create({
        school_id: schoolId,
        framework_id: 'NEP',
        domain: ind.domain,
        indicator_code: ind.code,
        indicator_name: ind.name,
        measurement_type: 'boolean',
        target_value: 1,
        weight: 1.0,
        is_mandatory: ind.mandatory,
        data_source: ind.data_source,
        is_active: true,
        sort_order: i,
        created_by: createdBy,
      } as any) as unknown as ComplianceIndicator;

      await this.indicatorRepo.save(indicator);
      seeded++;
    }

    return { seeded, total: NEP_INDICATORS.length, framework: 'NEP' };
  }

  async getIndicators(frameworkId: string) {
    const schoolId = this.getSchoolId();
    return this.indicatorRepo.find({
      where: { school_id: schoolId, framework_id: frameworkId, is_active: true },
      order: { domain: 'ASC', sort_order: 'ASC' },
    });
  }

  // ── Assess Compliance ─────────────────────────────────────────────────────

  async assess(academicYearId: string, frameworkId: string, assessedBy: string) {
    const schoolId = this.getSchoolId();

    const indicators = await this.indicatorRepo.find({
      where: { school_id: schoolId, framework_id: frameworkId, is_active: true },
    });

    if (indicators.length === 0) {
      return { message: `No indicators found for framework ${frameworkId}. Run seed first.`, assessed: 0 };
    }

    // Auto-assess data-driven indicators
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });

    // Curriculum coverage check
    const calendars = await this.calendarRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    });
    const avgCoverage = calendars.length > 0
      ? calendars.reduce((s, c) => s + (c.total_taught_periods / Math.max(c.total_planned_periods, 1)), 0) / calendars.length
      : 0;

    // Attendance check
    const attendances = await this.attendanceRepo.find({
      where: { school_id: schoolId },
      take: 1000,
    });
    const avgAttendance = attendances.length > 0
      ? attendances.filter(a => a.status === 'present').length / attendances.length
      : null;

    const results = [];

    for (const indicator of indicators) {
      const existing = await this.recordRepo.findOne({
        where: { school_id: schoolId, academic_year_id: academicYearId, indicator_id: indicator.id },
      });

      let status = ComplianceStatus.NOT_ASSESSED;
      let currentValue: number | null = null;
      let evidence = '';
      let correctiveAction = '';

      // Auto-assess where data_source is not manual
      if (indicator.data_source === 'curriculum' && avgCoverage > 0) {
        currentValue = Math.round(avgCoverage * 100);
        status = avgCoverage >= 0.8 ? ComplianceStatus.MET : avgCoverage >= 0.6 ? ComplianceStatus.PARTIAL : ComplianceStatus.NOT_MET;
        evidence = `Curriculum coverage: ${currentValue}%`;
        if (status !== ComplianceStatus.MET) {
          correctiveAction = 'Review curriculum calendar and rebalance remaining periods.';
        }
      }

      // Keep existing manual assessments
      if (existing?.is_manually_overridden) {
        results.push(existing);
        continue;
      }

      if (existing) {
        await this.recordRepo.update(
          { school_id: schoolId, id: existing.id },
          {
            status: status !== ComplianceStatus.NOT_ASSESSED ? status : existing.status,
            current_value: currentValue ?? existing.current_value,
            evidence: evidence || existing.evidence,
            corrective_action: correctiveAction || existing.corrective_action,
            assessed_at: new Date(),
            assessed_by: assessedBy,
            updated_by: assessedBy,
          } as any
        );
        results.push({ indicator_code: indicator.indicator_code, status, auto_assessed: status !== ComplianceStatus.NOT_ASSESSED });
      } else {
        const record = this.recordRepo.create({
          school_id: schoolId,
          academic_year_id: academicYearId,
          indicator_id: indicator.id,
          framework_id: frameworkId,
          domain: indicator.domain,
          indicator_code: indicator.indicator_code,
          status,
          current_value: currentValue,
          target_value: indicator.target_value,
          evidence,
          corrective_action: correctiveAction,
          is_manually_overridden: false,
          assessed_at: new Date(),
          assessed_by: assessedBy,
          created_by: assessedBy,
        } as any) as unknown as ComplianceRecord;
        await this.recordRepo.save(record);
        results.push({ indicator_code: indicator.indicator_code, status, auto_assessed: status !== ComplianceStatus.NOT_ASSESSED });
      }
    }

    return { academic_year_id: academicYearId, framework_id: frameworkId, assessed: results.length, results };
  }

  // ── Update Manual Assessment ──────────────────────────────────────────────

  async updateRecord(recordId: string, dto: {
    status: ComplianceStatus;
    current_value?: number;
    evidence?: string;
    corrective_action?: string;
    is_manually_overridden?: boolean;
    override_justification?: string;
  }, userId: string) {
    const schoolId = this.getSchoolId();
    await this.recordRepo.update(
      { school_id: schoolId, id: recordId },
      {
        ...dto,
        assessed_at: new Date(),
        assessed_by: userId,
        overridden_by: dto.is_manually_overridden ? userId : undefined,
        updated_by: userId,
      } as any
    );
    return { success: true };
  }

  // ── Compliance Report ─────────────────────────────────────────────────────

  async getReport(academicYearId: string, frameworkId: string) {
    const schoolId = this.getSchoolId();

    const records = await this.recordRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId, framework_id: frameworkId },
      order: { domain: 'ASC', indicator_code: 'ASC' },
    });

    const indicators = await this.indicatorRepo.find({
      where: { school_id: schoolId, framework_id: frameworkId, is_active: true },
    });

    const met = records.filter(r => r.status === ComplianceStatus.MET).length;
    const partial = records.filter(r => r.status === ComplianceStatus.PARTIAL).length;
    const notMet = records.filter(r => r.status === ComplianceStatus.NOT_MET).length;
    const notAssessed = records.filter(r => r.status === ComplianceStatus.NOT_ASSESSED).length;
    const mandatory = indicators.filter(i => i.is_mandatory);
    const mandatoryMet = mandatory.filter(m =>
      records.find(r => r.indicator_id === m.id && r.status === ComplianceStatus.MET)
    ).length;

    // Group by domain
    const byDomain = new Map<string, any>();
    records.forEach(r => {
      if (!byDomain.has(r.domain)) byDomain.set(r.domain, { domain: r.domain, met: 0, partial: 0, not_met: 0, not_assessed: 0, records: [] });
      const d = byDomain.get(r.domain)!;
      d[r.status === ComplianceStatus.MET ? 'met' : r.status === ComplianceStatus.PARTIAL ? 'partial' : r.status === ComplianceStatus.NOT_MET ? 'not_met' : 'not_assessed']++;
      d.records.push(r);
    });

    const score = records.length > 0 ? Math.round((met / records.length) * 100) : 0;
    const mandatoryScore = mandatory.length > 0 ? Math.round((mandatoryMet / mandatory.length) * 100) : 0;

    return {
      framework_id: frameworkId,
      academic_year_id: academicYearId,
      generated_at: new Date(),
      summary: {
        total_indicators: indicators.length,
        assessed: records.length,
        met,
        partial,
        not_met: notMet,
        not_assessed: notAssessed,
        compliance_score: score,
        mandatory_compliance_score: mandatoryScore,
        is_fully_compliant: notMet === 0 && notAssessed === 0,
        mandatory_fully_met: mandatoryMet === mandatory.length,
      },
      by_domain: Array.from(byDomain.values()),
      corrective_actions: records
        .filter(r => r.corrective_action && r.status !== ComplianceStatus.MET)
        .map(r => ({ indicator_code: r.indicator_code, domain: r.domain, action: r.corrective_action, status: r.status })),
    };
  }

  async exportReport(academicYearId: string, frameworkId: string, format: string) {
    const report = await this.getReport(academicYearId, frameworkId);

    if (format === 'json') {
      return { format: 'json', data: report };
    }

    if (format === 'csv') {
      const lines = ['Domain,Indicator Code,Indicator,Status,Current Value,Evidence,Corrective Action'];
      report.by_domain.forEach((d: any) => {
        d.records.forEach((r: any) => {
          lines.push([
            r.domain, r.indicator_code, '', r.status,
            r.current_value ?? '', r.evidence ?? '', r.corrective_action ?? ''
          ].map(v => `"${v}"`).join(','));
        });
      });
      return { format: 'csv', data: lines.join('\n') };
    }

    // PDF and Excel deferred — return structured data for frontend rendering
    return { format, data: report, note: 'PDF/Excel generation requires frontend rendering layer' };
  }
}
