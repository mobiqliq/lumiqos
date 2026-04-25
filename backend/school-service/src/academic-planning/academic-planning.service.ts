import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicPlan } from '@xceliqos/shared/src/entities/academic-plan.entity';
import { AcademicPlanItem } from '@xceliqos/shared/src/entities/academic-plan-item.entity';
import { PlanningDay } from '@xceliqos/shared/src/entities/planning-day.entity';
import { Board } from '@xceliqos/shared/src/entities/board.entity';
import { Syllabus } from '@xceliqos/shared/src/entities/syllabus.entity';
import { AcademicCalendarEvent } from '@xceliqos/shared/src/entities/academic-calendar-event.entity';
import { AcademicYear } from '@xceliqos/shared/src/entities/academic-year.entity';
import { CurriculumPlan } from '@xceliqos/shared/src/entities/curriculum-plan.entity';
import { CurriculumPlanItem } from '@xceliqos/shared/src/entities/curriculum-plan-item.entity';
import { Exam } from '@xceliqos/shared/src/entities/exam.entity';
import { Class } from '@xceliqos/shared/src/entities/class.entity';
import { Subject } from '@xceliqos/shared/src/entities/subject.entity';
import { SyllabusTopic } from '@xceliqos/shared/src/entities/syllabus-topic.entity';
import { School } from '@xceliqos/shared/src/entities/school.entity';
import { v4 as uuid } from 'uuid';

@Injectable()
export class AcademicPlanningService {
  private readonly logger = new Logger(AcademicPlanningService.name);
    constructor(
        @InjectRepository(AcademicPlan)
        private planRepo: Repository<AcademicPlan>,
        @InjectRepository(AcademicPlanItem)
        private itemRepo: Repository<AcademicPlanItem>,
    @InjectRepository(SyllabusTopic)
    private syllabusTopicRepo: Repository<SyllabusTopic>,
    @InjectRepository(PlanningDay)
    private planningDayRepo: Repository<PlanningDay>,
        @InjectRepository(Board)
        private boardConfigRepo: Repository<Board>,
        @InjectRepository(Syllabus)
        private syllabusRepo: Repository<Syllabus>,
        @InjectRepository(AcademicCalendarEvent)
        private calendarEventRepo: Repository<AcademicCalendarEvent>,
        @InjectRepository(AcademicYear)
        private academicYearRepo: Repository<AcademicYear>,
        @InjectRepository(CurriculumPlan)
        private curriculumPlanRepo: Repository<CurriculumPlan>,
        @InjectRepository(CurriculumPlanItem)
        private curriculumItemRepo: Repository<CurriculumPlanItem>,
        @InjectRepository(Exam)
        private examRepo: Repository<Exam>,
        @InjectRepository(Class)
        private classRepo: Repository<Class>,
        @InjectRepository(Subject)
        private subjectRepo: Repository<Subject>,
        @InjectRepository(School) private schoolRepo: Repository<School>,
    ) {}

