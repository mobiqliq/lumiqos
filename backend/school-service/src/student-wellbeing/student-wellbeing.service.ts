import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WellbeingFlag, WellbeingSignalType, WellbeingTier, WellbeingFlagStatus } from '@xceliqos/shared/src/entities/wellbeing-flag.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { RetrievalTask, RetrievalTaskStatus } from '@xceliqos/shared/src/entities/retrieval-task.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { TenantContext } from '@xceliqos/shared/index';

// Trauma-informed response guides — evidence-based, action-oriented
const TRAUMA_INFORMED_GUIDES: Record<string, any> = {
  attendance_drop: {
    title: 'Attendance Drop Response Guide',
    principle: 'Curiosity before consequences. Assume barriers, not avoidance.',
    immediate_actions: [
      'Warm check-in with student privately — ask open questions, not accusatory ones',
      'Contact parent/guardian with care framing: "We noticed X is missing school and want to support"',
      'Check for peer relationship issues, bullying, or transition stress',
    ],
    avoid: [
      'Do not publicly highlight attendance in class',
      'Do not assume laziness or family neglect without exploration',
      'Do not issue warnings before understanding the cause',
    ],
    escalate_if: 'Attendance drops below 60% or student discloses distress, family crisis, or safety concern',
  },
  mastery_regression: {
    title: 'Academic Regression Response Guide',
    principle: 'Regression is information. Ask what changed, not what is wrong.',
    immediate_actions: [
      'Private conversation: "I noticed your scores changed recently. Is everything okay?"',
      'Check if regression coincides with a life event (family change, health, peer issues)',
      'Offer targeted support without stigma — frame as "catching up" not "falling behind"',
    ],
    avoid: [
      'Do not compare to previous performance publicly',
      'Do not attribute regression to effort without exploration',
      'Do not add academic pressure before addressing root cause',
    ],
    escalate_if: 'Regression persists > 3 weeks or student shows signs of withdrawal or emotional distress',
  },
  engagement_drop: {
    title: 'Disengagement Response Guide',
    principle: 'Disengagement is a symptom, not a character flaw.',
    immediate_actions: [
      'Observe whether disengagement is subject-specific or general',
      'Check for sensory, learning, or neurodiversity factors that may affect engagement',
      'Introduce choice and autonomy in tasks where possible',
    ],
    avoid: [
      'Do not interpret quietness or withdrawal as rudeness',
      'Do not use shame-based motivation strategies',
    ],
    escalate_if: 'Student stops responding to staff, withdraws from peers, or expresses hopelessness',
  },
  homework_decline: {
    title: 'Homework Non-Completion Response Guide',
    principle: 'Non-completion often signals capacity issues, not attitude.',
    immediate_actions: [
      'Explore whether home environment supports homework completion',
      'Offer in-school homework time or structured support',
      'Reduce load temporarily while investigating root cause',
    ],
    avoid: [
      'Do not issue detention for non-completion without first understanding context',
      'Do not assume the student chose not to complete work',
    ],
    escalate_if: 'Non-completion is accompanied by distress signals or disclosure of home difficulties',
  },
  combined: {
    title: 'Multiple Signal Response Guide',
    principle: 'When multiple signals fire simultaneously, the student is communicating something important.',
    immediate_actions: [
      'Immediate counselor brief — share all signals with context',
      'Schedule a care team meeting within 48 hours',
      'Ensure student has at least one trusted adult in school they can access',
    ],
    avoid: [
      'Do not wait for a single definitive cause before acting',
      'Do not share concerns with peers or non-essential staff',
    ],
    escalate_if: 'Any disclosure of harm, crisis, or safety concern — immediate escalation to principal and qualified professional',
  },
};

