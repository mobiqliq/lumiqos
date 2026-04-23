import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolCalendarConfig } from '@xceliqos/shared/src/entities/school-calendar-config.entity';
import { TimetablePeriod } from '@xceliqos/shared/src/entities/timetable-period.entity';
import { WeeklyTimetable } from '@xceliqos/shared/src/entities/weekly-timetable.entity';
import { SubjectAllocation } from '@xceliqos/shared/src/entities/subject-allocation.entity';

@Injectable()
export class SchoolConfigService {
    constructor(
        @InjectRepository(SchoolCalendarConfig)
        private readonly calendarConfigRepo: Repository<SchoolCalendarConfig>,
        @InjectRepository(TimetablePeriod)
        private readonly periodRepo: Repository<TimetablePeriod>,
        @InjectRepository(WeeklyTimetable)
        private readonly timetableRepo: Repository<WeeklyTimetable>,
        @InjectRepository(SubjectAllocation)
        private readonly allocationRepo: Repository<SubjectAllocation>,
    ) {}

    // --- Calendar Config ---
    async getCalendarConfig(school_id: string, academic_year_id: string) {
        return this.calendarConfigRepo.findOne({
            where: { school_id, academic_year_id },
        });
    }

    async upsertCalendarConfig(school_id: string, dto: Partial<SchoolCalendarConfig>) {
        const existing = await this.calendarConfigRepo.findOne({
            where: { school_id, academic_year_id: dto.academic_year_id },
        });
        if (existing) {
            Object.assign(existing, dto);
            return this.calendarConfigRepo.save(existing);
        }
        return this.calendarConfigRepo.save(
            this.calendarConfigRepo.create({ ...dto, school_id }),
        );
    }

    // --- Timetable Periods ---
    async getPeriods(school_id: string, academic_year_id: string) {
        return this.periodRepo.find({
            where: { school_id, academic_year_id, is_active: true },
            order: { order_index: 'ASC' },
        });
    }

    async upsertPeriods(school_id: string, academic_year_id: string, periods: Partial<TimetablePeriod>[]) {
        const results = [];
        for (const p of periods) {
            const existing = await this.periodRepo.findOne({
                where: { school_id, academic_year_id, order_index: p.order_index, day_cycle_label: p.day_cycle_label ?? undefined },
            });
            if (existing) {
                Object.assign(existing, p);
                results.push(await this.periodRepo.save(existing));
            } else {
                results.push(await this.periodRepo.save(
                    this.periodRepo.create({ ...p, school_id, academic_year_id }),
                ));
            }
        }
        return results;
    }

    // --- Weekly Timetable ---
    async getWeeklyTimetable(school_id: string, academic_year_id: string, class_id?: string) {
        const where: any = { school_id, academic_year_id, is_active: true };
        if (class_id) where.class_id = class_id;
        return this.timetableRepo.find({ where });
    }

    async upsertWeeklyTimetable(school_id: string, entries: Partial<WeeklyTimetable>[]) {
        const results = [];
        for (const e of entries) {
            const existing = await this.timetableRepo.findOne({
                where: {
                    school_id,
                    academic_year_id: e.academic_year_id,
                    class_id: e.class_id,
                    timetable_period_id: e.timetable_period_id,
                    day_of_week: e.day_of_week,
                    day_cycle_label: e.day_cycle_label ?? undefined,
                },
            });
            if (existing) {
                Object.assign(existing, e);
                results.push(await this.timetableRepo.save(existing));
            } else {
                results.push(await this.timetableRepo.save(
                    this.timetableRepo.create({ ...e, school_id }),
                ));
            }
        }
        return results;
    }

    // --- Subject Allocation ---
    async getSubjectAllocations(school_id: string, academic_year_id: string, class_id?: string) {
        const where: any = { school_id, academic_year_id };
        if (class_id) where.class_id = class_id;
        return this.allocationRepo.find({ where });
    }

    async upsertSubjectAllocations(school_id: string, allocations: Partial<SubjectAllocation>[]) {
        const results = [];
        for (const a of allocations) {
            const existing = await this.allocationRepo.findOne({
                where: { school_id, academic_year_id: a.academic_year_id, class_id: a.class_id, subject_id: a.subject_id },
            });
            if (existing) {
                Object.assign(existing, a);
                results.push(await this.allocationRepo.save(existing));
            } else {
                results.push(await this.allocationRepo.save(
                    this.allocationRepo.create({ ...a, school_id }),
                ));
            }
        }
        return results;
    }
}
