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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurriculumService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const academic_calendar_event_entity_1 = require("../../../shared/src/entities/academic-calendar-event.entity");
const lesson_plan_entity_1 = require("../../../shared/src/entities/lesson-plan.entity");
const curriculum_mapping_entity_1 = require("../../../shared/src/entities/curriculum-mapping.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const school_entity_1 = require("../../../shared/src/entities/school.entity");
const curriculum_plan_item_entity_1 = require("../../../shared/src/entities/curriculum-plan-item.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const ai_service_1 = require("../ai/ai.service");
let CurriculumService = class CurriculumService {
    syllabusRepository;
    calendarRepository;
    lessonPlanRepository;
    mappingRepository;
    planItemRepository;
    subjectRepository;
    schoolRepository;
    classRepository;
    teacherSubjectRepository;
    aiService;
    constructor(syllabusRepository, calendarRepository, lessonPlanRepository, mappingRepository, planItemRepository, subjectRepository, schoolRepository, classRepository, teacherSubjectRepository, aiService) {
        this.syllabusRepository = syllabusRepository;
        this.calendarRepository = calendarRepository;
        this.lessonPlanRepository = lessonPlanRepository;
        this.mappingRepository = mappingRepository;
        this.planItemRepository = planItemRepository;
        this.subjectRepository = subjectRepository;
        this.schoolRepository = schoolRepository;
        this.classRepository = classRepository;
        this.teacherSubjectRepository = teacherSubjectRepository;
        this.aiService = aiService;
    }
    async getSyllabus(schoolId, classId) {
        return this.syllabusRepository.find({
            where: { school_id: schoolId, class_id: classId },
            relations: ['subject']
        });
    }
    async getCalendar(schoolId, academicYearId) {
        return this.calendarRepository.find({
            where: { school_id: schoolId, academic_year_id: academicYearId },
            order: { created_at: 'ASC' }
        });
    }
    async simulateDisruption(schoolId, lostDays, reason) {
        return this.aiService.generateCurriculumRefactoring(lostDays, reason);
    }
    async generateLessonPlan(schoolId, classId, subjectId, teacherId, topic) {
        const subject = subjectId ? await this.subjectRepository.findOne({ where: { id: subjectId } }) : null;
        const school = schoolId ? await this.schoolRepository.findOne({ where: { id: schoolId } }) : null;
        const targetClass = classId ? await this.classRepository.findOne({ where: { id: classId } }) : null;
        const subjectName = subject ? subject.name : 'Mathematics';
        const board = school ? (school.board || 'CBSE') : 'CBSE';
        const grade = targetClass ? (targetClass.grade_level || 10) : 10;
        const planData = await this.aiService.generateLessonPlan(subjectName, topic, grade, board);
        const lessonPlan = this.lessonPlanRepository.create({
            school_id: schoolId,
            class_id: classId,
            subject_id: subjectId,
            teacher_id: teacherId,
            title: topic,
            estimated_minutes: 45,
            plan_data: planData
        });
        return this.lessonPlanRepository.save(lessonPlan);
    }
    async getCalendarSummary(schoolId, month, year) {
        const monthInt = parseInt(month, 10);
        const startDate = `${year}-${month.padStart(2, '0')}-01`;
        const lastDay = new Date(year, monthInt, 0).getDate();
        const endDate = `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
        const today = new Date().toISOString().split('T')[0];
        const items = await this.planItemRepository.createQueryBuilder('item')
            .innerJoin('item.plan', 'plan')
            .select("TO_CHAR(item.planned_date, 'YYYY-MM-DD')", 'date')
            .addSelect('item.status', 'status')
            .where('plan.school_id = :schoolId', { schoolId })
            .andWhere('item.planned_date BETWEEN :startDate AND :endDate', { startDate, endDate })
            .getRawMany();
        const dailyData = {};
        items.forEach(item => {
            const date = item.date;
            if (!dailyData[date]) {
                dailyData[date] = { date, completed: 0, pending: 0, missed: 0, unitCount: 0 };
            }
            const isMissed = item.status === 'pending' && item.date < today;
            if (isMissed) {
                dailyData[date].missed++;
            }
            else if (item.status === 'completed') {
                dailyData[date].completed++;
            }
            else {
                dailyData[date].pending++;
            }
            dailyData[date].unitCount++;
        });
        return Object.values(dailyData);
    }
    async getDailyMapping(schoolId, date) {
        const today = new Date().toISOString().split('T')[0];
        const planItems = await this.planItemRepository.find({
            where: { planned_date: date },
            relations: ['plan', 'syllabus', 'syllabus.subject']
        });
        return planItems.filter(i => i.plan.school_id === schoolId).map(item => ({
            id: item.id,
            topic: item.syllabus?.current_topic || 'Planned Topic',
            status: (item.status === 'pending' && item.planned_date < today) ? 'MISSED' : item.status.toUpperCase(),
            subject: item.syllabus?.subject,
            planned_date: item.planned_date,
        }));
    }
    async getTeacherCalendar(teacherId, schoolId, startDate, endDate) {
        return this.mappingRepository.find({
            where: {
                school_id: schoolId,
                teacher_id: teacherId,
                mapping_date: (0, typeorm_2.Between)(startDate, endDate)
            },
            relations: ['class', 'subject', 'lessonPlan']
        });
    }
    async getTeacherAssignments(teacherId) {
        return this.teacherSubjectRepository.find({
            where: { teacher_id: teacherId },
            relations: ['class', 'subject', 'section']
        });
    }
    async getSyllabusProgress(schoolId, classId, subjectId) {
        return this.syllabusRepository.findOne({
            where: { school_id: schoolId, class_id: classId, subject_id: subjectId },
            relations: ['subject', 'class']
        });
    }
    async getSyllabusRecommendations(schoolId, classId, subjectId) {
        const syllabus = await this.getSyllabusProgress(schoolId, classId, subjectId);
        if (!syllabus)
            return { recommendedTopic: null, currentTopic: null, topics: [] };
        const topics = [
            syllabus.current_topic || 'Introduction',
            'Module 2: Advanced Applications',
            'Module 3: Critical Analysis',
            'Final Assessment Prep'
        ];
        return {
            recommendedTopic: syllabus.current_topic || 'Introduction',
            currentTopic: syllabus.current_topic,
            progressPercent: 15,
            totalUnits: syllabus.units,
            topics
        };
    }
    async executeLesson(id, topic, lessonPlanId) {
        let mapping = await this.mappingRepository.findOne({
            where: { id },
            relations: ['lessonPlan']
        });
        if (!mapping) {
            const assignment = await this.teacherSubjectRepository.findOne({
                where: { id },
                relations: ['class', 'subject']
            });
            if (assignment) {
                const today = new Date().toISOString().split('T')[0];
                mapping = await this.mappingRepository.findOne({
                    where: {
                        school_id: assignment.school_id,
                        class_id: assignment.class_id,
                        subject_id: assignment.subject_id,
                        mapping_date: today
                    }
                });
                if (!mapping) {
                    mapping = this.mappingRepository.create({
                        school_id: assignment.school_id,
                        class_id: assignment.class_id,
                        subject_id: assignment.subject_id,
                        teacher_id: assignment.teacher_id,
                        mapping_date: today,
                        topic: topic || 'Unplanned Lesson',
                        status: 'scheduled',
                        lesson_plan_id: lessonPlanId
                    });
                    await this.mappingRepository.save(mapping);
                }
            }
        }
        if (!mapping)
            throw new Error('Lesson context not found for execution');
        mapping.status = 'completed';
        if (topic)
            mapping.topic = topic;
        if (lessonPlanId)
            mapping.lesson_plan_id = lessonPlanId;
        await this.mappingRepository.save(mapping);
        const syllabus = await this.syllabusRepository.findOne({
            where: { school_id: mapping.school_id, class_id: mapping.class_id, subject_id: mapping.subject_id }
        });
        if (syllabus) {
            syllabus.current_topic = `Module ${mapping.unit_number + 1}: Next Steps`;
            await this.syllabusRepository.save(syllabus);
        }
        return mapping;
    }
    async getParentInsights(studentId) {
        const enrollments = await this.teacherSubjectRepository.query(`SELECT class_id FROM student_enrollment WHERE student_id = $1 AND status = 'active' LIMIT 1`, [studentId]);
        if (enrollments.length === 0)
            return [];
        const classId = enrollments[0].class_id;
        const recentLessons = await this.mappingRepository.find({
            where: { class_id: classId, status: 'completed' },
            relations: ['lessonPlan', 'subject', 'class'],
            order: { updated_at: 'DESC' },
            take: 3
        });
        return recentLessons.map(lesson => ({
            topic: lesson.topic,
            subject: lesson.subject.name,
            class: lesson.class.name,
            hooks: lesson.lessonPlan?.plan_data?.kitchenTableHooks || []
        }));
    }
    async generateAcademicPlan(schoolId) {
        const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
        if (!school)
            throw new common_1.NotFoundException('School not found');
        const subjects = await this.subjectRepository.find({ where: { school_id: schoolId } });
        const teacherSubjects = await this.teacherSubjectRepository.find({ where: { school_id: schoolId } });
        const classes = await this.classRepository.find({ where: { school_id: schoolId } });
        const uniqueTeachers = new Set(teacherSubjects.map(ts => ts.teacher_id));
        const planData = await this.aiService.generateAcademicPlan(school.board || 'CBSE', 'K-12 Academy', uniqueTeachers.size || 1, subjects.map(s => s.name));
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const mappingsToSave = [];
        for (let i = 1; i <= 30; i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const randomTeacherId = Array.from(uniqueTeachers)[0] || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';
            if (randomSubject && randomClass) {
                mappingsToSave.push(this.mappingRepository.create({
                    school_id: schoolId,
                    class_id: randomClass.id,
                    subject_id: randomSubject.id,
                    teacher_id: randomTeacherId,
                    mapping_date: dateStr,
                    topic: `NEP-Aligned ${randomSubject.name} - Unit ${Math.floor(i / 5) + 1}`,
                    unit_number: Math.floor(i / 5) + 1,
                    status: 'scheduled'
                }));
            }
        }
        if (mappingsToSave.length > 0) {
            await this.mappingRepository.save(mappingsToSave);
        }
        return planData;
    }
};
exports.CurriculumService = CurriculumService;
exports.CurriculumService = CurriculumService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(syllabus_entity_1.Syllabus)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_calendar_event_entity_1.AcademicCalendarEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(lesson_plan_entity_1.LessonPlan)),
    __param(3, (0, typeorm_1.InjectRepository)(curriculum_mapping_entity_1.CurriculumMapping)),
    __param(4, (0, typeorm_1.InjectRepository)(curriculum_plan_item_entity_1.CurriculumPlanItem)),
    __param(5, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(6, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(7, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(8, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        ai_service_1.AiService])
], CurriculumService);
//# sourceMappingURL=curriculum.service.js.map