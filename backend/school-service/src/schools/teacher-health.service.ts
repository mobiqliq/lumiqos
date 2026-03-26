import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { PlannedSchedule, ScheduleStatus } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { AcademicService } from './academic.service';

@Injectable()
export class TeacherHealthService {
    constructor(
        @InjectRepository(PlannedSchedule) private readonly scheduleRepo: Repository<PlannedSchedule>,
        @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        private readonly academicService: AcademicService
    ) {}

    async getSupportRadar(schoolId: string) {
        // 1. Get all teacher-subject mappings
        const mappings = await this.teacherSubjectRepo.find({
            where: { school_id: schoolId },
            relations: ['teacher']
        });

        const teacherIds = [...new Set(mappings.map(m => m.teacher_id))];
        const alerts = [];

        for (const tId of teacherIds) {
            // Find a sample class/subject for this teacher to check velocity
            const sample = mappings.find(m => m.teacher_id === tId);
            if (!sample) continue;

            const velocityReport = await this.academicService.getVelocityReport(sample.class_id, sample.subject_id, schoolId);
            
            // Only care about "Red" (slow) velocity
            if (velocityReport.velocity < 0.85) {
                // 2. Deep Scan: Analyze Complexity of their current and future load
                // We'll look at the next 10 lessons in their schedule
                const futureLessons = await this.scheduleRepo.find({
                    where: { 
                        school_id: schoolId, 
                        teacher_id: tId,
                        status: ScheduleStatus.SCHEDULED
                    },
                    order: { planned_date: 'ASC' },
                    take: 10,
                    relations: ['lesson']
                });

                const totalComplexity = futureLessons.reduce((sum, s) => sum + (s.lesson?.complexity_index || 5), 0);
                const avgComplexity = futureLessons.length > 0 ? totalComplexity / futureLessons.length : 5;

                const teacher = await this.userRepo.findOne({ where: { id: tId }});

                // 3. Diagnosis
                if (avgComplexity > 7) {
                    alerts.push({
                        teacher_id: tId,
                        teacher_name: teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Teacher',
                        velocity: velocityReport.velocity,
                        density_score: avgComplexity.toFixed(1),
                        diagnosis: 'OVERLOAD_DETECTED',
                        rationale: `Velocity is low (${velocityReport.velocity.toFixed(2)}v) primarily due to high average lesson complexity (${avgComplexity.toFixed(1)}/10). This creates a 'dense schedule' bottleneck.`,
                        recommendation: 'Recommend reassigning 2 upcoming high-complexity units to an Assistant Teacher to prevent burnout.',
                        action_label: '⚡ Support Required'
                    });
                } else {
                    alerts.push({
                        teacher_id: tId,
                        teacher_name: teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Teacher',
                        velocity: velocityReport.velocity,
                        density_score: avgComplexity.toFixed(1),
                        diagnosis: 'PEDAGOGICAL_LAG',
                        rationale: 'Velocity is low but lesson complexity is moderate. This indicates a standard instructional lag.',
                        recommendation: 'Scheduled a brief check-in or suggest Plan B (Lesson Compression).',
                        action_label: '💬 Check-in'
                    });
                }
            }
        }

        return alerts;
    }
}
