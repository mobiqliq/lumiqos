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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceAuditorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
let ResourceAuditorService = class ResourceAuditorService {
    teacherSubjectRepo;
    userRepo;
    constructor(teacherSubjectRepo, userRepo) {
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.userRepo = userRepo;
    }
    async auditTeacherWorkload(schoolId) {
        const assignments = await this.teacherSubjectRepo.find({
            where: { school_id: schoolId },
            relations: ['teacher']
        });
        const teacherLoads = {};
        for (const ass of assignments) {
            const tId = ass.teacher_id;
            if (!tId)
                continue;
            const teacher = await this.userRepo.findOne({ where: { id: tId } });
            const teacherName = teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Unknown';
            if (!teacherLoads[tId]) {
                teacherLoads[tId] = { name: teacherName, total_periods: 0, sections: [] };
            }
            const periodsPerWeek = (ass.periods_per_day || 1) * 6;
            teacherLoads[tId].total_periods += periodsPerWeek;
            teacherLoads[tId].sections.push(`${ass.class_id}-${ass.section_id} (${ass.subject_id})`);
        }
        const alerts = [];
        for (const [tId, data] of Object.entries(teacherLoads)) {
            if (data.total_periods > 32) {
                alerts.push({
                    teacher_id: tId,
                    teacher_name: data.name,
                    weekly_periods: data.total_periods,
                    limit: 32,
                    risk_level: data.total_periods > 38 ? 'CRITICAL' : 'HIGH',
                    message: `${data.name} is assigned ${data.total_periods} periods/week. This exceeds the CBSE recommendation of 28-32.`,
                    affected_sections: data.sections
                });
            }
        }
        return {
            audit_timestamp: new Date().toISOString(),
            status: alerts.length > 0 ? 'WARNING' : 'HEALTHY',
            alerts: alerts
        };
    }
};
exports.ResourceAuditorService = ResourceAuditorService;
exports.ResourceAuditorService = ResourceAuditorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ResourceAuditorService);
//# sourceMappingURL=resource-auditor.service.js.map