    /**
     * Layer 3: Calendar Sync
     * Populate PlanningDay from AcademicCalendarEvent
     */
    async syncCalendar(schoolId: string, academicYearId: string) {
        const events = await this.calendarEventRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId }
        });

        const academicYear = await this.academicYearRepo.findOne({ where: { id: academicYearId } });
        if (!academicYear) throw new NotFoundException('Academic Year not found');

        // Delete existing PlanningDay entries for this year
        await this.planningDayRepo.delete({ school_id: schoolId, academic_year_id: academicYearId });

        const daysToSave: PlanningDay[] = [];
        
        // Loop through months in Academic Calendar Events
        for (const event of events) {
            const daysInMonth = new Date(academicYear.start_date.getFullYear(), event.month_index, 0).getDate();
            const workingDays = new Set((event.working_days || []).map(Number));

            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(academicYear.start_date.getFullYear(), event.month_index - 1, day);
                const dateStr = date.toISOString().split('T')[0];

                // Simplified: All weekdays are WORKING if in working_days list, else HOLIDAY
                const type = workingDays.has(day) ? 'WORKING' : 'HOLIDAY';

                daysToSave.push(this.planningDayRepo.create({
                    id: uuid(),
                    school_id: schoolId,
                    academic_year_id: academicYearId,
                    date: dateStr,
                    type: type
                }));
            }
        }

        // Mark EXAM days (Simplified identification of Final Exam)
        const finalExams = await this.examRepo.find({
             where: { school_id: schoolId, academic_year_id: academicYearId }
             // In a real system, we'd filter for 'FINAL' or 'ANNUAL'
        });

        for (const exam of finalExams) {
            if (exam.start_date && exam.end_date) {
                // Mark range as EXAM
                const start = new Date(exam.start_date);
                const end = new Date(exam.end_date);
                for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                    const ds = d.toISOString().split('T')[0];
                    const dayEntry = daysToSave.find(de => de.date === ds);
                    if (dayEntry) dayEntry.type = 'EXAM';
                }
            }
        }

        await this.planningDayRepo.save(daysToSave);
        return { message: 'Calendar synced successfully', count: daysToSave.length };
    }

    /**
     * Layer 2: Core Logic - Generate Academic Plan
     */
    async generatePlan(schoolId: string, academicYearId: string, classId: string, subjectId: string, disruptionMode: boolean = false) {
        // 1. Idempotency Rule: Overwrite existing plan
        // 1. Check for existing baseline and handle versioning
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
            throw new ConflictException('A baseline plan already exists and is approved. Use disruption mode to regenerate.');
        }

        const nextVersion = existingPlans.length > 0 ? existingPlans[0].version + 1 : 1;

        // 2. Load Context
        const syllabus = await this.syllabusRepo.findOne({ 
            where: { school_id: schoolId, class_id: classId, subject_id: subjectId } 
        });
        if (!syllabus) {
            throw new ConflictException('Academic plan generation requires a structured syllabus.');
        }

        const topics = await this.syllabusTopicRepo.find({
            where: { syllabus_id: syllabus.id },
            order: { sequence: 'ASC' }
        });

        if (topics.length === 0) {
            throw new ConflictException('Syllabus has no topics configured. Cannot generate plan.');
        }

        // Fetch school to get board association
        const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
        if (!school) throw new NotFoundException(`School with ID ${schoolId} not found`);
        
        const boardConfig = await this.boardConfigRepo.findOne({ where: { name: school.board } });
        if (!boardConfig) throw new NotFoundException(`Board configuration for "${school.board}" not found`);
        const finalExam = await this.examRepo.findOne({ 
            where: { school_id: schoolId, academic_year_id: academicYearId }, 
            order: { start_date: 'DESC' } 
        });
        if (!finalExam || !finalExam.start_date) throw new NotFoundException('Final Exam dates not found for year');

        // Create Planning entries if not present
        await this.syncCalendar(schoolId, academicYearId);

        // Fetch valid WORKING days
        const workingDays = await this.planningDayRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId, type: 'WORKING' },
            order: { date: 'ASC' }
        });
        this.logger.log('WORKING DAYS COUNT:', workingDays.length);
        this.logger.log('FIRST 5 DAYS:', workingDays.slice(0, 5));

        // 3. Handle Disruption Mode (Adjusted Plan)
        if (disruptionMode && baselinePlan) {
            // Note: generateAdjustedPlan also needs refinement to use explicit topics
            return this.generateAdjustedPlan(schoolId, academicYearId, classId, subjectId, baselinePlan, syllabus, workingDays);
        }

        // Backward Planning Logic
        const examStart = new Date(finalExam.start_date);
        const bufferOffset = boardConfig.exam_buffer_days + boardConfig.revision_days;
        
let examIdx = workingDays.findIndex(wd => new Date(wd.date) >= examStart);

if (examIdx === -1) {
    examIdx = workingDays.length;
}

let lastTeachingDateIdx = examIdx - 1 - bufferOffset;

if (!workingDays[lastTeachingDateIdx]) {
    throw new Error(`Invalid teaching index: ${lastTeachingDateIdx}`);
}


