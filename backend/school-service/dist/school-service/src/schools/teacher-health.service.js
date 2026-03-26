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
exports.TeacherHealthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const planned_schedule_entity_1 = require("../../../shared/src/entities/planned-schedule.entity");
const teacher_subject_entity_1 = require("../../../shared/src/entities/teacher-subject.entity");
const user_entity_1 = require("../../../shared/src/entities/user.entity");
const academic_service_1 = require("./academic.service");
let TeacherHealthService = class TeacherHealthService {
    scheduleRepo;
    teacherSubjectRepo;
    userRepo;
    academicService;
    constructor(scheduleRepo, teacherSubjectRepo, userRepo, academicService) {
        this.scheduleRepo = scheduleRepo;
        this.teacherSubjectRepo = teacherSubjectRepo;
        this.userRepo = userRepo;
        this.academicService = academicService;
    }
    async getSupportRadar(schoolId) {
        const mappings = await this.teacherSubjectRepo.find({
            where: { school_id: schoolId },
            relations: ['teacher']
        });
        const teacherIds = [...new Set(mappings.map(m => m.teacher_id))];
        const alerts = [];
        for (const tId of teacherIds) {
            const sample = mappings.find(m => m.teacher_id === tId);
            if (!sample)
                continue;
            const velocityReport = await this.academicService.getVelocityReport(sample.class_id, sample.subject_id, schoolId);
            if (velocityReport.velocity < 0.85) {
                const futureLessons = await this.scheduleRepo.find({
                    where: {
                        school_id: schoolId,
                        teacher_id: tId,
                        status: planned_schedule_entity_1.ScheduleStatus.SCHEDULED
                    },
                    order: { planned_date: 'ASC' },
                    take: 10,
                    relations: ['lesson']
                });
                const totalComplexity = futureLessons.reduce((sum, s) => sum + (s.lesson?.complexity_index || 5), 0);
                const avgComplexity = futureLessons.length > 0 ? totalComplexity / futureLessons.length : 5;
                const teacher = await this.userRepo.findOne({ where: { id: tId } });
                if (avgComplexity > 7) {
                    alerts.push({
                        teacher_id: tId,
                        teacher_name: teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Teacher',
                        velocity: velocityReport.velocity,
                        density_score: avgComplexity.toFixed(1),
                        diagnosis: 'OVERLOAD_DETECTED',
                        rationale: `Velocity is low (${velocityReport.velocity.toFixed(2)}v) primarily due to high average lesson complexity (${avgComplexity.toFixed(1)}/10). This creates a 'dense schedule' bottleneck.`,
                        recommendation: 'Recommend reassigning 2 upcoming high-complexity units to an Assistant Teacher to prevent burnout.',
                        action_label: '⚡ Support Required'
                    });
                }
                else {
                    alerts.push({
                        teacher_id: tId,
                        teacher_name: teacher ? `${teacher.first_name || ''} ${teacher.last_name || ''}`.trim() : 'Teacher',
                        velocity: velocityReport.velocity,
                        density_score: avgComplexity.toFixed(1),
                        diagnosis: 'PEDAGOGICAL_LAG',
                        rationale: 'Velocity is low but lesson complexity is moderate. This indicates a standard instructional lag.',
                        recommendation: 'Scheduled a brief check-in or suggest Plan B (Lesson Compression).',
                        action_label: '💬 Check-in'
                    });
                }
            }
        }
        return alerts;
    }
};
exports.TeacherHealthService = TeacherHealthService;
exports.TeacherHealthService = TeacherHealthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(planned_schedule_entity_1.PlannedSchedule)),
    __param(1, (0, typeorm_1.InjectRepository)(teacher_subject_entity_1.TeacherSubject)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        academic_service_1.AcademicService])
], TeacherHealthService);
//# sourceMappingURL=teacher-health.service.js.map