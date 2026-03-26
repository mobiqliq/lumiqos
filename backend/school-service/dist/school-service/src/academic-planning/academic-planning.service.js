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
exports.AcademicPlanningService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const academic_plan_entity_1 = require("../../../shared/src/entities/academic-plan.entity");
const academic_plan_item_entity_1 = require("../../../shared/src/entities/academic-plan-item.entity");
const planning_day_entity_1 = require("../../../shared/src/entities/planning-day.entity");
const board_entity_1 = require("../../../shared/src/entities/board.entity");
const syllabus_entity_1 = require("../../../shared/src/entities/syllabus.entity");
const academic_calendar_event_entity_1 = require("../../../shared/src/entities/academic-calendar-event.entity");
const academic_year_entity_1 = require("../../../shared/src/entities/academic-year.entity");
const curriculum_plan_entity_1 = require("../../../shared/src/entities/curriculum-plan.entity");
const curriculum_plan_item_entity_1 = require("../../../shared/src/entities/curriculum-plan-item.entity");
const exam_entity_1 = require("../../../shared/src/entities/exam.entity");
const class_entity_1 = require("../../../shared/src/entities/class.entity");
const subject_entity_1 = require("../../../shared/src/entities/subject.entity");
const syllabus_topic_entity_1 = require("../../../shared/src/entities/syllabus-topic.entity");
const uuid_1 = require("uuid");
let AcademicPlanningService = class AcademicPlanningService {
    planRepo;
    itemRepo;
    syllabusTopicRepo;
    planningDayRepo;
    boardConfigRepo;
    syllabusRepo;
    calendarEventRepo;
    academicYearRepo;
    curriculumPlanRepo;
    curriculumItemRepo;
    examRepo;
    classRepo;
    subjectRepo;
    constructor(planRepo, itemRepo, syllabusTopicRepo, planningDayRepo, boardConfigRepo, syllabusRepo, calendarEventRepo, academicYearRepo, curriculumPlanRepo, curriculumItemRepo, examRepo, classRepo, subjectRepo) {
        this.planRepo = planRepo;
        this.itemRepo = itemRepo;
        this.syllabusTopicRepo = syllabusTopicRepo;
        this.planningDayRepo = planningDayRepo;
        this.boardConfigRepo = boardConfigRepo;
        this.syllabusRepo = syllabusRepo;
        this.calendarEventRepo = calendarEventRepo;
        this.academicYearRepo = academicYearRepo;
        this.curriculumPlanRepo = curriculumPlanRepo;
        this.curriculumItemRepo = curriculumItemRepo;
        this.examRepo = examRepo;
        this.classRepo = classRepo;
        this.subjectRepo = subjectRepo;
    }
    async syncCalendar(schoolId, academicYearId) {
        const events = await this.calendarEventRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId }
        });
        const academicYear = await this.academicYearRepo.findOne({ where: { id: academicYearId } });
        if (!academicYear)
            throw new common_1.NotFoundException('Academic Year not found');
        await this.planningDayRepo.delete({ school_id: schoolId, academic_year_id: academicYearId });
        const daysToSave = [];
        for (const event of events) {
            const daysInMonth = new Date(academicYear.start_date.getFullYear(), event.month_index, 0).getDate();
            const workingDays = new Set(event.working_days || []);
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(academicYear.start_date.getFullYear(), event.month_index - 1, day);
                const dateStr = date.toISOString().split('T')[0];
                const type = workingDays.has(day) ? 'WORKING' : 'HOLIDAY';
                daysToSave.push(this.planningDayRepo.create({
                    id: (0, uuid_1.v4)(),
                    school_id: schoolId,
                    academic_year_id: academicYearId,
                    date: dateStr,
                    type: type
                }));
            }
        }
        const finalExams = await this.examRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId }
        });
        for (const exam of finalExams) {
            if (exam.start_date && exam.end_date) {
                const start = new Date(exam.start_date);
                const end = new Date(exam.end_date);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const ds = d.toISOString().split('T')[0];
                    const dayEntry = daysToSave.find(de => de.date === ds);
                    if (dayEntry)
                        dayEntry.type = 'EXAM';
                }
            }
        }
        await this.planningDayRepo.save(daysToSave);
        return { message: 'Calendar synced successfully', count: daysToSave.length };
    }
    async generatePlan(schoolId, academicYearId, classId, subjectId, disruptionMode = false) {
        const existingPlans = await this.planRepo.find({
            where: {
                school_id: schoolId,
                academic_year_id: academicYearId,
                class_id: classId,
                subject_id: subjectId
            },
            order: { version: 'DESC' }
        });
        const baselinePlan = existingPlans.find(p => p.is_baseline);
        if (baselinePlan && baselinePlan.status === 'approved' && !disruptionMode) {
            throw new common_1.ConflictException('A baseline plan already exists and is approved. Use disruption mode to regenerate.');
        }
        const nextVersion = existingPlans.length > 0 ? existingPlans[0].version + 1 : 1;
        const syllabus = await this.syllabusRepo.findOne({
            where: { school_id: schoolId, class_id: classId, subject_id: subjectId }
        });
        if (!syllabus) {
            throw new common_1.ConflictException('Academic plan generation requires a structured syllabus.');
        }
        const topics = await this.syllabusTopicRepo.find({
            where: { syllabus_id: syllabus.id },
            order: { sequence: 'ASC' }
        });
        if (topics.length === 0) {
            throw new common_1.ConflictException('Syllabus has no topics configured. Cannot generate plan.');
        }
        const boardConfig = await this.boardConfigRepo.findOne({
            where: { name: 'CBSE' }
        }) || { exam_buffer_days: 7, revision_days: 14, max_sessions_per_day: 1 };
        const finalExam = await this.examRepo.findOne({
            where: { school_id: schoolId, academic_year_id: academicYearId },
            order: { start_date: 'DESC' }
        });
        if (!finalExam || !finalExam.start_date)
            throw new common_1.NotFoundException('Final Exam dates not found for year');
        await this.syncCalendar(schoolId, academicYearId);
        const workingDays = await this.planningDayRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId, type: 'WORKING' },
            order: { date: 'ASC' }
        });
        if (disruptionMode && baselinePlan) {
            return this.generateAdjustedPlan(schoolId, academicYearId, classId, subjectId, baselinePlan, syllabus, workingDays);
        }
        const examStart = new Date(finalExam.start_date);
        const bufferOffset = boardConfig.exam_buffer_days + boardConfig.revision_days;
        let lastTeachingDateIdx = workingDays.findIndex(wd => new Date(wd.date) >= examStart) - 1;
        if (lastTeachingDateIdx < 0)
            lastTeachingDateIdx = workingDays.length - 1;
        lastTeachingDateIdx -= bufferOffset;
        if (lastTeachingDateIdx < 0 || lastTeachingDateIdx < topics.length) {
            const plan = this.planRepo.create({
                id: (0, uuid_1.v4)(),
                school_id: schoolId,
                academic_year_id: academicYearId,
                class_id: classId,
                subject_id: subjectId,
                version: nextVersion,
                is_baseline: false,
                status: 'infeasible'
            });
            await this.planRepo.save(plan);
            return {
                plan_id: plan.id,
                total_topics: topics.length,
                total_days: workingDays.length,
                completion_date: null,
                feasibility_status: 'infeasible'
            };
        }
        const plan = this.planRepo.create({
            id: (0, uuid_1.v4)(),
            school_id: schoolId,
            academic_year_id: academicYearId,
            class_id: classId,
            subject_id: subjectId,
            version: nextVersion,
            is_baseline: false,
            status: 'generated'
        });
        await this.planRepo.save(plan);
        const planItems = [];
        let currentDayIdx = lastTeachingDateIdx;
        for (let i = topics.length - 1; i >= 0; i--) {
            const topic = topics[i];
            const wd = workingDays[currentDayIdx];
            planItems.push(this.itemRepo.create({
                id: (0, uuid_1.v4)(),
                plan_id: plan.id,
                class_id: classId,
                subject_id: subjectId,
                topic_index: topic.sequence,
                planned_date: wd.date,
                session_count: 1
            }));
            currentDayIdx--;
        }
        await this.itemRepo.save(planItems);
        return {
            plan_id: plan.id,
            total_topics: topics.length,
            total_days: workingDays.length,
            completion_date: workingDays[lastTeachingDateIdx].date,
            feasibility_status: 'generated'
        };
    }
    async getPlan(planId) {
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        const items = await this.itemRepo.find({ where: { plan_id: planId }, order: { topic_index: 'ASC' } });
        return { plan, items };
    }
    async approvePlan(planId) {
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        if (plan.status === 'infeasible')
            throw new common_1.ConflictException('Cannot approve infeasible plan');
        plan.status = 'approved';
        plan.is_baseline = true;
        await this.planRepo.save(plan);
        await this.planRepo.createQueryBuilder()
            .update(academic_plan_entity_1.AcademicPlan)
            .set({ is_baseline: false })
            .where('school_id = :schoolId', { schoolId: plan.school_id })
            .andWhere('academic_year_id = :yId', { yId: plan.academic_year_id })
            .andWhere('class_id = :cId', { cId: plan.class_id })
            .andWhere('subject_id = :sId', { sId: plan.subject_id })
            .andWhere('id != :currentId', { currentId: plan.id })
            .execute();
        const items = await this.itemRepo.find({ where: { plan_id: planId } });
        const classId = items[0]?.class_id;
        const subjectId = items[0]?.subject_id;
        if (classId && subjectId) {
            let cPlan = await this.curriculumPlanRepo.findOne({
                where: { school_id: plan.school_id, class_id: classId, subject_id: subjectId, academic_year_id: plan.academic_year_id }
            });
            if (!cPlan) {
                const syllabus = await this.syllabusRepo.findOne({
                    where: { school_id: plan.school_id, class_id: classId, subject_id: subjectId }
                });
                const sortedItems = [...items].sort((a, b) => a.topic_index - b.topic_index);
                const startDate = sortedItems[0]?.planned_date;
                const endDate = sortedItems[sortedItems.length - 1]?.planned_date;
                cPlan = this.curriculumPlanRepo.create({
                    id: (0, uuid_1.v4)(),
                    school_id: plan.school_id,
                    class_id: classId,
                    subject_id: subjectId,
                    academic_year_id: plan.academic_year_id,
                    total_topics: syllabus?.total_topics || items.length,
                    total_estimated_hours: (syllabus?.total_topics || items.length) * 1,
                    planned_start_date: startDate,
                    planned_end_date: endDate,
                    status: 'active'
                });
                await this.curriculumPlanRepo.save(cPlan);
            }
            const existingCItems = await this.curriculumItemRepo.find({ where: { plan_id: cPlan.id } });
            const existingIndices = new Set(existingCItems.map(ci => parseInt(ci.topic_id || '0', 10)));
            const cItems = items
                .filter(api => !existingIndices.has(api.topic_index))
                .map(api => ({
                id: (0, uuid_1.v4)(),
                plan_id: cPlan.id,
                topic_id: api.topic_index.toString(),
                planned_date: api.planned_date,
                status: 'PLANNED'
            }));
            if (cItems.length > 0) {
                await this.curriculumItemRepo.save(cItems);
            }
        }
        return { success: true, message: 'Plan approved as academic baseline for tracking.' };
    }
    async getLatestPlanStatus(schoolId, academicYearId, classId, subjectId) {
        const sId = schoolId?.trim();
        const yId = academicYearId?.trim();
        const cId = classId?.trim();
        const subId = subjectId?.trim();
        try {
            const plan = await this.planRepo.findOne({
                where: { school_id: sId, academic_year_id: yId, class_id: cId, subject_id: subId },
                order: { version: 'DESC', is_baseline: 'DESC' }
            });
            if (!plan)
                return { status: 'NONE' };
            return {
                status: plan.status.toUpperCase(),
                plan_id: plan.id,
                version: plan.version,
                is_baseline: plan.is_baseline
            };
        }
        catch (err) {
            console.error(`[DEBUG] ERROR in getLatestPlanStatus:`, err);
            return { status: 'ERROR', message: err.message };
        }
    }
    async getPlanPreview(planId) {
        console.log(`[DEBUG] getPlanPreview for planId: ${planId}`);
        try {
            const { plan, items } = await this.getPlan(planId);
            console.log(`[DEBUG] Found plan: ${plan.id}, items count: ${items.length}`);
            const academicYear = await this.academicYearRepo.findOne({ where: { id: plan.academic_year_id } });
            if (!academicYear)
                throw new common_1.NotFoundException('Academic Year not found');
            const syllabus = await this.syllabusRepo.findOne({
                where: { school_id: plan.school_id, class_id: plan.class_id, subject_id: plan.subject_id }
            });
            const finalExam = await this.examRepo.findOne({
                where: { school_id: plan.school_id, academic_year_id: plan.academic_year_id },
                order: { start_date: 'DESC' }
            });
            const lastPlannedDate = items.length > 0 ? items[items.length - 1].planned_date : null;
            const firstPlannedDate = items.length > 0 ? items[0].planned_date : null;
            let bufferDays = 0;
            let bufferStatus = 'SAFE';
            if (finalExam?.start_date && lastPlannedDate) {
                const diffTime = new Date(finalExam.start_date).getTime() - new Date(lastPlannedDate).getTime();
                bufferDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                if (bufferDays > 60) {
                    console.warn(`[SANITY] High buffer detected for plan ${plan.id}: ${bufferDays} days.`);
                }
                if (bufferDays > 30)
                    bufferStatus = 'LOOSE';
                else if (bufferDays >= 5)
                    bufferStatus = 'SAFE';
                else if (bufferDays > 0)
                    bufferStatus = 'TIGHT';
                else
                    bufferStatus = 'OVERFLOW';
            }
            const monthly_distribution_full_year = [];
            const monthlyGroups = {};
            items.forEach(item => {
                const month = new Date(item.planned_date).toLocaleString('default', { month: 'long', year: 'numeric' });
                monthlyGroups[month] = (monthlyGroups[month] || 0) + 1;
            });
            const start = new Date(academicYear.start_date);
            const end = new Date(academicYear.end_date);
            let curr = new Date(start.getFullYear(), start.getMonth(), 1);
            while (curr <= end) {
                const monthLabel = curr.toLocaleString('default', { month: 'long', year: 'numeric' });
                monthly_distribution_full_year.push({
                    month: monthLabel,
                    topic_count: monthlyGroups[monthLabel] || 0
                });
                curr.setMonth(curr.getMonth() + 1);
            }
            let topics_per_week = 0;
            if (firstPlannedDate && finalExam?.start_date) {
                const planStart = new Date(firstPlannedDate);
                const examDate = new Date(finalExam.start_date);
                const totalWeeks = Math.max(1, (examDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
                topics_per_week = parseFloat((items.length / totalWeeks).toFixed(1));
            }
            const todayDate = new Date().toISOString().split('T')[0];
            const expected_topics_by_today = items.filter(i => i.planned_date <= todayDate).length;
            let completed_topics = 0;
            const cPlan = await this.curriculumPlanRepo.findOne({
                where: { school_id: plan.school_id, class_id: plan.class_id, subject_id: plan.subject_id, academic_year_id: plan.academic_year_id },
                relations: ['items']
            });
            if (cPlan && cPlan.items) {
                completed_topics = cPlan.items.filter(i => i.status === 'completed').length;
            }
            const ayStart = new Date(academicYear.start_date).getTime();
            const ayEnd = new Date(academicYear.end_date).getTime();
            const ayDuration = ayEnd - ayStart;
            const elapsed = new Date().getTime() - ayStart;
            if ((elapsed / ayDuration) > 0.25 && expected_topics_by_today === 0) {
                console.warn(`[SANITY] Planning misalignment for plan ${plan.id}. 25% of year elapsed but 0 topics expected.`);
            }
            let pacingStatus = 'NORMAL';
            if (topics_per_week > 4)
                pacingStatus = 'AGGRESSIVE';
            if (topics_per_week > 6 || bufferStatus === 'OVERFLOW')
                pacingStatus = 'RISKY';
            return {
                plan_id: plan.id,
                status: plan.status,
                is_baseline: plan.is_baseline,
                total_topics: syllabus?.total_topics || items.length,
                allocated_topics: items.length,
                monthly_distribution_full_year,
                buffer_days: bufferDays,
                buffer_status: bufferStatus,
                topics_per_week,
                pacing: pacingStatus,
                expected_topics_by_today,
                completed_topics
            };
        }
        catch (err) {
            console.error(`[DEBUG] ERROR in getPlanPreview:`, err);
            throw err;
        }
    }
    async updatePlanItems(planId, updates) {
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan)
            throw new common_1.NotFoundException('Plan not found');
        if (plan.is_baseline)
            throw new common_1.ConflictException('Cannot edit baseline plan');
        if (plan.status !== 'GENERATED' && plan.status !== 'generated') {
            throw new common_1.ConflictException(`Cannot edit plan in ${plan.status} state. Only GENERATED plans are editable.`);
        }
        for (const update of updates) {
            await this.itemRepo.update({ id: update.id, plan_id: planId }, { planned_date: update.planned_date });
        }
        return { success: true };
    }
    async getAcademicHealthSummary(schoolId, academicYearId) {
        console.log(`[DEBUG] getAcademicHealthSummary for school: ${schoolId}, year: ${academicYearId}`);
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(schoolId) || !uuidRegex.test(academicYearId)) {
            console.error(`[ERROR] Invalid schoolId or academicYearId format: ${schoolId}, ${academicYearId}`);
            return { status: 'INVALID_PARAMETERS' };
        }
        try {
            const baselinePlans = await this.planRepo.find({
                where: { school_id: schoolId, academic_year_id: academicYearId, is_baseline: true }
            });
            if (baselinePlans.length === 0) {
                return {
                    status: 'NO_BASELINE',
                    message: "Generate and approve an academic plan to start tracking progress"
                };
            }
            const todayDate = new Date().toISOString().split('T')[0];
            const class_summary = [];
            let totalCompleted = 0;
            let totalOverall = 0;
            let totalExpected = 0;
            let baselineWithCurriculumCount = 0;
            for (const plan of baselinePlans) {
                const cPlan = await this.curriculumPlanRepo.findOne({
                    where: { school_id: schoolId, class_id: plan.class_id, subject_id: plan.subject_id, academic_year_id: academicYearId },
                    relations: ['items']
                });
                const items = await this.itemRepo.find({ where: { plan_id: plan.id } });
                const expectedToday = items.filter(i => i.planned_date <= todayDate).length;
                const totalPlanTopics = items.length;
                let completedTopics = 0;
                if (cPlan) {
                    baselineWithCurriculumCount++;
                    completedTopics = cPlan.items ? cPlan.items.filter(i => i.status === 'completed').length : 0;
                }
                const gap = expectedToday - completedTopics;
                const completionPercent = totalPlanTopics > 0 ? (completedTopics / totalPlanTopics) * 100 : 0;
                let status = 'ON_TRACK';
                if (completedTopics === 0 && expectedToday > 0) {
                    status = 'NOT_STARTED';
                }
                else if (gap > 2) {
                    status = 'DELAYED';
                }
                else if (gap > 0) {
                    status = 'AT_RISK';
                }
                const classEntity = await this.classRepo.findOne({ where: { id: plan.class_id } });
                const subjectEntity = await this.subjectRepo.findOne({ where: { id: plan.subject_id } });
                class_summary.push({
                    class_id: plan.class_id,
                    subject_id: plan.subject_id,
                    class_name: classEntity?.class_name || `Class ${plan.class_id.substring(0, 2)}`,
                    subject_name: subjectEntity?.name || `Subject ${plan.subject_id.substring(0, 2)}`,
                    completion_percentage: completionPercent.toFixed(1),
                    expected_topics_by_today: expectedToday,
                    completed_topics: completedTopics,
                    gap: gap,
                    delay: {
                        value: gap,
                        label: gap > 0 ? `Behind by ${gap} topics` : 'On Track'
                    },
                    status
                });
                totalCompleted += completedTopics;
                totalOverall += totalPlanTopics;
                totalExpected += expectedToday;
            }
            if (totalCompleted === 0 && baselinePlans.length > 0) {
                return {
                    status: 'NO_EXECUTION_DATA',
                    message: "Tracking has not started yet. Teachers have not recorded progress."
                };
            }
            const response = {
                status: 'ACTIVE',
                overall_completion_percentage: totalOverall > 0 ? ((totalCompleted / totalOverall) * 100).toFixed(1) : "0.0",
                expected_topics_by_today: totalExpected,
                completed_topics: totalCompleted,
                on_track_count: class_summary.filter(c => c.status === 'ON_TRACK').length,
                at_risk_count: class_summary.filter(c => c.status === 'AT_RISK').length,
                delayed_count: class_summary.filter(c => c.status === 'DELAYED' || c.status === 'NOT_STARTED').length,
                class_summary,
                alerts: []
            };
            if (process.env.NODE_ENV !== 'production') {
                response.meta = {
                    baseline_plan_count: baselinePlans.length,
                    plans_with_curriculum: baselineWithCurriculumCount
                };
            }
            return response;
        }
        catch (err) {
            console.error(`[DEBUG] ERROR in getAcademicHealthSummary:`, err);
            throw err;
        }
    }
    async getDailyInsights(schoolId, academicYearId) {
        const baselinePlans = await this.planRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId, is_baseline: true }
        });
        const todayDate = new Date().toISOString().split('T')[0];
        const insights = [];
        for (const plan of baselinePlans) {
            const classEntity = await this.classRepo.findOne({ where: { id: plan.class_id } });
            const subjectEntity = await this.subjectRepo.findOne({ where: { id: plan.subject_id } });
            const todayItems = await this.itemRepo.find({
                where: { plan_id: plan.id, planned_date: todayDate }
            });
            const cPlan = await this.curriculumPlanRepo.findOne({
                where: { school_id: schoolId, class_id: plan.class_id, subject_id: plan.subject_id, academic_year_id: academicYearId },
                relations: ['items']
            });
            const pendingItems = cPlan?.items?.filter(i => i.planned_date < todayDate && i.status.toLowerCase() !== 'completed') || [];
            const completedToday = cPlan?.items?.filter(i => i.planned_date === todayDate && i.status.toLowerCase() === 'completed').length || 0;
            const delayCount = pendingItems.length;
            const action = delayCount > 0
                ? `Complete ${delayCount} pending topics + today's ${todayItems.length} planned topics`
                : todayItems.length > 0
                    ? `Focus on today's ${todayItems.length} planned topics`
                    : "No teaching planned for today";
            insights.push({
                class_name: classEntity?.class_name || 'Class',
                subject_name: subjectEntity?.name || 'Subject',
                today_plan: todayItems.length > 0 ? `${todayItems.length} topics` : 'None',
                completed_today: completedToday,
                pending_topics: delayCount,
                delay: delayCount,
                action,
                risk_status: delayCount > 2 ? 'HIGH' : delayCount > 0 ? 'MEDIUM' : 'LOW'
            });
        }
        return insights;
    }
    async generateAdjustedPlan(schoolId, academicYearId, classId, subjectId, baseline, syllabus, workingDays) {
        const todayDate = new Date().toISOString().split('T')[0];
        const cPlan = await this.curriculumPlanRepo.findOne({
            where: { school_id: schoolId, class_id: classId, subject_id: subjectId, academic_year_id: academicYearId },
            relations: ['items']
        });
        const completedTopicIndices = new Set(cPlan?.items?.filter(i => i.status.toLowerCase() === 'completed').map(i => i.topic_id) || []);
        const topics = await this.syllabusTopicRepo.find({
            where: { syllabus_id: syllabus.id },
            order: { sequence: 'ASC' }
        });
        const remainingTopics = topics.filter(t => !completedTopicIndices.has(t.sequence.toString()));
        const availableDays = workingDays.filter(wd => wd.date >= todayDate);
        if (availableDays.length < remainingTopics.length) {
            const infeasiblePlan = this.planRepo.create({
                id: (0, uuid_1.v4)(),
                school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId,
                version: baseline.version + 1,
                parent_plan_id: baseline.id,
                is_baseline: false,
                status: 'infeasible'
            });
            await this.planRepo.save(infeasiblePlan);
            return { plan_id: infeasiblePlan.id, feasibility_status: 'infeasible', message: 'Not enough days left to complete remaining topics.' };
        }
        const adjustedPlan = this.planRepo.create({
            id: (0, uuid_1.v4)(),
            school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId,
            version: baseline.version + 1,
            parent_plan_id: baseline.id,
            is_baseline: false,
            status: 'generated'
        });
        await this.planRepo.save(adjustedPlan);
        const planItems = [];
        for (let i = 0; i < remainingTopics.length; i++) {
            planItems.push(this.itemRepo.create({
                id: (0, uuid_1.v4)(),
                plan_id: adjustedPlan.id,
                class_id: classId,
                subject_id: subjectId,
                topic_index: remainingTopics[i].sequence,
                planned_date: availableDays[i].date,
                session_count: 1
            }));
        }
        await this.itemRepo.save(planItems);
        return {
            plan_id: adjustedPlan.id,
            total_remaining: remainingTopics.length,
            available_days: availableDays.length,
            feasibility_status: 'generated',
            message: `Created Adjusted Plan v${adjustedPlan.version} with ${remainingTopics.length} topics.`
        };
    }
};
exports.AcademicPlanningService = AcademicPlanningService;
exports.AcademicPlanningService = AcademicPlanningService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_plan_entity_1.AcademicPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_plan_item_entity_1.AcademicPlanItem)),
    __param(2, (0, typeorm_1.InjectRepository)(syllabus_topic_entity_1.SyllabusTopic)),
    __param(3, (0, typeorm_1.InjectRepository)(planning_day_entity_1.PlanningDay)),
    __param(4, (0, typeorm_1.InjectRepository)(board_entity_1.Board)),
    __param(5, (0, typeorm_1.InjectRepository)(syllabus_entity_1.Syllabus)),
    __param(6, (0, typeorm_1.InjectRepository)(academic_calendar_event_entity_1.AcademicCalendarEvent)),
    __param(7, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __param(8, (0, typeorm_1.InjectRepository)(curriculum_plan_entity_1.CurriculumPlan)),
    __param(9, (0, typeorm_1.InjectRepository)(curriculum_plan_item_entity_1.CurriculumPlanItem)),
    __param(10, (0, typeorm_1.InjectRepository)(exam_entity_1.Exam)),
    __param(11, (0, typeorm_1.InjectRepository)(class_entity_1.Class)),
    __param(12, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AcademicPlanningService);
//# sourceMappingURL=academic-planning.service.js.map