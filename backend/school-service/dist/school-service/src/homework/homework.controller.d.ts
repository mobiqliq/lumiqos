import { HomeworkService } from './homework.service';
export declare class HomeworkController {
    private readonly homeworkService;
    constructor(homeworkService: HomeworkService);
    createHomework(dto: any): Promise<import("@lumiqos/shared/index").HomeworkAssignment>;
    updateHomework(id: string, dto: any): Promise<import("@lumiqos/shared/index").HomeworkAssignment | null>;
    getHomeworkForClass(classId: string, sectionId: string): Promise<import("@lumiqos/shared/index").HomeworkAssignment[]>;
    submitHomework(dto: any): Promise<import("@lumiqos/shared/index").HomeworkSubmission | null>;
    gradeHomework(dto: any): Promise<import("@lumiqos/shared/index").HomeworkSubmission | null>;
    getCompletionMetrics(homeworkId: string): Promise<{
        total_students: number;
        submitted: number;
        missing: number;
        completion_percentage: number;
    }>;
}
