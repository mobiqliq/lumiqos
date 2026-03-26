import { Repository, DataSource } from 'typeorm';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { HomeworkAssignment } from '@lumiqos/shared/src/entities/homework-assignment.entity';
import { HomeworkSubmission } from '@lumiqos/shared/src/entities/homework-submission.entity';
import { MessageThread } from '@lumiqos/shared/src/entities/message-thread.entity';
import { Message } from '@lumiqos/shared/src/entities/message.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
export declare class TeacherService {
    private readonly teacherSubjectRepo;
    private readonly homeworkRepo;
    private readonly submissionRepo;
    private readonly threadRepo;
    private readonly messageRepo;
    private readonly attendanceSessionRepo;
    private readonly studentAttendanceRepo;
    private readonly enrollmentRepo;
    private readonly academicYearRepo;
    private readonly userRepo;
    private dataSource;
    constructor(teacherSubjectRepo: Repository<TeacherSubject>, homeworkRepo: Repository<HomeworkAssignment>, submissionRepo: Repository<HomeworkSubmission>, threadRepo: Repository<MessageThread>, messageRepo: Repository<Message>, attendanceSessionRepo: Repository<AttendanceSession>, studentAttendanceRepo: Repository<StudentAttendance>, enrollmentRepo: Repository<StudentEnrollment>, academicYearRepo: Repository<AcademicYear>, userRepo: Repository<User>, dataSource: DataSource);
    getDashboard(teacherId: string): Promise<{
        today_schedule: {
            class_name: string;
            section_name: string;
            subject_name: string;
        }[];
        pending_homework_reviews: number;
        pending_grading: number;
        unread_parent_messages: number;
    }>;
    getClasses(teacherId: string): Promise<{
        class_id: string;
        section_id: string;
        subject_id: string;
        class_name: string;
        section_name: string;
        subject_name: string;
    }[]>;
    submitQuickAttendance(teacherId: string, payload: any): Promise<{
        message: string;
        total_students_processed: number;
    }>;
    assignQuickHomework(teacherId: string, payload: any): Promise<{
        message: string;
        homework_id: string;
    }>;
    getHomeworkSubmissions(teacherId: string, limit?: number, offset?: number): Promise<HomeworkSubmission[]>;
    submitGrade(teacherId: string, payload: any): Promise<{
        message: string;
    }>;
    getMessages(teacherId: string): Promise<{
        thread_id: string;
        student_name: string;
        latest_message: any;
        last_updated: any;
    }[]>;
    getTeachers(schoolId: string): Promise<User[]>;
}
