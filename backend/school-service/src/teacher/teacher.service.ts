import { Injectable, InternalServerErrorException, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource } from 'typeorm';
import { TenantContext } from '@lumiqos/shared/index';
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

@Injectable()
export class TeacherService {
    constructor(
        @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>,
        @InjectRepository(HomeworkAssignment) private readonly homeworkRepo: Repository<HomeworkAssignment>,
        @InjectRepository(HomeworkSubmission) private readonly submissionRepo: Repository<HomeworkSubmission>,
        @InjectRepository(MessageThread) private readonly threadRepo: Repository<MessageThread>,
        @InjectRepository(Message) private readonly messageRepo: Repository<Message>,
        @InjectRepository(AttendanceSession) private readonly attendanceSessionRepo: Repository<AttendanceSession>,
        @InjectRepository(StudentAttendance) private readonly studentAttendanceRepo: Repository<StudentAttendance>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(AcademicYear) private readonly academicYearRepo: Repository<AcademicYear>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private dataSource: DataSource
    ) { }

    async getDashboard(teacherId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        const [
            pendingHomework,
            unreadMessages, // Proxied for now as active threads
            schedule
        ] = await Promise.all([
            this.submissionRepo.createQueryBuilder('sub')
                .innerJoin('sub.homework', 'hw')
                .where('sub.school_id = :schoolId', { schoolId })
                .andWhere('sub.status = :status', { status: 'submitted' })
                .andWhere('hw.teacher_id = :teacherId', { teacherId })
                .getCount(),

            this.threadRepo.count({
                where: { school_id: schoolId, teacher_id: teacherId }
            }),

            this.teacherSubjectRepo.find({
                where: { school_id: schoolId, teacher_id: teacherId },
                relations: ['class', 'section', 'subject']
            })
        ]);

        return {
            today_schedule: schedule.map(s => ({
                class_name: s.class.class_name,
                section_name: s.section.section_name,
                subject_name: s.subject.subject_name
            })),
            pending_homework_reviews: pendingHomework,
            pending_grading: pendingHomework, // Syncing logic for simplified dashboard representation MVP
            unread_parent_messages: unreadMessages
        };
    }

    async getClasses(teacherId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const subjects = await this.teacherSubjectRepo.find({
            where: { school_id: schoolId, teacher_id: teacherId },
            relations: ['class', 'section', 'subject']
        });

        return subjects.map(s => ({
            class_id: s.class_id,
            section_id: s.section_id,
            subject_id: s.subject_id,
            class_name: s.class.class_name,
            section_name: s.section.section_name,
            subject_name: s.subject.subject_name
        }));
    }

    async submitQuickAttendance(teacherId: string, payload: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const { class_id, section_id, subject_id, date, attendance } = payload; // array of { student_id, status } exceptions

        // Verify Academic Year natively to fetch active enrollments
        const activeYear = await this.academicYearRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!activeYear) throw new InternalServerErrorException('No active academic year');

        // 1. Prevent Duplicate Sessions
        const existingSession = await this.attendanceSessionRepo.findOne({
            where: {
                school_id: schoolId,
                class_id,
                section_id,
                subject_id, // assuming nullable subject_id for class level. Can be enforced if payload provides.
                session_date: date
            }
        });

        if (existingSession) throw new BadRequestException('Attendance already recorded for this session');

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 2. Fetch Active Enrollments ONLY
            const activeEnrollments = await queryRunner.manager.find(StudentEnrollment, {
                where: {
                    school_id: schoolId,
                    academic_year_id: activeYear.academic_year_id,
                    class_id,
                    section_id,
                    status: 'active'
                }
            });

            if (activeEnrollments.length === 0) throw new BadRequestException('No active students found');

            // 3. Spawns session
            const session = queryRunner.manager.create(AttendanceSession, {
                school_id: schoolId,
                class_id,
                section_id,
                academic_year_id: activeYear.academic_year_id,
                subject_id: subject_id || null,
                session_date: date,
                recorded_by: teacherId
            });
            await queryRunner.manager.save(session);

            // 4. Default Assumptions Logic
            const exceptionMap = new Map();
            if (attendance && Array.isArray(attendance)) {
                for (const ex of attendance) { exceptionMap.set(ex.student_id, ex.status); }
            }

