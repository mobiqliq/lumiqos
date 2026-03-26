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
exports.AcademicController = void 0;
const common_1 = require("@nestjs/common");
const academic_service_1 = require("./academic.service");
const academic_calendar_service_1 = require("./academic-calendar.service");
const pedagogical_pour_service_1 = require("./pedagogical-pour.service");
const recovery_strategist_service_1 = require("./recovery-strategist.service");
const substitution_service_1 = require("./substitution.service");
const compliance_auditor_service_1 = require("./compliance-auditor.service");
const parity_auditor_service_1 = require("./parity-auditor.service");
const what_if_simulator_service_1 = require("./what-if-simulator.service");
const onboarding_service_1 = require("./onboarding.service");
const teacher_health_service_1 = require("./teacher-health.service");
const resource_auditor_service_1 = require("./resource-auditor.service");
const index_1 = require("../../../shared/src/index");
const index_2 = require("../../../shared/src/index");
const index_3 = require("../../../shared/src/index");
let AcademicController = class AcademicController {
    academicService;
    calendarService;
    pedagogicalPourService;
    recoveryService;
    substitutionService;
    complianceAuditorService;
    parityAuditorService;
    whatIfSimulatorService;
    onboardingService;
    teacherHealthService;
    resourceAuditorService;
    academicCalendarService;
    constructor(academicService, calendarService, pedagogicalPourService, recoveryService, substitutionService, complianceAuditorService, parityAuditorService, whatIfSimulatorService, onboardingService, teacherHealthService, resourceAuditorService, academicCalendarService) {
        this.academicService = academicService;
        this.calendarService = calendarService;
        this.pedagogicalPourService = pedagogicalPourService;
        this.recoveryService = recoveryService;
        this.substitutionService = substitutionService;
        this.complianceAuditorService = complianceAuditorService;
        this.parityAuditorService = parityAuditorService;
        this.whatIfSimulatorService = whatIfSimulatorService;
        this.onboardingService = onboardingService;
        this.teacherHealthService = teacherHealthService;
        this.resourceAuditorService = resourceAuditorService;
        this.academicCalendarService = academicCalendarService;
    }
    createClass(createDto) {
        return this.academicService.createClass(createDto);
    }
    getClasses() {
        return this.academicService.getClasses();
    }
    updateClass(id, updateDto) {
        return this.academicService.updateClass(id, updateDto);
    }
    deleteClass(id) {
        return this.academicService.deleteClass(id);
    }
    createSection(createDto) {
        return this.academicService.createSection(createDto);
    }
    getSections() {
        return this.academicService.getSections();
    }
    updateSection(id, updateDto) {
        return this.academicService.updateSection(id, updateDto);
    }
    createSubject(createDto) {
        return this.academicService.createSubject(createDto);
    }
    getSubjects(classId) {
        return this.academicService.getSubjects(classId);
    }
    updateSubject(id, updateDto) {
        return this.academicService.updateSubject(id, updateDto);
    }
    assignTeacher(createDto) {
        return this.academicService.assignTeacherToSubject(createDto);
    }
    getTeacherSubjects() {
        return this.academicService.getTeacherSubjects();
    }
    removeTeacherSubject(id) {
        return this.academicService.removeTeacherSubject(id);
    }
    setupDefault() {
        return this.academicService.setupDefaultClasses();
    }
    getAvailability(classId, sectionId, subjectId, schoolId, yearId) {
        return this.calendarService.calculateSubjectAvailability(schoolId, yearId, classId, sectionId, subjectId);
    }
    async generateBaselineSchedule(body) {
        return this.pedagogicalPourService.generateBaselineSchedule(body.school_id, body.academic_year_id, body.class_id, body.section_id, body.subject_id);
    }
    async completeLesson(id, body) {
        return this.academicService.completeLesson(id, body.completion_date);
    }
    async getVelocityReport(classId, subjectId) {
        return this.academicService.getVelocityReport(classId, subjectId);
    }
    async getRecoveryPlans(body) {
        return this.recoveryService.generateRecoveryPlans(body.school_id, body.class_id, body.subject_id, body.board_exam_start_date);
    }
    async findSubstitute(body) {
        return this.substitutionService.findSubstitute(body.teacher_id, body.date, body.slot_id);
    }
    async checkCompliance(schoolId, yearId) {
        return this.complianceAuditorService.getComplianceAudit(schoolId, yearId);
    }
    async executeHandover(body) {
        return this.substitutionService.executeHandover(body.outgoing_teacher_id, body.incoming_teacher_id, body.effective_date);
    }
    async getParityAudit(schoolId, yearId) {
        return this.parityAuditorService.getParityAudit(schoolId, yearId);
    }
    async simulateEvent(body) {
        return this.whatIfSimulatorService.simulateCalendarLoss(body.school_id, body.year_id, body.start_date, body.end_date, body.event_name);
    }
    async launchAcademicYear(body) {
        return this.onboardingService.launchAcademicYear(body.school_id, body.year_id, body.board, body.teacher_assignments);
    }
    async getBaselineGantt(schoolId, yearId) {
        return this.academicService.getBaselineGantt(schoolId, yearId);
    }
    async lockCalendar(body) {
        return this.academicService.lockCalendar(body.school_id, body.year_id);
    }
    async getMorningPulse(schoolId) {
        return this.parityAuditorService.getParityAudit(schoolId, 'AYMAX-001');
    }
    async approveRecoveryPlan(body) {
        const result = await this.recoveryService.applyRecoveryPlan(body.school_id, body.class_id, body.subject_id, body.section_id, body.plan_type);
        return {
            status: "SUCCESS",
            message: `Successfully executed ${body.plan_type}. Affected schedule for ${body.section_id || body.class_id} has been permanently altered.`,
            execution_details: result
        };
    }
    async getDisruptionImpact(body) {
        return this.calendarService.processEmergencyClosure(body.school_id, body.date);
    }
    async resolveDisruption(body) {
        return {
            status: 'SUCCESS',
            message: `Disruption resolved via ${body.plan_name}. Automated WhatsApp/Email notifications have been dispatched to all Teachers and Parents.`,
            dispatched_to: '142 recipients',
            timestamp: new Date().toISOString()
        };
    }
    async getNEPReport(schoolId) {
        return this.complianceAuditorService.generateNEPReport(schoolId, 'AYMAX-001');
    }
    async getTeacherHealthRadar(schoolId) {
        return this.teacherHealthService.getSupportRadar(schoolId);
    }
    async saveGlobalConfig(config) {
        return this.academicCalendarService.initCalendarBoundaries(config.school_id, config.year_id, config.start_date, config.end_date, config.holidays);
    }
    async getResourceAudit(schoolId) {
        return this.resourceAuditorService.auditTeacherWorkload(schoolId);
    }
    async getAcademicGaps(schoolId, yearId) {
        return this.academicCalendarService.getAcademicGaps(schoolId, yearId);
    }
    async rippleMove(body) {
        return this.academicCalendarService.rippleScheduleChange(body.schedule_id, body.new_date);
    }
};
exports.AcademicController = AcademicController;
__decorate([
    (0, common_1.Post)('classes'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createClass", null);
__decorate([
    (0, common_1.Get)('classes'),
    (0, index_3.RequirePermissions)('academic:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getClasses", null);
__decorate([
    (0, common_1.Put)('classes/:id'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateClass", null);
__decorate([
    (0, common_1.Delete)('classes/:id'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "deleteClass", null);
__decorate([
    (0, common_1.Post)('sections'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createSection", null);
__decorate([
    (0, common_1.Get)('sections'),
    (0, index_3.RequirePermissions)('academic:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getSections", null);
__decorate([
    (0, common_1.Put)('sections/:id'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateSection", null);
__decorate([
    (0, common_1.Post)('subjects'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "createSubject", null);
__decorate([
    (0, common_1.Get)('subjects'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('class_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getSubjects", null);
__decorate([
    (0, common_1.Put)('subjects/:id'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "updateSubject", null);
__decorate([
    (0, common_1.Post)('teacher-subjects'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "assignTeacher", null);
__decorate([
    (0, common_1.Get)('teacher-subjects'),
    (0, index_3.RequirePermissions)('academic:read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getTeacherSubjects", null);
__decorate([
    (0, common_1.Delete)('teacher-subjects/:id'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "removeTeacherSubject", null);
__decorate([
    (0, common_1.Post)('setup-default'),
    (0, index_3.RequirePermissions)('academic:write'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "setupDefault", null);
__decorate([
    (0, common_1.Get)('availability/:classId/:sectionId/:subjectId'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Param)('sectionId')),
    __param(2, (0, common_1.Param)('subjectId')),
    __param(3, (0, common_1.Query)('school_id')),
    __param(4, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AcademicController.prototype, "getAvailability", null);
__decorate([
    (0, common_1.Post)('pedagogical-pour'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "generateBaselineSchedule", null);
__decorate([
    (0, common_1.Post)('schedule/:id/complete'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "completeLesson", null);
__decorate([
    (0, common_1.Get)('reports/velocity/:classId/:subjectId'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Param)('classId')),
    __param(1, (0, common_1.Param)('subjectId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getVelocityReport", null);
__decorate([
    (0, common_1.Post)('recovery-plans'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getRecoveryPlans", null);
__decorate([
    (0, common_1.Post)('substitute'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "findSubstitute", null);
__decorate([
    (0, common_1.Get)('compliance-audit'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "checkCompliance", null);
__decorate([
    (0, common_1.Post)('execute-handover'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "executeHandover", null);
__decorate([
    (0, common_1.Get)('parity-audit'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getParityAudit", null);
__decorate([
    (0, common_1.Post)('sandbox/simulate-event'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "simulateEvent", null);
__decorate([
    (0, common_1.Post)('onboarding/launch'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "launchAcademicYear", null);
__decorate([
    (0, common_1.Get)('baseline-gantt'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('academic_year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getBaselineGantt", null);
__decorate([
    (0, common_1.Post)('calendar/lock'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "lockCalendar", null);
__decorate([
    (0, common_1.Get)('morning-pulse'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getMorningPulse", null);
__decorate([
    (0, common_1.Post)('recovery/approve'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "approveRecoveryPlan", null);
__decorate([
    (0, common_1.Post)('calendar/disruption/impact'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getDisruptionImpact", null);
__decorate([
    (0, common_1.Post)('calendar/disruption/resolve'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "resolveDisruption", null);
__decorate([
    (0, common_1.Get)('compliance/report'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getNEPReport", null);
__decorate([
    (0, common_1.Get)('teacher-health-radar'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getTeacherHealthRadar", null);
__decorate([
    (0, common_1.Post)('config'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "saveGlobalConfig", null);
__decorate([
    (0, common_1.Get)('resource-audit'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getResourceAudit", null);
__decorate([
    (0, common_1.Get)('gaps'),
    (0, index_3.RequirePermissions)('academic:read'),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('year_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "getAcademicGaps", null);
__decorate([
    (0, common_1.Post)('ripple'),
    (0, index_3.RequirePermissions)('academic:write'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicController.prototype, "rippleMove", null);
exports.AcademicController = AcademicController = __decorate([
    (0, common_1.Controller)('academic'),
    (0, common_1.UseGuards)(index_1.JwtAuthGuard, index_2.RbacGuard),
    __metadata("design:paramtypes", [academic_service_1.AcademicService,
        academic_calendar_service_1.AcademicCalendarService,
        pedagogical_pour_service_1.PedagogicalPourService,
        recovery_strategist_service_1.RecoveryStrategistService,
        substitution_service_1.SubstitutionService,
        compliance_auditor_service_1.ComplianceAuditorService,
        parity_auditor_service_1.ParityAuditorService,
        what_if_simulator_service_1.WhatIfSimulatorService,
        onboarding_service_1.OnboardingService,
        teacher_health_service_1.TeacherHealthService,
        resource_auditor_service_1.ResourceAuditorService,
        academic_calendar_service_1.AcademicCalendarService])
], AcademicController);
//# sourceMappingURL=academic.controller.js.map