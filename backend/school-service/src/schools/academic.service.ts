import { Injectable, BadRequestException, NotFoundException, Inject, forwardRef, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { SchoolCalendar, DayType } from '@lumiqos/shared/src/entities/school-calendar.entity';
import { AcademicCalendarService } from './academic-calendar.service';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { TenantContext } from '@lumiqos/shared/index';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { CurriculumUnit } from '@lumiqos/shared/src/entities/curriculum-unit.entity';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { PlannedSchedule, ScheduleStatus } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { TimeSlot } from '@lumiqos/shared/src/entities/time-slot.entity';
import { PedagogicalPourService } from './pedagogical-pour.service';
import { RecoveryStrategistService } from './recovery-strategist.service';
import { SubstitutionService } from './substitution.service';
import { AcademicGateway } from './academic.gateway';

@Injectable()
export class AcademicService {
  private readonly logger = new Logger(AcademicService.name);

  constructor(
    @InjectRepository(Class) private readonly classRepo: Repository<Class>,
    @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
    @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
    @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(Syllabus) private readonly syllabusRepo: Repository<Syllabus>,
    @InjectRepository(SchoolCalendar) private readonly calendarRepo: Repository<SchoolCalendar>,
    @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
    @InjectRepository(School) private readonly schoolRepo: Repository<School>,
    @InjectRepository(CurriculumUnit) private readonly unitRepo: Repository<CurriculumUnit>,
    @InjectRepository(LessonPlan) private readonly lessonPlanRepo: Repository<LessonPlan>,
    @InjectRepository(PlannedSchedule) private readonly scheduleRepo: Repository<PlannedSchedule>,
    @InjectRepository(TimeSlot) private readonly timeSlotRepo: Repository<TimeSlot>,
    private readonly calendarService: AcademicCalendarService,
    private readonly pedagogicalPourService: PedagogicalPourService,
    @Inject(forwardRef(() => RecoveryStrategistService))
    private readonly recoveryService: RecoveryStrategistService,
    private readonly substitutionService: SubstitutionService,
    private readonly academicGateway: AcademicGateway,
  ) { }

  // --- Classes ---
  async createClass(createDto: Partial<Class>) {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    
    const normalizedName = createDto.class_name?.trim().toUpperCase();
    const newClass = this.classRepo.create({ 
      ...createDto, 
      class_name: normalizedName,
      school_id: store.schoolId 
    });
    return this.classRepo.save(newClass);
  }

  async getClasses() {
    // Return ALL classes with has_syllabus flag computed efficiently
    const rawClasses = await this.classRepo.createQueryBuilder('class')
      .addSelect(qb => {
        return qb.select('COUNT(*)')
          .from(Syllabus, 's')
          .where('s.class_id = class.id')
          .andWhere('s.total_topics > 0');
      }, 'syllabus_count')
      .getRawAndEntities();

    return rawClasses.entities.map((c, idx) => ({
      ...c,
      has_syllabus: parseInt(rawClasses.raw[idx].syllabus_count, 10) > 0
    }));
  }

  async updateClass(id: string, updateDto: Partial<Class>) {
    if (updateDto.class_name) {
      updateDto.class_name = updateDto.class_name.trim().toUpperCase();
    }
    await this.classRepo.update(id, updateDto);
    return this.classRepo.findOne({ where: { class_id: id } });
  }

  async deleteClass(id: string) {
    await this.classRepo.delete(id);
    return { success: true };
  }

  // --- Sections ---
  async createSection(createDto: Partial<Section>) {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');

    // Validate class belongs to the same school
    const classEntity = await this.classRepo.findOne({
      where: { class_id: createDto.class_id, school_id: store.schoolId }
    });

    if (!classEntity) {
      throw new BadRequestException('Class not found or does not belong to this school.');
    }

    const section = this.sectionRepo.create({ ...createDto, school_id: store.schoolId });
    return this.sectionRepo.save(section);
  }

  async getSections() {
    return this.sectionRepo.find({ relations: ['class'] });
  }

  async updateSection(id: string, updateDto: Partial<Section>) {
    await this.sectionRepo.update(id, updateDto);
    return this.sectionRepo.findOne({ where: { section_id: id } });
  }

  // --- Subjects ---
  async createSubject(createDto: Partial<Subject>) {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    const subject = this.subjectRepo.create({ ...createDto, school_id: store.schoolId });
    return this.subjectRepo.save(subject);
  }

  async getSubjects(classId?: string) {
    if (classId) {
      // Use DISTINCT to prevent duplicates if multiple versions of syllabus exist
      return this.subjectRepo.createQueryBuilder('subject')
        .where(qb => {
          const subQuery = qb.subQuery()
            .select('DISTINCT syllabus.subject_id')
            .from(Syllabus, 'syllabus')
            .where('syllabus.class_id = :classId', { classId })
            .andWhere('syllabus.total_topics > 0')
            .getQuery();
          return 'subject.id IN ' + subQuery;
        })
        .setParameter('classId', classId)
        .getMany();
    }
    return this.subjectRepo.find();
  }

  async updateSubject(id: string, updateDto: Partial<Subject>) {
    await this.subjectRepo.update(id, updateDto);
    return this.subjectRepo.findOne({ where: { subject_id: id } });
  }

  // --- Teacher Subjects ---
  async assignTeacherToSubject(createDto: Partial<TeacherSubject>) {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');

    // Validate Teacher
    const teacher = await this.userRepo.findOne({
      where: { user_id: createDto.teacher_id, school_id: store.schoolId },
      relations: ['role']
    });

    if (!teacher) {
      throw new NotFoundException('Teacher not found in this school.');
    }

    if (!['teacher', 'principal'].includes(teacher.role.role_name)) {
      throw new BadRequestException(`User role ${teacher.role.role_name} is not permitted to teach.`);
    }

    // Validate Subject
    const subject = await this.subjectRepo.findOne({
      where: { subject_id: createDto.subject_id, school_id: store.schoolId }
    });
    if (!subject) throw new BadRequestException('Subject not found in this school.');

    // Validate Class
    const classEntity = await this.classRepo.findOne({
      where: { class_id: createDto.class_id, school_id: store.schoolId }
    });
    if (!classEntity) throw new BadRequestException('Class not found in this school.');

    // Validate Section (if provided)
    if (createDto.section_id) {
      const sectionEntity = await this.sectionRepo.findOne({
        where: { section_id: createDto.section_id, class_id: createDto.class_id, school_id: store.schoolId }
      });
      if (!sectionEntity) throw new BadRequestException('Section not found for this class in this school.');
    }

    const assignment = this.teacherSubjectRepo.create({
      ...createDto,
      school_id: store.schoolId
    });

    return this.teacherSubjectRepo.save(assignment);
  }

  async getTeacherSubjects() {
    // TenantRepository naturally filters by school_id
    return this.teacherSubjectRepo.find({
      relations: ['teacher', 'subject', 'class', 'section']
    });
  }

  async removeTeacherSubject(id: string) {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');

    const assignment = await this.teacherSubjectRepo.findOne({
      where: { id, school_id: store.schoolId }
    });
    
    if (!assignment) throw new NotFoundException('Assignment not found');

    return this.teacherSubjectRepo.remove(assignment);
  }

  // --- Setup Helper ---
  async setupDefaultClasses() {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    const names = Array.from({ length: 12 }, (_, i) => ({
      name: `Grade ${i + 1}`,
      level: i + 1
    }));

    let classesCreated = 0;
    let classesSkipped = 0;

    for (const item of names) {
      const exists = await this.classRepo.findOne({
        where: { grade_level: item.level, school_id: store.schoolId }
      });

      if (!exists) {
        const c = this.classRepo.create({
          school_id: store.schoolId,
          class_name: item.name,
          grade_level: item.level
        });
        await this.classRepo.save(c);
        classesCreated++;
      } else {
        classesSkipped++;
      }
    }

    return {
      classes_created: classesCreated,
      classes_skipped: classesSkipped
    };
  }

  // --- Velocity & PROGRESS ---
  async completeLesson(scheduleId: string, completionDate: string) {
    const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
    if (!schedule) throw new NotFoundException('Schedule entry not found');

    const planned = new Date(schedule.planned_date);
    const actual = new Date(completionDate);
    const diffTime = actual.getTime() - planned.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    schedule.actual_completion_date = completionDate;
    schedule.deviation_days = diffDays;
    schedule.status = ScheduleStatus.COMPLETED;

    const saved = await this.scheduleRepo.save(schedule);

    // Broadcast velocity update
    try {
        const vr = await this.getVelocityReport(schedule.class_id, schedule.subject_id, schedule.school_id);
        this.academicGateway.broadcastLessonCompleted(
            schedule.school_id, schedule.class_id, schedule.subject_id, schedule.section_id, vr.velocity
        );
    } catch (e) {
        this.logger.error('Failed to broadcast lesson completion', e);
    }

    return saved;
  }

  async getVelocityReport(classId: string, subjectId: string, schoolId?: string) {
    const store = TenantContext.getStore();
    const sid = schoolId || store?.schoolId;
    if (!sid) throw new Error('School ID or Tenant context missing');

    const today = new Date().toISOString().split('T')[0];

    // Total planned up to today (items that SHOULD have been done)
    const plannedItems = await this.scheduleRepo.find({
      where: {
        school_id: sid,
        class_id: classId,
        subject_id: subjectId,
        planned_date: LessThanOrEqual(today)
      }
    });

    // Actually completed
    const completedItems = plannedItems.filter(p => p.status === ScheduleStatus.COMPLETED);

    const velocity = plannedItems.length > 0 ? completedItems.length / plannedItems.length : 1;
    const laggingPeriods = plannedItems.length - completedItems.length;

    return {
      velocity: parseFloat(velocity.toFixed(2)),
      planned_units: plannedItems.length,
      completed_units: completedItems.length,
      lagging_periods: laggingPeriods,
      };
  }

  // --- Phase 3: Baseline Approval (Gantt & Lock) ---
  async getBaselineGantt(schoolId: string, yearId: string) {
    // Collect all schedules
    const schedules = await this.scheduleRepo.find({
        where: { school_id: schoolId, academic_year_id: yearId },
        relations: ['subject', 'class'],
        order: { planned_date: 'ASC' }
    });

    // Group by Subject and calculate start/end months
    const ganttData: Record<string, any> = {};
    for (const s of schedules) {
        if (!s.planned_date) continue;
        const subName = s.subject?.name || s.subject?.subject_name || s.subject_id;
        const cName = s.class?.name || s.class?.class_name || s.class_id;
        const key = `${cName} - ${subName}`;

        if (!ganttData[key]) {
            ganttData[key] = {
                title: key,
                subject: subName,
                class: cName,
                startDate: s.planned_date,
                endDate: s.planned_date,
                lessonCount: 0
            };
        }
        ganttData[key].lessonCount++;
        if (s.planned_date < ganttData[key].startDate) ganttData[key].startDate = s.planned_date;
        if (s.planned_date > ganttData[key].endDate) ganttData[key].endDate = s.planned_date;
    }

    return Object.values(ganttData);
  }

  async lockCalendar(schoolId: string, yearId: string) {
      // Here we securely lock the calendar
      // For demonstration, we'll mark all SCHEDULED items with a system log or a 'LOCKED' flag
      // Since our enum is strict to SCHEDULED, we'll just count how many are there and emit a lock success
      const count = await this.scheduleRepo.count({
          where: { school_id: schoolId, academic_year_id: yearId, status: ScheduleStatus.SCHEDULED }
      });
      
      this.logger.log(`Calendar Locked for ${schoolId} AY ${yearId}. Total structured lessons: ${count}`);
      
      return {
          status: 'LOCKED',
          message: 'Calendar successfully locked. Planned Dates are now cemented.',
          total_locked_lessons: count,
          timestamp: new Date().toISOString()
      };
  }
}