            const attendanceRecords = activeEnrollments.map(enr => {
                return queryRunner.manager.create(StudentAttendance, {
                    school_id: schoolId,
                    session_id: session.session_id,
                    student_id: enr.student_id,
                    status: exceptionMap.has(enr.student_id) ? exceptionMap.get(enr.student_id) : 'present'
                });
            });

            await queryRunner.manager.save(attendanceRecords);
            await queryRunner.commitTransaction();

            return { message: 'Quick attendance saved successfully', total_students_processed: attendanceRecords.length };

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async assignQuickHomework(teacherId: string, payload: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        const { class_id, section_id, subject_id, title, due_date, attachment_url } = payload;

        // Verify authorization assignment mapping limits
        const isAssigned = await this.teacherSubjectRepo.findOne({
            where: {
                school_id: schoolId,
                teacher_id: teacherId,
                class_id,
                subject_id // Section mapping usually part of subject payload natively
            }
        });

        if (!isAssigned) {
            throw new ForbiddenException('Teacher not assigned to this class or subject');
        }

        const hw = this.homeworkRepo.create({
            school_id: schoolId,
            teacher_id: teacherId,
            class_id,
            section_id,
            subject_id,
            title,
            due_date,
            attachment_url,
            assigned_date: new Date().toISOString().split('T')[0]
        });

        await this.homeworkRepo.save(hw);
        return { message: 'Homework quick assigned', homework_id: hw.homework_id };
    }

    async getHomeworkSubmissions(teacherId: string, limit = 25, offset = 0) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        const submissions = await this.submissionRepo.createQueryBuilder('sub')
            .innerJoin('sub.homework', 'hw')
            .innerJoinAndSelect('sub.student', 'st')
            .where('sub.school_id = :schoolId', { schoolId })
            .andWhere('sub.status = :status', { status: 'submitted' })
            .andWhere('hw.teacher_id = :teacherId', { teacherId })
            .limit(limit)
            .offset(offset)
            .getMany();

        return submissions;
    }

    async submitGrade(teacherId: string, payload: any) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;
        const { submission_id, grade, teacher_feedback } = payload;

        const sub = await this.submissionRepo.findOne({
            where: { submission_id, school_id: schoolId },
            relations: ['homework']
        });

        if (!sub) throw new NotFoundException('Submission not found');
        if (sub.homework.teacher_id !== teacherId) throw new ForbiddenException('Unauthorized grading bounds');

        sub.status = 'graded';
        sub.grade = grade;
        sub.teacher_remark = teacher_feedback;
        sub.graded_at = new Date();

        await this.submissionRepo.save(sub);
        return { message: 'Submission graded securely' };
    }

    async getMessages(teacherId: string) {
        const store = TenantContext.getStore();
        if (!store) throw new Error('Tenant context missing');
        const schoolId = store.schoolId;

        const threads = await this.threadRepo.find({
            where: { school_id: schoolId, teacher_id: teacherId },
            relations: ['student']
        });

        const threadIds = threads.map(t => t.thread_id);

        if (threadIds.length === 0) return [];

        // Map Latest Message preview aggregating
        const latestMsgs = await this.messageRepo.createQueryBuilder('m')
            .where('m.school_id = :schoolId', { schoolId })
            .andWhere('m.thread_id IN (:...threadIds)', { threadIds })
            .orderBy('m.created_at', 'DESC')
            .limit(500) // Bound buffer safely for mapping memory 
            .getMany();

        const msgMap = new Map();
        latestMsgs.forEach(m => {
            if (!msgMap.has(m.thread_id)) {
                msgMap.set(m.thread_id, m);
            }
        });

        return threads.map(t => {
            const latest = msgMap.get(t.thread_id);
            return {
                thread_id: t.thread_id,
                student_name: t.student ? `${t.student.first_name} ${t.student.last_name}` : 'Unknown',
                latest_message: latest ? latest.message_body : 'No messages',
                last_updated: latest ? latest.created_at : t.created_at
            };
        });
    }

    async getTeachers(schoolId: string) {
        return this.userRepo.find({
            where: { school_id: schoolId }
        });
    }
}
