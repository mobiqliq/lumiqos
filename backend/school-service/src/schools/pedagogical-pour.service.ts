import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LessonPlan } from '@xceliqos/shared/src/entities/lesson-plan.entity';
import { SchoolCalendar, DayType } from '@xceliqos/shared/src/entities/school-calendar.entity';
import { PlannedSchedule } from '@xceliqos/shared/src/entities/planned-schedule.entity';
import { CurriculumUnit } from '@xceliqos/shared/src/entities/curriculum-unit.entity';
import { Section } from '@xceliqos/shared/src/entities/section.entity';
import { TeacherSubject } from '@xceliqos/shared/src/entities/teacher-subject.entity';

@Injectable()
export class PedagogicalPourService {
    private readonly logger = new Logger(PedagogicalPourService.name);

    constructor(
        @InjectRepository(LessonPlan)
        private lessonPlanRepo: Repository<LessonPlan>,
        @InjectRepository(SchoolCalendar)
        private calendarRepo: Repository<SchoolCalendar>,
        @InjectRepository(PlannedSchedule)
        private scheduleRepo: Repository<PlannedSchedule>,
        @InjectRepository(CurriculumUnit)
        private unitRepo: Repository<CurriculumUnit>,
        @InjectRepository(Section)
        private sectionRepo: Repository<Section>,
        @InjectRepository(TeacherSubject)
        private teacherSubjectRepo: Repository<TeacherSubject>,
    ) {}

    async generateBaselineSchedule(schoolId: string, yearId: string, classId: string, sectionId: string | undefined, subjectId: string) {
        this.logger.log(`Starting Pedagogical Pour for Class: ${classId}, Subject: ${subjectId}`);

        // 1. Fetch Lesson Plans ordered by Unit and Sequence
        const units = await this.unitRepo.find({
            where: { subject_id: subjectId },
            order: { sequence_order: 'ASC' }
        });

        const allLessons: LessonPlan[] = [];
        for (const unit of units) {
            const lessons = await this.lessonPlanRepo.find({
                where: { unit_id: unit.id },
                order: { complexity_index: 'ASC' } // Fallback ordering if no explicit sequence
            });
            allLessons.push(...lessons);
        }

        // 2. Fetch valid Teaching Days
        const teachingDays = await this.calendarRepo.find({
            where: { 
                school_id: schoolId, 
                academic_year_id: yearId,
                is_working_day: true 
            },
            order: { date: 'ASC' }
        });

        if (allLessons.length === 0 || teachingDays.length === 0) {
            return { error: 'No lessons or teaching days found to pour.' };
        }

        // 3. Fetch Sections to schedule for
        let targetSections: Section[] = [];
        if (sectionId) {
            const sec = await this.sectionRepo.findOne({ where: { id: sectionId } });
            if (sec) targetSections.push(sec);
        } else {
            targetSections = await this.sectionRepo.find({ where: { class_id: classId } });
        }

        if (targetSections.length === 0) {
            // Fallback if no sections exist, just create a default item
            targetSections.push({ id: undefined, class_id: classId } as any);
        }

        const scheduledItems: Partial<PlannedSchedule>[] = [];
        
        // Generate MASTER SEQUENCE for the first section
        const firstSection = targetSections[0];
        const firstSectionId = firstSection.id;
        
        // Look up Teacher Assignment for the first section
        const firstAssignment = await this.teacherSubjectRepo.findOne({
            where: { class_id: classId, section_id: firstSectionId, subject_id: subjectId }
        });
        const firstTeacherId = firstAssignment ? firstAssignment.teacher_id : null;

        let dayIdx = 0;
        let weeklyHighComplexityCount = 0;
        let lastWeekNum = -1;
        
        const masterSequence: Array<{ lesson_id?: string, date: string, title_override?: string, teacher_id?: string }> = [];

        for (let i = 0; i < allLessons.length; i++) {
            const lesson = allLessons[i];
            let dayScheduled = false;

            while (!dayScheduled && dayIdx < teachingDays.length) {
                const day = teachingDays[dayIdx];
                const dateObj = new Date(day.date);
                const weekNum = this.getWeekNumber(dateObj);

                if (weekNum !== lastWeekNum) {
                    weeklyHighComplexityCount = 0;
                    lastWeekNum = weekNum;
                }

                // RULE 2: Activity Padding & Heavy chapter buffer
                const paddingRequired = [DayType.PRE_EXAM, DayType.POST_EVENT].includes(day.day_type as any);
                const isHeavy = lesson.complexity_index > 8;

                if (paddingRequired && lesson.complexity_index > 4) {
                    masterSequence.push({ date: day.date, title_override: 'Revision / Buffer (Padding)' });
                    dayIdx++;
                    continue;
                }

                // RULE 1: Complexity Balancing (Max 3/week)
                if (isHeavy && weeklyHighComplexityCount >= 3) {
                    masterSequence.push({ date: day.date, title_override: 'Practice / Complexity Buffer' });
                    dayIdx++;
                    continue;
                }

                // Schedule it!
                masterSequence.push({ 
                    lesson_id: lesson.id, 
                    date: day.date,
                    teacher_id: firstTeacherId || undefined
                });

                if (isHeavy) weeklyHighComplexityCount++;

                // RULE 3: Unit Test Auto-Placement
                const nextLesson = allLessons[i + 1];
                if (nextLesson && nextLesson.unit_id !== lesson.unit_id) {
                    dayIdx++;
                    if (dayIdx < teachingDays.length) {
                        masterSequence.push({ 
                            date: teachingDays[dayIdx].date, 
                            title_override: `Unit Test: ${lesson.unit?.title || 'Unit Completion'}` 
                        });
                    }
                }

                dayScheduled = true;
                dayIdx++;
            }
        }

        // Apply MASTER SEQUENCE to ALL target sections (Parallel Sync)
        for (const section of targetSections) {
            const currentSectionId = section.id;
            const assignment = await this.teacherSubjectRepo.findOne({
                where: { class_id: classId, section_id: currentSectionId, subject_id: subjectId }
            });
            const teacherId = assignment ? assignment.teacher_id : null;

            for (const seq of masterSequence) {
                scheduledItems.push({
                    school_id: schoolId,
                    class_id: classId,
                    subject_id: subjectId,
                    section_id: currentSectionId,
                    teacher_id: teacherId || seq.teacher_id,
                    academic_year_id: yearId,
                    lesson_id: seq.lesson_id,
                    planned_date: seq.date,
                    title_override: seq.title_override,
                    status: 'Scheduled' as any
                });
            }
        }

        // 4. Batch Save
        // Note: For baseline, we usually clear old scheduled items first
        if (sectionId) {
            await this.scheduleRepo.delete({ 
                school_id: schoolId, academic_year_id: yearId,
                class_id: classId, subject_id: subjectId, section_id: sectionId
            });
        } else {
            await this.scheduleRepo.delete({ 
                school_id: schoolId, academic_year_id: yearId,
                class_id: classId, subject_id: subjectId
            });
        }

        const saved = await this.scheduleRepo.save(scheduledItems);
        
        return {
            message: 'Baseline schedule generated successfully',
            lessons_scheduled: allLessons.length,
            total_slots_used: scheduledItems.length,
            example_first_date: scheduledItems[0]?.planned_date
        };
    }

    private getWeekNumber(d: Date): number {
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    }
}
