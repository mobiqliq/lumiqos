import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumPlan } from '@xceliqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@xceliqos/shared/src/entities/curriculum-plan-item.entity';
import { Syllabus } from '@xceliqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@xceliqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { GeneratePlanDto } from '../dto/orchestrator.dto';

@Injectable()
export class CurriculumPlannerService {
    constructor(
        @InjectRepository(CurriculumPlan)
        private planRepo: Repository<CurriculumPlan>,
        @InjectRepository(CurriculumPlanItem)
        private itemRepo: Repository<CurriculumPlanItem>,
        @InjectRepository(Syllabus)
        private syllabusRepo: Repository<Syllabus>,
        @InjectRepository(AcademicCalendarEvent)
        private calendarRepo: Repository<AcademicCalendarEvent>,
        @InjectRepository(AcademicYear)
        private yearRepo: Repository<AcademicYear>,
    ) {}

    async generatePlan(schoolId: string, dto: GeneratePlanDto) {
        const { academic_year_id, class_id, subject_id, planned_start_date, planned_end_date } = dto;

        const year = await this.yearRepo.findOne({ where: { id: academic_year_id, school_id: schoolId } });
        if (!year) throw new NotFoundException('Academic Year not found');

        const syllabusEntries = await this.syllabusRepo.find({ 
            where: { school_id: schoolId, class_id, subject_id } 
        });
        if (syllabusEntries.length === 0) throw new BadRequestException('Syllabus is empty for this class/subject');

        const start = planned_start_date ? new Date(planned_start_date) : new Date(year.start_date);
        const end = planned_end_date ? new Date(planned_end_date) : new Date(year.end_date);

        // Deterministic teaching day identification (Excluding Sundays)
        // AcademicCalendarEvent is a monthly summary, so we use Sundays as standard holidays.
        const teachingDays: string[] = [];
        let curr = new Date(start);
        while (curr <= end) {
            const dateStr = curr.toISOString().split('T')[0];
            const isSunday = curr.getDay() === 0;
            if (!isSunday) {
                teachingDays.push(dateStr);
            }
            curr.setDate(curr.getDate() + 1);
        }

        if (teachingDays.length === 0) throw new BadRequestException('Zero teaching days available');

        const plan = this.planRepo.create({
            school_id: schoolId,
            academic_year_id,
            class_id,
            subject_id,
            planned_start_date: start.toISOString().split('T')[0],
            planned_end_date: end.toISOString().split('T')[0],
            total_topics: syllabusEntries.length,
            total_estimated_hours: syllabusEntries.reduce((acc, s) => acc + (s.units || 1), 0),
            status: 'active'
        });
        const savedPlan = await this.planRepo.save(plan);

        const items: CurriculumPlanItem[] = [];
        for (let i = 0; i < syllabusEntries.length; i++) {
            const dayIndex = i % teachingDays.length;
            const planned_date = teachingDays[dayIndex];
            
            items.push(this.itemRepo.create({
                plan_id: savedPlan.id,
                topic_id: syllabusEntries[i].id,
                planned_date,
                planned_sessions: 1,
                status: 'pending'
            }));
        }

        await this.itemRepo.save(items);
        return { ...savedPlan, items };
    }

    async getPlan(schoolId: string, planId: string) {
        const plan = await this.planRepo.findOne({
            where: { id: planId, school_id: schoolId },
            relations: ['items', 'items.syllabus']
        });
        if (!plan) throw new NotFoundException('Plan not found');

        const today = new Date().toISOString().split('T')[0];
        const enrichedItems = plan.items.map(item => ({
            ...item,
            status: (item.status === 'pending' && item.planned_date < today) ? 'MISSED' : item.status
        }));

        const completed = enrichedItems.filter(i => i.status === 'completed').length;
        const progress = enrichedItems.length > 0 ? (completed / enrichedItems.length) * 100 : 0;

        return { ...plan, items: enrichedItems, progress: Math.round(progress) };
    }

    async getPlansForClass(schoolId: string, academicYearId: string, classId: string) {
        return this.planRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, status: 'active' },
            relations: ['subject']
        });
    }
}
