import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { AiService } from '../ai/ai.service';
export declare class AttendanceService {
    private readonly sessionRepo;
    private readonly attendanceRepo;
    private readonly enrollmentRepo;
    private eventEmitter;
    private aiService;
    constructor(sessionRepo: Repository<AttendanceSession>, attendanceRepo: Repository<StudentAttendance>, enrollmentRepo: Repository<StudentEnrollment>, eventEmitter: EventEmitter2, aiService: AiService);
    createSession(dto: Partial<AttendanceSession>): Promise<{
        message: string;
        session_id: string;
        students_count: number;
    }>;
    markAttendance(sessionId: string, records: {
        student_id: string;
        status: string;
        remarks?: string;
    }[]): Promise<{
        message: string;
    }>;
    getClassAttendance(classId: string, sectionId: string, date: string): Promise<StudentAttendance[]>;
    getStudentAttendance(studentId: string): Promise<StudentAttendance[]>;
    getAttendanceAnalytics(teacherId: string, classId: string): Promise<{
        aiInsights: {
            summary: string;
            insight: string;
            prediction: string;
        };
        dailyAvg: number;
        weeklyTrend: number[];
        mostAbsentDay: string;
    }>;
    getSchoolOverview(schoolId: string): Promise<{
        todayPresence: string;
        monthlyAvg: string;
        criticalClasses: {
            class: string;
            attendance: string;
            status: string;
        }[];
        schoolWideTrend: number[];
    }>;
}