@Injectable()
export class StudentWellbeingService {
  constructor(
    @InjectRepository(WellbeingFlag) private readonly flagRepo: Repository<WellbeingFlag>,
    @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
    @InjectRepository(ForgettingCurve) private readonly curveRepo: Repository<ForgettingCurve>,
    @InjectRepository(RetrievalTask) private readonly taskRepo: Repository<RetrievalTask>,
    @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
    @InjectRepository(HomeworkAssignment) private readonly assignmentRepo: Repository<HomeworkAssignment>,
    @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  private determineTier(severityScore: number, signalCount: number): WellbeingTier {
    if (severityScore >= 75 || signalCount >= 3) return WellbeingTier.TIER_3;
    if (severityScore >= 50 || signalCount >= 2) return WellbeingTier.TIER_2;
    return WellbeingTier.TIER_1;
  }

  private routeFromTier(tier: WellbeingTier): string {
    if (tier === WellbeingTier.TIER_3) return 'principal';
    if (tier === WellbeingTier.TIER_2) return 'counselor';
    return 'teacher';
  }

  async scanStudent(studentId: string, academicYearId: string, createdBy: string) {
    const schoolId = this.getSchoolId();
    const signals: any[] = [];
    let totalSeverity = 0;

    // ── Signal 1: Attendance Drop ──────────────────────────────────────────
    const attendances = await this.attendanceRepo.find({
      where: { school_id: schoolId, student_id: studentId },
      order: { created_at: 'DESC' },
    });

    if (attendances.length >= 10) {
      const recent = attendances.slice(0, 10);
      const older = attendances.slice(10, 20);
      const recentRate = recent.filter(a => a.status === 'present').length / recent.length;
      const olderRate = older.length > 0 ? older.filter(a => a.status === 'present').length / older.length : recentRate;
      const delta = recentRate - olderRate;

      if (recentRate < 0.75) {
        const severity = Math.min(40, (0.75 - recentRate) * 100);
        signals.push({
          signal: WellbeingSignalType.ATTENDANCE_DROP,
          value: Math.round(recentRate * 100),
          threshold: 75,
          delta: Math.round(delta * 100),
          severity,
        });
        totalSeverity += severity;
      }
    }

    // ── Signal 2: Mastery Regression ───────────────────────────────────────
    const curves = await this.curveRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });

    if (curves.length > 0) {
      const atRisk = curves.filter(c => c.is_at_risk || c.retrievability < 0.4);
      const regressionRate = atRisk.length / curves.length;

      if (regressionRate > 0.3) {
        const severity = Math.min(30, regressionRate * 60);
        signals.push({
          signal: WellbeingSignalType.MASTERY_REGRESSION,
          value: Math.round(regressionRate * 100),
          threshold: 30,
          at_risk_topics: atRisk.length,
          severity,
        });
        totalSeverity += severity;
      }
    }

    // ── Signal 3: Engagement Drop (Retrieval avoidance) ────────────────────
    const recentTasks = await this.taskRepo.find({
      where: { school_id: schoolId, student_id: studentId },
      order: { created_at: 'DESC' },
      take: 10,
    });

    if (recentTasks.length >= 5) {
      const skippedOrOverdue = recentTasks.filter(t =>
        t.status === RetrievalTaskStatus.SKIPPED || t.status === RetrievalTaskStatus.OVERDUE
      ).length;
      const avoidanceRate = skippedOrOverdue / recentTasks.length;

      if (avoidanceRate > 0.4) {
        const severity = Math.min(20, avoidanceRate * 40);
        signals.push({
          signal: WellbeingSignalType.RETRIEVAL_AVOIDANCE,
          value: Math.round(avoidanceRate * 100),
          threshold: 40,
          skipped_tasks: skippedOrOverdue,
          severity,
        });
        totalSeverity += severity;
      }
    }

    // ── Signal 4: Homework Decline ─────────────────────────────────────────
    const assignments = await this.assignmentRepo.find({
      where: { school_id: schoolId },
      take: 20,
    });

    if (assignments.length > 0) {
      const assignmentIds = assignments.map(a => a.homework_id ?? a.id).filter(Boolean);
      const submissions = await this.submissionRepo.find({
        where: { school_id: schoolId, student_id: studentId },
      });
      const submittedIds = new Set(submissions.map(s => s.homework_id));
      const completionRate = assignmentIds.filter(id => submittedIds.has(id)).length / assignmentIds.length;

      if (completionRate < 0.5) {
        const severity = Math.min(20, (0.5 - completionRate) * 60);
        signals.push({
          signal: WellbeingSignalType.HOMEWORK_DECLINE,
          value: Math.round(completionRate * 100),
          threshold: 50,
          severity,
        });
        totalSeverity += severity;
      }
    }

    if (signals.length === 0) {
      return { student_id: studentId, flags_raised: 0, signals_checked: 4, message: 'No wellbeing concerns detected' };
    }

    // Determine tier and signal type
    const signalType = signals.length >= 2 ? WellbeingSignalType.COMBINED : signals[0].signal;
    const tier = this.determineTier(totalSeverity, signals.length);
    const routeTo = this.routeFromTier(tier);
    const guideKey = signals.length >= 2 ? 'combined' : signals[0].signal;

