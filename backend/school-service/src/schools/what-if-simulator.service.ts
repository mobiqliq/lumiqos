import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PlannedSchedule, ScheduleStatus } from '@xceliqos/shared/src/entities/planned-schedule.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';

@Injectable()
export class WhatIfSimulatorService {
    private readonly logger = new Logger(WhatIfSimulatorService.name);

    constructor(
        @InjectRepository(PlannedSchedule) private readonly scheduleRepo: Repository<PlannedSchedule>,
        @InjectRepository(Class) private readonly classRepo: Repository<Class>,
        @InjectRepository(Subject) private readonly subjectRepo: Repository<Subject>,
    ) {}

    async simulateCalendarLoss(
        schoolId: string, 
        yearId: string, 
        startDate: string, 
        endDate: string, 
        eventName: string
    ) {
        this.logger.log(`Running What-If Simulation: Injecting ${eventName} from ${startDate} to ${endDate}`);

        // 1. Find all classes scheduled during this hypothetical event
        const affectedSchedules = await this.scheduleRepo.find({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                status: ScheduleStatus.SCHEDULED,
                planned_date: Between(startDate, endDate)
            },
            relations: ['class', 'subject']
        });

        if (affectedSchedules.length === 0) {
            return {
                event: eventName,
                status: 'SAFE',
                message: 'No classes are scheduled during this period. Safe to proceed.',
                casualty_report: []
            };
        }

        // 2. Group lost periods by Class + Subject
        const lostPeriodsMap: Record<string, { classEnt: Class, subEnt: Subject, lostCount: number }> = {};

        for (const s of affectedSchedules) {
            const key = `${s.class_id}_${s.subject_id}`;
            if (!lostPeriodsMap[key]) {
                lostPeriodsMap[key] = { classEnt: s.class, subEnt: s.subject, lostCount: 0 };
            }
            lostPeriodsMap[key].lostCount++;
        }

        // 3. Generate Casualty Report
        const casualtyReport = [];
        let criticalCount = 0;

        for (const [key, data] of Object.entries(lostPeriodsMap)) {
            const classId = data.classEnt.id;
            const subjectId = data.subEnt.id;

            // Find the CURRENT last scheduled date for this class/subject
            const lastScheduled = await this.scheduleRepo.findOne({
                where: { school_id: schoolId, class_id: classId, subject_id: subjectId, status: ScheduleStatus.SCHEDULED },
                order: { planned_date: 'DESC' }
            });

            // Heuristic Board Exam Date
            const boardExamDate = '2026-03-01'; 
            
            if (lastScheduled) {
                const currentEndDate = new Date(lastScheduled.planned_date);
                // Add lost days (rough calculation: lostCount * 1.5 days to account for weekends/buffer spacing)
                currentEndDate.setDate(currentEndDate.getDate() + Math.ceil(data.lostCount * 1.5));
                
                const projectedEndDateStr = currentEndDate.toISOString().split('T')[0];
                const isCasualty = projectedEndDateStr > boardExamDate;

                if (isCasualty) {
                    criticalCount++;
                    casualtyReport.push({
                        class_name: data.classEnt.name || data.classEnt.class_name,
                        subject_name: data.subEnt.name || data.subEnt.subject_name,
                        lost_periods: data.lostCount,
                        original_end_date: lastScheduled.planned_date,
                        projected_end_date: projectedEndDateStr,
                        board_exam_date: boardExamDate,
                        status: 'CRITICAL_CASUALTY',
                        warning: `Syllabus completion will push past Board Exams (${boardExamDate})!`
                    });
                } else {
                    casualtyReport.push({
                        class_name: data.classEnt.name || data.classEnt.class_name,
                        subject_name: data.subEnt.name || data.subEnt.subject_name,
                        lost_periods: data.lostCount,
                        original_end_date: lastScheduled.planned_date,
                        projected_end_date: projectedEndDateStr,
                        board_exam_date: boardExamDate,
                        status: 'RECOVERABLE',
                        warning: 'Can be recovered using Buffer periods or Saturdays.'
                    });
                }
            }
        }

        const overallStatus = criticalCount > 0 ? 'CRITICAL_RISK' : 'MANAGEABLE';

        return {
            event: eventName,
            simulated_dates: `${startDate} to ${endDate}`,
            total_affected_periods: affectedSchedules.length,
            overall_status: overallStatus,
            casualty_report: casualtyReport.sort((a,b) => a.status === 'CRITICAL_CASUALTY' ? -1 : 1)
        };
    }
}
