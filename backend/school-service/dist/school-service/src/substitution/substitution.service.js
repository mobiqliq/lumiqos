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
var SubstitutionService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubstitutionService = void 0;
const common_1 = require("@nestjs/common");
const ai_service_1 = require("../ai/ai.service");
const index_1 = require("../../../shared/src/index");
let SubstitutionService = SubstitutionService_1 = class SubstitutionService {
    aiService;
    logger = new common_1.Logger(SubstitutionService_1.name);
    constructor(aiService) {
        this.aiService = aiService;
    }
    async getAbsences() {
        const store = index_1.TenantContext.getStore();
        const schoolId = store ? store.schoolId : 'demo-school';
        return [
            {
                id: 'abs_001',
                teacher_id: 'usr_t_004',
                teacher_name: 'Mr. Brown',
                reason: 'Sick Leave',
                status: 'pending_allocation',
                impacted_periods: [
                    { period: 1, class: 'Class 10A', subject: 'Social Studies', time: '09:00 AM - 09:45 AM' },
                    { period: 2, class: 'Class 9B', subject: 'Social Studies', time: '09:45 AM - 10:30 AM' }
                ]
            }
        ];
    }
    async allocateSubstitutes(absenceId, absentTeacherId, periods) {
        const store = index_1.TenantContext.getStore();
        const schoolId = store ? store.schoolId : 'demo-school';
        const allocationResult = await this.aiService.generateSubstituteAllocation(absentTeacherId, periods);
        return {
            absence_id: absenceId,
            ...allocationResult
        };
    }
    async notifySubstitutes(allocations) {
        this.logger.log('Sending automated push notifications to substitute teachers...');
        const notificationsSent = allocations.filter(a => a.substitute_id).length;
        return {
            status: 'Success',
            message: `Push notifications sent successfully to ${notificationsSent} allocated substitute(s).`
        };
    }
};
exports.SubstitutionService = SubstitutionService;
exports.SubstitutionService = SubstitutionService = SubstitutionService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [ai_service_1.AiService])
], SubstitutionService);
//# sourceMappingURL=substitution.service.js.map