export declare class AiService {
    private readonly logger;
    generateLessonPlan(subject: string, topic: string, grade: number, board: string): Promise<any>;
    generateExam(board: string, subject: string, classLevel: string, type: string): Promise<{
        status: string;
        alignment: string;
        bloomsTaxonomySpan: string[];
        sections: {
            name: string;
            marks: number;
            type: string;
            questions: number;
        }[];
    }>;
    generateCurriculumRefactoring(lostDays: number, reason: string): Promise<{
        title: string;
        body: string;
    }>;
    generateSubstituteAllocation(absentTeacherId: string, periods: any[]): Promise<{
        status: string;
        allocated: {
            period: any;
            class: any;
            subject: any;
            original_teacher: string;
            allocated_substitute: string;
            substitute_id: string | null;
            match_confidence: string;
        }[];
    }>;
    generateAttendanceInsights(data: {
        dailyAvg: number;
        weeklyTrend: number[];
        mostAbsentDay: string;
    }): Promise<{
        summary: string;
        insight: string;
        prediction: string;
    }>;
    generateAcademicPlan(board: string, schoolType: string, totalTeachers: number, subjects: string[]): Promise<{
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
