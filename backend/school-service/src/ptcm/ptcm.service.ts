import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { PTCMeeting, PTCMeetingStatus } from '@xceliqos/shared/src/entities/ptc-meeting.entity';
import { PTCMeetingCommitment, CommitmentOwner, CommitmentStatus } from '@xceliqos/shared/src/entities/ptc-meeting-commitment.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { ForgettingCurve } from '@xceliqos/shared/src/entities/forgetting-curve.entity';
import { HomeworkSubmission } from '@xceliqos/shared/src/entities/homework-submission.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class PTCMService {
  constructor(
    @InjectRepository(PTCMeeting) private readonly meetingRepo: Repository<PTCMeeting>,
    @InjectRepository(PTCMeetingCommitment) private readonly commitmentRepo: Repository<PTCMeetingCommitment>,
    @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
    @InjectRepository(StudentMarks) private readonly marksRepo: Repository<StudentMarks>,
    @InjectRepository(ForgettingCurve) private readonly curveRepo: Repository<ForgettingCurve>,
    @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
    private readonly config: ConfigService,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Schedule ──────────────────────────────────────────────────────────────

  async scheduleMeeting(dto: {
    parent_user_id: string;
    teacher_user_id: string;
    student_id: string;
    academic_year_id: string;
    scheduled_at: string;
    duration_minutes?: number;
  }, createdBy: string) {
    const schoolId = this.getSchoolId();
    const meeting = this.meetingRepo.create({
      school_id: schoolId,
      ...dto,
      scheduled_at: new Date(dto.scheduled_at),
      duration_minutes: dto.duration_minutes ?? 15,
      status: PTCMeetingStatus.SCHEDULED,
      agenda: [],
      notes: [],
      created_by: createdBy,
    } as any) as unknown as PTCMeeting;
    return this.meetingRepo.save(meeting);
  }

  async listMeetings(userId: string, role: string, academicYearId?: string) {
    const schoolId = this.getSchoolId();
    const qb = this.meetingRepo
      .createQueryBuilder('m')
      .where('m.school_id = :schoolId', { schoolId })
      .andWhere('m.deleted_at IS NULL')
      .orderBy('m.scheduled_at', 'DESC');

    if (role === 'parent') {
      qb.andWhere('m.parent_user_id = :userId', { userId });
    } else if (role === 'teacher') {
      qb.andWhere('m.teacher_user_id = :userId', { userId });
    }
    if (academicYearId) qb.andWhere('m.academic_year_id = :ayid', { ayid: academicYearId });

    return qb.getMany();
  }

  async getMeeting(meetingId: string) {
    const schoolId = this.getSchoolId();
    const meeting = await this.meetingRepo.findOne({
      where: { school_id: schoolId, id: meetingId },
    });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const commitments = await this.commitmentRepo.find({
      where: { school_id: schoolId, meeting_id: meetingId },
    });

    return { meeting, commitments };
  }

  // ── AI Briefs ─────────────────────────────────────────────────────────────

  private async buildStudentContext(studentId: string, schoolId: string) {
    const attendances = await this.attendanceRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });
    const total = attendances.length;
    const present = attendances.filter(a => a.status === 'present').length;
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : null;

    const marks = await this.marksRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });
    const avgScore = marks.length > 0
      ? Math.round(marks.reduce((s, m) => s + (m.marks_obtained ?? 0), 0) / marks.length)
      : null;

    const atRiskTopics = await this.curveRepo.count({
      where: { school_id: schoolId, student_id: studentId, is_at_risk: true },
    });

    const submissions = await this.submissionRepo.find({
      where: { school_id: schoolId, student_id: studentId },
    });
    const submittedCount = submissions.filter(s => s.submitted_at).length;

    return { attendanceRate, avgScore, atRiskTopics, homeworkSubmitted: submittedCount, totalHomework: submissions.length };
  }

  private async callAI(systemPrompt: string, userPrompt: string): Promise<string> {
    const openAiKey = this.config.get<string>('OPENAI_API_KEY');
    if (openAiKey) {
      try {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${openAiKey}` },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            max_tokens: 800,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
          }),
        });
        if (res.ok) {
          const data = await res.json() as any;
          return data.choices?.[0]?.message?.content ?? '';
        }
      } catch {}
    }

    const anthropicKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (anthropicKey) {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 800,
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      });
      if (res.ok) {
        const data = await res.json() as any;
        return data.content?.[0]?.text ?? '';
      }
    }

    return '';
  }

  async getTeacherBrief(meetingId: string) {
    const schoolId = this.getSchoolId();
    const meeting = await this.meetingRepo.findOne({ where: { school_id: schoolId, id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    if (meeting.teacher_brief) return { brief: meeting.teacher_brief, cached: true };

    const ctx = await this.buildStudentContext(meeting.student_id, schoolId);

    const systemPrompt = `You are XceliQ, preparing a teacher for a parent-teacher conference.
Use Growth Mindset language. Never deficit-first. Frame concerns as opportunities for growth.
Respond in JSON with keys: strengths (array of 3 strings), concerns (array of 2 strings), ask_of_parent (string).`;

    const userPrompt = `Student data:
- Attendance rate: ${ctx.attendanceRate !== null ? ctx.attendanceRate + '%' : 'no data'}
- Average assessment score: ${ctx.avgScore !== null ? ctx.avgScore : 'no data'}
- At-risk retrieval topics: ${ctx.atRiskTopics}
- Homework submitted: ${ctx.homeworkSubmitted}/${ctx.totalHomework}

Generate a pre-meeting brief for the teacher with 3 strengths, 2 growth areas (framed positively), and 1 specific ask of the parent.`;

    const raw = await this.callAI(systemPrompt, userPrompt);
    let brief: Record<string, any> = { strengths: [], concerns: [], ask_of_parent: '' };

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      brief = JSON.parse(clean);
    } catch {
      brief = { strengths: [], concerns: [], ask_of_parent: raw, parse_error: true };
    }

    brief.generated_at = new Date().toISOString();
    brief.context_used = ctx;

    await this.meetingRepo.update(
      { school_id: schoolId, id: meetingId },
      { teacher_brief: brief } as any
    );

    return { brief, cached: false };
  }

  async getParentBrief(meetingId: string) {
    const schoolId = this.getSchoolId();
    const meeting = await this.meetingRepo.findOne({ where: { school_id: schoolId, id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    if (meeting.parent_brief) return { brief: meeting.parent_brief, cached: true };

    const ctx = await this.buildStudentContext(meeting.student_id, schoolId);

    const systemPrompt = `You are XceliQ, preparing a parent for a parent-teacher conference.
Use warm, encouraging, jargon-free language. Frame everything from the child growth perspective.
Respond in JSON with keys: achievements (array of 3 strings), discussion_points (array of 2 strings), home_support_tip (string).`;

    const userPrompt = `Student data:
- Attendance rate: ${ctx.attendanceRate !== null ? ctx.attendanceRate + '%' : 'no data'}
- Average assessment score: ${ctx.avgScore !== null ? ctx.avgScore : 'no data'}
- At-risk retrieval topics: ${ctx.atRiskTopics}
- Homework submitted: ${ctx.homeworkSubmitted}/${ctx.totalHomework}

Generate a pre-meeting brief for the parent with 3 achievements to celebrate, 2 discussion points, and 1 home support tip.`;

    const raw = await this.callAI(systemPrompt, userPrompt);
    let brief: Record<string, any> = { achievements: [], discussion_points: [], home_support_tip: '' };

    try {
      const clean = raw.replace(/```json|```/g, '').trim();
      brief = JSON.parse(clean);
    } catch {
      brief = { achievements: [], discussion_points: [], home_support_tip: raw, parse_error: true };
    }

    brief.generated_at = new Date().toISOString();

    await this.meetingRepo.update(
      { school_id: schoolId, id: meetingId },
      { parent_brief: brief } as any
    );

    return { brief, cached: false };
  }

  // ── During Meeting ────────────────────────────────────────────────────────

  async addNote(meetingId: string, note: { text: string; timestamp?: string }, userId: string) {
    const schoolId = this.getSchoolId();
    const meeting = await this.meetingRepo.findOne({ where: { school_id: schoolId, id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const notes = meeting.notes ?? [];
    notes.push({ text: note.text, timestamp: note.timestamp ?? new Date().toISOString(), logged_by: userId });

    await this.meetingRepo.update(
      { school_id: schoolId, id: meetingId },
      { notes, status: PTCMeetingStatus.IN_PROGRESS, updated_by: userId } as any
    );
    return { success: true, note_count: notes.length };
  }

  // ── Post Meeting ──────────────────────────────────────────────────────────

  async addCommitments(meetingId: string, commitments: {
    commitment_text: string;
    owner: CommitmentOwner;
    owner_user_id: string;
    due_date?: string;
  }[], createdBy: string) {
    const schoolId = this.getSchoolId();
    const meeting = await this.meetingRepo.findOne({ where: { school_id: schoolId, id: meetingId } });
    if (!meeting) throw new NotFoundException('Meeting not found');

    const saved = [];
    for (const c of commitments) {
      const commitment = this.commitmentRepo.create({
        school_id: schoolId,
        meeting_id: meetingId,
        student_id: meeting.student_id,
        commitment_text: c.commitment_text,
        owner: c.owner,
        owner_user_id: c.owner_user_id,
        due_date: c.due_date,
        status: CommitmentStatus.PENDING,
        created_by: createdBy,
      } as any) as unknown as PTCMeetingCommitment;
      saved.push(await this.commitmentRepo.save(commitment));
    }

    await this.meetingRepo.update(
      { school_id: schoolId, id: meetingId },
      { status: PTCMeetingStatus.COMPLETED, updated_by: createdBy } as any
    );

    return { success: true, commitments_created: saved.length, commitments: saved };
  }

  async updateStatus(meetingId: string, status: PTCMeetingStatus, userId: string) {
    const schoolId = this.getSchoolId();
    await this.meetingRepo.update(
      { school_id: schoolId, id: meetingId },
      { status, updated_by: userId } as any
    );
    return { success: true, status };
  }

  // ── Commitments ───────────────────────────────────────────────────────────

  async getCommitments(userId: string) {
    const schoolId = this.getSchoolId();
    const today = new Date().toISOString().split('T')[0];

    const commitments = await this.commitmentRepo.find({
      where: { school_id: schoolId, owner_user_id: userId },
      order: { due_date: 'ASC' },
    });

    // Auto-flag overdue
    return commitments.map(c => ({
      ...c,
      is_overdue: c.due_date && c.due_date < today && c.status === CommitmentStatus.PENDING,
    }));
  }

  async completeCommitment(commitmentId: string, notes: string, userId: string) {
    const schoolId = this.getSchoolId();
    await this.commitmentRepo.update(
      { school_id: schoolId, id: commitmentId, owner_user_id: userId },
      {
        status: CommitmentStatus.COMPLETED,
        completed_at: new Date(),
        completion_notes: notes,
        updated_by: userId,
      } as any
    );
    return { success: true };
  }
}
