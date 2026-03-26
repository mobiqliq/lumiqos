import { Repository } from 'typeorm';
import { ReportCard } from '@lumiqos/shared/src/entities/report-card.entity';
import { ReportCardSubject } from '@lumiqos/shared/src/entities/report-card-subject.entity';
import { ExamSubject } from '@lumiqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@lumiqos/shared/src/entities/student-marks.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { GradeScale } from '@lumiqos/shared/src/entities/grade-scale.entity';
export declare class ReportCardsService {
    private readonly reportCardRepo;
    private readonly reportCardSubjectRepo;
    private readonly examSubjectRepo;
    private readonly studentMarksRepo;
    private readonly enrollmentRepo;
    private readonly gradeScaleRepo;
    constructor(reportCardRepo: Repository<ReportCard>, reportCardSubjectRepo: Repository<ReportCardSubject>, examSubjectRepo: Repository<ExamSubject>, studentMarksRepo: Repository<StudentMarks>, enrollmentRepo: Repository<StudentEnrollment>, gradeScaleRepo: Repository<GradeScale>);
    generateReportCards(examId: string, classId: string, sectionId: string | undefined, force: boolean): Promise<{
        message: string;
        total_students: number;
        ranked_students: number;
    }>;
    private calculateGrade;
    getClassReportCards(examId: string, classId: string, sectionId?: string): Promise<ReportCard[]>;
    getStudentReportCards(studentId: string): Promise<ReportCard[]>;
}
