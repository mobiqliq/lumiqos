import { Repository } from 'typeorm';
import { ExamType } from '@lumiqos/shared/src/entities/exam-type.entity';
import { Exam } from '@lumiqos/shared/src/entities/exam.entity';
import { ExamSubject } from '@lumiqos/shared/src/entities/exam-subject.entity';
import { StudentMarks } from '@lumiqos/shared/src/entities/student-marks.entity';
import { GradeScale } from '@lumiqos/shared/src/entities/grade-scale.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { AiService } from '../ai/ai.service';
export declare class ExamsService {
    private readonly examTypeRepo;
    private readonly examRepo;
    private readonly examSubjectRepo;
    private readonly studentMarksRepo;
    private readonly gradeScaleRepo;
    private readonly enrollmentRepo;
    private aiService;
    constructor(examTypeRepo: Repository<ExamType>, examRepo: Repository<Exam>, examSubjectRepo: Repository<ExamSubject>, studentMarksRepo: Repository<StudentMarks>, gradeScaleRepo: Repository<GradeScale>, enrollmentRepo: Repository<StudentEnrollment>, aiService: AiService);
    createExamType(dto: Partial<ExamType>): Promise<ExamType>;
    getExamTypes(): Promise<ExamType[]>;
    createExam(dto: Partial<Exam>): Promise<Exam>;
    getExams(): Promise<Exam[]>;
    assignSubject(dto: Partial<ExamSubject>): Promise<ExamSubject>;
    createGradeScale(dto: Partial<GradeScale>): Promise<GradeScale>;
    private calculateGrade;
    enterBulkMarks(examSubjectId: string, records: {
        student_id: string;
        marks_obtained: number | null;
        remarks?: string;
    }[]): Promise<{
        message: string;
        count: number;
    }>;
    getResults(examId: string, classId: string, sectionId?: string): Promise<StudentMarks[]>;
    getStudentHistory(studentId: string): Promise<StudentMarks[]>;
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
}
