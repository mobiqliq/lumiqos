import { AttendanceService } from './attendance.service';
export declare class AttendanceController {
    private readonly attendanceService;
    constructor(attendanceService: AttendanceService);
    createSession(dto: any): Promise<{
        message: string;
        session_id: string;
        students_count: number;
    }>;
    markAttendance(dto: any): Promise<{
        message: string;
    }>;
    getClassAttendance(classId: string, sectionId: string, date: string): Promise<import("@lumiqos/shared/index").StudentAttendance[]>;
    getStudentAttendance(studentId: string): Promise<import("@lumiqos/shared/index").StudentAttendance[]>;
    getAnalytics(teacherId: string, classId: string): Promise<{
        aiInsights: {
            summary: string;
            insight: string;
            prediction: string;
        };
        dailyAvg: number;
        weeklyTrend: number[];
        mostAbsentDay: string;
    }>;
    getOverview(schoolId: string): Promise<{
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
