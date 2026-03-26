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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
let AppController = class AppController {
    appService;
    schoolClient;
    constructor(appService, schoolClient) {
        this.appService = appService;
        this.schoolClient = schoolClient;
    }
    getHello() {
        return this.appService.getHello();
    }
    async getDemoData() {
        const schools = await (0, rxjs_1.firstValueFrom)(this.schoolClient.send({ cmd: 'get_schools' }, {})).catch(() => []);
        const school = schools.length > 0 ? schools[0] : { id: 'GFA', name: 'Greenfield Academy', school_code: 'GFA-2026' };
        const schoolId = school.id;
        const [students, teachers, dashboardStats] = await Promise.all([
            (0, rxjs_1.firstValueFrom)(this.schoolClient.send({ cmd: 'get_students' }, { schoolId })).catch(() => []),
            (0, rxjs_1.firstValueFrom)(this.schoolClient.send({ cmd: 'get_teachers' }, { schoolId })).catch(() => []),
            (0, rxjs_1.firstValueFrom)(this.schoolClient.send({ cmd: 'get_dashboard_overview' }, { schoolId })).catch(() => ({})),
        ]);
        return {
            school: {
                name: school.name || school.school_name,
                code: school.school_code || school.code,
                region: school.region || 'ap-south-1',
                affiliationBoard: school.affiliation_board || 'CBSE'
            },
            students: students.map((s) => ({
                id: s.id,
                first_name: s.first_name,
                last_name: s.last_name,
                admission_number: s.admission_number,
                class_name: 'Class 10',
                section: 'A',
                status: s.status,
                attendance: Math.floor(Math.random() * 15) + 85,
                avgScore: Math.floor(Math.random() * 20) + 75,
                feeStatus: s.id.includes('5') ? 'overdue' : 'paid',
                risk: s.id.includes('5') ? 'high' : 'low',
                xp: s.xp || 0,
                level: s.level || 1,
                streak_days: s.streak_days || 0,
                skill_tree: s.skill_tree || null
            })),
            teachers: teachers.map((t) => ({
                id: t.id,
                name: `${t.first_name} ${t.last_name}`,
                subject: 'Science',
                classes: 'Class 9, 10',
                experience: '10 yrs',
                status: t.status,
                leavesTaken: 2,
                leavesTotal: 15,
                rating: 4.8
            })),
            classes: [
                { name: 'Class 10', sections: ['A'], students: students.length, classTeacher: 'Sunita Verma', avgScore: 82 },
                { name: 'Class 9', sections: ['A', 'B'], students: 64, classTeacher: 'Mohammed Ali', avgScore: 75 },
            ],
            announcements: [
                { id: 1, title: 'Annual Sports Day', body: 'Annual Sports Day will be held on March 25th.', time: '2 hours ago', priority: 'important' },
                { id: 2, title: 'Science Exhibition', body: 'Inter-school science exhibition entries open.', time: '3 days ago', priority: 'info' },
            ],
            fees: students.map((s) => ({
                student: `${s.first_name} ${s.last_name}`,
                class: 'Class 10-A',
                amount: '₹15,000',
                due: 'Mar 31',
                status: s.id.includes('5') ? 'overdue' : 'paid'
            })),
            timetable: [
                { period: 1, time: '8:00 – 8:45', subject: 'Mathematics', teacher: 'Dr. Rajesh Kumar', status: 'completed' },
                { period: 2, time: '8:45 – 9:30', subject: 'English', teacher: 'Sunita Verma', status: 'current' },
                { period: 3, time: '9:45 – 10:30', subject: 'Science', teacher: 'Mohammed Ali', status: 'upcoming' },
            ],
            insights: {
                principal: [
                    {
                        type: 'warning',
                        icon: '⚠️',
                        title: 'Attendance Alert',
                        body: `Today's attendance is ${dashboardStats.attendance?.today_attendance_rate || 0}%. ${dashboardStats.attendance?.absent_students_today || 0} students are absent.`,
                        action: 'View Details'
                    },
                    {
                        type: 'prediction',
                        icon: '📈',
                        title: 'Fee Collection',
                        body: `Outstanding fees: ₹${dashboardStats.finance?.outstanding_fees || 0}. ${dashboardStats.finance?.overdue_invoices || 0} invoices are overdue.`,
                        action: 'Send Reminders'
                    },
                ],
                teacher: [
                    { type: 'action', icon: '📝', title: 'Homework Pending', body: `${dashboardStats.homework?.pending_homework_reviews || 0} homework reviews pending.`, action: 'Grade Now' },
                    { type: 'highlight', icon: '⭐', title: 'Class Performance', body: `Class 10 average is ${dashboardStats.academics?.average_exam_score || 0}% this term.`, action: 'View Details' },
                ],
                parent: [
                    { type: 'highlight', icon: '⭐', title: 'Great Progress!', body: 'Aarav scored 92% in Math — up from 85% last month. Keep it up!', action: 'View Report' },
                ],
                finance: [
                    { type: 'prediction', title: 'Fee Collection Target', body: 'On track to meet 95% of monthly target. ₹1.2L expected by Friday.', action: 'View Report' },
                    { type: 'warning', title: 'Overdue Payments', body: 'Batch of 12 invoices are 15+ days overdue.', action: 'Send Reminders' }
                ],
                hr: [
                    { type: 'action', title: 'Leave Approvals', body: '3 staff leave requests pending review.', action: 'Review Now' },
                    { type: 'highlight', title: 'Attendance Streak', body: '98% staff attendance maintained this week.', action: 'View Analytics' }
                ],
                admin: [
                    { type: 'prediction', title: 'Admission Forecast', body: 'Projected 15% increase in sibling enrollments for next term.', action: 'View Leads' },
                    { type: 'warning', title: 'Compliance Audit', body: 'Fire safety certificate expires in 12 days.', action: 'Renew Now' }
                ]
            },
            stats: {
                totalStudents: dashboardStats.students?.total_students || 0,
                activeEnrolled: dashboardStats.students?.active_students || 0,
                attendanceToday: dashboardStats.attendance?.today_attendance_rate || 0,
                overdueInvoices: dashboardStats.finance?.overdue_invoices || 0
            },
            copilotConversations: {
                principal: [
                    { q: 'Which students need attention this week?', a: '3 students flagged as high-risk:\n• **Priya Patel** (Class 10A) — 72% attendance, 54% avg score\n• **Vikram Reddy** (Class 8A) — 68% attendance, overdue fees\n• **Karthik Rao** (Class 10B) — 65% attendance, 42% avg, overdue fees\n\n💡 Recommend scheduling parent meetings for all three.' },
                ],
                teacher: [
                    { q: 'How are my Class 10 students doing?', a: '**Class 10 Summary:**\n• Top scorer: Aarav Sharma (88% avg)\n• Needs help: Karthik Rao (42% avg) & Priya Patel (54% avg)\n• Class attendance: 78% avg' },
                ],
            },
            reportCards: [
                { subject: 'Mathematics', midterm: 88, final: 92, grade: 'A+', remarks: 'Excellent analytical skills' },
                { subject: 'Science', midterm: 90, final: 94, grade: 'A+', remarks: 'Outstanding lab work' },
            ],
            admissionsPipeline: [
                { stage: 'Leads', count: 48, color: '#3b82f6' },
                { stage: 'Applied', count: 32, color: '#8b5cf6' },
                { stage: 'Entrance', count: 24, color: '#f59e0b' },
                { stage: 'Offered', count: 18, color: '#10b981' },
            ],
            expenses: [
                { category: 'Salaries', amount: '₹12.4L', pct: 65 },
                { category: 'Maintenance', amount: '₹2.1L', pct: 15 },
                { category: 'Supplies', amount: '₹1.8L', pct: 10 },
                { category: 'Utilities', amount: '₹1.2L', pct: 10 },
            ]
        };
    }
    async getPeriodConfig() {
        const schoolId = 'GFA';
        return (0, rxjs_1.firstValueFrom)(this.schoolClient.send({ cmd: 'get_period_config' }, { schoolId }));
    }
    async savePeriodConfig(body) {
        const schoolId = 'GFA';
        return (0, rxjs_1.firstValueFrom)(this.schoolClient.send({ cmd: 'save_period_config' }, { schoolId, config: body.config }));
    }
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], AppController.prototype, "getHello", null);
__decorate([
    (0, common_1.Get)('demo-data'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getDemoData", null);
__decorate([
    (0, common_1.Get)('periods-config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getPeriodConfig", null);
__decorate([
    (0, common_1.Post)('periods-config'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "savePeriodConfig", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __param(1, (0, common_1.Inject)('SCHOOL_SERVICE')),
    __metadata("design:paramtypes", [app_service_1.AppService,
        microservices_1.ClientProxy])
], AppController);
//# sourceMappingURL=app.controller.js.map