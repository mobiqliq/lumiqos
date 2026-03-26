"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WhatIfSimulatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WhatIfSimulatorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
let WhatIfSimulatorService = WhatIfSimulatorService_1 = class WhatIfSimulatorService {
    scheduleRepo;
    classRepo;
    subjectRepo;
    logger = new common_1.Logger(WhatIfSimulatorService_1.name);
    constructor(scheduleRepo, classRepo, subjectRepo) {
        this.scheduleRepo = scheduleRepo;
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
    }
    async simulateCalendarLoss(schoolId, yearId, startDate, endDate, eventName) {
        this.logger.log(`Running What-If Simulation: Injecting ${eventName} from ${startDate} to ${endDate}`);
        const affectedSchedules = await this.scheduleRepo.find({
            where: {
                school_id: schoolId,
                academic_year_id: yearId,
                status: planned_schedule_entity_1.ScheduleStatus.SCHEDULED,
                planned_date: (0, typeorm_2.Between)(startDate, endDate)
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
        const lostPeriodsMap = {};
        for (const s of affectedSchedules) {
            const key = `${s.class_id}_${s.subject_id}`;
            if (!lostPeriodsMap[key]) {
                lostPeriodsMap[key] = { classEnt: s.class, subEnt: s.subject, lostCount: 0 };
            }
            lostPeriodsMap[key].lostCount++;
        }
        const casualtyReport = [];
        let criticalCount = 0;
        for (const [key, data] of Object.entries(lostPeriodsMap)) {
            const classId = data.classEnt.id;
            const subjectId = data.subEnt.id;
            const lastScheduled = await this.scheduleRepo.findOne({
                where: { school_id: schoolId, class_id: classId, subject_id: subjectId, status: planned_schedule_entity_1.ScheduleStatus.SCHEDULED },
                order: { planned_date: 'DESC' }
            });
            const boardExamDate = '2026-03-01';
            if (lastScheduled) {
                const currentEndDate = new Date(lastScheduled.planned_date);
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
                }
                else {
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
            casualty_report: casualtyReport.sort((a, b) => a.status === 'CRITICAL_CASUALTY' ? -1 : 1)
        };
    }
};
exports.WhatIfSimulatorService = WhatIfSimulatorService;
exports.WhatIfSimulatorService = WhatIfSimulatorService = WhatIfSimulatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(2, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], WhatIfSimulatorService);
//# sourceMappingURL=what-if-simulator.service.js.map