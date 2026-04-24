import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RetrievalTask, RetrievalTaskStatus, RetrievalTaskType } from '@xceliqos/shared/src/entities/retrieval-task.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { CurriculumCalendarEntry, CalendarEntryStatus } from '@xceliqos/shared/src/entities/curriculum-calendar-entry.entity';
import { StudentConceptMastery } from '@xceliqos/shared/src/entities/student-concept-mastery.entity';
import { QuestionBank } from '@xceliqos/shared/src/entities/question-bank.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class XceliQReviseService {
  constructor(
    @InjectRepository(RetrievalTask) private readonly taskRepo: Repository<RetrievalTask>,
    @InjectRepository(ForgettingCurve) private readonly curveRepo: Repository<ForgettingCurve>,
    @InjectRepository(CurriculumCalendarEntry) private readonly calEntryRepo: Repository<CurriculumCalendarEntry>,
    @InjectRepository(StudentConceptMastery) private readonly masteryRepo: Repository<StudentConceptMastery>,
    @InjectRepository(QuestionBank) private readonly questionBankRepo: Repository<QuestionBank>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── SM-2 Algorithm ────────────────────────────────────────────────────────

  private sm2(ef: number, interval: number, repetitions: number, quality: number): {
    ef: number; interval: number; repetitions: number;
  } {
    // quality: 0-5
    if (quality < 3) {
      // Failed recall — reset
      return { ef: Math.max(1.3, ef - 0.2), interval: 1, repetitions: 0 };
    }
    const newEf = Math.max(1.3, ef + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    let newInterval: number;
    if (repetitions === 0) newInterval = 1;
    else if (repetitions === 1) newInterval = 6;
    else newInterval = Math.round(interval * newEf);
    return { ef: newEf, interval: newInterval, repetitions: repetitions + 1 };
  }

  // Ebbinghaus retrievability R = e^(-t/S)
  private calcRetrievability(stability: number, daysSinceReview: number): number {
    return Math.exp(-daysSinceReview / Math.max(stability, 0.1));
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  private today(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ── Schedule Generation ───────────────────────────────────────────────────

  async scheduleForStudent(studentId: string, academicYearId: string, classId: string) {
    const schoolId = this.getSchoolId();

    // Get all taught entries for this student's class
    const taughtEntries = await this.calEntryRepo.find({
      where: {
        school_id: schoolId,
        academic_year_id: academicYearId,
        class_id: classId,
        status: CalendarEntryStatus.TAUGHT,
      },
      order: { actual_date: 'ASC' },
    });

    if (taughtEntries.length === 0) return { scheduled: 0, message: 'No taught entries found' };

    // Collect unique board_topic_ids from taught entries
    const topicMap = new Map<string, { date: string; subject_id: string }>();
    taughtEntries.forEach(e => {
      (e.board_topic_ids ?? []).forEach((topicId: string) => {
        if (!topicMap.has(topicId)) {
          topicMap.set(topicId, { date: e.actual_date ?? e.planned_date, subject_id: e.subject_id });
        }
      });
    });

    const today = this.today();
    let scheduled = 0;

    for (const [topicId, { date, subject_id }] of topicMap) {
      // Get or create forgetting curve for this student+topic
      let curve = await this.curveRepo.findOne({
        where: { school_id: schoolId, student_id: studentId, board_topic_id: topicId },
      });

      if (!curve) {
        // Check initial mastery from concept mastery if available
        const daysSinceLearned = Math.max(1,
          Math.round((new Date(today).getTime() - new Date(date).getTime()) / 86400000)
        );

        const firstReviewDate = this.addDays(date, 1);
        curve = this.curveRepo.create({
          school_id: schoolId,
          student_id: studentId,
          academic_year_id: academicYearId,
          board_topic_id: topicId,
          subject_id,
          ease_factor: 2.5,
          interval_days: 1,
          repetition_count: 0,
          stability: 1.0,
          retrievability: this.calcRetrievability(1.0, daysSinceLearned),
          last_review_date: date,
          next_review_date: firstReviewDate,
          total_reviews: 0,
          is_at_risk: daysSinceLearned > 3,
          created_by: studentId,
        } as any) as unknown as ForgettingCurve;
        curve = await this.curveRepo.save(curve);
      }

      // Skip if already scheduled for today or future
      if (curve.next_review_date && curve.next_review_date > today) continue;

      // Check if task already exists for today
      const existing = await this.taskRepo.findOne({
        where: {
          school_id: schoolId,
          student_id: studentId,
          board_topic_id: topicId,
          scheduled_date: today,
          status: RetrievalTaskStatus.SCHEDULED,
        },
      });
      if (existing) continue;

      // Find a question from the bank for this topic
      const question = await this.questionBankRepo
        .createQueryBuilder('q')
        .where('q.school_id = :schoolId', { schoolId })
        .andWhere("q.metadata->>'board_topic_id' = :topicId", { topicId })
        .andWhere('q.deleted_at IS NULL')
        .orderBy('RANDOM()')
        .limit(1)
        .getOne();

      const task = this.taskRepo.create({
        school_id: schoolId,
        student_id: studentId,
        academic_year_id: academicYearId,
        board_topic_id: topicId,
        question_bank_id: question?.id ?? null,
        task_type: RetrievalTaskType.MICRO_QUIZ,
        scheduled_date: today,
        due_date: today,
        status: RetrievalTaskStatus.DUE,
        forgetting_curve_id: curve.id,
        created_by: studentId,
      } as any) as unknown as RetrievalTask;

      await this.taskRepo.save(task);
      scheduled++;
    }

    return { scheduled, topics_tracked: topicMap.size };
  }

  // ── Get Due Tasks ─────────────────────────────────────────────────────────

  async getDueTasks(studentId: string) {
    const schoolId = this.getSchoolId();
    const today = this.today();

    const tasks = await this.taskRepo
      .createQueryBuilder('t')
      .where('t.school_id = :schoolId', { schoolId })
      .andWhere('t.student_id = :studentId', { studentId })
      .andWhere('t.scheduled_date <= :today', { today })
      .andWhere('t.status IN (:...statuses)', { statuses: [RetrievalTaskStatus.DUE, RetrievalTaskStatus.SCHEDULED, RetrievalTaskStatus.OVERDUE] })
      .andWhere('t.deleted_at IS NULL')
      .orderBy('t.scheduled_date', 'ASC')
      .getMany();

    // Hydrate with question data
    const hydrated = await Promise.all(tasks.map(async t => {
      let question = null;
      if (t.question_bank_id) {
        question = await this.questionBankRepo.findOne({ where: { id: t.question_bank_id } });
      }
      const curve = t.forgetting_curve_id
        ? await this.curveRepo.findOne({ where: { id: t.forgetting_curve_id } })
        : null;
      return {
        task: t,
        question: question ? {
          id: question.id,
          question_text: question.question_text,
          question_type: question.question_type,
          options: question.options,
          estimated_minutes: question.estimated_minutes,
        } : null,
        retrievability: curve?.retrievability ?? null,
        encouragement: curve?.encouragement_note ?? 'Every retrieval practice strengthens your memory!',
      };
    }));

    return hydrated;
  }

  // ── Submit Response ───────────────────────────────────────────────────────

  async submitResponse(taskId: string, dto: {
    student_response: string;
    is_correct: boolean;
    quality_score: number; // 0-5
    response_time_ms?: number;
  }, studentId: string) {
    const schoolId = this.getSchoolId();

    const task = await this.taskRepo.findOne({
      where: { school_id: schoolId, id: taskId, student_id: studentId },
    });
    if (!task) throw new NotFoundException('Task not found');

    const now = new Date();
    await this.taskRepo.update(
      { school_id: schoolId, id: taskId },
      {
        student_response: dto.student_response,
        is_correct: dto.is_correct,
        quality_score: dto.quality_score,
        response_time_ms: dto.response_time_ms,
        status: RetrievalTaskStatus.COMPLETED,
        completed_at: now,
        updated_by: studentId,
      } as any
    );

    // Update forgetting curve
    if (task.forgetting_curve_id) {
      const curve = await this.curveRepo.findOne({
        where: { school_id: schoolId, id: task.forgetting_curve_id },
      });
      if (curve) {
        const { ef, interval, repetitions } = this.sm2(
          curve.ease_factor,
          curve.interval_days,
          curve.repetition_count,
          dto.quality_score,
        );

        const today = this.today();
        const nextReview = this.addDays(today, interval);
        const newStability = Math.max(1, curve.stability * (1 + 0.1 * dto.quality_score));
        const newRetrievability = 1.0; // Reset to 1 after successful review
        const newAvgQuality = curve.total_reviews > 0
          ? ((curve.average_quality ?? dto.quality_score) * curve.total_reviews + dto.quality_score) / (curve.total_reviews + 1)
          : dto.quality_score;

        const encouragement = dto.quality_score >= 4
          ? 'Excellent recall! Your memory of this topic is strong.'
          : dto.quality_score >= 3
          ? 'Good effort! Reviewing this again soon will strengthen your memory.'
          : "This topic needs more practice — that's completely normal. Each attempt builds your understanding.";

        await this.curveRepo.update(
          { school_id: schoolId, id: task.forgetting_curve_id },
          {
            ease_factor: ef,
            interval_days: interval,
            repetition_count: repetitions,
            stability: newStability,
            retrievability: newRetrievability,
            last_review_date: today,
            next_review_date: nextReview,
            total_reviews: curve.total_reviews + 1,
            average_quality: newAvgQuality,
            is_at_risk: false,
            encouragement_note: encouragement,
            updated_by: studentId,
          } as any
        );
      }
    }

    return { success: true, task_id: taskId, quality_score: dto.quality_score };
  }

  // ── Get Forgetting Curve State ────────────────────────────────────────────

  async getCurveState(studentId: string) {
    const schoolId = this.getSchoolId();
    const today = this.today();

    const curves = await this.curveRepo.find({
      where: { school_id: schoolId, student_id: studentId },
      order: { next_review_date: 'ASC' },
    });

    // Update retrievability for each curve based on time elapsed
    const updated = curves.map(c => {
      const daysSince = c.last_review_date
        ? Math.max(0, Math.round((new Date(today).getTime() - new Date(c.last_review_date).getTime()) / 86400000))
        : 0;
      const currentR = this.calcRetrievability(c.stability, daysSince);
      return {
        ...c,
        current_retrievability: Math.round(currentR * 100),
        days_since_review: daysSince,
        is_overdue: c.next_review_date ? c.next_review_date < today : false,
      };
    });

    return updated;
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getAnalytics(studentId: string) {
    const schoolId = this.getSchoolId();
    const today = this.today();

    const curves = await this.curveRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });

    const tasks = await this.taskRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });

    const completed = tasks.filter(t => t.status === RetrievalTaskStatus.COMPLETED);
    const correct = completed.filter(t => t.is_correct);
    const overdue = curves.filter(c => c.next_review_date && c.next_review_date < today);
    const atRisk = curves.filter(c => c.is_at_risk || (c.next_review_date && c.next_review_date < today));

    const avgQuality = completed.length > 0
      ? completed.reduce((sum, t) => sum + (t.quality_score ?? 0), 0) / completed.length
      : 0;

    const avgRetention = curves.length > 0
      ? curves.reduce((sum, c) => {
          const days = c.last_review_date
            ? Math.max(0, Math.round((new Date(today).getTime() - new Date(c.last_review_date).getTime()) / 86400000))
            : 0;
          return sum + this.calcRetrievability(c.stability, days);
        }, 0) / curves.length
      : 0;

    return {
      student_id: studentId,
      topics_tracked: curves.length,
      tasks_completed: completed.length,
      tasks_correct: correct.length,
      accuracy_percent: completed.length > 0 ? Math.round((correct.length / completed.length) * 100) : 0,
      average_quality_score: Math.round(avgQuality * 10) / 10,
      average_retention_percent: Math.round(avgRetention * 100),
      overdue_topics: overdue.length,
      at_risk_topics: atRisk.map(c => c.board_topic_id),
      next_due_date: curves
        .filter(c => c.next_review_date)
        .sort((a, b) => a.next_review_date!.localeCompare(b.next_review_date!))
        [0]?.next_review_date ?? null,
    };
  }
}
