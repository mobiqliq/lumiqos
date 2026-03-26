import { AttendanceSession } from './attendance-session.entity';
export declare class StudentAttendance {
    id: string;
    session_id: string;
    student_id: string;
    school_id: string;
    status: string;
    remarks: string;
    session: AttendanceSession;
    created_at: Date;
    updated_at: Date;
}
