import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Syllabus } from '@xceliqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@xceliqos/shared/src/entities/academic-calendar-event.entity';
import { LessonPlan } from '@xceliqos/shared/src/entities/lesson-plan.entity';
import { CurriculumMapping } from '@xceliqos/shared/src/entities/curriculum-mapping.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { CurriculumPlanItem } from '@xceliqos/shared/src/entities/curriculum-plan-item.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { TeacherSubject } from '@xceliqos/shared/src/entities/teacher-subject.entity';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CurriculumService {
    constructor(
        @InjectRepository(Syllabus)
        private syllabusRepository: Repository<Syllabus>,
        @InjectRepository(AcademicCalendarEvent)
        private calendarRepository: Repository<AcademicCalendarEvent>,
        @InjectRepository(LessonPlan)
        private lessonPlanRepository: Repository<LessonPlan>,
        @InjectRepository(CurriculumMapping)
        private mappingRepository: Repository<CurriculumMapping>,
        @InjectRepository(CurriculumPlanItem)
        private planItemRepository: Repository<CurriculumPlanItem>,
        @InjectRepository(Subject)
        private subjectRepository: Repository<Subject>,
        @InjectRepository(School)
        private schoolRepository: Repository<School>,
        @InjectRepository(Class)
        private classRepository: Repository<Class>,
        @InjectRepository(TeacherSubject)
        private teacherSubjectRepository: Repository<TeacherSubject>,
        private aiService: AiService,
    ) { }

    async getSyllabus(schoolId: string, classId: string) {
        return this.syllabusRepository.find({
            where: { school_id: schoolId, class_id: classId },
            relations: ['subject']
        });
    }

    async getCalendar(schoolId: string, academicYearId: string) {
        return this.calendarRepository.find({
            where: { school_id: schoolId, academic_year_id: academicYearId },
            order: { created_at: 'ASC' }
        });
    }

    async simulateDisruption(schoolId: string, lostDays: number, reason: string) {
        // In a real scenario, this would update the actual calendar rows
        // For now, we call the AI structural planner
        return this.aiService.generateCurriculumRefactoring(lostDays, reason);
    }

    async generateLessonPlan(schoolId: string, classId: string, subjectId: string, teacherId: string, topic: string) {
        // 1. Fetch Context
        const subject = subjectId ? await this.subjectRepository.findOne({ where: { id: subjectId } }) : null;
        const school = schoolId ? await this.schoolRepository.findOne({ where: { id: schoolId } }) : null;
        const targetClass = classId ? await this.classRepository.findOne({ where: { id: classId } }) : null;

        const subjectName = subject ? subject.name : 'Mathematics';
        const board = school ? (school.board || 'CBSE') : 'CBSE';
        const grade = targetClass ? (targetClass.grade_level || 10) : 10;

        // 2. Call AI with full context
        const planData = await this.aiService.generateLessonPlan(subjectName, topic, grade, board);

        // Save to Database
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

    async getCalendarSummary(schoolId: string, month: string, year: number) {
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

        const dailyData: Record<string, any> = {};

        items.forEach(item => {
            const date = item.date;
            if (!dailyData[date]) {
                dailyData[date] = { date, completed: 0, pending: 0, missed: 0, unitCount: 0 };
            }
            
            const isMissed = item.status === 'pending' && item.date < today;
            if (isMissed) {
                dailyData[date].missed++;
            } else if (item.status === 'completed') {
                dailyData[date].completed++;
            } else {
                dailyData[date].pending++;
            }
            dailyData[date].unitCount++;
        });

        return Object.values(dailyData);
    }

    async getDailyMapping(schoolId: string, date: string) {
        const today = new Date().toISOString().split('T')[0];
        
        const planItems = await this.planItemRepository.find({
            where: { planned_date: date },
            relations: ['plan', 'syllabus', 'syllabus.subject']
        });

        // Map Orchestrator items to the format expected by the frontend
        return planItems.filter(i => i.plan.school_id === schoolId).map(item => ({
            id: item.id,
            topic: item.syllabus?.current_topic || 'Planned Topic',
            status: (item.status === 'pending' && item.planned_date < today) ? 'MISSED' : item.status.toUpperCase(),
            subject: item.syllabus?.subject,
            planned_date: item.planned_date,
            // Add suggestion logic here if needed for backend-driven suggestions
        }));
    }

    async getTeacherCalendar(teacherId: string, schoolId: string, startDate: string, endDate: string) {
        return this.mappingRepository.find({
            where: {
                school_id: schoolId,
                teacher_id: teacherId,
                mapping_date: Between(startDate, endDate)
            },
            relations: ['class', 'subject', 'lessonPlan']
        });
    }

    async getTeacherAssignments(teacherId: string) {
        return this.teacherSubjectRepository.find({
            where: { teacher_id: teacherId },
            relations: ['class', 'subject', 'section']
        });
    }

    async getSyllabusProgress(schoolId: string, classId: string, subjectId: string) {
        return this.syllabusRepository.findOne({
            where: { school_id: schoolId, class_id: classId, subject_id: subjectId },
            relations: ['subject', 'class']
        });
    }

    async getSyllabusRecommendations(schoolId: string, classId: string, subjectId: string) {
        const syllabus = await this.getSyllabusProgress(schoolId, classId, subjectId);
        if (!syllabus) return { recommendedTopic: null, currentTopic: null, topics: [] };

        // Real topics would come from a JSON field or separate table. 
        // For this demo, we'll generate a realistic module list based on the subject name if missing.
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

    async executeLesson(id: string, topic?: string, lessonPlanId?: string) {
        // The ID could be a CurriculumMapping ID or a TeacherSubject ID
        let mapping = await this.mappingRepository.findOne({
            where: { id },
            relations: ['lessonPlan']
        });

        if (!mapping) {
            // Fallback: Check if it's a TeacherSubject assignment
            const assignment = await this.teacherSubjectRepository.findOne({
                where: { id },
                relations: ['class', 'subject']
            });

            if (assignment) {
                // Find or create today's mapping
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

        if (!mapping) throw new Error('Lesson context not found for execution');

        // 1. Update status to completed
        mapping.status = 'completed';
        if (topic) mapping.topic = topic;
        if (lessonPlanId) mapping.lesson_plan_id = lessonPlanId;
        await this.mappingRepository.save(mapping);

        // 2. Update Syllabus current_topic to indicate progress
        const syllabus = await this.syllabusRepository.findOne({
            where: { school_id: mapping.school_id, class_id: mapping.class_id, subject_id: mapping.subject_id }
        });

        if (syllabus) {
            syllabus.current_topic = `Module ${mapping.unit_number + 1}: Next Steps`;
            await this.syllabusRepository.save(syllabus);
        }

        return mapping;
    }

    async getParentInsights(studentId: string) {
        // Find recent completed mappings for the student's class
        const enrollments = await this.teacherSubjectRepository.query(
            `SELECT class_id FROM student_enrollment WHERE student_id = $1 AND status = 'active' LIMIT 1`,
            [studentId]
        );

        if (enrollments.length === 0) return [];
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

    async generateAcademicPlan(schoolId: string) {
        const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
        if (!school) throw new NotFoundException('School not found');

        const subjects = await this.subjectRepository.find({ where: { school_id: schoolId } });
        const teacherSubjects = await this.teacherSubjectRepository.find({ where: { school_id: schoolId } });
        const classes = await this.classRepository.find({ where: { school_id: schoolId } });
        
        const uniqueTeachers = new Set(teacherSubjects.map(ts => ts.teacher_id));

        const planData = await this.aiService.generateAcademicPlan(
            school.board || 'CBSE',
            'K-12 Academy',
            uniqueTeachers.size || 1,
            subjects.map(s => s.name)
        );

        // PERSISTENCE: Populate the calendar with sample mappings for the current month
        // to demonstrate the "Intelligence Calendar" population.
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const mappingsToSave: CurriculumMapping[] = [];

        for (let i = 1; i <= 30; i++) {
            const date = new Date(year, month, i);
            const dateStr = date.toISOString().split('T')[0];
            
            // For each day, pick a random subject and class to populate
            const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const randomTeacherId = Array.from(uniqueTeachers)[0] as string || '1dc69606-ae8e-46df-8f9d-2ee971e391a0';

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
}


