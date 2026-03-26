import { Repository } from 'typeorm';
import { Student, StudentEnrollment, StudentAttendance, HomeworkSubmission, ReportCard, ReportCardSubject, AcademicYear } from '@lumiqos/shared/index';
export declare class AiService {
    private readonly studentRepo;
    private readonly enrollmentRepo;
    private readonly attendanceRepo;
    private readonly hwRepo;
    private readonly rcRepo;
    private readonly rcSubjectRepo;
    private readonly yrRepo;
    constructor(studentRepo: Repository<Student>, enrollmentRepo: Repository<StudentEnrollment>, attendanceRepo: Repository<StudentAttendance>, hwRepo: Repository<HomeworkSubmission>, rcRepo: Repository<ReportCard>, rcSubjectRepo: Repository<ReportCardSubject>, yrRepo: Repository<AcademicYear>);
    private getActiveYear;
    private wrapAiResponse;
    getStudentPerformance(studentId: string): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    getClassAnalytics(classId: string, sectionId: string): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    getRiskStudents(): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    generateCurriculum(payload: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    generateAssessment(payload: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
    evaluateHomework(payload: any): Promise<{
        analysis: any;
        confidence_score: number;
        generated_at: string;
        generated_by: string;
    }>;
}
