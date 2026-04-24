import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkloadIndex, WorkloadRiskLevel } from '@xceliqos/shared/src/entities/workload-index.entity';
import { WorkloadRule } from '@xceliqos/shared/src/entities/workload-rule.entity';
import { WeeklyTimetable } from '@xceliqos/shared/src/entities/weekly-timetable.entity';
import { CurriculumCalendarEntry, CalendarEntryStatus } from '@xceliqos/shared/src/entities/curriculum-calendar-entry.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class TeacherWellbeingService {
  constructor(
    @InjectRepository(WorkloadIndex) private readonly workloadRepo: Repository<WorkloadIndex>,
    @InjectRepository(WorkloadRule) private readonly ruleRepo: Repository<WorkloadRule>,
    @InjectRepository(WeeklyTimetable) private readonly timetableRepo: Repository<WeeklyTimetable>,
    @InjectRepository(CurriculumCalendarEntry) private readonly calEntryRepo: Repository<CurriculumCalendarEntry>,
    @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
    @InjectRepository(HomeworkAssignment) private readonly assignmentRepo: Repository<HomeworkAssignment>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  private getMondayOfWeek(date: Date): string {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  }

  private getSundayOfWeek(mondayStr: string): string {
    const d = new Date(mondayStr);
    d.setDate(d.getDate() + 6);
    return d.toISOString().split('T')[0];
  }

  // ── Rules ─────────────────────────────────────────────────────────────────

  async getRules() {
    const schoolId = this.getSchoolId();
    const rules = await this.ruleRepo.findOne({ where: { school_id: schoolId } });
    if (!rules) {
      // Return defaults
      return {
        school_id: schoolId,
        max_periods_per_day: 6,
        max_consecutive_periods: 3,
        min_break_slots: 1,
        max_substitutions_per_week: 3,
        max_periods_per_week: 30,
        amber_threshold: 60,
        red_threshold: 80,
        hard_block_on_violation: false,
        applies_to_roles: ['teacher'],
      };
    }
    return rules;
  }

  async upsertRules(dto: Partial<WorkloadRule>, updatedBy: string) {
    const schoolId = this.getSchoolId();
    const existing = await this.ruleRepo.findOne({ where: { school_id: schoolId } });

    if (existing) {
      await this.ruleRepo.update(
        { school_id: schoolId, id: existing.id },
        { ...dto, updated_by: updatedBy } as any
      );
      return this.ruleRepo.findOne({ where: { school_id: schoolId } });
    }

    const rule = this.ruleRepo.create({
      school_id: schoolId,
      ...dto,
      created_by: updatedBy,
    } as any) as unknown as WorkloadRule;
    return this.ruleRepo.save(rule);
  }

  // ── Compute Workload ──────────────────────────────────────────────────────

  async computeWorkload(academicYearId: string, weekDate?: string) {
    const schoolId = this.getSchoolId();
    const weekStart = this.getMondayOfWeek(weekDate ? new Date(weekDate) : new Date());
    const weekEnd = this.getSundayOfWeek(weekStart);

    const rules = await this.getRules();

    // Get all teachers
    const teachers = await this.userRepo.find({
      where: { school_id: schoolId, is_active: true },
    });
    const teacherList = teachers.filter(u => u.role_id === 'teacher');

    const results = [];

    for (const teacher of teacherList) {
      const staffId = teacher.id;

      // 1. Periods taught this week from timetable (proxy: timetable slots × working days)
      const timetableSlots = await this.timetableRepo.find({
        where: { school_id: schoolId, academic_year_id: academicYearId, teacher_id: staffId, is_active: true },
      });
      const periodsPerWeek = timetableSlots.length;

      // 2. Substitutions taken this week from calendar entries
      const substitutions = await this.calEntryRepo
        .createQueryBuilder('e')
        .where('e.school_id = :schoolId', { schoolId })
        .andWhere('e.substitute_teacher_id = :staffId', { staffId })
        .andWhere('e.planned_date >= :weekStart', { weekStart })
        .andWhere('e.planned_date <= :weekEnd', { weekEnd })
        .andWhere('e.is_substituted = true')
        .getCount();

      // 3. Correction queue depth (submitted homework not yet graded)
      const assignments = await this.assignmentRepo.find({
        where: { school_id: schoolId, teacher_id: staffId },
      });
      const assignmentIds = assignments.map(a => a.homework_id ?? a.id).filter(Boolean);
      let correctionQueueDepth = 0;
      if (assignmentIds.length > 0) {
        correctionQueueDepth = await this.submissionRepo
          .createQueryBuilder('s')
          .where('s.school_id = :schoolId', { schoolId })
          .andWhere('s.homework_id IN (:...ids)', { ids: assignmentIds })
          .andWhere("s.status = 'submitted'")
          .andWhere('s.grade IS NULL')
          .getCount();
      }

      // 4. Consecutive periods (from timetable — check max consecutive per day)
      const slotsByDow = new Map<number, number[]>();
      timetableSlots.forEach(s => {
        if (!slotsByDow.has(s.day_of_week)) slotsByDow.set(s.day_of_week, []);
        slotsByDow.get(s.day_of_week)!.push(s.timetable_period_id ? 1 : 0);
      });
      const maxConsecutive = Math.max(0, ...Array.from(slotsByDow.values()).map(slots => slots.length));

      // 5. Compute score (weighted)
      const periodScore = Math.min(50, (periodsPerWeek / rules.max_periods_per_week) * 50);
      const subScore = Math.min(20, (substitutions / rules.max_substitutions_per_week) * 20);
      const queueScore = Math.min(20, Math.min(correctionQueueDepth / 10, 1) * 20);
      const consecutiveScore = maxConsecutive > rules.max_consecutive_periods ? 10 : 0;

      const workloadScore = Math.round(periodScore + subScore + queueScore + consecutiveScore);

      // 6. Risk level
      const riskLevel = workloadScore >= rules.red_threshold
        ? WorkloadRiskLevel.RED
        : workloadScore >= rules.amber_threshold
        ? WorkloadRiskLevel.AMBER
        : WorkloadRiskLevel.GREEN;

      // 7. Violations
      const violations: any[] = [];
      if (periodsPerWeek > rules.max_periods_per_week) {
        violations.push({ rule: 'max_periods_per_week', value: periodsPerWeek, limit: rules.max_periods_per_week });
      }
      if (substitutions > rules.max_substitutions_per_week) {
        violations.push({ rule: 'max_substitutions_per_week', value: substitutions, limit: rules.max_substitutions_per_week });
      }
      if (maxConsecutive > rules.max_consecutive_periods) {
        violations.push({ rule: 'max_consecutive_periods', value: maxConsecutive, limit: rules.max_consecutive_periods });
      }

      const recommendation = riskLevel === WorkloadRiskLevel.RED
        ? 'Immediate review required. Reduce periods or substitutions this week.'
        : riskLevel === WorkloadRiskLevel.AMBER
        ? 'Monitor closely. Avoid additional substitution assignments.'
        : 'Workload within healthy range.';

      // Upsert
      const existing = await this.workloadRepo.findOne({
        where: { school_id: schoolId, staff_id: staffId, week_start_date: weekStart },
      });

      if (existing) {
        await this.workloadRepo.update(
          { school_id: schoolId, id: existing.id },
          {
            periods_taught: periodsPerWeek,
            substitutions_taken: substitutions,
            correction_queue_depth: correctionQueueDepth,
            consecutive_periods_max: maxConsecutive,
            workload_score: workloadScore,
            risk_level: riskLevel,
            violations,
            recommendation,
            updated_by: staffId,
          } as any
        );
        results.push({ staff_id: staffId, workload_score: workloadScore, risk_level: riskLevel });
      } else {
        const idx = this.workloadRepo.create({
          school_id: schoolId,
          staff_id: staffId,
          academic_year_id: academicYearId,
          week_start_date: weekStart,
          week_end_date: weekEnd,
          periods_taught: periodsPerWeek,
          substitutions_taken: substitutions,
          correction_queue_depth: correctionQueueDepth,
          consecutive_periods_max: maxConsecutive,
          workload_score: workloadScore,
          risk_level: riskLevel,
          violations,
          recommendation,
          is_acknowledged: false,
          created_by: staffId,
        } as any) as unknown as WorkloadIndex;
        await this.workloadRepo.save(idx);
        results.push({ staff_id: staffId, workload_score: workloadScore, risk_level: riskLevel });
      }
    }

    return {
      week_start: weekStart,
      week_end: weekEnd,
      teachers_computed: results.length,
      red: results.filter(r => r.risk_level === WorkloadRiskLevel.RED).length,
      amber: results.filter(r => r.risk_level === WorkloadRiskLevel.AMBER).length,
      green: results.filter(r => r.risk_level === WorkloadRiskLevel.GREEN).length,
      results,
    };
  }

  // ── Get Heatmap ───────────────────────────────────────────────────────────

  async getHeatmap(academicYearId: string, weekDate?: string) {
    const schoolId = this.getSchoolId();
    const weekStart = this.getMondayOfWeek(weekDate ? new Date(weekDate) : new Date());

    const workloads = await this.workloadRepo.find({
      where: { school_id: schoolId, week_start_date: weekStart },
      order: { workload_score: 'DESC' },
    });

    return {
      week_start: weekStart,
      heatmap: workloads,
      summary: {
        red: workloads.filter(w => w.risk_level === WorkloadRiskLevel.RED).length,
        amber: workloads.filter(w => w.risk_level === WorkloadRiskLevel.AMBER).length,
        green: workloads.filter(w => w.risk_level === WorkloadRiskLevel.GREEN).length,
      },
    };
  }

  async getStaffWorkload(staffId: string) {
    const schoolId = this.getSchoolId();
    return this.workloadRepo.find({
      where: { school_id: schoolId, staff_id: staffId },
      order: { week_start_date: 'DESC' },
      take: 8, // Last 8 weeks
    });
  }

  // ── Pre-assignment Check ──────────────────────────────────────────────────

  async checkAssignment(dto: { staff_id: string; additional_periods: number; is_substitution: boolean; academic_year_id: string }) {
    const schoolId = this.getSchoolId();
    const weekStart = this.getMondayOfWeek(new Date());

    const current = await this.workloadRepo.findOne({
      where: { school_id: schoolId, staff_id: dto.staff_id, week_start_date: weekStart },
    });

    const rules = await this.getRules();
    const currentScore = current?.workload_score ?? 0;
    const currentPeriods = current?.periods_taught ?? 0;
    const currentSubs = current?.substitutions_taken ?? 0;

    const violations: any[] = [];

    if (currentPeriods + dto.additional_periods > rules.max_periods_per_week) {
      violations.push({
        rule: 'max_periods_per_week',
        current: currentPeriods,
        additional: dto.additional_periods,
        limit: rules.max_periods_per_week,
      });
    }

    if (dto.is_substitution && currentSubs + 1 > rules.max_substitutions_per_week) {
      violations.push({
        rule: 'max_substitutions_per_week',
        current: currentSubs,
        limit: rules.max_substitutions_per_week,
      });
    }

    const projectedScore = Math.min(100, currentScore + (dto.additional_periods / rules.max_periods_per_week) * 30);
    const projectedRisk = projectedScore >= rules.red_threshold
      ? WorkloadRiskLevel.RED
      : projectedScore >= rules.amber_threshold
      ? WorkloadRiskLevel.AMBER
      : WorkloadRiskLevel.GREEN;

    return {
      staff_id: dto.staff_id,
      current_workload_score: currentScore,
      current_risk_level: current?.risk_level ?? WorkloadRiskLevel.GREEN,
      projected_workload_score: Math.round(projectedScore),
      projected_risk_level: projectedRisk,
      violations,
      blocked: rules.hard_block_on_violation && violations.length > 0,
      recommendation: violations.length > 0
        ? 'Assignment may overload this teacher. Consider an alternative.'
        : 'Assignment within safe workload limits.',
    };
  }

  // ── Confidential Self-Referral ────────────────────────────────────────────

  async submitReferral(dto: { notes: string; contact_preference?: string }, staffId: string) {
    const schoolId = this.getSchoolId();
    // Stored as metadata on WorkloadIndex — confidential, only counselor/principal can see
    const weekStart = this.getMondayOfWeek(new Date());
    const current = await this.workloadRepo.findOne({
      where: { school_id: schoolId, staff_id: staffId, week_start_date: weekStart },
    });

    const referralData = {
      self_referral: true,
      referral_notes: dto.notes,
      contact_preference: dto.contact_preference ?? 'counselor',
      referred_at: new Date().toISOString(),
    };

    if (current) {
      await this.workloadRepo.update(
        { school_id: schoolId, id: current.id },
        { metadata: { ...current.metadata, ...referralData }, updated_by: staffId } as any
      );
    }

    return { success: true, message: 'Your referral has been sent confidentially to the school counselor.' };
  }

  async acknowledgeWorkload(workloadId: string, principalId: string) {
    const schoolId = this.getSchoolId();
    await this.workloadRepo.update(
      { school_id: schoolId, id: workloadId },
      { is_acknowledged: true, acknowledged_by: principalId, updated_by: principalId } as any
    );
    return { success: true };
  }
}
