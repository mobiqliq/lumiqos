import { Repository } from 'typeorm';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@lumiqos/shared/src/entities/academic-calendar-event.entity';
import { LessonPlan } from '@lumiqos/shared/src/entities/lesson-plan.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { CurriculumPlanItem } from '@lumiqos/shared/src/entities/curriculum-plan-item.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { AiService } from '../ai/ai.service';
export declare class CurriculumService {
    private syllabusRepository;
    private calendarRepository;
    private lessonPlanRepository;
    private mappingRepository;
    private planItemRepository;
    private subjectRepository;
    private schoolRepository;
    private classRepository;
    private teacherSubjectRepository;
    private aiService;
    constructor(syllabusRepository: Repository<Syllabus>, calendarRepository: Repository<AcademicCalendarEvent>, lessonPlanRepository: Repository<LessonPlan>, mappingRepository: Repository<CurriculumMapping>, planItemRepository: Repository<CurriculumPlanItem>, subjectRepository: Repository<Subject>, schoolRepository: Repository<School>, classRepository: Repository<Class>, teacherSubjectRepository: Repository<TeacherSubject>, aiService: AiService);
    getSyllabus(schoolId: string, classId: string): Promise<Syllabus[]>;
    getCalendar(schoolId: string, academicYearId: string): Promise<AcademicCalendarEvent[]>;
    simulateDisruption(schoolId: string, lostDays: number, reason: string): Promise<{
        title: string;
        body: string;
    }>;
    generateLessonPlan(schoolId: string, classId: string, subjectId: string, teacherId: string, topic: string): Promise<LessonPlan>;
    getCalendarSummary(schoolId: string, month: string, year: number): Promise<any[]>;
    getDailyMapping(schoolId: string, date: string): Promise<{
        id: string;
        topic: string;
        status: string;
        subject: Subject;
        planned_date: string;
    }[]>;
    getTeacherCalendar(teacherId: string, schoolId: string, startDate: string, endDate: string): Promise<CurriculumMapping[]>;
    getTeacherAssignments(teacherId: string): Promise<TeacherSubject[]>;
    getSyllabusProgress(schoolId: string, classId: string, subjectId: string): Promise<Syllabus | null>;
    getSyllabusRecommendations(schoolId: string, classId: string, subjectId: string): Promise<{
        recommendedTopic: null;
        currentTopic: null;
        topics: never[];
        progressPercent?: undefined;
        totalUnits?: undefined;
    } | {
        recommendedTopic: string;
        currentTopic: string;
        progressPercent: number;
        totalUnits: number;
        topics: string[];
    }>;
    executeLesson(id: string, topic?: string, lessonPlanId?: string): Promise<CurriculumMapping>;
    getParentInsights(studentId: string): Promise<{
        topic: string;
        subject: string;
        class: string;
        hooks: any;
    }[]>;
    generateAcademicPlan(schoolId: string): Promise<{
        structuralFramework: string;
        boardAlignment: string;
        stages: {
            name: string;
            focus: string;
            periodsPerWeek: number;
        }[];
        subjectWeightage: {
            subject: string;
            weight: string;
            nepGoal: string;
        }[];
        teacherOptimization: {
            ratio: string;
            recommendation: string;
        };
        milestones: {
            term: string;
            goal: string;
        }[];
    }>;
}
