import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '@lumiqos/shared/src/entities/school.entity';
import { Student } from '@lumiqos/shared/src/entities/student.entity';
import { AcademicYear } from '@lumiqos/shared/src/entities/academic-year.entity';
import { Class } from '@lumiqos/shared/src/entities/class.entity';
import { Section } from '@lumiqos/shared/src/entities/section.entity';
import { StudentEnrollment } from '@lumiqos/shared/src/entities/student-enrollment.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { StudentAttendance } from '@lumiqos/shared/src/entities/student-attendance.entity';
import { AttendanceSession } from '@lumiqos/shared/src/entities/attendance-session.entity';
import { FeeInvoice } from '@lumiqos/shared/src/entities/fee-invoice.entity';
import { Subject } from '@lumiqos/shared/src/entities/subject.entity';
import { Syllabus } from '@lumiqos/shared/src/entities/syllabus.entity';
import { CurriculumMapping } from '@lumiqos/shared/src/entities/curriculum-mapping.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { Board } from '@lumiqos/shared/src/entities/board.entity';
import { SaasPlan } from '@lumiqos/shared/src/entities/saas-plan.entity';
import { TenantSubscription } from '@lumiqos/shared/src/entities/tenant-subscription.entity';
import { Role } from '@lumiqos/shared/src/entities/role.entity';
import { Permission } from '@lumiqos/shared/src/entities/permission.entity';
import { RolePermission } from '@lumiqos/shared/src/entities/role-permission.entity';

const TEST_SCHOOL_ID = '11111111-1111-1111-1111-111111111111';
const TEST_CLASS_ID  = '33333333-3333-3333-3333-333333333333';
const TEST_SUBJECT_ID = '44444444-4444-4444-4444-444444444444';

@Injectable()
export class SeederService implements OnApplicationBootstrap {
    constructor(
        @InjectRepository(School) private readonly schoolRepo: Repository<School>,
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(AcademicYear) private readonly yearRepo: Repository<AcademicYear>,
        @InjectRepository(Class) private readonly classRepo: Repository<Class>,
        @InjectRepository(Section) private readonly sectionRepo: Repository<Section>,
        @InjectRepository(StudentEnrollment) private readonly enrollmentRepo: Repository<StudentEnrollment>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
        @InjectRepository(AttendanceSession) private readonly sessionRepo: Repository<AttendanceSession>,
        @InjectRepository(FeeInvoice) private readonly feeRepo: Repository<FeeInvoice>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
        @InjectRepository(Syllabus) private readonly syllabusRepo: Repository<Syllabus>,
        @InjectRepository(CurriculumMapping) private readonly mappingRepo: Repository<CurriculumMapping>,
        @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>,
        @InjectRepository(Board) private readonly boardConfigRepo: Repository<Board>,
        @InjectRepository(SaasPlan) private readonly planRepo: Repository<SaasPlan>,
        @InjectRepository(TenantSubscription) private readonly subRepo: Repository<TenantSubscription>,
        @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
        @InjectRepository(Permission) private readonly permissionRepo: Repository<Permission>,
        @InjectRepository(RolePermission) private readonly rolePermissionRepo: Repository<RolePermission>,
    ) { }

