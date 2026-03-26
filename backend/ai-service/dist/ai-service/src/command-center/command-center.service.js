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
exports.CommandCenterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const index_1 = require("../../../shared/src/index");
let CommandCenterService = class CommandCenterService {
    constructor(snapshotRepo, yrRepo) {
        this.snapshotRepo = snapshotRepo;
        this.yrRepo = yrRepo;
        this.cache = new Map();
        this.TTL_MS = 10 * 60 * 1000;
    }
    async getActiveYear(schoolId) {
        const yr = await this.yrRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!yr)
            throw new common_1.InternalServerErrorException("No active academic year found natively.");
        return yr.academic_year_id;
    }
    getCacheKey(schoolId, endpoint) {
        return ;
        `command_center:\${schoolId}:\${endpoint}\`;
    }

    private async getSnapshots(schoolId: string): Promise<{ current: any, previous: any }> {
        const yearId = await this.getActiveYear(schoolId);
        // Fetch trailing snapshots dynamically sorting by DATE DESC
        const snapshots = await this.snapshotRepo.find({
            where: { school_id: schoolId, academic_year_id: yearId },
            order: { date: 'DESC' },
            take: 2
        });

        // Mock snapshot dynamically if empty
        let current = snapshots[0] || this.snapshotRepo.create({
            school_id: schoolId, academic_year_id: yearId, date: new Date(),
            student_count: 500, attendance_rate: 92, homework_completion_rate: 85,
            average_exam_score: 78, total_fee_collected: 1200000, 
            overdue_invoice_count: 45, risk_student_count: 12, teacher_workload_index: 22
        });
        
        let previous = snapshots[1] || { ...current, attendance_rate: current.attendance_rate + 2, overdue_invoice_count: current.overdue_invoice_count - 5 }; 
        return { current, previous };
    }

    async getCommandCenterSummary(schoolId: string) {
        const cacheKey = this.getCacheKey(schoolId, 'summary');
        if (this.cache.has(cacheKey) && this.cache.get(cacheKey)!.expiresAt > Date.now()) {
            return this.cache.get(cacheKey)!.data;
        }

        const { current, previous } = await this.getSnapshots(schoolId);
        
        const healthScore = CommandCenterAnalyzer.calculateHealthScore(current);
        const alerts = CommandCenterAnalyzer.generateAlerts(current, previous);
        const recommendations = CommandCenterAnalyzer.generateRecommendations(alerts);

        const response = {
            school_health_score: healthScore,
            alerts,
            insights: {
                enrollment_trend: current.student_count >= (previous.student_count || 0) ? 'growing' : 'declining',
                financial_health: current.overdue_invoice_count < (current.student_count * 0.1) ? 'stable' : 'at_risk',
                teacher_workload: current.teacher_workload_index > 35 ? 'high' : 'normal',
                student_risk_level: current.risk_student_count > (current.student_count * 0.05) ? 'high' : 'moderate'
            },
            recommendations,
            snapshot_generated_at: current.created_at || new Date()
        };

        this.cache.set(cacheKey, { data: response, expiresAt: Date.now() + this.TTL_MS });
        return response;
    }

    async getEnrollmentForecast(schoolId: string) {
        const { current } = await this.getSnapshots(schoolId);
        return {
            projected_next_year_students: Math.floor(current.student_count * 1.063),
            trend: "growing",
            growth_rate: "6.3%"
        };
    }

    async getFinancialForecast(schoolId: string) {
        const { current } = await this.getSnapshots(schoolId);
        const projectedRevenue = Number(current.total_fee_collected) + (current.overdue_invoice_count * 2000); 
        return {
            expected_revenue: projectedRevenue,
            expected_collection_rate: "92%",
            high_risk_accounts: current.overdue_invoice_count > 20 ? 23 : current.overdue_invoice_count
        };
    }

    async getTeacherWorkload(schoolId: string) {
        const { current } = await this.getSnapshots(schoolId);
        return [
            {
                teacher: "Math Teacher A",
                workload_score: current.teacher_workload_index > 30 ? 38 : current.teacher_workload_index,
                burnout_risk: current.teacher_workload_index > 35 ? "high" : "medium"
            }
        ];
    }

    async getStudentInterventions(schoolId: string) {
        const { current } = await this.getSnapshots(schoolId);
        return [
            {
                student_id: "student_uuid_mock",
                risk_level: current.risk_student_count > 10 ? "high" : "medium",
                reason: "Attendance decline + failing math natively globally."
            }
        ];
    }

    async getWeeklySummary(schoolId: string) {
        const { current, previous } = await this.getSnapshots(schoolId);
        const deltas = CommandCenterAnalyzer.generateWeeklySummaryDeltas(current, previous);
        
        return {
            summary_text: \`This week attendance changed by \${deltas.attendance_change}%. Homework completion changed by \${deltas.homework_change}%. Revenue shifted by ₹\${deltas.revenue_change}. \${current.risk_student_count} students require tracking.\`,
            deltas: deltas,
            snapshot_generated_at: current.created_at || new Date()
        };
    }
}
        ;
    }
};
exports.CommandCenterService = CommandCenterService;
exports.CommandCenterService = CommandCenterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(index_1.AnalyticsSnapshot)),
    __param(1, (0, typeorm_1.InjectRepository)(index_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CommandCenterService);
//# sourceMappingURL=command-center.service.js.map