import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SchoolCalendar, DayType } from '@xceliqos/shared/src/entities/school-calendar.entity';
import { TimeSlot } from '@xceliqos/shared/src/entities/time-slot.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { TeacherSubject } from '@xceliqos/shared/src/entities/teacher-subject.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { PlannedSchedule } from '@xceliqos/shared/src/entities/planned-schedule.entity';

@Injectable()
export class AcademicCalendarService {
    constructor(
        @InjectRepository(SchoolCalendar)
        private calendarRepo: Repository<SchoolCalendar>,
        @InjectRepository(TimeSlot)
        private slotRepo: Repository<TimeSlot>,
        @InjectRepository(AcademicYear)
        private yearRepo: Repository<AcademicYear>,
        @InjectRepository(TeacherSubject)
        private teacherSubjectRepo: Repository<TeacherSubject>,
        @InjectRepository(Class)
        private classRepo: Repository<Class>,
        @InjectRepository(Subject)
        private subjectRepo: Repository<Subject>,
        @InjectRepository(PlannedSchedule)
        private scheduleRepo: Repository<PlannedSchedule>,
    ) {}

    /**
     * Generates a school calendar for the entire academic year.
     * Excludes Sundays by default.
     */
    async generateYearCalendar(schoolId: string, yearId: string) {
        const year = await this.yearRepo.findOne({ where: { id: yearId } });
        if (!year) throw new Error('Academic year not found');

        const startDate = new Date(year.start_date);
        const endDate = new Date(year.end_date);
        const current = new Date(startDate);

        const entries = [];
        while (current <= endDate) {
            const dateStr = current.toISOString().split('T')[0];
            const isSunday = current.getDay() === 0;

            entries.push(this.calendarRepo.create({
                school_id: schoolId,
                academic_year_id: yearId,
                date: dateStr,
                day_type: isSunday ? DayType.HOLIDAY : DayType.TEACHING_DAY,
                is_working_day: !isSunday,
                description: isSunday ? 'Sunday' : undefined
            }));

            current.setDate(current.getDate() + 1);
        }

        return this.calendarRepo.save(entries);
    }

    /**
     * Calculates total available teaching minutes for a specific class/subject.
     * Assumes a standard period duration from TimeSlots.
     */
    async calculateTeachingCapacity(schoolId: string, yearId: string) {
        const teachingDays = await this.calendarRepo.count({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                is_working_day: true,
                day_type: DayType.TEACHING_DAY
            }
        });

        const slots = await this.slotRepo.find({ where: { school_id: schoolId } });
        
        // Calculate total minutes per day from slots
        let minutesPerDay = 0;
        slots.forEach(slot => {
            const [startH, startM] = slot.start_time.split(':').map(Number);
            const [endH, endM] = slot.end_time.split(':').map(Number);
            const duration = (endH * 60 + endM) - (startH * 60 + startM);
            minutesPerDay += duration;
        });

