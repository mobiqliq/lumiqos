import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuestionBank, QuestionType, BloomLevel, DifficultyLevel } from '@xceliqos/shared/src/entities/question-bank.entity';
import { ExamQuestion } from '@xceliqos/shared/src/entities/exam-question.entity';
import { ExamAnswerSheet, AnswerSheetStatus } from '@xceliqos/shared/src/entities/exam-answer-sheet.entity';
import { StudentAnswerSheet, SheetProcessingStatus } from '@xceliqos/shared/src/entities/student-answer-sheet.entity';
import { ItemAnalysis } from '@xceliqos/shared/src/entities/item-analysis.entity';
import { BoardSyllabus } from '@xceliqos/shared/src/entities/board-syllabus.entity';
import { SchoolCurriculumMap } from '@xceliqos/shared/src/entities/school-curriculum-map.entity';
import { ExamSubject } from '@xceliqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@xceliqos/shared/src/entities/student-marks.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class ExamEngineService {
  constructor(
    @InjectRepository(QuestionBank) private readonly questionBankRepo: Repository<QuestionBank>,
    @InjectRepository(ExamQuestion) private readonly examQuestionRepo: Repository<ExamQuestion>,
    @InjectRepository(ExamAnswerSheet) private readonly answerSheetRepo: Repository<ExamAnswerSheet>,
    @InjectRepository(StudentAnswerSheet) private readonly studentSheetRepo: Repository<StudentAnswerSheet>,
    @InjectRepository(ItemAnalysis) private readonly itemAnalysisRepo: Repository<ItemAnalysis>,
    @InjectRepository(BoardSyllabus) private readonly boardSyllabusRepo: Repository<BoardSyllabus>,
    @InjectRepository(SchoolCurriculumMap) private readonly curriculumMapRepo: Repository<SchoolCurriculumMap>,
    @InjectRepository(ExamSubject) private readonly examSubjectRepo: Repository<ExamSubject>,
    @InjectRepository(StudentMarks) private readonly studentMarksRepo: Repository<StudentMarks>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Question Bank ─────────────────────────────────────────────────────────

  async addQuestion(dto: {
    subject_id: string;
    class_id?: string;
    topic?: string;
    board_topic_id?: string;
    nep_competency?: string;
    question_type: QuestionType;
    bloom_level: BloomLevel;
    difficulty: DifficultyLevel;
    question_text: string;
    options?: Record<string, any>[];
    correct_answer?: string;
    match_pairs?: Record<string, any>[];
    rubric?: Record<string, any>;
    default_marks?: number;
    estimated_minutes?: number;
    source?: string;
    board_id?: string;
  }, createdBy: string) {
    const schoolId = this.getSchoolId();

    // Resolve board_id from school if not provided
    let boardId = dto.board_id;
    if (!boardId) {
      const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
      boardId = school?.board ?? 'CBSE';
    }

    const question = this.questionBankRepo.create({
      school_id: schoolId,
      subject_id: dto.subject_id,
      class_id: dto.class_id,
      topic: dto.topic,
      nep_competency: dto.nep_competency,
      question_type: dto.question_type,
      bloom_level: dto.bloom_level,
      difficulty: dto.difficulty,
      question_text: dto.question_text,
      options: dto.options,
      correct_answer: dto.correct_answer,
      match_pairs: dto.match_pairs,
      rubric: dto.rubric,
      default_marks: dto.default_marks ?? 1,
      estimated_minutes: dto.estimated_minutes ?? 2,
      source: dto.source,
      usage_count: 0,
      created_by: createdBy,
      metadata: { board_id: boardId, board_topic_id: dto.board_topic_id },
    } as any) as unknown as QuestionBank;

    return this.questionBankRepo.save(question);
  }

  async listQuestions(filters: {
    subject_id?: string;
    class_id?: string;
    topic?: string;
    bloom_level?: BloomLevel;
    difficulty?: DifficultyLevel;
    question_type?: QuestionType;
    board_id?: string;
    board_topic_id?: string;
  }) {
    const schoolId = this.getSchoolId();

    const qb = this.questionBankRepo
      .createQueryBuilder('q')
      .where('q.school_id = :schoolId', { schoolId })
      .andWhere('q.deleted_at IS NULL')
      .orderBy('q.created_at', 'DESC');

    if (filters.subject_id) qb.andWhere('q.subject_id = :subject_id', { subject_id: filters.subject_id });
    if (filters.class_id) qb.andWhere('q.class_id = :class_id', { class_id: filters.class_id });
    if (filters.topic) qb.andWhere('q.topic ILIKE :topic', { topic: `%${filters.topic}%` });
    if (filters.bloom_level) qb.andWhere('q.bloom_level = :bloom_level', { bloom_level: filters.bloom_level });
    if (filters.difficulty) qb.andWhere('q.difficulty = :difficulty', { difficulty: filters.difficulty });
    if (filters.question_type) qb.andWhere('q.question_type = :question_type', { question_type: filters.question_type });
    if (filters.board_id) qb.andWhere("q.metadata->>'board_id' = :board_id", { board_id: filters.board_id });
    if (filters.board_topic_id) qb.andWhere("q.metadata->>'board_topic_id' = :board_topic_id", { board_topic_id: filters.board_topic_id });

    return qb.getMany();
  }

  async bulkAddQuestions(questions: any[], createdBy: string) {
    const results = [];
    for (const q of questions) {
      results.push(await this.addQuestion(q, createdBy));
    }
    return { added: results.length, questions: results };
  }

  async getQuestion(id: string) {
    const schoolId = this.getSchoolId();
    const q = await this.questionBankRepo.findOne({ where: { school_id: schoolId, id } });
    if (!q) throw new NotFoundException('Question not found');
    return q;
  }

  async updateQuestion(id: string, dto: Partial<QuestionBank>, updatedBy: string) {
    const schoolId = this.getSchoolId();
    await this.questionBankRepo.update(
      { school_id: schoolId, id },
      { ...dto, updated_by: updatedBy } as any
    );
    return this.getQuestion(id);
  }

  // ── Exam Assembly ─────────────────────────────────────────────────────────

  async assembleExam(examSubjectId: string, params: {
    total_marks: number;
    sections: {
      label: string;
      question_type: QuestionType;
      count: number;
      marks_per_question: number;
      bloom_levels?: BloomLevel[];
      difficulty?: DifficultyLevel;
      topic_ids?: string[];
    }[];
  }, createdBy: string) {
    const schoolId = this.getSchoolId();

    const examSubject = await this.examSubjectRepo.findOne({
      where: { school_id: schoolId, id: examSubjectId },
    });
    if (!examSubject) throw new NotFoundException('Exam subject not found');

    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    const boardId = school?.board ?? 'CBSE';

    let questionOrder = 1;
    const assembled: ExamQuestion[] = [];

    for (const section of params.sections) {
      const qb = this.questionBankRepo
        .createQueryBuilder('q')
        .where('q.school_id = :schoolId', { schoolId })
        .andWhere('q.subject_id = :subjectId', { subjectId: examSubject.subject_id })
        .andWhere('q.question_type = :type', { type: section.question_type })
        .andWhere("q.metadata->>'board_id' = :boardId", { boardId })
        .andWhere('q.deleted_at IS NULL')
        .orderBy('RANDOM()')
        .take(section.count);

      if (section.difficulty) qb.andWhere('q.difficulty = :diff', { diff: section.difficulty });
      if (section.bloom_levels?.length) qb.andWhere('q.bloom_level IN (:...blooms)', { blooms: section.bloom_levels });
      if (section.topic_ids?.length) qb.andWhere("q.metadata->>'board_topic_id' IN (:...topics)", { topics: section.topic_ids });

      const questions = await qb.getMany();

      for (const q of questions) {
        const eq = this.examQuestionRepo.create({
          school_id: schoolId,
          exam_subject_id: examSubjectId,
          question_bank_id: q.id,
          question_order: questionOrder++,
          section_label: section.label,
          allocated_marks: section.marks_per_question,
          created_by: createdBy,
        } as any) as unknown as ExamQuestion;
        assembled.push(await this.examQuestionRepo.save(eq));

        // Increment usage count
        await this.questionBankRepo.increment({ id: q.id }, 'usage_count', 1);
      }
    }

    return { exam_subject_id: examSubjectId, questions_assembled: assembled.length, questions: assembled };
  }

  async getExamQuestions(examSubjectId: string) {
    const schoolId = this.getSchoolId();
    const questions = await this.examQuestionRepo
      .createQueryBuilder('eq')
      .where('eq.school_id = :schoolId', { schoolId })
      .andWhere('eq.exam_subject_id = :examSubjectId', { examSubjectId })
      .andWhere('eq.deleted_at IS NULL')
      .orderBy('eq.question_order', 'ASC')
      .getMany();

    // Hydrate question bank data
    const hydrated = await Promise.all(questions.map(async eq => {
      const qb = await this.questionBankRepo.findOne({ where: { id: eq.question_bank_id } });
      return { ...eq, question: qb };
    }));

    return hydrated;
  }

  // ── Answer Sheet ──────────────────────────────────────────────────────────

  async createAnswerSheet(examSubjectId: string, dto: {
    template_config?: Record<string, any>;
  }, createdBy: string) {
    const schoolId = this.getSchoolId();

    const examSubject = await this.examSubjectRepo.findOne({
      where: { school_id: schoolId, id: examSubjectId },
    });
    if (!examSubject) throw new NotFoundException('Exam subject not found');

    const questions = await this.getExamQuestions(examSubjectId);

    // Build sections from assembled questions
    const sectionMap = new Map<string, any[]>();
    questions.forEach(q => {
      const label = q.section_label ?? 'A';
      if (!sectionMap.has(label)) sectionMap.set(label, []);
      sectionMap.get(label)!.push(q.id);
    });

    const sections = Array.from(sectionMap.entries()).map(([label, qIds]) => ({
      section_label: label,
      question_ids: qIds,
    }));

    const sheet = this.answerSheetRepo.create({
      school_id: schoolId,
      exam_subject_id: examSubjectId,
      exam_id: examSubject.exam_id,
      qr_payload: { exam_subject_id: examSubjectId, exam_id: examSubject.exam_id, school_id: schoolId },
      sections,
      template_config: dto.template_config ?? {
        paper_size: 'A4',
        font_size: 11,
        marks_box_width: 40,
        marks_box_height: 20,
        bubble_diameter: 12,
        header_logo: true,
        board_name_in_header: true,
        summary_strip: true,
      },
      status: AnswerSheetStatus.DRAFT,
      created_by: createdBy,
    } as any) as unknown as ExamAnswerSheet;

    return this.answerSheetRepo.save(sheet);
  }

  // ── Student Sheet Upload & OCR ────────────────────────────────────────────

  async uploadStudentSheet(examSubjectId: string, studentId: string, imageUrl: string, uploadedBy: string) {
    const schoolId = this.getSchoolId();

    const existing = await this.studentSheetRepo.findOne({
      where: { school_id: schoolId, exam_subject_id: examSubjectId, student_id: studentId },
    });

    if (existing) {
      await this.studentSheetRepo.update(
        { school_id: schoolId, exam_subject_id: examSubjectId, student_id: studentId },
        { image_url: imageUrl, uploaded_at: new Date(), processing_status: SheetProcessingStatus.PENDING, updated_by: uploadedBy }
      );
      return this.studentSheetRepo.findOne({
        where: { school_id: schoolId, exam_subject_id: examSubjectId, student_id: studentId },
      });
    }

    const answerSheet = await this.answerSheetRepo.findOne({
      where: { school_id: schoolId, exam_subject_id: examSubjectId },
    });

    const sheet = this.studentSheetRepo.create({
      school_id: schoolId,
      exam_subject_id: examSubjectId,
      exam_answer_sheet_id: answerSheet?.id,
      student_id: studentId,
      image_url: imageUrl,
      uploaded_at: new Date(),
      processing_status: SheetProcessingStatus.PENDING,
      teacher_confirmed: false,
      result_notified: false,
      created_by: uploadedBy,
    } as any) as unknown as StudentAnswerSheet;

    return this.studentSheetRepo.save(sheet);
  }

  async confirmMarks(studentSheetId: string, dto: {
    confirmed_marks: Record<string, any>;
    total_marks_confirmed: number;
    grade_confirmed: string;
  }, confirmedBy: string) {
    const schoolId = this.getSchoolId();

    const sheet = await this.studentSheetRepo.findOne({
      where: { school_id: schoolId, id: studentSheetId },
    });
    if (!sheet) throw new NotFoundException('Student answer sheet not found');

    await this.studentSheetRepo.update(
      { school_id: schoolId, id: studentSheetId },
      {
        confirmed_marks: dto.confirmed_marks,
        total_marks_confirmed: dto.total_marks_confirmed,
        grade_confirmed: dto.grade_confirmed,
        teacher_confirmed: true,
        confirmed_by: confirmedBy,
        confirmed_at: new Date(),
        processing_status: SheetProcessingStatus.CONFIRMED,
        updated_by: confirmedBy,
      }
    );

    return { success: true, student_id: sheet.student_id, total: dto.total_marks_confirmed, grade: dto.grade_confirmed };
  }

  async notifyResult(studentSheetId: string) {
    const schoolId = this.getSchoolId();
    const sheet = await this.studentSheetRepo.findOne({
      where: { school_id: schoolId, id: studentSheetId },
    });
    if (!sheet) throw new NotFoundException('Student answer sheet not found');
    if (!sheet.teacher_confirmed) throw new BadRequestException('Marks not confirmed by teacher yet');

    await this.studentSheetRepo.update(
      { school_id: schoolId, id: studentSheetId },
      { result_notified: true, result_notified_at: new Date() }
    );
    return { success: true, notified_for_student: sheet.student_id };
  }

  async getStudentSheets(examSubjectId: string) {
    const schoolId = this.getSchoolId();
    return this.studentSheetRepo.find({
      where: { school_id: schoolId, exam_subject_id: examSubjectId },
      order: { uploaded_at: 'DESC' },
    });
  }

  // ── Item Analysis ─────────────────────────────────────────────────────────

  async runItemAnalysis(examSubjectId: string, createdBy: string) {
    const schoolId = this.getSchoolId();

    const examQuestions = await this.examQuestionRepo.find({
      where: { school_id: schoolId, exam_subject_id: examSubjectId },
    });
    if (examQuestions.length === 0) throw new NotFoundException('No questions found for this exam subject');

    const confirmedSheets = await this.studentSheetRepo.find({
      where: { school_id: schoolId, exam_subject_id: examSubjectId, teacher_confirmed: true },
    });
    if (confirmedSheets.length === 0) throw new BadRequestException('No confirmed sheets available for analysis');

    const totalStudents = confirmedSheets.length;
    const totalMarks = confirmedSheets.map(s => s.total_marks_confirmed ?? 0);
    const avgTotal = totalMarks.reduce((a, b) => a + b, 0) / totalStudents;

    const results: ItemAnalysis[] = [];

    for (const eq of examQuestions) {
      const questionMarks = confirmedSheets.map(s => {
        const marks = s.confirmed_marks?.[eq.question_order] ?? 0;
        return Number(marks);
      });

      const correctCount = questionMarks.filter(m => m >= eq.allocated_marks).length;
      const difficultyIndex = correctCount / totalStudents;
      const avgMarks = questionMarks.reduce((a, b) => a + b, 0) / totalStudents;

      // Point-biserial discrimination index approximation
      const topHalf = confirmedSheets
        .filter(s => (s.total_marks_confirmed ?? 0) >= avgTotal)
        .map(s => (s.confirmed_marks?.[eq.question_order] ?? 0) >= eq.allocated_marks ? 1 : 0);
      const bottomHalf = confirmedSheets
        .filter(s => (s.total_marks_confirmed ?? 0) < avgTotal)
        .map(s => (s.confirmed_marks?.[eq.question_order] ?? 0) >= eq.allocated_marks ? 1 : 0);

      const topRate = topHalf.length > 0 ? topHalf.reduce((a, b) => a + b, 0) / topHalf.length : 0;
      const bottomRate = bottomHalf.length > 0 ? bottomHalf.reduce((a, b) => a + b, 0) / bottomHalf.length : 0;
      const discriminationIndex = topRate - bottomRate;

      const isFlagged = discriminationIndex < 0.1 || difficultyIndex < 0.2;
      const flagReason = isFlagged
        ? discriminationIndex < 0.1 ? 'Poor discriminator' : 'Very high difficulty'
        : null;

      const existing = await this.itemAnalysisRepo.findOne({
        where: { school_id: schoolId, exam_subject_id: examSubjectId, exam_question_id: eq.id },
      });

      if (existing) {
        await this.itemAnalysisRepo.update(
          { school_id: schoolId, exam_subject_id: examSubjectId, exam_question_id: eq.id },
          {
            attempt_count: totalStudents,
            difficulty_index: difficultyIndex,
            discrimination_index: discriminationIndex,
            average_marks: avgMarks,
            max_marks: eq.allocated_marks,
            is_flagged: isFlagged,
            flag_reason: flagReason ?? undefined,
            updated_by: createdBy,
          } as any
        );
        results.push(existing);
      } else {
        const analysis = this.itemAnalysisRepo.create({
          school_id: schoolId,
          exam_subject_id: examSubjectId,
          exam_question_id: eq.id,
          question_bank_id: eq.question_bank_id,
          attempt_count: totalStudents,
          difficulty_index: difficultyIndex,
          discrimination_index: discriminationIndex,
          average_marks: avgMarks,
          max_marks: eq.allocated_marks,
          is_flagged: isFlagged,
          flag_reason: flagReason,
          created_by: createdBy,
        } as any) as unknown as ItemAnalysis;
        results.push(await this.itemAnalysisRepo.save(analysis));
      }
    }

    return { exam_subject_id: examSubjectId, questions_analysed: results.length, results };
  }

  async getItemAnalysis(examSubjectId: string) {
    const schoolId = this.getSchoolId();
    return this.itemAnalysisRepo.find({
      where: { school_id: schoolId, exam_subject_id: examSubjectId },
      order: { discrimination_index: 'ASC' },
    });
  }

  // ── Board Syllabus (read for school context) ──────────────────────────────

  async getBoardSyllabus(boardId: string, grade?: number, subjectId?: string) {
    const qb = this.boardSyllabusRepo
      .createQueryBuilder('bs')
      .where('bs.board_id = :boardId', { boardId })
      .andWhere('bs.is_current = true');
    if (grade) qb.andWhere('bs.grade = :grade', { grade });
    if (subjectId) qb.andWhere('bs.subject_id = :subjectId', { subjectId });
    return qb.getMany();
  }

  // ── Curriculum Map ────────────────────────────────────────────────────────

  async createCurriculumMap(dto: {
    academic_year_id: string;
    subject_id: string;
    class_id: string;
    board_syllabus_id: string;
    textbook_name: string;
    textbook_author?: string;
    textbook_publisher?: string;
    textbook_edition?: string;
    total_chapters: number;
    chapter_mappings: Record<string, any>[];
  }, createdBy: string) {
    const schoolId = this.getSchoolId();

    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    const boardId = school?.board ?? 'CBSE';

    // Archive existing active map
    await this.curriculumMapRepo.update(
      { school_id: schoolId, subject_id: dto.subject_id, class_id: dto.class_id, is_active: true },
      { is_active: false, archived_at: new Date(), archived_by: createdBy }
    );

    const boardSyllabus = await this.boardSyllabusRepo.findOne({ where: { id: dto.board_syllabus_id } });
    const totalBoardTopics = boardSyllabus?.topics?.length ?? 0;
    const mappedTopics = new Set<string>();
    dto.chapter_mappings.forEach(c => (c.board_topic_ids ?? []).forEach((t: string) => mappedTopics.add(t)));

    const map = this.curriculumMapRepo.create({
      school_id: schoolId,
      academic_year_id: dto.academic_year_id,
      subject_id: dto.subject_id,
      class_id: dto.class_id,
      board_syllabus_id: dto.board_syllabus_id,
      board_id: boardId,
      textbook_name: dto.textbook_name,
      textbook_author: dto.textbook_author,
      textbook_publisher: dto.textbook_publisher,
      textbook_edition: dto.textbook_edition,
      total_chapters: dto.total_chapters,
      chapter_mappings: dto.chapter_mappings,
      mapped_topics_count: mappedTopics.size,
      total_board_topics: totalBoardTopics,
      is_active: true,
      created_by: createdBy,
    } as any) as unknown as SchoolCurriculumMap;

    return this.curriculumMapRepo.save(map);
  }

  async getCurriculumMap(subjectId: string, classId: string, academicYearId?: string) {
    const schoolId = this.getSchoolId();
    const qb = this.curriculumMapRepo
      .createQueryBuilder('cm')
      .where('cm.school_id = :schoolId', { schoolId })
      .andWhere('cm.subject_id = :subjectId', { subjectId })
      .andWhere('cm.class_id = :classId', { classId })
      .orderBy('cm.created_at', 'DESC');

    if (academicYearId) {
      qb.andWhere('cm.academic_year_id = :academicYearId', { academicYearId });
    } else {
      qb.andWhere('cm.is_active = true');
    }
    return qb.getMany();
  }

  async getCurriculumMapHistory(subjectId: string, classId: string) {
    const schoolId = this.getSchoolId();
    return this.curriculumMapRepo.find({
      where: { school_id: schoolId, subject_id: subjectId, class_id: classId },
      order: { created_at: 'DESC' },
    });
  }

  async restoreCurriculumMap(archivedMapId: string, newAcademicYearId: string, createdBy: string) {
    const schoolId = this.getSchoolId();
    const archived = await this.curriculumMapRepo.findOne({
      where: { school_id: schoolId, id: archivedMapId },
    });
    if (!archived) throw new NotFoundException('Archived curriculum map not found');

    // Archive current active
    await this.curriculumMapRepo.update(
      { school_id: schoolId, subject_id: archived.subject_id, class_id: archived.class_id, is_active: true },
      { is_active: false, archived_at: new Date(), archived_by: createdBy }
    );

    const restored = this.curriculumMapRepo.create({
      school_id: schoolId,
      academic_year_id: newAcademicYearId,
      subject_id: archived.subject_id,
      class_id: archived.class_id,
      board_syllabus_id: archived.board_syllabus_id,
      board_id: archived.board_id,
      textbook_name: archived.textbook_name,
      textbook_author: archived.textbook_author,
      textbook_publisher: archived.textbook_publisher,
      textbook_edition: archived.textbook_edition,
      total_chapters: archived.total_chapters,
      chapter_mappings: archived.chapter_mappings,
      mapped_topics_count: archived.mapped_topics_count,
      total_board_topics: archived.total_board_topics,
      is_active: true,
      restored_from_map_id: archivedMapId,
      created_by: createdBy,
    } as any) as unknown as SchoolCurriculumMap;

    return this.curriculumMapRepo.save(restored);
  }

  async getCurriculumCoverage(subjectId: string, classId: string) {
    const schoolId = this.getSchoolId();
    const activeMap = await this.curriculumMapRepo.findOne({
      where: { school_id: schoolId, subject_id: subjectId, class_id: classId, is_active: true },
    });
    if (!activeMap) throw new NotFoundException('No active curriculum map found');

    const boardSyllabus = await this.boardSyllabusRepo.findOne({
      where: { id: activeMap.board_syllabus_id },
    });

    const mappedTopicIds = new Set<string>();
    activeMap.chapter_mappings.forEach(c =>
      (c.board_topic_ids ?? []).forEach((t: string) => mappedTopicIds.add(t))
    );

    const unmappedTopics = (boardSyllabus?.topics ?? []).filter(
      (t: any) => !mappedTopicIds.has(t.topic_id)
    );

    return {
      textbook: activeMap.textbook_name,
      author: activeMap.textbook_author,
      total_board_topics: activeMap.total_board_topics,
      mapped_topics: activeMap.mapped_topics_count,
      unmapped_topics: unmappedTopics.length,
      coverage_percent: activeMap.total_board_topics > 0
        ? Math.round((activeMap.mapped_topics_count / activeMap.total_board_topics) * 100)
        : 0,
      unmapped_topic_list: unmappedTopics,
    };
  }
}
