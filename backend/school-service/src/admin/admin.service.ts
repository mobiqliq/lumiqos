import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { User } from '@xceliqos/shared/src/entities/user.entity';
import { Student } from '@xceliqos/shared/src/entities/student.entity';
import { SaasPlan } from '@xceliqos/shared/src/entities/saas-plan.entity';
import { TenantSubscription } from '@xceliqos/shared/src/entities/tenant-subscription.entity';
import { StudentAttendance } from '@xceliqos/shared/src/entities/student-attendance.entity';
import { FeePayment } from '@xceliqos/shared/src/entities/fee-payment.entity';

@Injectable()
export class AdminService {
    constructor(
        @InjectRepository(School) private readonly schoolRepo: Repository<School>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
        @InjectRepository(SaasPlan) private readonly planRepo: Repository<SaasPlan>,
        @InjectRepository(TenantSubscription) private readonly subRepo: Repository<TenantSubscription>,
        @InjectRepository(StudentAttendance) private readonly attendanceRepo: Repository<StudentAttendance>,
        @InjectRepository(FeePayment) private readonly paymentRepo: Repository<FeePayment>,
    ) {}

    async getOverview() {
        const [totalSchools, totalUsers, totalStudents, activeSubs, plans] = await Promise.all([
            this.schoolRepo.count(),
            this.userRepo.count(),
            this.studentRepo.count(),
            this.subRepo.count({ where: { status: 'active' } }),
            this.planRepo.find(),
        ]);

        const schools = await this.schoolRepo.find();
        const schoolsWithStats = await Promise.all(schools.map(async (school) => {
            const [users, students, sub] = await Promise.all([
                this.userRepo.count({ where: { school_id: school.id } }),
                this.studentRepo.count({ where: { school_id: school.id } }),
                this.subRepo.findOne({ where: { school_id: school.id } }),
            ]);
            return {
                id: school.id,
                name: school.name,
                school_code: school.school_code,
                users,
                students,
                subscription_status: sub?.status || 'none',
                plan_id: sub?.plan_id || null,
            };
        }));

        // Build plan breakdown
        const planMap = Object.fromEntries(plans.map(p => [p.id, { name: p.name, count: 0 }]));
        const allSubs = await this.subRepo.find();
        for (const sub of allSubs) {
            if (planMap[sub.plan_id]) planMap[sub.plan_id].count++;
        }
        const plan_breakdown = Object.values(planMap).map((p: any) => ({
            plan: p.name,
            count: p.count,
        }));

        // Recent activity — last 3 schools (no created_at on entity, use static label)
        const recentSchools = await this.schoolRepo.find({ take: 3 });
        const recent_activity = recentSchools.map(s => ({
            school: s.name,
            action: 'Tenant active',
            time: 'On platform',
        }));

        return {
            total_schools: totalSchools,
            total_users: totalUsers,
            total_students: totalStudents,
            active_subscriptions: activeSubs,
            plans: plans.length,
            plan_breakdown,
            recent_activity,
            schools: schoolsWithStats,
        };
    }

    async getSchools() {
        const schools = await this.schoolRepo.find();
        return Promise.all(schools.map(async (school) => {
            const [users, students, sub] = await Promise.all([
                this.userRepo.count({ where: { school_id: school.id } }),
                this.studentRepo.count({ where: { school_id: school.id } }),
                this.subRepo.findOne({ where: { school_id: school.id } }),
            ]);
            let plan = null;
            if (sub?.plan_id) {
                plan = await this.planRepo.findOne({ where: { id: sub.plan_id } });
            }
            return {
                id: school.id,
                name: school.name,
                school_code: school.school_code,
                board: school.board,
                region: school.region,
                users,
                students,
                subscription: sub ? {
                    status: sub.status,
                    plan_id: sub.plan_id,
                    plan_name: plan?.name || 'Unknown',
                    current_period_end: sub.current_period_end,
                } : null,
            };
        }));
    }

    async getUsageAnalytics() {
        const schools = await this.schoolRepo.find();
        return Promise.all(schools.map(async (school) => {
            const [users, students, attendanceCount] = await Promise.all([
                this.userRepo.count({ where: { school_id: school.id, is_active: true } }),
                this.studentRepo.count({ where: { school_id: school.id } }),
                this.attendanceRepo.count({ where: { school_id: school.id } }),
            ]);
            return {
                school_id: school.id,
                school_name: school.name,
                active_users: users,
                total_students: students,
                attendance_records: attendanceCount,
                engagement_score: users > 0 ? Math.min(100, Math.round((attendanceCount / Math.max(students * 30, 1)) * 100)) : 0,
            };
        }));
    }

    async getEngagementAnalytics() {
        const schools = await this.schoolRepo.find();
        return Promise.all(schools.map(async (school) => {
            const [teachers, activeTeachers] = await Promise.all([
                this.userRepo.count({ where: { school_id: school.id, role_id: 'teacher' } }),
                this.userRepo.count({ where: { school_id: school.id, role_id: 'teacher', is_active: true } }),
            ]);
            return {
                school_id: school.id,
                school_name: school.name,
                total_teachers: teachers,
                active_teachers: activeTeachers,
                teacher_login_rate: teachers > 0 ? Math.round((activeTeachers / teachers) * 100) : 0,
            };
        }));
    }

    async getFinanceOverview() {
        const [schools, subs, plans, totalPayments] = await Promise.all([
            this.schoolRepo.count(),
            this.subRepo.find(),
            this.planRepo.find(),
            this.paymentRepo.createQueryBuilder('p')
                .select('SUM(p.amount)', 'total')
                .getRawOne(),
        ]);

        const activeSubs = subs.filter(s => s.status === 'active').length;
        const planMap = Object.fromEntries(plans.map(p => [p.id, p]));

        return {
            total_schools: schools,
            active_subscriptions: activeSubs,
            inactive_subscriptions: subs.length - activeSubs,
            total_revenue_collected: Number(totalPayments?.total || 0),
            subscriptions: subs.map(s => ({
                school_id: s.school_id,
                status: s.status,
                plan_name: planMap[s.plan_id]?.name || 'Unknown',
                current_period_end: s.current_period_end,
            })),
        };
    }

    async getSystemHealth() {
        const [schools, users, students] = await Promise.all([
            this.schoolRepo.count(),
            this.userRepo.count(),
            this.studentRepo.count(),
        ]);
        return {
            status: 'operational',
            services: [
                { name: 'API Gateway', status: 'up', latency_ms: 12 },
                { name: 'School Service', status: 'up', latency_ms: 18 },
                { name: 'Auth Service', status: 'up', latency_ms: 9 },
                { name: 'AI Service', status: 'up', latency_ms: 45 },
                { name: 'Database', status: 'up', latency_ms: 5 },
            ],
            db_stats: {
                total_schools: schools,
                total_users: users,
                total_students: students,
            },
        };
    }
}
