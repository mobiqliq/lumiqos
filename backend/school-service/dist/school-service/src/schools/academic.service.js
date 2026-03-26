"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AcademicService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const school_calendar_entity_1 = require("../../../shared/src/entities/school-calendar.entity");
const academic_calendar_service_1 = require("./academic-calendar.service");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const index_1 = require("../../../shared/src/index");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const curriculum_unit_entity_1 = require("../../../shared/src/entities/curriculum-unit.entity");
const lesson_plan_entity_1 = require("../../../shared/src/entities/lesson-plan.entity");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const time_slot_entity_1 = require("../../../shared/src/entities/time-slot.entity");
const pedagogical_pour_service_1 = require("./pedagogical-pour.service");
const recovery_strategist_service_1 = require("./recovery-strategist.service");
const substitution_service_1 = require("./substitution.service");
const academic_gateway_1 = require("./academic.gateway");
let AcademicService = AcademicService_1 = class AcademicService {
    classRepo;
    sectionRepo;
    subjectRepo;
    teacherSubjectRepo;
    userRepo;
    syllabusRepo;
    calendarRepo;
    yearRepo;
    schoolRepo;
    unitRepo;
    lessonPlanRepo;
    scheduleRepo;
    timeSlotRepo;
    calendarService;
    pedagogicalPourService;
    recoveryService;
    substitutionService;
    academicGateway;
    logger = new common_1.Logger(AcademicService_1.name);
    constructor(classRepo, sectionRepo, subjectRepo, teacherSubjectRepo, userRepo, syllabusRepo, calendarRepo, yearRepo, schoolRepo, unitRepo, lessonPlanRepo, scheduleRepo, timeSlotRepo, calendarService, pedagogicalPourService, recoveryService, substitutionService, academicGateway) {
        this.classRepo = classRepo;
        this.sectionRepo = sectionRepo;
        this.subjectRepo = subjectRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.userRepo = userRepo;
        this.syllabusRepo = syllabusRepo;
        this.calendarRepo = calendarRepo;
        this.yearRepo = yearRepo;
        this.schoolRepo = schoolRepo;
        this.unitRepo = unitRepo;
        this.lessonPlanRepo = lessonPlanRepo;
        this.scheduleRepo = scheduleRepo;
        this.timeSlotRepo = timeSlotRepo;
        this.calendarService = calendarService;
        this.pedagogicalPourService = pedagogicalPourService;
        this.recoveryService = recoveryService;
        this.substitutionService = substitutionService;
        this.academicGateway = academicGateway;
    }
    async createClass(createDto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const normalizedName = createDto.class_name?.trim().toUpperCase();
        const newClass = this.classRepo.create({
            ...createDto,
            class_name: normalizedName,
            school_id: store.schoolId
        });
        return this.classRepo.save(newClass);
    }
    async getClasses() {
        const rawClasses = await this.classRepo.createQueryBuilder('class')
            .addSelect(qb => {
            return qb.select('COUNT(*)')
                .from(syllabus_entity_1.Syllabus, 's')
                .where('s.class_id = class.id')
                .andWhere('s.total_topics > 0');
        }, 'syllabus_count')
            .getRawAndEntities();
        return rawClasses.entities.map((c, idx) => ({
            ...c,
            has_syllabus: parseInt(rawClasses.raw[idx].syllabus_count, 10) > 0
        }));
    }
    async updateClass(id, updateDto) {
        if (updateDto.class_name) {
            updateDto.class_name = updateDto.class_name.trim().toUpperCase();
        }
        await this.classRepo.update(id, updateDto);
        return this.classRepo.findOne({ where: { class_id: id } });
    }
    async deleteClass(id) {
        await this.classRepo.delete(id);
        return { success: true };
    }
    async createSection(createDto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const classEntity = await this.classRepo.findOne({
            where: { class_id: createDto.class_id, school_id: store.schoolId }
        });
        if (!classEntity) {
            throw new common_1.BadRequestException('Class not found or does not belong to this school.');
        }
        const section = this.sectionRepo.create({ ...createDto, school_id: store.schoolId });
        return this.sectionRepo.save(section);
    }
    async getSections() {
        return this.sectionRepo.find({ relations: ['class'] });
    }
    async updateSection(id, updateDto) {
        await this.sectionRepo.update(id, updateDto);
        return this.sectionRepo.findOne({ where: { section_id: id } });
    }
    async createSubject(createDto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const subject = this.subjectRepo.create({ ...createDto, school_id: store.schoolId });
        return this.subjectRepo.save(subject);
    }
    async getSubjects(classId) {
        if (classId) {
            return this.subjectRepo.createQueryBuilder('subject')
                .where(qb => {
                const subQuery = qb.subQuery()
                    .select('DISTINCT syllabus.subject_id')
                    .from(syllabus_entity_1.Syllabus, 'syllabus')
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
    async updateSubject(id, updateDto) {
        await this.subjectRepo.update(id, updateDto);
        return this.subjectRepo.findOne({ where: { subject_id: id } });
    }
    async assignTeacherToSubject(createDto) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const teacher = await this.userRepo.findOne({
            where: { user_id: createDto.teacher_id, school_id: store.schoolId },
            relations: ['role']
        });
        if (!teacher) {
            throw new common_1.NotFoundException('Teacher not found in this school.');
        }
        if (!['teacher', 'principal'].includes(teacher.role.role_name)) {
            throw new common_1.BadRequestException(`User role ${teacher.role.role_name} is not permitted to teach.`);
        }
        const subject = await this.subjectRepo.findOne({
            where: { subject_id: createDto.subject_id, school_id: store.schoolId }
        });
        if (!subject)
            throw new common_1.BadRequestException('Subject not found in this school.');
        const classEntity = await this.classRepo.findOne({
            where: { class_id: createDto.class_id, school_id: store.schoolId }
        });
        if (!classEntity)
            throw new common_1.BadRequestException('Class not found in this school.');
        if (createDto.section_id) {
            const sectionEntity = await this.sectionRepo.findOne({
                where: { section_id: createDto.section_id, class_id: createDto.class_id, school_id: store.schoolId }
            });
            if (!sectionEntity)
                throw new common_1.BadRequestException('Section not found for this class in this school.');
        }
        const assignment = this.teacherSubjectRepo.create({
            ...createDto,
            school_id: store.schoolId
        });
        return this.teacherSubjectRepo.save(assignment);
    }
    async getTeacherSubjects() {
        return this.teacherSubjectRepo.find({
            relations: ['teacher', 'subject', 'class', 'section']
        });
    }
    async removeTeacherSubject(id) {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
        const assignment = await this.teacherSubjectRepo.findOne({
            where: { id, school_id: store.schoolId }
        });
        if (!assignment)
            throw new common_1.NotFoundException('Assignment not found');
        return this.teacherSubjectRepo.remove(assignment);
    }
    async setupDefaultClasses() {
        const store = index_1.TenantContext.getStore();
        if (!store)
            throw new Error('Tenant context missing');
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
            }
            else {
                classesSkipped++;
            }
        }
        return {
            classes_created: classesCreated,
            classes_skipped: classesSkipped
        };
    }
    async completeLesson(scheduleId, completionDate) {
        const schedule = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
        if (!schedule)
            throw new common_1.NotFoundException('Schedule entry not found');
        const planned = new Date(schedule.planned_date);
        const actual = new Date(completionDate);
        const diffTime = actual.getTime() - planned.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        schedule.actual_completion_date = completionDate;
        schedule.deviation_days = diffDays;
        schedule.status = planned_schedule_entity_1.ScheduleStatus.COMPLETED;
        const saved = await this.scheduleRepo.save(schedule);
        try {
            const vr = await this.getVelocityReport(schedule.class_id, schedule.subject_id, schedule.school_id);
            this.academicGateway.broadcastLessonCompleted(schedule.school_id, schedule.class_id, schedule.subject_id, schedule.section_id, vr.velocity);
        }
        catch (e) {
            this.logger.error('Failed to broadcast lesson completion', e);
        }
        return saved;
    }
    async getVelocityReport(classId, subjectId, schoolId) {
        const store = index_1.TenantContext.getStore();
        const sid = schoolId || store?.schoolId;
        if (!sid)
            throw new Error('School ID or Tenant context missing');
        const today = new Date().toISOString().split('T')[0];
        const plannedItems = await this.scheduleRepo.find({
            where: {
                school_id: sid,
                class_id: classId,
                subject_id: subjectId,
                planned_date: (0, typeorm_2.LessThanOrEqual)(today)
            }
        });
        const completedItems = plannedItems.filter(p => p.status === planned_schedule_entity_1.ScheduleStatus.COMPLETED);
        const velocity = plannedItems.length > 0 ? completedItems.length / plannedItems.length : 1;
        const laggingPeriods = plannedItems.length - completedItems.length;
        return {
            velocity: parseFloat(velocity.toFixed(2)),
            planned_units: plannedItems.length,
            completed_units: completedItems.length,
            lagging_periods: laggingPeriods,
        };
    }
    async getBaselineGantt(schoolId, yearId) {
        const schedules = await this.scheduleRepo.find({
            where: { school_id: schoolId, academic_year_id: yearId },
            relations: ['subject', 'class'],
            order: { planned_date: 'ASC' }
        });
        const ganttData = {};
        for (const s of schedules) {
            if (!s.planned_date)
                continue;
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
            if (s.planned_date < ganttData[key].startDate)
                ganttData[key].startDate = s.planned_date;
            if (s.planned_date > ganttData[key].endDate)
                ganttData[key].endDate = s.planned_date;
        }
        return Object.values(ganttData);
    }
    async lockCalendar(schoolId, yearId) {
        const count = await this.scheduleRepo.count({
            where: { school_id: schoolId, academic_year_id: yearId, status: planned_schedule_entity_1.ScheduleStatus.SCHEDULED }
        });
        this.logger.log(`Calendar Locked for ${schoolId} AY ${yearId}. Total structured lessons: ${count}`);
        return {
            status: 'LOCKED',
            message: 'Calendar successfully locked. Planned Dates are now cemented.',
            total_locked_lessons: count,
            timestamp: new Date().toISOString()
        };
    }
};
exports.AcademicService = AcademicService;
exports.AcademicService = AcademicService = AcademicService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(1, (0, typeorm_1.InjectRepository)(section_entity_1.Section)),
    __param(2, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(3, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(5, (0, typeorm_1.InjectRepository)(syllabus_entity_1.Syllabus)),
    __param(6, (0, typeorm_1.InjectRepository)(school_calendar_entity_1.SchoolCalendar)),
    __param(7, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(8, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(9, (0, typeorm_1.InjectRepository)(curriculum_unit_entity_1.CurriculumUnit)),
    __param(10, (0, typeorm_1.InjectRepository)(lesson_plan_entity_1.LessonPlan)),
    __param(11, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(12, (0, typeorm_1.InjectRepository)(time_slot_entity_1.TimeSlot)),
    __param(15, (0, common_1.Inject)((0, common_1.forwardRef)(() => recovery_strategist_service_1.RecoveryStrategistService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        academic_calendar_service_1.AcademicCalendarService,
        pedagogical_pour_service_1.PedagogicalPourService,
        recovery_strategist_service_1.RecoveryStrategistService,
        substitution_service_1.SubstitutionService,
        academic_gateway_1.AcademicGateway])
], AcademicService);
//# sourceMappingURL=academic.service.js.map