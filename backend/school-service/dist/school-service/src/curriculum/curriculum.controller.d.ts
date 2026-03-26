import { CurriculumService } from './curriculum.service';
export declare class CurriculumController {
    private readonly curriculumService;
    constructor(curriculumService: CurriculumService);
    getSyllabus(schoolId: string, classId: string): Promise<import("@lumiqos/shared/index").Syllabus[]>;
    getCalendar(schoolId: string, academicYearId: string): Promise<import("@lumiqos/shared/index").AcademicCalendarEvent[]>;
    simulateDisruption(body: {
        schoolId: string;
        lostDays: number;
        reason: string;
    }): Promise<{
        title: string;
        body: string;
    }>;
    getCalendarSummaryHttp(schoolId: string, month: string, year: string): Promise<any[]>;
    getDailyMappingHttp(schoolId: string, date: string): Promise<{
        id: string;
        topic: string;
        status: string;
        subject: import("@lumiqos/shared/index").Subject;
        planned_date: string;
    }[]>;
    getCalendarSummary(data: any): Promise<any[]>;
    getDailyMapping(data: any): Promise<{
        id: string;
        topic: string;
        status: string;
        subject: import("@lumiqos/shared/index").Subject;
        planned_date: string;
    }[]>;
    generateLessonPlan(body: any, req: any): Promise<import("@lumiqos/shared/index").LessonPlan>;
    generateLessonPlanTcp(data: any): Promise<import("@lumiqos/shared/index").LessonPlan>;
    getTeacherAssignments(req: any, tId?: string): Promise<import("@lumiqos/shared/index").TeacherSubject[]>;
    getSyllabusRecommendations(classId: string, subjectId: string, req: any): Promise<{
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
    executeLesson(id: string, body: {
        topic?: string;
        lessonPlanId?: string;
    }): Promise<import("@lumiqos/shared/index").CurriculumMapping>;
    getParentInsights(studentId: string): Promise<{
        topic: string;
        subject: string;
        class: string;
        hooks: any;
    }[]>;
    generateAcademicPlan(req: any): Promise<{
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