    async onApplicationBootstrap() {
        console.log('--- STARTING IDEMPOTENT SEEDER ---');

        // 1. Find or Create School
        let school = await this.schoolRepo.findOne({ where: { school_code: 'GFA-2026' } });
        if (!school) {
            school = await this.schoolRepo.save(this.schoolRepo.create({
                name: 'Greenfield Academy',
                school_code: 'GFA-2026',
                region: 'ap-south-1',
                board: 'CBSE',
            }));
            console.log('Seeded School: Greenfield Academy');
        }

        // 2. Find or Create Academic Year
        let year = await this.yearRepo.findOne({ where: { school_id: school.id, name: '2025-26' } });
        if (!year) {
            year = await this.yearRepo.save(this.yearRepo.create({
                school_id: school.id,
                name: '2025-26',
                year_name: '2025-26',
                start_date: new Date('2025-04-01'),
                end_date: new Date('2026-03-31'),
                status: 'active',
            }));
        }

        // 3. Find or Create Classes
        const classNames = ['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];
        for (const name of classNames) {
            const exists = await this.classRepo.findOne({ where: { school_id: school.id, name: name } });
            if (!exists) {
                await this.classRepo.save(this.classRepo.create({
                    school_id: school.id,
                    name: name,
                    class_name: name,
                    grade_level: parseInt(name.split(' ')[1]),
                }));
            }
        }

        // 4. Seed Boards
        const boards = ['CBSE', 'ICSE'];
        for (const bName of boards) {
            const exists = await this.boardConfigRepo.findOne({ where: { name: bName } });
            if (!exists) {
                await this.boardConfigRepo.save(this.boardConfigRepo.create({
                    name: bName,
                    exam_buffer_days: bName === 'CBSE' ? 7 : 5,
                    revision_days: bName === 'CBSE' ? 14 : 10,
                    max_sessions_per_day: bName === 'CBSE' ? 2 : 1
                }));
            }
        }


        // Seed Roles first (required before creating users)
        const roleNames = ['principal', 'teacher', 'administrator', 'finance', 'hr', 'student', 'parent'];
        for (const roleName of roleNames) {
            let role = await this.roleRepo.findOne({ where: { name: roleName } });
            if (!role) {
                role = await this.roleRepo.save(this.roleRepo.create({ name: roleName, role_id: roleName }));
                console.log(`Seeded role: ${roleName}`);
            }
        }

        // 5. Seed Roles
        const rolesData = [
            { role_id: 'principal', name: 'Principal', role_name: 'Principal' },
            { role_id: 'teacher', name: 'Teacher', role_name: 'Teacher' },
            { role_id: 'administrator', name: 'Administrator', role_name: 'Administrator' },
            { role_id: 'finance', name: 'Finance', role_name: 'Finance' },
            { role_id: 'hr', name: 'HR', role_name: 'HR' },
            { role_id: 'parent', name: 'Parent', role_name: 'Parent' },
            { role_id: 'student', name: 'Student', role_name: 'Student' },
        ];
        for (const r of rolesData) {
            const exists = await this.roleRepo.findOne({ where: { role_id: r.role_id } });
            if (!exists) {
                await this.roleRepo.save(this.roleRepo.create(r));
                console.log(`Seeded role: ${r.role_id}`);
            }
        }

        // 5. Seed Staff for TEST_SCHOOL_ID
        const staffData = [
            { first_name: 'Rajesh',   last_name: 'Kumar',   email: 'principal@testschool.edu',     role_id: 'principal' },
            { first_name: 'Sunita',   last_name: 'Verma',   email: 'teacher1@testschool.edu',      role_id: 'teacher' },
            { first_name: 'Amit',     last_name: 'Sharma',  email: 'teacher2@testschool.edu',      role_id: 'teacher' },
            { first_name: 'Priya',    last_name: 'Singh',   email: 'teacher3@testschool.edu',      role_id: 'teacher' },
            { first_name: 'Deepak',   last_name: 'Gupta',   email: 'admin@testschool.edu',         role_id: 'administrator' },
            { first_name: 'Meena',    last_name: 'Joshi',   email: 'finance@testschool.edu',       role_id: 'finance' },
            { first_name: 'Vikram',   last_name: 'Rao',     email: 'hr@testschool.edu',            role_id: 'hr' },
            { first_name: 'Kavitha',  last_name: 'Nair',    email: 'teacher4@testschool.edu',      role_id: 'teacher' },
        ];
        // bcrypt hash of 'Test@1234' (cost 10)
        const DEFAULT_PASSWORD_HASH = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';
        const seededUsers: Record<string, User> = {};
        for (const s of staffData) {
            let user = await this.userRepo.findOne({ where: { email: s.email } });
            if (!user) {
                user = await this.userRepo.save(this.userRepo.create({
                    ...s,
                    school_id: TEST_SCHOOL_ID,
                    status: 'active',
                    is_active: true,
                    password_hash: DEFAULT_PASSWORD_HASH,
                }));
                console.log(`Seeded staff: ${s.email}`);
            }
            seededUsers[s.email] = user;
        }

        // 6. Seed Additional Subjects for TEST_SCHOOL_ID
        const subjectNames = ['Science', 'English', 'Hindi', 'Social Studies', 'Computer Science'];
        const seededSubjects: Record<string, Subject> = {};
        for (const name of subjectNames) {
            let subj = await this.subjectRepo.findOne({ where: { school_id: TEST_SCHOOL_ID, name } });
            if (!subj) {
                subj = await this.subjectRepo.save(this.subjectRepo.create({
                    school_id: TEST_SCHOOL_ID,
                    name,
                    subject_name: name,
                    credits: 1.0,
                }));
                console.log(`Seeded subject: ${name}`);
            }
            seededSubjects[name] = subj;
        }

        // 7. Seed TeacherSubject assignments for TEST_SCHOOL_ID
        const teacher1 = seededUsers['teacher1@testschool.edu'];
        const teacher2 = seededUsers['teacher2@testschool.edu'];
        const teacher3 = seededUsers['teacher3@testschool.edu'];
        const teacher4 = seededUsers['teacher4@testschool.edu'];

        const assignments = [
            { teacher: teacher1, subject_id: TEST_SUBJECT_ID },
            { teacher: teacher2, subject_id: seededSubjects['Science']?.id },
            { teacher: teacher3, subject_id: seededSubjects['English']?.id },
            { teacher: teacher4, subject_id: seededSubjects['Hindi']?.id },
        ];

        for (const a of assignments) {
            if (!a.teacher || !a.subject_id) continue;
            const exists = await this.teacherSubjectRepo.findOne({
                where: { school_id: TEST_SCHOOL_ID, teacher_id: a.teacher.id, subject_id: a.subject_id },
            });
            if (!exists) {
                await this.teacherSubjectRepo.save(this.teacherSubjectRepo.create({
                    school_id: TEST_SCHOOL_ID,
                    teacher_id: a.teacher.id,
                    subject_id: a.subject_id,
                    class_id: TEST_CLASS_ID,
                    periods_per_day: 1,
                }));
                console.log(`Seeded TeacherSubject: ${a.teacher.email} → ${a.subject_id}`);
            }
        }

        // 8. Seed SaaS Plans
        const plansData = [
            { name: 'Starter', plan_id: 'starter', max_students: 500, max_teachers: 30, ai_features_enabled: false, analytics_enabled: false },
            { name: 'Growth', plan_id: 'growth', max_students: 2000, max_teachers: 100, ai_features_enabled: true, analytics_enabled: false },
            { name: 'Enterprise', plan_id: 'enterprise', max_students: 99999, max_teachers: 9999, ai_features_enabled: true, analytics_enabled: true },
        ];
        const seededPlans: Record<string, SaasPlan> = {};
        for (const p of plansData) {
            let plan = await this.planRepo.findOne({ where: { plan_id: p.plan_id } });
            if (!plan) {
                plan = await this.planRepo.save(this.planRepo.create(p));
                console.log(`Seeded plan: ${p.name}`);
            }
            seededPlans[p.plan_id] = plan;
        }

        // 9. Seed Tenant Subscriptions for all schools
        const allSchools = await this.schoolRepo.find();
        const planKeys = ['starter', 'growth', 'enterprise'];
        for (let i = 0; i < allSchools.length; i++) {
            const s = allSchools[i];
            const exists = await this.subRepo.findOne({ where: { school_id: s.id } });
            if (!exists) {
                const planKey = planKeys[i % planKeys.length];
                await this.subRepo.save(this.subRepo.create({
                    school_id: s.id,
                    plan_id: seededPlans[planKey].id,
                    status: 'active',
                    current_period_end: new Date('2027-03-31'),
                }));
                console.log(`Seeded subscription: ${s.name} -> ${planKey}`);
            }
        }

        // 9. Seed Permissions and RolePermissions
        const PERMISSIONS = [
            { permission_id: 'dashboard.view',       name: 'View Dashboard',        module: 'dashboard',    action: 'view' },
            { permission_id: 'students.view',        name: 'View Students',         module: 'students',     action: 'view' },
            { permission_id: 'students.manage',      name: 'Manage Students',       module: 'students',     action: 'manage' },
            { permission_id: 'attendance.view',      name: 'View Attendance',       module: 'attendance',   action: 'view' },
            { permission_id: 'attendance.manage',    name: 'Manage Attendance',     module: 'attendance',   action: 'manage' },
            { permission_id: 'homework.view',        name: 'View Homework',         module: 'homework',     action: 'view' },
            { permission_id: 'homework.manage',      name: 'Manage Homework',       module: 'homework',     action: 'manage' },
            { permission_id: 'exams.view',           name: 'View Exams',            module: 'exams',        action: 'view' },
            { permission_id: 'exams.manage',         name: 'Manage Exams',          module: 'exams',        action: 'manage' },
            { permission_id: 'finance.view',         name: 'View Finance',          module: 'finance',      action: 'view' },
            { permission_id: 'finance.manage',       name: 'Manage Finance',        module: 'finance',      action: 'manage' },
            { permission_id: 'hr.view',              name: 'View HR',               module: 'hr',           action: 'view' },
            { permission_id: 'hr.manage',            name: 'Manage HR',             module: 'hr',           action: 'manage' },
            { permission_id: 'reports.view',         name: 'View Reports',          module: 'reports',      action: 'view' },
            { permission_id: 'analytics.view',       name: 'View Analytics',        module: 'analytics',    action: 'view' },
            { permission_id: 'settings.manage',      name: 'Manage Settings',       module: 'settings',     action: 'manage' },
            { permission_id: 'timetable.view',       name: 'View Timetable',        module: 'timetable',    action: 'view' },
            { permission_id: 'timetable.manage',     name: 'Manage Timetable',      module: 'timetable',    action: 'manage' },
            { permission_id: 'communication.view',   name: 'View Communication',    module: 'communication',action: 'view' },
            { permission_id: 'communication.manage', name: 'Manage Communication',  module: 'communication',action: 'manage' },
        ];

        for (const p of PERMISSIONS) {
            const exists = await this.permissionRepo.findOne({ where: { permission_id: p.permission_id } });
            if (!exists) {
                await this.permissionRepo.save(this.permissionRepo.create(p));
            }
        }
        console.log('Permissions seeded');

        // Role → permission mapping
        const ROLE_PERMISSIONS: Record<string, string[]> = {
            principal: [
                'dashboard.view','students.view','students.manage',
                'attendance.view','attendance.manage','homework.view','homework.manage',
                'exams.view','exams.manage','finance.view','hr.view','hr.manage',
                'reports.view','analytics.view','settings.manage',
                'timetable.view','timetable.manage','communication.view','communication.manage',
            ],
            teacher: [
                'dashboard.view','students.view','attendance.view','attendance.manage',
                'homework.view','homework.manage','exams.view','exams.manage',
                'reports.view','timetable.view','communication.view','communication.manage',
            ],
            administrator: [
                'dashboard.view','students.view','students.manage',
                'attendance.view','exams.view','reports.view',
                'timetable.view','timetable.manage','communication.view','communication.manage',
                'settings.manage',
            ],
            finance: [
                'dashboard.view','finance.view','finance.manage','reports.view',
            ],
            hr: [
                'dashboard.view','hr.view','hr.manage','reports.view',
            ],
            parent: [
                'dashboard.view','students.view','attendance.view',
                'homework.view','exams.view','finance.view','communication.view',
            ],
            student: [
                'dashboard.view','attendance.view','homework.view',
                'exams.view','finance.view','communication.view',
            ],
        };

        for (const [roleId, permIds] of Object.entries(ROLE_PERMISSIONS)) {
            for (const permId of permIds) {
                const exists = await this.rolePermissionRepo.findOne({
                    where: { role_id: roleId, permission_id: permId },
                });
                if (!exists) {
                    await this.rolePermissionRepo.save(
                        this.rolePermissionRepo.create({ role_id: roleId, permission_id: permId })
                    );
                }
            }
        }
        console.log('RolePermissions seeded');

        console.log('--- IDEMPOTENT SEEDING COMPLETE ---');
    }
}
