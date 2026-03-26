import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';

@Injectable()
export class ResourceAuditorService {
    constructor(
        @InjectRepository(TeacherSubject)
        private readonly teacherSubjectRepo: Repository<TeacherSubject>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ) {}

    /**
     * Step 2.1: The Burnout Load Auditor
     * Checks if any teacher is assigned more than the recommended periods per week.
     * Recommendations: CBSE suggest 28-32 periods per week.
     */
    async auditTeacherWorkload(schoolId: string) {
        // 1. Get all assignments for the school
        const assignments = await this.teacherSubjectRepo.find({
            where: { school_id: schoolId },
            relations: ['teacher']
        });

        // 2. Aggregate periods per week per teacher
        const teacherLoads: Record<string, { name: string, total_periods: number, sections: string[] }> = {};

        for (const ass of assignments) {
            const tId = ass.teacher_id;
            if (!tId) continue;

            const teacher = await this.userRepo.findOne({ where: { id: tId } });
            const teacherName = teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Unknown';

            if (!teacherLoads[tId]) {
                teacherLoads[tId] = { name: teacherName, total_periods: 0, sections: [] };
            }

            // periods_per_day * 6 days (assuming 6-day week)
            const periodsPerWeek = (ass.periods_per_day || 1) * 6;
            teacherLoads[tId].total_periods += periodsPerWeek;
            teacherLoads[tId].sections.push(`${ass.class_id}-${ass.section_id} (${ass.subject_id})`);
        }

        // 3. Generate alerts
        const alerts = [];
        for (const [tId, data] of Object.entries(teacherLoads)) {
            if (data.total_periods > 32) {
                alerts.push({
                    teacher_id: tId,
                    teacher_name: data.name,
                    weekly_periods: data.total_periods,
                    limit: 32,
                    risk_level: data.total_periods > 38 ? 'CRITICAL' : 'HIGH',
                    message: `${data.name} is assigned ${data.total_periods} periods/week. This exceeds the CBSE recommendation of 28-32.`,
                    affected_sections: data.sections
                });
            }
        }

        return {
            audit_timestamp: new Date().toISOString(),
            status: alerts.length > 0 ? 'WARNING' : 'HEALTHY',
            alerts: alerts
        };
    }
}