        // For simplicity, we currently assume all periods are available.
        // In a real scenario, we would filter by Class/Teacher timetable.
        return teachingDays * minutesPerDay;
    }

    /**
     * Flags a warning if Total_Estimated_Minutes > Total_Available_Minutes.
     */
    async validateCurriculumFit(availableMinutes: number, syllabusMinutes: number) {
        if (syllabusMinutes > availableMinutes) {
            return {
                valid: false,
                warning: `Curriculum overflow! Syllabus requires ${syllabusMinutes} mins, but only ${availableMinutes} are available.`,
                deficit: syllabusMinutes - availableMinutes
            };
        }
        return { valid: true, warning: null, deficit: 0 };
    }

    /**
     * Step 2.1: The "Availability" Calculator
     * Calculates the Total Available Periods for a specific Subject/Class.
     */
    async calculateSubjectAvailability(schoolId: string, yearId: string, classId: string, sectionId: string, subjectId: string) {
        // 1. Get Subject/Class mapping for periods per day
        const mapping = await this.teacherSubjectRepo.findOne({
            where: { school_id: schoolId, class_id: classId, section_id: sectionId, subject_id: subjectId }
        });

        const periodsPerDay = mapping?.periods_per_day || 1;

        // 2. Count Teaching Days (excluding Sundays, holidays, and blackout dates)
        // Blackout dates are already subtracted if we only count Teaching_Day
        const teachingDays = await this.calendarRepo.count({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                day_type: DayType.TEACHING_DAY,
                is_working_day: true
            }
        });

        const totalAvailablePeriods = teachingDays * periodsPerDay;

        // 3. Get metadata for formatting
        const cls = await this.classRepo.findOne({ where: { id: classId } });
        const sub = await this.subjectRepo.findOne({ where: { id: subjectId } });

        return {
            class: cls?.name,
            subject: sub?.name,
            total_available_periods: totalAvailablePeriods,
            formatted: `${cls?.name} | ${sub?.name} | Total Available Periods: ${totalAvailablePeriods}`
        };
    }

    /**
     * Phase 5: Sudden Disruption (Rainy Day)
     * Marks a day as closed and calculates the "Casualty Report" of delayed lessons.
     */
    async processEmergencyClosure(schoolId: string, date: string) {
        // 1. Mark date as holiday in SchoolCalendar
        const calendarEntry = await this.calendarRepo.findOne({ where: { school_id: schoolId, date: date } });
        if (calendarEntry) {
            calendarEntry.is_working_day = false;
            calendarEntry.day_type = DayType.HOLIDAY;
            calendarEntry.description = 'Emergency Closure (Rainy Day)';
            await this.calendarRepo.save(calendarEntry);
        }

        // 2. Count affected lessons across the ENTIRE school for this date
        const affectedCount = await this.scheduleRepo.count({
            where: { school_id: schoolId, planned_date: date }
        });

        // 3. Generate the 3 Recovery Paths for the Principal
        return {
            date: date,
            affected_lessons: affectedCount,
            recovery_plans: [
                {
                    id: 'EMER_PLAN_A',
                    name: 'Plan A: Buffer Burn',
                    description: 'Convert existing Revision/Buffer slots into teaching periods to reclaim the lost day.',
                    action: 'BURN_BUFFERS'
                },
                {
                    id: 'EMER_PLAN_B',
                    name: 'Plan B: Saturday Swap',
                    description: 'Convert the very next non-working Saturday into a full teaching day.',
                    action: 'SATURDAY_SWAP'
                },
                {
                    id: 'EMER_PLAN_C',
                    name: 'Plan C: Pedagogical Compression',
                    description: 'Merge upcoming curriculum units into fewer slots to maintain the March Board Exam deadline.',
                    action: 'MERGE_UNITS'
                }
            ]
        };
    }

    /**
     * Step 1.1: Global Configuration (Setting the Boundaries)
     * Seeds the SchoolCalendar with Start/End dates and uploaded Holidays.
     */
    async initCalendarBoundaries(
        schoolId: string, 
        yearId: string, 
        startDate: string, 
        endDate: string, 
        holidays: Array<{ date: string, description: string }>
    ) {
        // 1. Wipe existing calendar for this year to start clean
        await this.calendarRepo.delete({ school_id: schoolId, academic_year_id: yearId });

        const start = new Date(startDate);
        const end = new Date(endDate);
        const current = new Date(start);
        const entries = [];

        while (current <= end) {
            const dateStr = current.toISOString().split('T')[0];
            const isSunday = current.getDay() === 0;
            const holiday = holidays.find(h => h.date === dateStr);

            entries.push(this.calendarRepo.create({
                school_id: schoolId,
                academic_year_id: yearId,
                date: dateStr,
                day_type: holiday ? DayType.HOLIDAY : (isSunday ? DayType.HOLIDAY : DayType.TEACHING_DAY),
                is_working_day: !holiday && !isSunday,
                description: holiday ? holiday.description : (isSunday ? 'Sunday' : undefined)
            }));

            current.setDate(current.getDate() + 1);
        }

        return this.calendarRepo.save(entries);
    }

    /**
     * Step 4.1: The Gap Finder
     * Scans for subjects finishing too close to the academic year end.
     */
    async getAcademicGaps(schoolId: string, yearId: string) {
        const year = await this.yearRepo.findOne({ where: { id: yearId } });
        if (!year) return [];

        const termEnd = new Date(year.end_date);
        
        // Find the last lesson for each subject
        const lastLessons = await this.scheduleRepo
            .createQueryBuilder('s')
            .select(['s.subject_id', 'MAX(s.planned_date) as last_date'])
            .where('s.school_id = :schoolId', { schoolId })
            .andWhere('s.academic_year_id = :yearId', { yearId })
            .groupBy('s.subject_id')
            .getRawMany();

        const gaps = [];
        for (const ll of lastLessons) {
            const lastDate = new Date(ll.last_date);
            const diffDays = Math.ceil((termEnd.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays < 15) {
                const sub = await this.subjectRepo.findOne({ where: { id: ll.subject_id } });
                gaps.push({
                    subject_id: ll.subject_id,
                    subject_name: sub?.name,
                    last_date: ll.last_date,
                    buffer_days: diffDays,
                    risk: diffDays < 5 ? 'CRITICAL' : 'WARNING',
                    message: `Warning: ${sub?.name} finishes on ${ll.last_date}, leaving only ${diffDays} days for Revision before year end.`
                });
            }
        }
        return gaps;
    }

    /**
     * Step 4.2: The Ripple Engine (Manual Tweak Ripple)
     * Shifts all subsequent lessons when one is moved.
     */
    async rippleScheduleChange(scheduleId: string, newDate: string) {
        const item = await this.scheduleRepo.findOne({ where: { id: scheduleId } });
        if (!item) return;

        const oldDate = item.planned_date;
        item.planned_date = newDate;
        await this.scheduleRepo.save(item);

        // Find all lessons for this Section/Subject that were planned AFTER the old date
        const downstream = await this.scheduleRepo.find({
            where: {
                school_id: item.school_id,
                academic_year_id: item.academic_year_id,
                class_id: item.class_id,
                section_id: item.section_id,
                subject_id: item.subject_id,
                planned_date: Between(oldDate, '2099-12-31')
            },
            order: { planned_date: 'ASC' }
        });

        // Filter for those strictly after the moved one
        const itemsToShift = downstream.filter(d => d.id !== scheduleId);

        // Get the list of next available teaching days starting from newDate
        const teachingDays = await this.calendarRepo.find({
            where: {
                school_id: item.school_id,
                academic_year_id: item.academic_year_id,
                date: Between(newDate, '2099-12-31'),
                is_working_day: true
            },
            order: { date: 'ASC' }
        });

        // Move the downstream items to the next teaching days sequentially
        let dayIdx = 0;
        if (teachingDays[0]?.date === newDate) dayIdx = 1;

        for (const ds of itemsToShift) {
            if (dayIdx < teachingDays.length) {
                ds.planned_date = teachingDays[dayIdx].date;
                dayIdx++;
            }
        }

        await this.scheduleRepo.save(itemsToShift);
        return { shifted: itemsToShift.length };
    }
}
