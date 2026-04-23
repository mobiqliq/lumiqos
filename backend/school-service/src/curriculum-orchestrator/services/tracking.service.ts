import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CurriculumPlan } from '@xceliqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@xceliqos/shared/src/entities/curriculum-plan-item.entity';
import { TeachingLog } from '@xceliqos/shared/src/entities/teaching-log.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { AcademicCalendarEvent } from '@xceliqos/shared/src/entities/academic-calendar-event.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { LogTeachingDto } from '../dto/orchestrator.dto';

@Injectable()
export class CurriculumTrackingService {
    constructor(
        @InjectRepository(CurriculumPlan)
        private planRepo: Repository<CurriculumPlan>,
        @InjectRepository(CurriculumPlanItem)
        private itemRepo: Repository<CurriculumPlanItem>,
        @InjectRepository(TeachingLog)
        private logRepo: Repository<TeachingLog>,
        @InjectRepository(AcademicYear)
        private yearRepo: Repository<AcademicYear>,
        @InjectRepository(AcademicCalendarEvent)
        private calendarRepo: Repository<AcademicCalendarEvent>,
        @InjectRepository(Subject)
        private subjectRepo: Repository<Subject>,
    ) {}

    async logTeaching(schoolId: string, teacherId: string, dto: LogTeachingDto) {
        // 1. Create Log
        const log = this.logRepo.create({
            ...dto,
            school_id: schoolId,
            teacher_id: teacherId
        });
        const savedLog = await this.logRepo.save(log);

        // 2. Update Plan Items
        // Find the active plan for this class/subject
        const plan = await this.planRepo.findOne({
            where: { school_id: schoolId, class_id: dto.class_id, subject_id: dto.subject_id, status: 'active' }
        });

        if (plan) {
            // Mark items matching the topics as completed
            const items = await this.itemRepo.find({
                where: { plan_id: plan.id, status: 'pending' }
            });

            const topicIds = new Set(dto.topics_covered);
            for (const item of items) {
                if (topicIds.has(item.topic_id)) {
                    item.status = 'completed';
                    await this.itemRepo.save(item);
                }
            }
        }

        return savedLog;
    }

    async getCurriculumSummary(schoolId: string, academicYearId: string, classId: string, subjectId: string) {
        const plan = await this.planRepo.findOne({
            where: { school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId, status: 'active' },
            relations: ['items']
        });

        if (!plan) return null;

        const totalTopics = plan.items.length;
        const completedTopics = plan.items.filter(i => i.status === 'completed').length;
        const remainingTopics = totalTopics - completedTopics;
        
        const today = new Date().toISOString().split('T')[0];
        const delayedTopicsList = plan.items.filter(i => i.status === 'pending' && i.planned_date < today);
        const delayedTopics = delayedTopicsList.length;

        // Calculate delay days (max delay among topics)
        let delayDays = 0;
        if (delayedTopics > 0) {
            const earliestDelayed = new Date(Math.min(...delayedTopicsList.map(i => new Date(i.planned_date).getTime())));
            delayDays = Math.ceil((new Date(today).getTime() - earliestDelayed.getTime()) / (1000 * 3600 * 24));
        }

        // Calculate remaining days (deterministic: non-Sundays from today to planned_end_date)
        let remainingDays = 0;
        let curr = new Date(today);
        const end = new Date(plan.planned_end_date);
        while (curr <= end) {
            if (curr.getDay() !== 0) remainingDays++;
            curr.setDate(curr.getDate() + 1);
        }

        // Risk Logic
        let riskStatus = 'ON_TRACK';
        if (remainingDays <= 0 && remainingTopics > 0) {
            riskStatus = 'MISSED_DEADLINE';
        } else if (delayedTopics / totalTopics > 0.1) {
            riskStatus = 'DELAYED';
        } else if (remainingTopics > remainingDays) {
            riskStatus = 'AT_RISK';
        }

        // Next scheduled date: earliest pending item on or after today
        const futureItems = plan.items
            .filter(i => i.status === 'pending' && i.planned_date >= today)
            .sort((a, b) => a.planned_date.localeCompare(b.planned_date));
        const nextScheduledDate = futureItems.length > 0 ? futureItems[0].planned_date : null;

        return {
            plan_id: plan.id,
            subject_id: subjectId,
            completion_percentage: Math.round((completedTopics / totalTopics) * 100) || 0,
            total_topics: totalTopics,
            completed_topics: completedTopics,
            delayed_topics: delayedTopics,
            delay_days: delayDays,
            remaining_topics: remainingTopics,
            remaining_days: remainingDays,
            risk_status: riskStatus,
            next_scheduled_date: nextScheduledDate
        };
    }
}
