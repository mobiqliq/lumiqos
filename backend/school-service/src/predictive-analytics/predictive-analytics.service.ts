import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PredictiveAlert, PredictionType, RiskLevel } from '@xceliqos/shared/src/entities/predictive-alert.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { FeeInvoice } from '@xceliqos/shared/src/entities/fee-invoice.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { CurriculumCalendar } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class PredictiveAnalyticsService {
  constructor(
    @InjectRepository(PredictiveAlert) private readonly alertRepo: Repository<PredictiveAlert>,
    @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
    @InjectRepository(StudentMarks) private readonly marksRepo: Repository<StudentMarks>,
    @InjectRepository(FeeInvoice) private readonly invoiceRepo: Repository<FeeInvoice>,
    @InjectRepository(FeePayment) private readonly paymentRepo: Repository<FeePayment>,
    @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(CurriculumCalendar) private readonly calendarRepo: Repository<CurriculumCalendar>,
    @InjectRepository(ForgettingCurve) private readonly curveRepo: Repository<ForgettingCurve>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  private riskLevel(score: number): RiskLevel {
    if (score >= 80) return RiskLevel.CRITICAL;
    if (score >= 60) return RiskLevel.HIGH;
    if (score >= 40) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private async upsertAlert(schoolId: string, dto: Omit<PredictiveAlert, keyof import('@xceliqos/shared/src/entities/base.entity').XceliQosBaseEntity | 'is_acknowledged' | 'acknowledged_by' | 'acknowledged_at'>, createdBy: string) {
    const existing = await this.alertRepo.findOne({
      where: {
        school_id: schoolId,
        prediction_type: dto.prediction_type,
        subject_id: dto.subject_id,
        academic_year_id: dto.academic_year_id,
      },
    });

    if (existing) {
      await this.alertRepo.update(
        { school_id: schoolId, id: existing.id },
        {
          risk_level: dto.risk_level,
          risk_score: dto.risk_score,
          factors: dto.factors,
          recommendation: dto.recommendation,
          route_to: dto.route_to,
          computed_at: new Date(),
          previous_risk_level: existing.risk_level,
          previous_risk_score: existing.risk_score,
          updated_by: createdBy,
        } as any
      );
      return { ...existing, ...dto };
    }

    const alert = this.alertRepo.create({
      school_id: schoolId,
      ...dto,
      is_acknowledged: false,
      computed_at: new Date(),
      created_by: createdBy,
    } as any) as unknown as PredictiveAlert;

    return this.alertRepo.save(alert);
  }

  // ── 1. Dropout Risk ───────────────────────────────────────────────────────
  // Signals: attendance rate + assessment performance + engagement (retrieval)

  async runDropoutRisk(academicYearId: string, classId: string, createdBy: string) {
    const schoolId = this.getSchoolId();

    const enrollments = await this.enrollmentRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId },
    });

    const results = [];

    for (const enrollment of enrollments) {
      const studentId = enrollment.student_id;

      // Attendance rate
      const attendances = await this.attendanceRepo.find({
        where: { school_id: schoolId, student_id: studentId },
      });
      const total = attendances.length;
      const present = attendances.filter(a => a.status === 'present').length;
      const attendanceRate = total > 0 ? present / total : 1;

      // Assessment performance
      const marks = await this.marksRepo.find({
        where: { school_id: schoolId, student_id: studentId },
      });
      const avgScore = marks.length > 0
        ? marks.reduce((s, m) => s + (m.marks_obtained ?? 0), 0) / marks.length
        : null;

      // Retrieval engagement (forgetting curve at-risk topics)
      const curves = await this.curveRepo.find({
        where: { school_id: schoolId, student_id: studentId, is_at_risk: true },
      });
      const atRiskTopics = curves.length;

      // Composite risk score (weighted)
      const attendanceScore = (1 - attendanceRate) * 40; // 40% weight
      const performanceScore = avgScore !== null ? Math.max(0, (50 - avgScore) / 50) * 35 : 20; // 35% weight
      const engagementScore = Math.min(atRiskTopics * 5, 25); // 25% weight, cap at 25

      const riskScore = Math.min(100, attendanceScore + performanceScore + engagementScore);

      const factors = [
        { factor: 'attendance_rate', value: Math.round(attendanceRate * 100), weight: 0.4, contribution: attendanceRate < 0.75 ? 'high' : attendanceRate < 0.85 ? 'medium' : 'low' },
        { factor: 'avg_assessment_score', value: avgScore !== null ? Math.round(avgScore) : 'no data', weight: 0.35, contribution: avgScore !== null && avgScore < 40 ? 'high' : 'low' },
        { factor: 'at_risk_topics', value: atRiskTopics, weight: 0.25, contribution: atRiskTopics > 3 ? 'high' : 'low' },
      ];

      const level = this.riskLevel(riskScore);
      const recommendation = level === RiskLevel.CRITICAL || level === RiskLevel.HIGH
        ? 'Immediate counselor outreach recommended. Schedule parent meeting.'
        : level === RiskLevel.MEDIUM
        ? 'Monitor attendance closely. Teacher check-in this week.'
        : 'No immediate action required. Continue monitoring.';

      results.push(await this.upsertAlert(schoolId, {
        academic_year_id: academicYearId,
        prediction_type: PredictionType.DROPOUT_RISK,
        subject_id: studentId,
        subject_type: 'student',
        risk_level: level,
        risk_score: Math.round(riskScore),
        factors,
        recommendation,
        route_to: level === RiskLevel.CRITICAL ? 'counselor' : 'teacher',
        previous_risk_level: undefined as any,
        previous_risk_score: undefined as any,
      } as any, createdBy));
    }

    return { prediction_type: PredictionType.DROPOUT_RISK, analysed: results.length, results };
  }

  // ── 2. Assessment Failure ─────────────────────────────────────────────────
  // Signals: prerequisite mastery gaps from forgetting curve

  async runAssessmentFailure(academicYearId: string, classId: string, createdBy: string) {
    const schoolId = this.getSchoolId();

    const enrollments = await this.enrollmentRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId },
    });

    const results = [];

    for (const enrollment of enrollments) {
      const studentId = enrollment.student_id;

      const curves = await this.curveRepo.find({
        where: { school_id: schoolId, student_id: studentId },
      });

      if (curves.length === 0) continue;

      const lowRetention = curves.filter(c => c.retrievability < 0.5);
      const criticalRetention = curves.filter(c => c.retrievability < 0.3);

      const riskScore = Math.min(100,
        (lowRetention.length / curves.length) * 60 +
        (criticalRetention.length / curves.length) * 40
      );

      const factors = [
        { factor: 'topics_low_retention', value: lowRetention.length, total: curves.length, threshold: 0.5 },
        { factor: 'topics_critical_retention', value: criticalRetention.length, total: curves.length, threshold: 0.3 },
        { factor: 'avg_retrievability', value: Math.round((curves.reduce((s, c) => s + c.retrievability, 0) / curves.length) * 100) },
      ];

      const level = this.riskLevel(riskScore);
      results.push(await this.upsertAlert(schoolId, {
        academic_year_id: academicYearId,
        prediction_type: PredictionType.ASSESSMENT_FAILURE,
        subject_id: studentId,
        subject_type: 'student',
        risk_level: level,
        risk_score: Math.round(riskScore),
        factors,
        recommendation: level === RiskLevel.HIGH || level === RiskLevel.CRITICAL
          ? 'Schedule targeted revision sessions. XceliQRevise tasks overdue.'
          : 'Encourage completion of scheduled retrieval tasks.',
        route_to: 'teacher',
        previous_risk_level: undefined as any,
        previous_risk_score: undefined as any,
      } as any, createdBy));
    }

    return { prediction_type: PredictionType.ASSESSMENT_FAILURE, analysed: results.length, results };
  }

  // ── 3. Fee Default ────────────────────────────────────────────────────────
  // Signals: overdue invoices + payment history pattern

  async runFeeDefault(academicYearId: string, createdBy: string) {
    const schoolId = this.getSchoolId();

    const invoices = await this.invoiceRepo.find({
      where: { school_id: schoolId },
    });

    const studentInvoiceMap = new Map<string, typeof invoices>();
    invoices.forEach(inv => {
      const sid = inv.student_id;
      if (!studentInvoiceMap.has(sid)) studentInvoiceMap.set(sid, []);
      studentInvoiceMap.get(sid)!.push(inv);
    });

    const results = [];

    for (const [studentId, studentInvoices] of studentInvoiceMap) {
      const overdue = studentInvoices.filter(inv => {
        const due = inv.due_date ? new Date(inv.due_date) : null;
        return due && due < new Date() && inv.status !== 'paid';
      });

      const totalDue = studentInvoices.reduce((s, i) => s + (Number(i.amount) ?? 0), 0);
      const totalOverdue = overdue.reduce((s, i) => s + (Number(i.amount) ?? 0), 0);

      const overdueRatio = totalDue > 0 ? totalOverdue / totalDue : 0;
      const overdueCount = overdue.length;

      const riskScore = Math.min(100, overdueRatio * 60 + Math.min(overdueCount * 10, 40));

      const factors = [
        { factor: 'overdue_invoices', value: overdueCount, total: studentInvoices.length },
        { factor: 'overdue_amount_ratio', value: Math.round(overdueRatio * 100) },
        { factor: 'total_overdue_amount', value: Math.round(totalOverdue) },
      ];

      const level = this.riskLevel(riskScore);
      if (level === RiskLevel.LOW) continue; // Only surface medium+ fee risks

      results.push(await this.upsertAlert(schoolId, {
        academic_year_id: academicYearId,
        prediction_type: PredictionType.FEE_DEFAULT,
        subject_id: studentId,
        subject_type: 'student',
        risk_level: level,
        risk_score: Math.round(riskScore),
        factors,
        recommendation: level === RiskLevel.CRITICAL
          ? 'Immediate finance team follow-up. Consider payment plan.'
          : 'Send fee reminder. Finance review recommended.',
        route_to: 'finance',
        previous_risk_level: undefined as any,
        previous_risk_score: undefined as any,
      } as any, createdBy));
    }

    return { prediction_type: PredictionType.FEE_DEFAULT, analysed: studentInvoiceMap.size, flagged: results.length, results };
  }

  // ── 4. Curriculum Shortfall ───────────────────────────────────────────────
  // Signals: coverage rate vs remaining days

  async runCurriculumShortfall(academicYearId: string, createdBy: string) {
    const schoolId = this.getSchoolId();

    const calendars = await this.calendarRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId },
    });

    const results = [];

    for (const calendar of calendars) {
      const total = calendar.total_planned_periods;
      const taught = calendar.total_taught_periods;
      const remaining = total - taught;

      if (total === 0) continue;

      const coverageRate = taught / total;
      const today = new Date();

      // Estimate progress expected by now (linear)
      // We do not have year dates here — use coverage as proxy
      // Risk = if coverage < 50% and remaining > 50% of total
      const remainingRatio = remaining / total;
      const riskScore = Math.min(100, (1 - coverageRate) * 50 + remainingRatio * 50);

      const factors = [
        { factor: 'coverage_rate', value: Math.round(coverageRate * 100) },
        { factor: 'taught_periods', value: taught },
        { factor: 'remaining_periods', value: remaining },
        { factor: 'total_periods', value: total },
        { factor: 'regulatory_framework', value: calendar.regulatory_framework },
      ];

      const level = this.riskLevel(riskScore);
      if (level === RiskLevel.LOW) continue;

      results.push(await this.upsertAlert(schoolId, {
        academic_year_id: academicYearId,
        prediction_type: PredictionType.CURRICULUM_SHORTFALL,
        subject_id: calendar.class_id,
        subject_type: 'class',
        risk_level: level,
        risk_score: Math.round(riskScore),
        factors,
        recommendation: level === RiskLevel.CRITICAL
          ? 'Immediate rebalance required. Use curriculum calendar rebalance tool.'
          : 'Review curriculum calendar. Consider compressing remaining chapters.',
        route_to: 'principal',
        previous_risk_level: undefined as any,
        previous_risk_score: undefined as any,
      } as any, createdBy));
    }

    return { prediction_type: PredictionType.CURRICULUM_SHORTFALL, analysed: calendars.length, flagged: results.length, results };
  }

  // ── Get Alerts ────────────────────────────────────────────────────────────

  async getAlerts(filters: {
    prediction_type?: PredictionType;
    risk_level?: RiskLevel;
    subject_id?: string;
    academic_year_id?: string;
    unacknowledged_only?: boolean;
  }) {
    const schoolId = this.getSchoolId();

    const qb = this.alertRepo
      .createQueryBuilder('a')
      .where('a.school_id = :schoolId', { schoolId })
      .andWhere('a.deleted_at IS NULL')
      .orderBy('a.risk_score', 'DESC');

    if (filters.prediction_type) qb.andWhere('a.prediction_type = :pt', { pt: filters.prediction_type });
    if (filters.risk_level) qb.andWhere('a.risk_level = :rl', { rl: filters.risk_level });
    if (filters.subject_id) qb.andWhere('a.subject_id = :sid', { sid: filters.subject_id });
    if (filters.academic_year_id) qb.andWhere('a.academic_year_id = :ayid', { ayid: filters.academic_year_id });
    if (filters.unacknowledged_only) qb.andWhere('a.is_acknowledged = false');

    return qb.getMany();
  }

  async acknowledgeAlert(alertId: string, userId: string) {
    const schoolId = this.getSchoolId();
    await this.alertRepo.update(
      { school_id: schoolId, id: alertId },
      { is_acknowledged: true, acknowledged_by: userId, acknowledged_at: new Date(), updated_by: userId }
    );
    return { success: true };
  }

  async runAll(academicYearId: string, classId: string, createdBy: string) {
    const schoolId = this.getSchoolId();
    const [dropout, assessment, fees, shortfall] = await Promise.all([
      this.runDropoutRisk(academicYearId, classId, createdBy),
      this.runAssessmentFailure(academicYearId, classId, createdBy),
      this.runFeeDefault(academicYearId, createdBy),
      this.runCurriculumShortfall(academicYearId, createdBy),
    ]);

    return {
      academic_year_id: academicYearId,
      class_id: classId,
      computed_at: new Date(),
      dropout_risk: { analysed: dropout.analysed, flagged: dropout.results.length },
      assessment_failure: { analysed: assessment.analysed, flagged: assessment.results.length },
      fee_default: { analysed: fees.analysed, flagged: fees.flagged },
      curriculum_shortfall: { analysed: shortfall.analysed, flagged: shortfall.flagged },
    };
  }
}
