import { StudentsService } from './students.service';
export declare class StudentsController {
    private readonly studentsService;
    constructor(studentsService: StudentsService);
    createStudent(dto: any): Promise<import("@lumiqos/shared/index").Student>;
    getStudents(): Promise<import("@lumiqos/shared/index").Student[]>;
    getStudentsMicroservice(): Promise<import("@lumiqos/shared/index").Student[]>;
    getStudentById(id: string): Promise<import("@lumiqos/shared/index").Student>;
    updateStudent(id: string, dto: any): Promise<import("@lumiqos/shared/index").Student>;
    deleteStudent(id: string): Promise<{
        message: string;
    }>;
    enrollStudent(dto: any): Promise<import("@lumiqos/shared/index").StudentEnrollment>;
    promoteStudent(dto: {
        student_id: string;
        current_enrollment_id: string;
        target_academic_year_id: string;
        target_class_id: string;
        target_section_id?: string;
        roll_number?: string;
    }): Promise<import("@lumiqos/shared/index").StudentEnrollment>;
    getEnrollments(studentId: string): Promise<import("@lumiqos/shared/index").StudentEnrollment[]>;
    addGuardian(studentId: string, dto: any): Promise<import("@lumiqos/shared/index").StudentGuardian>;
    getGuardians(studentId: string): Promise<import("@lumiqos/shared/index").StudentGuardian[]>;
    uploadDocument(studentId: string, dto: any): Promise<import("@lumiqos/shared/index").StudentDocument>;
    getGamificationProfile(studentId: string): Promise<{
        xp: number;
        level: number;
        streak_days: number;
        skill_tree: any;
    }>;
    getQuests(studentId: string): Promise<import("@lumiqos/shared/index").HomeworkAssignment[]>;
    submitQuest(studentId: string, questId: string, dto: any): Promise<{
        message: string;
        xp_gained: number;
        new_total_xp: number;
        level_up: boolean;
    }>;
}