if (lastTeachingDateIdx < 0) {
    lastTeachingDateIdx = 0;
}

        if (workingDays.length < topics.length + bufferOffset) {
            // Feasibility Check
            const plan = this.planRepo.create({
                id: uuid(),
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
            id: uuid(),
            school_id: schoolId,
            academic_year_id: academicYearId,
            class_id: classId,
            subject_id: subjectId,
            version: nextVersion,
            is_baseline: false,
            status: 'generated'
        });
        await this.planRepo.save(plan);

        // Assign topics backwards
        const planItems: AcademicPlanItem[] = [];
        let currentDayIdx = lastTeachingDateIdx;

        // Loop through topics from last to first
        for (let i = topics.length - 1; i >= 0; i--) {
            const topic = topics[i];
            const wd = workingDays[currentDayIdx];
            planItems.push(this.itemRepo.create({
        school_id: schoolId,
                id: uuid(),
                plan_id: plan.id,
                class_id: classId,
                subject_id: subjectId,
                topic_index: topic.sequence, // Using explicit sequence
                planned_date: wd.date,
                session_count: (() => { const len = topic.topic_name.length; return len > 30 ? 3 : len > 15 ? 2 : 1; })()
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

    async getPlan(planId: string) {
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');
        const items = await this.itemRepo.find({ where: { plan_id: planId }, order: { topic_index: 'ASC' } });
        return { plan, items };
    }

    /**
     * Layer 5: Integration
     * Map AcademicPlanItem → CurriculumPlanItem on approval
     */
    async approvePlan(planId: string) {
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');
        if (plan.status === 'infeasible') throw new ConflictException('Cannot approve infeasible plan');

        plan.status = 'approved';
        plan.is_baseline = true;
        await this.planRepo.save(plan);

        // De-baseline others for the same context
        await this.planRepo.createQueryBuilder()
            .update(AcademicPlan)
            .set({ is_baseline: false })
            .where('school_id = :schoolId', { schoolId: plan.school_id })
            .andWhere('academic_year_id = :yId', { yId: plan.academic_year_id })
            .andWhere('class_id = :cId', { cId: plan.class_id })
            .andWhere('subject_id = :sId', { sId: plan.subject_id })
            .andWhere('id != :currentId', { currentId: plan.id })
            .execute();

        const items = await this.itemRepo.find({ where: { plan_id: planId } });
        
        // Single group for (Class, Subject) in this phase
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

                // Get min/max dates from items
                const sortedItems = [...items].sort((a, b) => a.topic_index - b.topic_index);
                const startDate = sortedItems[0]?.planned_date;
                const endDate = sortedItems[sortedItems.length - 1]?.planned_date;

                cPlan = this.curriculumPlanRepo.create({
                    id: uuid(),
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

            // Map AcademicPlanItem → CurriculumPlanItem
            // Only map topics that don't already exist in the curriculum plan
            const existingCItems = await this.curriculumItemRepo.find({ where: { plan_id: cPlan.id } });
            const existingIndices = new Set(existingCItems.map(ci => parseInt(ci.topic_id || '0', 10))); // Assuming topic_id holds index for now

            const cItems = items
                .filter(api => !existingIndices.has(api.topic_index))
                .map(api => ({
                    id: uuid(),
                    plan_id: cPlan.id,
                    topic_id: api.topic_index.toString(), // numeric reference
                    planned_date: api.planned_date,
                    status: 'PLANNED'
                }));
            
            if (cItems.length > 0) {
                await this.curriculumItemRepo.save(cItems as any);
            }
        }

        return { success: true, message: 'Plan approved as academic baseline for tracking.' };
    }

    /**
     * Layer 6: Status Tracking
     * Get the latest plan status for a specific subject context
     */
    async getLatestPlanStatus(schoolId: string, academicYearId: string, classId: string, subjectId: string) {
        const sId = schoolId?.trim();
        const yId = academicYearId?.trim();
        const cId = classId?.trim();
        const subId = subjectId?.trim();

        try {
            const plan = await this.planRepo.findOne({
                where: { school_id: sId, academic_year_id: yId, class_id: cId, subject_id: subId },
                order: { version: 'DESC', is_baseline: 'DESC' }
            });

            if (!plan) return { status: 'NONE' };

            return {
                status: plan.status.toUpperCase(),
                plan_id: plan.id,
                version: plan.version,
                is_baseline: plan.is_baseline
            };
        } catch (err) {
            this.logger.error(`[DEBUG] ERROR in getLatestPlanStatus:`, err);
            return { status: 'ERROR', message: err.message };
        }
    }

    async getPlanPreview(planId: string) {
        this.logger.log(`[DEBUG] getPlanPreview for planId: ${planId}`);
        try {
            const { plan, items } = await this.getPlan(planId);
            this.logger.log(`[DEBUG] Found plan: ${plan.id}, items count: ${items.length}`);
        
        const academicYear = await this.academicYearRepo.findOne({ where: { id: plan.academic_year_id } });
        if (!academicYear) throw new NotFoundException('Academic Year not found');

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
                this.logger.warn(`[SANITY] High buffer detected for plan ${plan.id}: ${bufferDays} days.`);
            }

            if (bufferDays > 30) bufferStatus = 'LOOSE';
            else if (bufferDays >= 5) bufferStatus = 'SAFE';
            else if (bufferDays > 0) bufferStatus = 'TIGHT';
            else bufferStatus = 'OVERFLOW';
        }

        // Full Academic Year Distribution
        const monthly_distribution_full_year: { month: string; topic_count: number }[] = [];
        const monthlyGroups: Record<string, number> = {};
        
        items.forEach(item => {
            const month = new Date(item.planned_date).toLocaleString('default', { month: 'long', year: 'numeric' });
            monthlyGroups[month] = (monthlyGroups[month] || 0) + 1;
        });

        // Generate full 12 months based on academic year
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

        // Load Density (Topics per week)
        let topics_per_week = 0;
        if (firstPlannedDate && finalExam?.start_date) {
            const planStart = new Date(firstPlannedDate);
            const examDate = new Date(finalExam.start_date);
            const totalWeeks = Math.max(1, (examDate.getTime() - planStart.getTime()) / (1000 * 60 * 60 * 24 * 7));
            topics_per_week = parseFloat((items.length / totalWeeks).toFixed(1));
        }

        // Progress Tracking (Expected vs Actual)
        const todayDate = new Date().toISOString().split('T')[0];
        const expected_topics_by_today = items.filter(i => i.planned_date <= todayDate).length;
        
        // Fetch completed topics from CurriculumPlan if it exists (only for approved plans)
        let completed_topics = 0;
        const cPlan = await this.curriculumPlanRepo.findOne({
            where: { school_id: plan.school_id, class_id: plan.class_id, subject_id: plan.subject_id, academic_year_id: plan.academic_year_id },
            relations: ['items']
        });
        if (cPlan && cPlan.items) {
            completed_topics = cPlan.items.filter(i => i.status === 'completed').length;
        }

        // Misalignment Detection
        const ayStart = new Date(academicYear.start_date).getTime();
        const ayEnd = new Date(academicYear.end_date).getTime();
        const ayDuration = ayEnd - ayStart;
        const elapsed = new Date().getTime() - ayStart;

        if ((elapsed / ayDuration) > 0.25 && expected_topics_by_today === 0) {
            this.logger.warn(`[SANITY] Planning misalignment for plan ${plan.id}. 25% of year elapsed but 0 topics expected.`);
        }

        // Pacing Check
        let pacingStatus = 'NORMAL';
        if (topics_per_week > 4) pacingStatus = 'AGGRESSIVE';
        if (topics_per_week > 6 || bufferStatus === 'OVERFLOW') pacingStatus = 'RISKY';

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
        } catch (err) {
            this.logger.error(`[DEBUG] ERROR in getPlanPreview:`, err);
            throw err;
        }
    }

    async updatePlanItems(planId: string, updates: { id: string, planned_date: string }[]) {
        const plan = await this.planRepo.findOne({ where: { id: planId } });
        if (!plan) throw new NotFoundException('Plan not found');
        
        // Safety Rules (Strict)
        if (plan.is_baseline) throw new ConflictException('Cannot edit baseline plan');
        if (plan.status !== 'GENERATED' && plan.status !== 'generated') {
            throw new ConflictException(`Cannot edit plan in ${plan.status} state. Only GENERATED plans are editable.`);
        }

        for (const update of updates) {
            await this.itemRepo.update({ id: update.id, plan_id: planId }, { planned_date: update.planned_date });
        }
        return { success: true };
    }

    async getAcademicHealthSummary(schoolId: string, academicYearId: string) {
        this.logger.log(`[DEBUG] getAcademicHealthSummary for school: ${schoolId}, year: ${academicYearId}`);
        
        // Simple UUID validation to prevent Postgres cast errors
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(schoolId) || !uuidRegex.test(academicYearId)) {
            this.logger.error(`[ERROR] Invalid schoolId or academicYearId format: ${schoolId}, ${academicYearId}`);
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
            const class_summary: any[] = [];
            let totalCompleted = 0;
            let totalOverall = 0;
            let totalExpected = 0;
            let baselineWithCurriculumCount = 0;

            for (const plan of baselinePlans) {
                // Get CurriculumPlan linkage
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
                } else if (gap > 2) {
                    status = 'DELAYED';
                } else if (gap > 0) {
                    status = 'AT_RISK';
                }

                const classEntity = await this.classRepo.findOne({ where: { id: plan.class_id } });
                const subjectEntity = await this.subjectRepo.findOne({ where: { id: plan.subject_id } });

                class_summary.push({
                    class_id: plan.class_id,
                    subject_id: plan.subject_id,
                    class_name: classEntity?.class_name || `Class ${plan.class_id.substring(0,2)}`,
                    subject_name: subjectEntity?.name || `Subject ${plan.subject_id.substring(0,2)}`,
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

            const response: any = {
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

            // Debug Meta (dev only)
            if (process.env.NODE_ENV !== 'production') {
                response.meta = {
                    baseline_plan_count: baselinePlans.length,
                    plans_with_curriculum: baselineWithCurriculumCount
                };
            }

            return response;
        } catch (err) {
            this.logger.error(`[DEBUG] ERROR in getAcademicHealthSummary:`, err);
            throw err;
        }
    }

    /**
     * Layer 7: Daily Insight Engine
     * Compute actionable guidance for each subject
     */
    async getDailyInsights(schoolId: string, academicYearId: string) {
        const baselinePlans = await this.planRepo.find({
            where: { school_id: schoolId, academic_year_id: academicYearId, is_baseline: true }
        });

        const todayDate = new Date().toISOString().split('T')[0];
        const insights: any[] = [];

        for (const plan of baselinePlans) {
            const classEntity = await this.classRepo.findOne({ where: { id: plan.class_id } });
            const subjectEntity = await this.subjectRepo.findOne({ where: { id: plan.subject_id } });

            // Today's Planned
            const todayItems = await this.itemRepo.find({
                where: { plan_id: plan.id, planned_date: todayDate }
            });

            // Pending from previous days
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

    private async generateAdjustedPlan(schoolId: string, academicYearId: string, classId: string, subjectId: string, baseline: AcademicPlan, syllabus: Syllabus, workingDays: PlanningDay[]) {
        const todayDate = new Date().toISOString().split('T')[0];
        
        // 1. Identify remaining topics
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

        // 2. Find available days from today onwards
        const availableDays = workingDays.filter(wd => wd.date >= todayDate);

        if (availableDays.length < remainingTopics.length) {
            // Mark as infeasible but still create AdjustedPlan
             const infeasiblePlan = this.planRepo.create({
                id: uuid(),
                school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId,
                version: baseline.version + 1,
                parent_plan_id: baseline.id,
                is_baseline: false,
                status: 'infeasible'
            });
            await this.planRepo.save(infeasiblePlan);
            return { plan_id: infeasiblePlan.id, feasibility_status: 'infeasible', message: 'Not enough days left to complete remaining topics.' };
        }

        // 3. Create AdjustedPlan
        const adjustedPlan = this.planRepo.create({
            id: uuid(),
            school_id: schoolId, academic_year_id: academicYearId, class_id: classId, subject_id: subjectId,
            version: baseline.version + 1,
            parent_plan_id: baseline.id,
            is_baseline: false,
            status: 'generated'
        });
        await this.planRepo.save(adjustedPlan);

        // 4. Distribute topics forward
        const planItems: AcademicPlanItem[] = [];
        for (let i = 0; i < remainingTopics.length; i++) {
            planItems.push(this.itemRepo.create({
        school_id: schoolId,
                id: uuid(),
                plan_id: adjustedPlan.id,
                class_id: classId,
                subject_id: subjectId,
                topic_index: remainingTopics[i].sequence, // Using explicit sequence
                planned_date: availableDays[i].date,
                session_count: (() => { const len = remainingTopics[i].topic_name.length; return len > 30 ? 3 : len > 15 ? 2 : 1; })()
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
}
