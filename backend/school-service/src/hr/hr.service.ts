import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';

@Injectable()
export class HrService {
    constructor(
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>,
    ) {}

    async getHrOverview(schoolId: string) {
        const [totalStaff, activeStaff, teacherSubjectCount, roleDistribution] = await Promise.all([
            this.userRepo.count({ where: { school_id: schoolId } }),

            this.userRepo.count({ where: { school_id: schoolId, is_active: true } }),

            this.teacherSubjectRepo.count({ where: { school_id: schoolId } }),

            this.userRepo.createQueryBuilder('u')
                .where('u.school_id = :schoolId', { schoolId })
                .select(['u.role_id as role', 'COUNT(*) as count'])
                .groupBy('u.role_id')
                .getRawMany(),
        ]);

        return {
            total_staff: totalStaff,
            active_staff: activeStaff,
            inactive_staff: totalStaff - activeStaff,
            teacher_subject_assignments: teacherSubjectCount,
            role_distribution: roleDistribution.map(r => ({
                role: r.role || 'unassigned',
                count: Number(r.count),
            })),
        };
    }
}
