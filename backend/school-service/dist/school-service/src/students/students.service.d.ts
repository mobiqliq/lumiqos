import { Repository } from 'typeorm';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { StudentGuardian } from '@lumiqos/shared/src/entities/student-guardian.entity';
import { StudentDocument } from '@lumiqos/shared/src/entities/student-document.entity';
import { StudentHealthRecord } from '@lumiqos/shared/src/entities/student-health-record.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
export declare class StudentsService {
    private readonly studentRepo;
    private readonly enrollmentRepo;
    private readonly guardianRepo;
    private readonly documentRepo;
    private readonly healthRepo;
    private readonly yearRepo;
    private readonly classRepo;
    private readonly sectionRepo;
    private readonly questRepo;
    private readonly submissionRepo;
    constructor(studentRepo: Repository<Student>, enrollmentRepo: Repository<StudentEnrollment>, guardianRepo: Repository<StudentGuardian>, documentRepo: Repository<StudentDocument>, healthRepo: Repository<StudentHealthRecord>, yearRepo: Repository<AcademicYear>, classRepo: Repository<Class>, sectionRepo: Repository<Section>, questRepo: Repository<HomeworkAssignment>, submissionRepo: Repository<HomeworkSubmission>);
    createStudent(createDto: Partial<Student>): Promise<Student>;
    getStudents(): Promise<Student[]>;
    getStudentById(id: string): Promise<Student>;
    updateStudent(id: string, updateDto: Partial<Student>): Promise<Student>;
    deleteStudent(id: string): Promise<{
        message: string;
    }>;
    enrollStudent(createDto: Partial<StudentEnrollment>): Promise<StudentEnrollment>;
    promoteStudent(studentId: string, currentEnrollmentId: string, payload: {
        target_academic_year_id: string;
        target_class_id: string;
        target_section_id?: string;
        roll_number?: string;
    }): Promise<StudentEnrollment>;
    private enrollmentUniqueCheckAndCreate;
    getEnrollmentsForStudent(studentId: string): Promise<StudentEnrollment[]>;
    addGuardian(studentId: string, createDto: Partial<StudentGuardian>): Promise<StudentGuardian>;
    getGuardians(studentId: string): Promise<StudentGuardian[]>;
    uploadDocument(studentId: string, createDto: Partial<StudentDocument>): Promise<StudentDocument>;
    getGamificationProfile(studentId: string): Promise<{
        xp: number;
        level: number;
        streak_days: number;
        skill_tree: any;
    }>;
    getQuests(studentId: string): Promise<HomeworkAssignment[]>;
    submitQuest(studentId: string, questId: string, payload: any): Promise<{
        message: string;
        xp_gained: number;
        new_total_xp: number;
        level_up: boolean;
    }>;
}
