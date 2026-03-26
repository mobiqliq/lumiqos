import { Repository } from 'typeorm';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
export declare class HomeworkService {
    private readonly assignmentRepo;
    private readonly submissionRepo;
    private readonly enrollmentRepo;
    constructor(assignmentRepo: Repository<HomeworkAssignment>, submissionRepo: Repository<HomeworkSubmission>, enrollmentRepo: Repository<StudentEnrollment>);
    createHomework(dto: Partial<HomeworkAssignment>): Promise<HomeworkAssignment>;
    updateHomework(id: string, dto: Partial<HomeworkAssignment>): Promise<HomeworkAssignment | null>;
    getHomeworkForClass(classId: string, sectionId: string): Promise<HomeworkAssignment[]>;
    submitHomework(dto: Partial<HomeworkSubmission>): Promise<HomeworkSubmission | null>;
    gradeHomework(submissionId: string, grade: string, feedback: string): Promise<HomeworkSubmission | null>;
    getCompletionMetrics(homeworkId: string): Promise<{
        total_students: number;
        submitted: number;
        missing: number;
        completion_percentage: number;
    }>;
}
