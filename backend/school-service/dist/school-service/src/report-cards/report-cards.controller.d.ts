import { ReportCardsService } from './report-cards.service';
export declare class ReportCardsController {
    private readonly reportCardsService;
    constructor(reportCardsService: ReportCardsService);
    generateReportCards(dto: {
        exam_id: string;
        class_id: string;
        section_id?: string;
        force?: boolean;
    }): Promise<{
        message: string;
        total_students: number;
        ranked_students: number;
    }>;
    getClassReportCards(examId: string, classId: string, sectionId: string): Promise<import("@lumiqos/shared/index").ReportCard[]>;
    getStudentReportCards(studentId: string): Promise<import("@lumiqos/shared/index").ReportCard[]>;
}
