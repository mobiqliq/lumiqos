import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumCalendar, CurriculumCalendarStatus, RegulatoryFramework } from '@xceliqos/shared/src/entities/curriculum-calendar.entity';
import { CurriculumCalendarEntry, CalendarEntryStatus } from '@xceliqos/shared/src/entities/curriculum-calendar-entry.entity';
import { SchoolCalendarConfig } from '@xceliqos/shared/src/entities/school-calendar-config.entity';
import { WeeklyTimetable } from '@xceliqos/shared/src/entities/weekly-timetable.entity';
import { SubjectAllocation } from '@xceliqos/shared/src/entities/subject-allocation.entity';
import { SchoolCurriculumMap } from '@xceliqos/shared/src/entities/school-curriculum-map.entity';
import { BoardSyllabus } from '@xceliqos/shared/src/entities/board-syllabus.entity';
import { TenantContext } from '@xceliqos/shared/index';

@Injectable()
export class CurriculumCalendarService {
  constructor(
    @InjectRepository(CurriculumCalendar) private readonly calendarRepo: Repository<CurriculumCalendar>,
    @InjectRepository(CurriculumCalendarEntry) private readonly entryRepo: Repository<CurriculumCalendarEntry>,
    @InjectRepository(SchoolCalendarConfig) private readonly calendarConfigRepo: Repository<SchoolCalendarConfig>,
    @InjectRepository(WeeklyTimetable) private readonly timetableRepo: Repository<WeeklyTimetable>,
    @InjectRepository(SubjectAllocation) private readonly allocationRepo: Repository<SubjectAllocation>,
    @InjectRepository(SchoolCurriculumMap) private readonly curriculumMapRepo: Repository<SchoolCurriculumMap>,
    @InjectRepository(BoardSyllabus) private readonly boardSyllabusRepo: Repository<BoardSyllabus>,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  // ── Date utilities (timezone-aware, globally safe) ─────────────────────

  private getWorkingDaysBetween(
    startDate: string,
    endDate: string,
    workingDayNumbers: number[],
    nonWorkingDates: Set<string>,
  ): string[] {
    const days: string[] = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      const dow = current.getDay();
      const iso = current.toISOString().split('T')[0];
      if (workingDayNumbers.includes(dow) && !nonWorkingDates.has(iso)) {
        days.push(iso);
      }
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  private buildNonWorkingSet(config: SchoolCalendarConfig): Set<string> {
    const set = new Set<string>();
    config.school_event_days
      .filter(d => !d.is_working_day)
      .forEach(d => set.add(d.date));
    config.state_holidays
      .filter(d => !d.principal_override)
      .forEach(d => set.add(d.date));
    config.exam_windows.forEach(w => {
      const s = new Date(w.start_date);
      const e = new Date(w.end_date);
      const c = new Date(s);
      while (c <= e) {
        set.add(c.toISOString().split('T')[0]);
        c.setDate(c.getDate() + 1);
      }
    });
    return set;
  }

  // ── Generate Calendar ─────────────────────────────────────────────────

  async generateCalendar(dto: {
    academic_year_id: string;
    class_id: string;
    subject_id: string;
    regulatory_framework?: RegulatoryFramework;
    timezone?: string;
  }, createdBy: string) {
    const schoolId = this.getSchoolId();

    // 1. Load calendar config
    const config = await this.calendarConfigRepo.findOne({
      where: { school_id: schoolId, academic_year_id: dto.academic_year_id },
    });
    if (!config) throw new NotFoundException('School calendar config not found for this academic year');

    // 2. Load timetable slots for this class+subject
    const slots = await this.timetableRepo.find({
      where: {
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        class_id: dto.class_id,
        subject_id: dto.subject_id,
        is_active: true,
      },
    });
    if (slots.length === 0) throw new BadRequestException('No timetable slots found for this class+subject');

    // 3. Load curriculum map
    const curriculumMap = await this.curriculumMapRepo.findOne({
      where: {
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        subject_id: dto.subject_id,
        class_id: dto.class_id,
        is_active: true,
      },
    });
    if (!curriculumMap) throw new NotFoundException('No active curriculum map found for this class+subject');

    // 4. Load subject allocation for compliance check
    const allocation = await this.allocationRepo.findOne({
      where: {
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        class_id: dto.class_id,
        subject_id: dto.subject_id,
      },
    });

    // 5. Build non-working date set
    const nonWorking = this.buildNonWorkingSet(config);

    // 6. Get all working days in the year
    const workingDays = this.getWorkingDaysBetween(
      config.year_start_date,
      config.year_end_date,
      config.working_day_numbers,
      nonWorking,
    );

    // 7. Build slot map: day_of_week → [slot]
    const slotsByDow = new Map<number, typeof slots>();
    slots.forEach(s => {
      if (!slotsByDow.has(s.day_of_week)) slotsByDow.set(s.day_of_week, []);
      slotsByDow.get(s.day_of_week)!.push(s);
    });

    // 8. Filter working days that have a timetable slot for this subject
    const teachingDays = workingDays.filter(d => {
      const dow = new Date(d).getDay();
      return slotsByDow.has(dow);
    });

    // 9. Distribute chapters across teaching days
    const chapters = curriculumMap.chapter_mappings ?? [];
    const totalTeachingDays = teachingDays.length;
    const totalChapters = chapters.length;

    // Distribute teaching days proportionally across chapters by estimated_periods
    const totalEstimatedPeriods = chapters.reduce((sum: number, c: any) => sum + (c.estimated_periods ?? 1), 0);

    // 10. Create/update CurriculumCalendar header
    let calendar = await this.calendarRepo.findOne({
      where: {
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        class_id: dto.class_id,
        subject_id: dto.subject_id,
      },
    });

    const framework = dto.regulatory_framework ?? RegulatoryFramework.CUSTOM;
    const minPeriods = allocation?.nep_minimum_periods_per_week ?? 0;

    if (calendar) {
      await this.calendarRepo.update(
        { school_id: schoolId, id: calendar.id },
        {
          school_curriculum_map_id: curriculumMap.id,
          regulatory_framework: framework,
          min_periods_required: minPeriods,
          total_planned_periods: teachingDays.length,
          status: CurriculumCalendarStatus.DRAFT,
          updated_by: createdBy,
        }
      );
      // Remove old draft entries
      await this.entryRepo
        .createQueryBuilder()
        .softDelete()
        .where('curriculum_calendar_id = :id AND school_id = :schoolId AND status = :status',
          { id: calendar.id, schoolId, status: CalendarEntryStatus.PLANNED })
        .execute();
    } else {
      calendar = this.calendarRepo.create({
        school_id: schoolId,
        academic_year_id: dto.academic_year_id,
        class_id: dto.class_id,
        subject_id: dto.subject_id,
        school_curriculum_map_id: curriculumMap.id,
        regulatory_framework: framework,
        min_periods_required: minPeriods,
        total_planned_periods: teachingDays.length,
        total_taught_periods: 0,
        total_missed_periods: 0,
        is_compliant: false,
        status: CurriculumCalendarStatus.DRAFT,
        timezone: dto.timezone ?? 'Asia/Kolkata',
        created_by: createdBy,
      } as any) as unknown as CurriculumCalendar;
      calendar = await this.calendarRepo.save(calendar);
    }

    // 11. Build entries — assign chapters to teaching days proportionally
    const entries: Partial<CurriculumCalendarEntry>[] = [];
    let dayIndex = 0;
    let sequenceIndex = 0;

    for (const chapter of chapters) {
      const chapterPeriods = Math.max(
        1,
        Math.round((chapter.estimated_periods / totalEstimatedPeriods) * totalTeachingDays)
      );

      for (let p = 0; p < chapterPeriods && dayIndex < teachingDays.length; p++) {
        const date = teachingDays[dayIndex];
        const dow = new Date(date).getDay();
        const slotList = slotsByDow.get(dow) ?? [];
        const slot = slotList[0];

        entries.push({
          school_id: schoolId,
          curriculum_calendar_id: calendar.id,
          academic_year_id: dto.academic_year_id,
          class_id: dto.class_id,
          subject_id: dto.subject_id,
          teacher_id: slot?.teacher_id,
          timetable_period_id: slot?.timetable_period_id,
          day_of_week: dow,
          planned_date: date,
          chapter_number: chapter.chapter_number,
          chapter_name: chapter.chapter_name,
          board_topic_ids: chapter.board_topic_ids ?? [],
          status: CalendarEntryStatus.PLANNED,
          is_substituted: false,
          sequence_index: sequenceIndex++,
          created_by: createdBy,
        });
        dayIndex++;
      }
    }

    // Batch save entries
    const saved = await this.entryRepo.save(entries as any[]);

    return {
      calendar,
      total_teaching_days: teachingDays.length,
      total_entries_generated: saved.length,
      chapters_covered: totalChapters,
    };
  }

  // ── Get Calendar ──────────────────────────────────────────────────────

  async getCalendar(academicYearId: string, classId: string, subjectId: string) {
    const schoolId = this.getSchoolId();
    const calendar = await this.calendarRepo.findOne({
      where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId },
    });
    if (!calendar) throw new NotFoundException('Curriculum calendar not found');

    const entries = await this.entryRepo.find({
      where: { school_id: schoolId, curriculum_calendar_id: calendar.id },
      order: { planned_date: 'ASC' },
    });

    return { calendar, entries };
  }

  // ── Publish ───────────────────────────────────────────────────────────

  async publishCalendar(calendarId: string, publishedBy: string) {
    const schoolId = this.getSchoolId();
    const calendar = await this.calendarRepo.findOne({
      where: { school_id: schoolId, id: calendarId },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    // Compliance check
    const allocation = await this.allocationRepo.findOne({
      where: {
        school_id: schoolId,
        academic_year_id: calendar.academic_year_id,
        class_id: calendar.class_id,
        subject_id: calendar.subject_id,
      },
    });

    const issues: any[] = [];

    if (allocation?.nep_minimum_periods_per_week) {
      const weeksInYear = Math.round(calendar.total_planned_periods / allocation.periods_per_week);
      const minTotal = allocation.nep_minimum_periods_per_week * weeksInYear;
      if (calendar.total_planned_periods < minTotal) {
        issues.push({
          type: 'insufficient_periods',
          framework: calendar.regulatory_framework,
          required: minTotal,
          planned: calendar.total_planned_periods,
          deficit: minTotal - calendar.total_planned_periods,
        });
      }
    }

    if (issues.length > 0) {
      throw new BadRequestException({
        message: `Calendar cannot be published — ${issues.length} compliance issue(s) found`,
        issues,
      });
    }

    await this.calendarRepo.update(
      { school_id: schoolId, id: calendarId },
      {
        status: CurriculumCalendarStatus.PUBLISHED,
        is_compliant: true,
        compliance_issues: [],
        published_at: new Date(),
        published_by: publishedBy,
        updated_by: publishedBy,
      }
    );

    return { success: true, calendar_id: calendarId };
  }

  // ── Mark Taught ───────────────────────────────────────────────────────

  async markTaught(entryId: string, dto: { notes?: string }, teacherId: string) {
    const schoolId = this.getSchoolId();
    const entry = await this.entryRepo.findOne({
      where: { school_id: schoolId, id: entryId },
    });
    if (!entry) throw new NotFoundException('Calendar entry not found');

    await this.entryRepo.update(
      { school_id: schoolId, id: entryId },
      {
        status: CalendarEntryStatus.TAUGHT,
        actual_date: new Date().toISOString().split('T')[0],
        marked_taught_at: new Date(),
        taught_notes: dto.notes,
        updated_by: teacherId,
      }
    );

    // Update calendar taught count
    await this.calendarRepo
      .createQueryBuilder()
      .update(CurriculumCalendar)
      .set({ total_taught_periods: () => 'total_taught_periods + 1' })
      .where('id = :id AND school_id = :schoolId', { id: entry.curriculum_calendar_id, schoolId })
      .execute();

    return { success: true, entry_id: entryId };
  }

  // ── Rebalance (3 scenarios) ───────────────────────────────────────────

  async rebalance(calendarId: string, lostDates: string[], createdBy: string) {
    const schoolId = this.getSchoolId();
    const calendar = await this.calendarRepo.findOne({
      where: { school_id: schoolId, id: calendarId },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    // Get all future planned entries
    const today = new Date().toISOString().split('T')[0];
    const plannedEntries = await this.entryRepo.find({
      where: { school_id: schoolId, curriculum_calendar_id: calendarId, status: CalendarEntryStatus.PLANNED },
      order: { planned_date: 'ASC' },
    });

    const lostSet = new Set(lostDates);
    const affectedEntries = plannedEntries.filter(e => lostSet.has(e.planned_date));
    const remainingEntries = plannedEntries.filter(e => !lostSet.has(e.planned_date) && e.planned_date >= today);

    if (affectedEntries.length === 0) {
      return { message: 'No planned entries fall on lost dates', scenarios: [] };
    }

    // Get all future available dates (not in lost set)
    const config = await this.calendarConfigRepo.findOne({
      where: { school_id: schoolId, academic_year_id: calendar.academic_year_id },
    });
    if (!config) throw new NotFoundException('Calendar config not found');

    const nonWorking = this.buildNonWorkingSet(config);
    lostDates.forEach(d => nonWorking.add(d));

    const allFutureDates = this.getWorkingDaysBetween(
      today,
      config.year_end_date,
      config.working_day_numbers,
      nonWorking,
    );

    // Slots for this subject
    const slots = await this.timetableRepo.find({
      where: {
        school_id: schoolId,
        academic_year_id: calendar.academic_year_id,
        class_id: calendar.class_id,
        subject_id: calendar.subject_id,
        is_active: true,
      },
    });
    const slotDows = new Set(slots.map(s => s.day_of_week));
    const availableDates = allFutureDates.filter(d => slotDows.has(new Date(d).getDay()));

    // Already used dates
    const usedDates = new Set(remainingEntries.map(e => e.planned_date));
    const freeDates = availableDates.filter(d => !usedDates.has(d));

    const lostCount = affectedEntries.length;

    // Scenario 1: Compress — double-up periods on existing free slots
    const scenario1Dates = freeDates.slice(0, lostCount);

    // Scenario 2: Extend year — use dates after year_end_date (if school can extend)
    const extendedDates = this.getWorkingDaysBetween(
      config.year_end_date,
      this.addDays(config.year_end_date, 30),
      config.working_day_numbers,
      new Set(lostDates),
    ).slice(0, lostCount);

    // Scenario 3: Drop lowest-priority topics — identify topics covered in multiple entries
    const topicCoverage = new Map<string, number>();
    remainingEntries.forEach(e => {
      (e.board_topic_ids ?? []).forEach((t: string) => {
        topicCoverage.set(t, (topicCoverage.get(t) ?? 0) + 1);
      });
    });
    const droppableEntries = affectedEntries.filter(e =>
      (e.board_topic_ids ?? []).every((t: string) => (topicCoverage.get(t) ?? 0) > 1)
    );

    const scenarios = [
      {
        scenario: 'compress',
        label: 'Compress — reschedule into available free slots within the year',
        lost_periods: lostCount,
        recoverable: scenario1Dates.length,
        unrecoverable: Math.max(0, lostCount - scenario1Dates.length),
        proposed_dates: scenario1Dates,
        risk: scenario1Dates.length < lostCount ? 'Some periods unrecoverable' : 'Low',
      },
      {
        scenario: 'extend',
        label: 'Extend — add teaching days beyond the current year end date',
        lost_periods: lostCount,
        recoverable: extendedDates.length,
        unrecoverable: Math.max(0, lostCount - extendedDates.length),
        proposed_dates: extendedDates,
        risk: 'Requires school calendar extension approval',
      },
      {
        scenario: 'drop',
        label: 'Drop — remove redundant topic entries (topics covered elsewhere)',
        lost_periods: lostCount,
        droppable_entries: droppableEntries.map(e => e.id),
        droppable_count: droppableEntries.length,
        unrecoverable: Math.max(0, lostCount - droppableEntries.length),
        risk: droppableEntries.length < lostCount ? 'Some unique topics will be untaught' : 'Low — all dropped topics covered elsewhere',
      },
    ];

    // Store rebalance summary on calendar
    await this.calendarRepo.update(
      { school_id: schoolId, id: calendarId },
      {
        last_rebalanced_at: new Date(),
        rebalance_summary: { lost_dates: lostDates, lost_count: lostCount, scenarios_generated: 3 },
        updated_by: createdBy,
      } as any
    );

    return { calendar_id: calendarId, lost_dates: lostDates, lost_count: lostCount, scenarios };
  }

  // ── Apply Rebalance Scenario ──────────────────────────────────────────

  async applyRebalanceScenario(calendarId: string, dto: {
    scenario: 'compress' | 'extend' | 'drop';
    lost_dates: string[];
    proposed_dates?: string[];
    drop_entry_ids?: string[];
  }, appliedBy: string) {
    const schoolId = this.getSchoolId();

    if (dto.scenario === 'drop' && dto.drop_entry_ids?.length) {
      await this.entryRepo
        .createQueryBuilder()
        .softDelete()
        .where('id IN (:...ids) AND school_id = :schoolId', { ids: dto.drop_entry_ids, schoolId })
        .execute();
      return { success: true, dropped: dto.drop_entry_ids.length };
    }

    if ((dto.scenario === 'compress' || dto.scenario === 'extend') && dto.proposed_dates?.length) {
      const lostSet = new Set(dto.lost_dates);
      const affected = await this.entryRepo.find({
        where: { school_id: schoolId, curriculum_calendar_id: calendarId, status: CalendarEntryStatus.PLANNED },
        order: { planned_date: 'ASC' },
      });
      const toReschedule = affected.filter(e => lostSet.has(e.planned_date));

      for (let i = 0; i < toReschedule.length && i < dto.proposed_dates.length; i++) {
        await this.entryRepo.update(
          { school_id: schoolId, id: toReschedule[i].id },
          {
            planned_date: dto.proposed_dates[i],
            day_of_week: new Date(dto.proposed_dates[i]).getDay(),
            status: CalendarEntryStatus.RESCHEDULED,
            rebalance_scenario: dto.scenario,
            updated_by: appliedBy,
          }
        );
      }
      return { success: true, rescheduled: Math.min(toReschedule.length, dto.proposed_dates.length) };
    }

    throw new BadRequestException('Invalid scenario or missing parameters');
  }

  // ── Coverage Report ───────────────────────────────────────────────────

  async getCoverage(academicYearId: string, classId: string, subjectId: string) {
    const schoolId = this.getSchoolId();
    const calendar = await this.calendarRepo.findOne({
      where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId },
    });
    if (!calendar) throw new NotFoundException('Calendar not found');

    const entries = await this.entryRepo.find({
      where: { school_id: schoolId, curriculum_calendar_id: calendar.id },
    });

    const planned = entries.filter(e => e.status === CalendarEntryStatus.PLANNED).length;
    const taught = entries.filter(e => e.status === CalendarEntryStatus.TAUGHT).length;
    const missed = entries.filter(e => e.status === CalendarEntryStatus.MISSED).length;
    const substituted = entries.filter(e => e.status === CalendarEntryStatus.SUBSTITUTED).length;

    const taughtTopics = new Set<string>();
    entries.filter(e => e.status === CalendarEntryStatus.TAUGHT)
      .forEach(e => (e.board_topic_ids ?? []).forEach((t: string) => taughtTopics.add(t)));

    const plannedTopics = new Set<string>();
    entries.forEach(e => (e.board_topic_ids ?? []).forEach((t: string) => plannedTopics.add(t)));

    return {
      calendar_id: calendar.id,
      subject_id: subjectId,
      class_id: classId,
      regulatory_framework: calendar.regulatory_framework,
      is_compliant: calendar.is_compliant,
      total_periods: entries.length,
      planned,
      taught,
      missed,
      substituted,
      coverage_percent: entries.length > 0 ? Math.round((taught / entries.length) * 100) : 0,
      topics_planned: plannedTopics.size,
      topics_taught: taughtTopics.size,
      topic_coverage_percent: plannedTopics.size > 0
        ? Math.round((taughtTopics.size / plannedTopics.size) * 100)
        : 0,
    };
  }

  private addDays(dateStr: string, days: number): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }
}
