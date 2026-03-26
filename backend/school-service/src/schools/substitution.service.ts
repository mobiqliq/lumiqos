import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Not, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { PlannedSchedule, ScheduleStatus } from '@lumiqos/shared/src/entities/planned-schedule.entity';
import { User } from '@lumiqos/shared/src/entities/user.entity';
import { TeacherSubject } from '@lumiqos/shared/src/entities/teacher-subject.entity';

@Injectable()
export class SubstitutionService {
    constructor(
        @InjectRepository(PlannedSchedule) private readonly scheduleRepo: Repository<PlannedSchedule>,
        @InjectRepository(User) private readonly userRepo: Repository<User>,
        @InjectRepository(TeacherSubject) private readonly teacherSubjectRepo: Repository<TeacherSubject>
    ) { }

    async findSubstitute(absentTeacherId: string, date: string, slotId: string) {
        // 1. Identify what is being missed
        const missingLesson = await this.scheduleRepo.findOne({
            where: {
                teacher_id: absentTeacherId,
                planned_date: date,
                slot_id: slotId
            },
            relations: ['lesson', 'subject', 'teacher']
        });

        if (!missingLesson) {
            return { message: 'No lesson scheduled for this teacher at this time.' };
        }

        const subjectId = missingLesson.subject_id;
        const lessonTitle = missingLesson.title_override || missingLesson.lesson?.title || 'General Lesson';

        // 2. Find all other teachers
        const allTeachers = await this.userRepo.find({
            where: { id: Not(absentTeacherId) }
        });

        // 3. Find teachers who are FREE in this slot on this date
        const busySchedules = await this.scheduleRepo.find({
            where: { planned_date: date, slot_id: slotId },
            select: ['teacher_id']
        });
        const busyTeacherIds = busySchedules.map(s => s.teacher_id).filter(id => !!id);

        const freeTeachers = allTeachers.filter(t => !busyTeacherIds.includes(t.id));

        if (freeTeachers.length === 0) {
            return {
                alert: `CRITICAL: ${missingLesson.teacher?.first_name || 'Teacher'} is absent.`,
                recommendation: 'No free teachers available for this slot. Resource conflict detected.',
                substitution_type: 'NONE'
            };
        }

        // 4. Find the best match based on Competency (TeacherSubject)
        const competentTeacherSubjects = await this.teacherSubjectRepo.find({
            where: {
                teacher_id: In(freeTeachers.map(t => t.id)),
                subject_id: subjectId
            },
            relations: ['teacher']
        });

        if (competentTeacherSubjects.length > 0) {
            const bestMatch = competentTeacherSubjects[0].teacher;
            return {
                alert: `CRITICAL: ${missingLesson.teacher?.first_name || 'Teacher'} is absent.`,
                recommendation: `${bestMatch.first_name} ${bestMatch.last_name} is free and has the competency to cover "${lessonTitle}" today.`,
                substitution_type: 'PEDAGOGICAL_MATCH',
                teacher_id: bestMatch.id
            };
        }

        // 5. Fallback: Just return any free teacher
        const fallback = freeTeachers[0];
        return {
            alert: `CRITICAL: ${missingLesson.teacher?.first_name || 'Teacher'} is absent.`,
            recommendation: `${fallback.first_name} ${fallback.last_name} is free for general supervision (No direct subject match).`,
            substitution_type: 'GENERAL_SUPERVISION',
            teacher_id: fallback.id
        };
    }

    async executeHandover(outgoingTeacherId: string, incomingTeacherId: string, effectiveDate: string) {
        // 1. Reassign Schedules
        const schedules = await this.scheduleRepo.find({
            where: {
                teacher_id: outgoingTeacherId,
                status: ScheduleStatus.SCHEDULED,
                planned_date: MoreThanOrEqual(effectiveDate)
            },
            relations: ['class', 'subject', 'lesson']
        });

        if (schedules.length === 0) {
            return { message: 'No scheduled lessons found for handover.', count: 0, handover_report: [] };
        }

        const affectedSections = new Set<string>();
        
        for (const schedule of schedules) {
            schedule.teacher_id = incomingTeacherId;
            if (schedule.section_id) affectedSections.add(schedule.section_id);
        }

        await this.scheduleRepo.save(schedules);

        // 2. Generate Briefing / Handover Report
        const handoverReport = [];

        for (const sectionId of affectedSections) {
            // Find the last COMPLETED lesson for this section
            const lastCompleted = await this.scheduleRepo.findOne({
                where: {
                    section_id: sectionId,
                    status: ScheduleStatus.COMPLETED
                },
                order: {
                    actual_completion_date: 'DESC'
                },
                relations: ['class', 'subject', 'lesson']
            });

            // Calculate rough velocity (Completed / Total passed days)
            const completedCount = await this.scheduleRepo.count({
                where: { section_id: sectionId, status: ScheduleStatus.COMPLETED }
            });

            const scheduledSoFar = await this.scheduleRepo.count({
                where: { section_id: sectionId, planned_date: LessThanOrEqual(effectiveDate) }
            });

            const velocity = scheduledSoFar > 0 ? (completedCount / scheduledSoFar).toFixed(2) : '1.00';

            if (lastCompleted) {
                handoverReport.push({
                    section_id: sectionId,
                    class_name: lastCompleted.class?.name || lastCompleted.class?.class_name || 'Unknown Class',
                    subject_name: lastCompleted.subject?.name || lastCompleted.subject?.subject_name || 'Unknown Subject',
                    last_completed_lesson: lastCompleted.lesson?.title || lastCompleted.title_override || 'N/A',
                    completion_date: lastCompleted.actual_completion_date,
                    velocity_score: parseFloat(velocity)
                });
            }
        }

        return {
            message: `Successfully handed over ${schedules.length} periods.`,
            count: schedules.length,
            handover_report: handoverReport
        };
    }
}