    const systemNote = `SYSTEM FLAG — NOT A DIAGNOSIS. ${signals.length} wellbeing signal(s) detected. Route to ${routeTo} for human assessment.`;

    // Check if open flag already exists
    const existing = await this.flagRepo.findOne({
      where: {
        school_id: schoolId,
        student_id: studentId,
        academic_year_id: academicYearId,
        signal_type: signalType,
        status: WellbeingFlagStatus.OPEN,
      },
    });

    if (existing) {
      await this.flagRepo.update(
        { school_id: schoolId, id: existing.id },
        { signals, severity_score: totalSeverity, tier, route_to: routeTo, updated_by: createdBy } as any
      );
      return { student_id: studentId, flags_raised: 1, updated: true, tier, route_to: routeTo, signals };
    }

    const flag = this.flagRepo.create({
      school_id: schoolId,
      student_id: studentId,
      academic_year_id: academicYearId,
      signal_type: signalType,
      tier,
      status: WellbeingFlagStatus.OPEN,
      route_to: routeTo,
      signals,
      guide_key: guideKey,
      severity_score: totalSeverity,
      system_note: systemNote,
      care_notes: [],
      is_acknowledged: false,
      created_by: createdBy,
    } as any) as unknown as WellbeingFlag;

    await this.flagRepo.save(flag);
    return { student_id: studentId, flags_raised: 1, tier, route_to: routeTo, signals };
  }

  async scanClass(classId: string, academicYearId: string, createdBy: string) {
    const schoolId = this.getSchoolId();
    const enrollments = await this.enrollmentRepo.find({
      where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId },
    });

    const results = [];
    for (const enrollment of enrollments) {
      const result = await this.scanStudent(enrollment.student_id, academicYearId, createdBy);
      if (result.flags_raised > 0) results.push(result);
    }

    return {
      class_id: classId,
      students_scanned: enrollments.length,
      flags_raised: results.length,
      tier_3: results.filter(r => r.tier === WellbeingTier.TIER_3).length,
      tier_2: results.filter(r => r.tier === WellbeingTier.TIER_2).length,
      tier_1: results.filter(r => r.tier === WellbeingTier.TIER_1).length,
      flagged_students: results,
    };
  }

  async getFlags(filters: { tier?: WellbeingTier; status?: WellbeingFlagStatus; academic_year_id?: string }) {
    const schoolId = this.getSchoolId();
    const qb = this.flagRepo
      .createQueryBuilder('f')
      .where('f.school_id = :schoolId', { schoolId })
      .andWhere('f.deleted_at IS NULL')
      .orderBy('f.severity_score', 'DESC');

    if (filters.tier) qb.andWhere('f.tier = :tier', { tier: filters.tier });
    if (filters.status) qb.andWhere('f.status = :status', { status: filters.status });
    if (filters.academic_year_id) qb.andWhere('f.academic_year_id = :ayid', { ayid: filters.academic_year_id });

    return qb.getMany();
  }

  async getStudentFlags(studentId: string) {
    const schoolId = this.getSchoolId();
    return this.flagRepo.find({
      where: { school_id: schoolId, student_id: studentId },
      order: { created_at: 'DESC' },
    });
  }

  async updateFlagStatus(flagId: string, dto: {
    status: WellbeingFlagStatus;
    care_note?: string;
  }, userId: string) {
    const schoolId = this.getSchoolId();
    const flag = await this.flagRepo.findOne({ where: { school_id: schoolId, id: flagId } });
    if (!flag) throw new Error('Flag not found');

    const updates: any = {
      status: dto.status,
      updated_by: userId,
      is_acknowledged: true,
      acknowledged_by: userId,
      acknowledged_at: new Date(),
    };

    if (dto.status === WellbeingFlagStatus.RESOLVED) {
      updates.resolved_at = new Date();
      updates.resolved_by = userId;
    }

    if (dto.care_note) {
      const notes = flag.care_notes ?? [];
      notes.push({ note: dto.care_note, logged_by: userId, logged_at: new Date().toISOString() });
      updates.care_notes = notes;
    }

    await this.flagRepo.update({ school_id: schoolId, id: flagId }, updates);
    return { success: true, status: dto.status };
  }

  getGuide(signalType: string) {
    const guide = TRAUMA_INFORMED_GUIDES[signalType];
    if (!guide) return { message: 'Guide not found', available: Object.keys(TRAUMA_INFORMED_GUIDES) };
    return guide;
  }
}
