import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HomeworkAssignment } from '@xceliqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { HomeworkFeedback } from '@xceliqos/shared/src/entities/homework-feedback.entity';
import { StudentEnrollment } from '@xceliqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@xceliqos/shared/src/entities/student-guardian.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class HomeworkTransparencyService {
  constructor(
    @InjectRepository(HomeworkAssignment) private readonly assignmentRepo: Repository<HomeworkAssignment>,
    @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
    @InjectRepository(HomeworkFeedback) private readonly feedbackRepo: Repository<HomeworkFeedback>,
    @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
    @InjectRepository(StudentGuardian) private readonly guardianRepo: Repository<StudentGuardian>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Student View ──────────────────────────────────────────────────────────
  // Assignments + submission status + countdown

  async getStudentView(studentId: string) {
    const schoolId = this.getSchoolId();

    const enrollment = await this.enrollmentRepo.findOne({
      where: { school_id: schoolId, student_id: studentId },
    });
    if (!enrollment) throw new NotFoundException('Student enrollment not found');

    const assignments = await this.assignmentRepo.find({
      where: { school_id: schoolId, class_id: enrollment.class_id },
      order: { due_date: 'ASC' },
    });

    const submissions = await this.submissionRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });

    const submissionMap = new Map(submissions.map(s => [s.homework_id, s]));

    const now = new Date();
    return assignments.map(a => {
      const submission = submissionMap.get(a.id) ?? submissionMap.get(a.homework_id);
      const dueDate = a.due_date ? new Date(a.due_date) : null;
      const hoursUntilDue = dueDate ? Math.round((dueDate.getTime() - now.getTime()) / 3600000) : null;

      return {
        assignment: a,
        status: submission?.status ?? 'pending',
        submitted_at: submission?.submitted_at ?? null,
        grade: submission?.grade ?? null,
        hours_until_due: hoursUntilDue,
        is_overdue: dueDate ? dueDate < now && !submission : false,
      };
    });
  }

  // ── Parent View ───────────────────────────────────────────────────────────
  // All assignments, status, deadline, grade, feedback (parent_visible only)

  async getParentView(studentId: string) {
    const schoolId = this.getSchoolId();

    const studentView = await this.getStudentView(studentId);

    const submissions = await this.submissionRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });

    const submissionIds = submissions.map(s => s.id);
    let feedbacks: HomeworkFeedback[] = [];
    if (submissionIds.length > 0) {
      feedbacks = await this.feedbackRepo
        .createQueryBuilder('f')
        .where('f.school_id = :schoolId', { schoolId })
        .andWhere('f.student_id = :studentId', { studentId })
        .andWhere('f.parent_visible = true')
        .andWhere('f.teacher_confirmed = true')
        .getMany();
    }

    const feedbackMap = new Map(feedbacks.map(f => [f.submission_id, f]));
    const submissionMap = new Map(submissions.map(s => [s.homework_id, s]));

    return studentView.map(item => {
      const submission = submissionMap.get(item.assignment.id) ?? submissionMap.get(item.assignment.homework_id);
      const feedback = submission ? feedbackMap.get(submission.id) : null;
      return {
        ...item,
        feedback: feedback
          ? {
              strength: feedback.strength,
              improvement: feedback.improvement,
              encouragement: feedback.encouragement,
              grade: feedback.grade,
              is_late: feedback.is_late,
            }
          : null,
      };
    });
  }

  // ── Teacher Correction Queue ──────────────────────────────────────────────
  // Submissions pending feedback, ordered by due date

  async getTeacherQueue(teacherId: string) {
    const schoolId = this.getSchoolId();

    const assignments = await this.assignmentRepo.find({
      where: { school_id: schoolId, teacher_id: teacherId },
    });

    if (assignments.length === 0) return [];

    const assignmentIds = assignments.map(a => a.id);
    const homeworkIds = assignments.map(a => a.homework_id).filter(Boolean);
    const allIds = [...new Set([...assignmentIds, ...homeworkIds])];

    const submissions = await this.submissionRepo
      .createQueryBuilder('s')
      .where('s.school_id = :schoolId', { schoolId })
      .andWhere('s.homework_id IN (:...allIds)', { allIds })
      .andWhere("s.status = 'submitted'")
      .orderBy('s.submitted_at', 'ASC')
      .getMany();

    // Find which ones already have confirmed feedback
    const feedbackedIds = await this.feedbackRepo
      .createQueryBuilder('f')
      .select('f.submission_id')
      .where('f.school_id = :schoolId', { schoolId })
      .andWhere('f.teacher_confirmed = true')
      .getRawMany();

    const feedbackedSet = new Set(feedbackedIds.map(f => f.f_submission_id));

    const assignmentMap = new Map(assignments.map(a => [a.id, a]));

    return submissions
      .filter(s => !feedbackedSet.has(s.id))
      .map(s => ({
        submission: s,
        assignment: assignmentMap.get(s.homework_id) ?? null,
      }));
  }

  // ── Submit Structured Feedback ────────────────────────────────────────────

  async submitFeedback(submissionId: string, dto: {
    strength: string;
    improvement: string;
    encouragement: string;
    grade?: string;
    parent_visible?: boolean;
    ai_draft?: Record<string, any>;
  }, teacherId: string) {
    const schoolId = this.getSchoolId();

    const submission = await this.submissionRepo.findOne({
      where: { school_id: schoolId, id: submissionId },
    });
    if (!submission) throw new NotFoundException('Submission not found');

    // Check if late
    const assignment = await this.assignmentRepo.findOne({
      where: { school_id: schoolId, id: submission.homework_id },
    });
    const isLate = assignment?.due_date && submission.submitted_at
      ? new Date(submission.submitted_at) > new Date(assignment.due_date)
      : false;

    // Upsert feedback
    const existing = await this.feedbackRepo.findOne({
      where: { school_id: schoolId, submission_id: submissionId },
    });

    if (existing) {
      await this.feedbackRepo.update(
        { school_id: schoolId, submission_id: submissionId },
        {
          strength: dto.strength,
          improvement: dto.improvement,
          encouragement: dto.encouragement,
          grade: dto.grade,
          parent_visible: dto.parent_visible ?? true,
          ai_draft: dto.ai_draft,
          teacher_confirmed: true,
          teacher_confirmed_at: new Date(),
          updated_by: teacherId,
        }
      );
      return this.feedbackRepo.findOne({ where: { school_id: schoolId, submission_id: submissionId } });
    }

    const feedback = this.feedbackRepo.create({
      school_id: schoolId,
      submission_id: submissionId,
      homework_id: submission.homework_id,
      student_id: submission.student_id,
      teacher_id: teacherId,
      strength: dto.strength,
      improvement: dto.improvement,
      encouragement: dto.encouragement,
      grade: dto.grade,
      parent_visible: dto.parent_visible ?? true,
      ai_draft: dto.ai_draft,
      is_late: isLate,
      teacher_confirmed: true,
      teacher_confirmed_at: new Date(),
      created_by: teacherId,
    } as any) as unknown as HomeworkFeedback;

    return this.feedbackRepo.save(feedback);
  }

  // ── Notify Parent ─────────────────────────────────────────────────────────

  async notifyParent(submissionId: string, studentId: string) {
    const schoolId = this.getSchoolId();

    const feedback = await this.feedbackRepo.findOne({
      where: { school_id: schoolId, submission_id: submissionId },
    });
    if (!feedback) throw new NotFoundException('Feedback not found — teacher must submit feedback before notifying parent');

    await this.feedbackRepo.update(
      { school_id: schoolId, submission_id: submissionId },
      { parent_notified: true, parent_notified_at: new Date() }
    );

    return { success: true, message: 'Parent notification triggered' };
  }

  // ── Analytics ─────────────────────────────────────────────────────────────

  async getClassAnalytics(classId: string) {
    const schoolId = this.getSchoolId();

    const assignments = await this.assignmentRepo.find({
      where: { school_id: schoolId, class_id: classId },
    });

    if (assignments.length === 0) return { assignments: 0, submissions: 0, completion_rate: 0, by_subject: [], by_type: [] };

    const allIds = assignments.map(a => a.homework_id ?? a.id);

    const submissions = await this.submissionRepo
      .createQueryBuilder('s')
      .where('s.school_id = :schoolId', { schoolId })
      .andWhere('s.homework_id IN (:...allIds)', { allIds })
      .getMany();

    const totalExpected = assignments.length;
    const submitted = submissions.filter(s => s.status === 'submitted' || s.submitted_at).length;
    const late = submissions.filter(s => {
      const a = assignments.find(a => a.homework_id === s.homework_id || a.id === s.homework_id);
      return a?.due_date && s.submitted_at && new Date(s.submitted_at) > new Date(a.due_date);
    }).length;

    // By subject
    const bySubject = new Map<string, { total: number; submitted: number }>();
    assignments.forEach(a => {
      const key = a.subject_id ?? 'unknown';
      if (!bySubject.has(key)) bySubject.set(key, { total: 0, submitted: 0 });
      bySubject.get(key)!.total++;
    });
    submissions.forEach(s => {
      const a = assignments.find(a => a.homework_id === s.homework_id || a.id === s.homework_id);
      if (a) {
        const key = a.subject_id ?? 'unknown';
        if (bySubject.has(key)) bySubject.get(key)!.submitted++;
      }
    });

    // By type
    const byType = new Map<string, { total: number; submitted: number }>();
    assignments.forEach(a => {
      const key = a.type ?? 'homework';
      if (!byType.has(key)) byType.set(key, { total: 0, submitted: 0 });
      byType.get(key)!.total++;
    });
    submissions.forEach(s => {
      const a = assignments.find(a => a.homework_id === s.homework_id || a.id === s.homework_id);
      if (a) {
        const key = a.type ?? 'homework';
        if (byType.has(key)) byType.get(key)!.submitted++;
      }
    });

    return {
      assignments: totalExpected,
      submissions: submitted,
      late_submissions: late,
      completion_rate: totalExpected > 0 ? Math.round((submitted / totalExpected) * 100) : 0,
      by_subject: Array.from(bySubject.entries()).map(([subject_id, v]) => ({
        subject_id,
        ...v,
        rate: v.total > 0 ? Math.round((v.submitted / v.total) * 100) : 0,
      })),
      by_type: Array.from(byType.entries()).map(([type, v]) => ({
        type,
        ...v,
        rate: v.total > 0 ? Math.round((v.submitted / v.total) * 100) : 0,
      })),
    };
  }
}
