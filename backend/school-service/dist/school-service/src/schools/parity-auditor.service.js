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
var ParityAuditorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParityAuditorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const section_entity_1 = require("../../../shared/src/entities/section.entity");
let ParityAuditorService = ParityAuditorService_1 = class ParityAuditorService {
    scheduleRepo;
    classRepo;
    subjectRepo;
    sectionRepo;
    logger = new common_1.Logger(ParityAuditorService_1.name);
    constructor(scheduleRepo, classRepo, subjectRepo, sectionRepo) {
        this.scheduleRepo = scheduleRepo;
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
        this.sectionRepo = sectionRepo;
    }
    async getParityAudit(schoolId, yearId) {
        const todayDate = new Date().toISOString().split('T')[0];
        const schedules = await this.scheduleRepo.find({
            where: { school_id: schoolId, academic_year_id: yearId }
        });
        const tracking = {};
        for (const s of schedules) {
            if (!s.section_id)
                continue;
            const cId = s.class_id;
            const subId = s.subject_id;
            const secId = s.section_id;
            if (!tracking[cId])
                tracking[cId] = {};
            if (!tracking[cId][subId])
                tracking[cId][subId] = {};
            if (!tracking[cId][subId][secId])
                tracking[cId][subId][secId] = 0;
            if (s.status === planned_schedule_entity_1.ScheduleStatus.COMPLETED || s.planned_date < todayDate) {
                tracking[cId][subId][secId]++;
            }
        }
        const alerts = [];
        for (const [classId, subjects] of Object.entries(tracking)) {
            for (const [subjectId, sections] of Object.entries(subjects)) {
                const sectionEntries = Object.entries(sections);
                if (sectionEntries.length < 2)
                    continue;
                sectionEntries.sort((a, b) => b[1] - a[1]);
                const leadingSectionId = sectionEntries[0][0];
                const leadingCount = sectionEntries[0][1];
                const laggingSectionId = sectionEntries[sectionEntries.length - 1][0];
                const laggingCount = sectionEntries[sectionEntries.length - 1][1];
                const topicGap = leadingCount - laggingCount;
                if (topicGap > 3) {
                    const classEntity = await this.classRepo.findOne({ where: { id: classId } });
                    const subjectEntity = await this.subjectRepo.findOne({ where: { id: subjectId } });
                    const leadSecEntity = await this.sectionRepo.findOne({ where: { id: leadingSectionId } });
                    const lagSecEntity = await this.sectionRepo.findOne({ where: { id: laggingSectionId } });
                    const className = classEntity?.name || classEntity?.class_name || 'Class';
                    const subjectName = subjectEntity?.name || subjectEntity?.subject_name || 'Subject';
                    const leadName = leadSecEntity?.name || leadSecEntity?.section_name || 'Section A';
                    const lagName = lagSecEntity?.name || lagSecEntity?.section_name || 'Section B';
                    alerts.push({
                        class_id: classId,
                        class_name: className,
                        subject_id: subjectId,
                        subject_name: subjectName,
                        leading_section_name: leadName,
                        lagging_section_name: lagName,
                        topic_gap: topicGap,
                        recommendation: `In ${className} ${subjectName}, ${leadName} is ${topicGap} classes ahead of ${lagName}. Suggest moving 1 period from ${leadName} to ${lagName} next week to bring them back into sync before the Mid-Terms.`
                    });
                }
            }
        }
        return alerts;
    }
};
exports.ParityAuditorService = ParityAuditorService;
exports.ParityAuditorService = ParityAuditorService = ParityAuditorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(2, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __param(3, (0, typeorm_1.InjectRepository)(section_entity_1.Section)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ParityAuditorService);
//# sourceMappingURL=parity-auditor.service.js.map