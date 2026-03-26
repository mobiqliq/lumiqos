import { ExamsService } from './exams.service';
export declare class ExamsController {
    private readonly examsService;
    constructor(examsService: ExamsService);
    createExamType(dto: any): Promise<import("@lumiqos/shared/index").ExamType>;
    getExamTypes(): Promise<import("@lumiqos/shared/index").ExamType[]>;
    createExam(dto: any): Promise<import("@lumiqos/shared/index").Exam>;
    getExams(): Promise<import("@lumiqos/shared/index").Exam[]>;
    assignSubject(dto: any): Promise<import("@lumiqos/shared/index").ExamSubject>;
    enterBulkMarks(dto: any): Promise<{
        message: string;
        count: number;
    }>;
    getResults(examId: string, classId: string, sectionId: string): Promise<import("@lumiqos/shared/index").StudentMarks[]>;
    getStudentHistory(studentId: string): Promise<import("@lumiqos/shared/index").StudentMarks[]>;
    createGradeScale(dto: any): Promise<import("@lumiqos/shared/index").GradeScale>;
    generateExam(dto: {
        board: string;
        subject: string;
        classLevel: string;
        type: string;
    }): Promise<{
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
}
