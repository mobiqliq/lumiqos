import { AcademicService } from './academic.service';
import { AcademicCalendarService } from './academic-calendar.service';
import { PedagogicalPourService } from './pedagogical-pour.service';
import { RecoveryStrategistService } from './recovery-strategist.service';
import { SubstitutionService } from './substitution.service';
import { ComplianceAuditorService } from './compliance-auditor.service';
import { ParityAuditorService } from './parity-auditor.service';
import { WhatIfSimulatorService } from './what-if-simulator.service';
import { OnboardingService } from './onboarding.service';
import { TeacherHealthService } from './teacher-health.service';
import { ResourceAuditorService } from './resource-auditor.service';
export declare class AcademicController {
    private readonly academicService;
    private readonly calendarService;
    private readonly pedagogicalPourService;
    private readonly recoveryService;
    private readonly substitutionService;
    private readonly complianceAuditorService;
    private readonly parityAuditorService;
    private readonly whatIfSimulatorService;
    private readonly onboardingService;
    private readonly teacherHealthService;
    private readonly resourceAuditorService;
    private readonly academicCalendarService;
    constructor(academicService: AcademicService, calendarService: AcademicCalendarService, pedagogicalPourService: PedagogicalPourService, recoveryService: RecoveryStrategistService, substitutionService: SubstitutionService, complianceAuditorService: ComplianceAuditorService, parityAuditorService: ParityAuditorService, whatIfSimulatorService: WhatIfSimulatorService, onboardingService: OnboardingService, teacherHealthService: TeacherHealthService, resourceAuditorService: ResourceAuditorService, academicCalendarService: AcademicCalendarService);
    createClass(createDto: any): Promise<import("@lumiqos/shared/index").Class>;
    getClasses(): Promise<{
        has_syllabus: boolean;
        id: string;
        name: string;
        class_name: string;
        class_id: string;
        school_id: string;
        grade_level: number;
        created_at: Date;
        updated_at: Date;
    }[]>;
    updateClass(id: string, updateDto: any): Promise<import("@lumiqos/shared/index").Class | null>;
    deleteClass(id: string): Promise<{
        success: boolean;
    }>;
    createSection(createDto: any): Promise<import("@lumiqos/shared/index").Section>;
    getSections(): Promise<import("@lumiqos/shared/index").Section[]>;
    updateSection(id: string, updateDto: any): Promise<import("@lumiqos/shared/index").Section | null>;
    createSubject(createDto: any): Promise<import("@lumiqos/shared/index").Subject>;
    getSubjects(classId?: string): Promise<import("@lumiqos/shared/index").Subject[]>;
    updateSubject(id: string, updateDto: any): Promise<import("@lumiqos/shared/index").Subject | null>;
    assignTeacher(createDto: any): Promise<import("@lumiqos/shared/index").TeacherSubject>;
    getTeacherSubjects(): Promise<import("@lumiqos/shared/index").TeacherSubject[]>;
    removeTeacherSubject(id: string): Promise<import("@lumiqos/shared/index").TeacherSubject>;
    setupDefault(): Promise<{
        classes_created: number;
        classes_skipped: number;
    }>;
    getAvailability(classId: string, sectionId: string, subjectId: string, schoolId: string, yearId: string): Promise<{
        class: string | undefined;
        subject: string | undefined;
        total_available_periods: number;
        formatted: string;
    }>;
    generateBaselineSchedule(body: {
        school_id: string;
        academic_year_id: string;
        class_id: string;
        section_id: string;
        subject_id: string;
    }): Promise<{
        error: string;
        message?: undefined;
        lessons_scheduled?: undefined;
        total_slots_used?: undefined;
        example_first_date?: undefined;
    } | {
        message: string;
        lessons_scheduled: number;
        total_slots_used: number;
        example_first_date: string | undefined;
        error?: undefined;
    }>;
    completeLesson(id: string, body: {
        completion_date: string;
    }): Promise<import("@lumiqos/shared/index").PlannedSchedule>;
    getVelocityReport(classId: string, subjectId: string): Promise<{
        velocity: number;
        planned_units: number;
        completed_units: number;
        lagging_periods: number;
    }>;
    getRecoveryPlans(body: {
        school_id: string;
        class_id: string;
        subject_id: string;
        board_exam_start_date?: string;
    }): Promise<{
        message: string;
        velocity: number;
        deficit_periods?: undefined;
        risk_alert?: undefined;
        options?: undefined;
    } | {
        deficit_periods: number;
        velocity: number;
        risk_alert: {
            level: string;
            type: string;
            message: string;
            buy_back_hours: number;
            trigger_date: string;
        } | null;
        options: {
            id: string;
            name: string;
            logic: string;
            action: string;
            success_probability: number;
            impact: string;
            estimated_end_date: string;
        }[];
        message?: undefined;
    }>;
    findSubstitute(body: {
        teacher_id: string;
        date: string;
        slot_id: string;
    }): Promise<{
        message: string;
        alert?: undefined;
        recommendation?: undefined;
        substitution_type?: undefined;
        teacher_id?: undefined;
    } | {
        alert: string;
        recommendation: string;
        substitution_type: string;
        message?: undefined;
        teacher_id?: undefined;
    } | {
        alert: string;
        recommendation: string;
        substitution_type: string;
        teacher_id: string;
        message?: undefined;
    }>;
    checkCompliance(schoolId: string, yearId: string): Promise<{
        ail_compliance: string;
        vocational_ratio: string;
        bagless_days_scheduled: string;
        status: {
            ail_risk: boolean;
            vocational_risk: boolean;
            bagless_pause_compliance: boolean;
        };
    }>;
    executeHandover(body: {
        outgoing_teacher_id: string;
        incoming_teacher_id: string;
        effective_date: string;
    }): Promise<{
        message: string;
        count: number;
        handover_report: {
            section_id: string;
            class_name: string;
            subject_name: string;
            last_completed_lesson: string;
            completion_date: string;
            velocity_score: number;
        }[];
    }>;
    getParityAudit(schoolId: string, yearId: string): Promise<import("./parity-auditor.service").ParityAlert[]>;
    simulateEvent(body: {
        school_id: string;
        year_id: string;
        start_date: string;
        end_date: string;
        event_name: string;
    }): Promise<{
        event: string;
        status: string;
        message: string;
        casualty_report: never[];
        simulated_dates?: undefined;
        total_affected_periods?: undefined;
        overall_status?: undefined;
    } | {
        event: string;
        simulated_dates: string;
        total_affected_periods: number;
        overall_status: string;
        casualty_report: {
            class_name: string;
            subject_name: string;
            lost_periods: number;
            original_end_date: string;
            projected_end_date: string;
            board_exam_date: string;
            status: string;
            warning: string;
        }[];
        status?: undefined;
        message?: undefined;
    }>;
    launchAcademicYear(body: {
        school_id: string;
        year_id: string;
        board: string;
        teacher_assignments: any[];
    }): Promise<{
        status: string;
        message: string;
        stats: {
            teachers_assigned: number;
            topics_seeded: number;
            schedules_generated: number;
            board: string;
            year: string;
        };
    }>;
    getBaselineGantt(schoolId: string, yearId: string): Promise<any[]>;
    lockCalendar(body: {
        school_id: string;
        year_id: string;
    }): Promise<{
        status: string;
        message: string;
        total_locked_lessons: number;
        timestamp: string;
    }>;
    getMorningPulse(schoolId: string): Promise<import("./parity-auditor.service").ParityAlert[]>;
    approveRecoveryPlan(body: {
        school_id: string;
        class_id: string;
        subject_id: string;
        plan_type: string;
        section_id: string;
    }): Promise<{
        status: string;
        message: string;
        execution_details: {
            status: string;
            message: string;
            action_taken?: undefined;
            lesson_updates?: undefined;
            merged_date?: undefined;
        } | {
            status: string;
            action_taken: string;
            lesson_updates: number;
            message?: undefined;
            merged_date?: undefined;
        } | {
            status: string;
            action_taken: string;
            merged_date: string;
            message?: undefined;
            lesson_updates?: undefined;
        } | {
            status: string;
            action_taken: string;
            message?: undefined;
            lesson_updates?: undefined;
            merged_date?: undefined;
        };
    }>;
    getDisruptionImpact(body: {
        school_id: string;
        date: string;
    }): Promise<{
        date: string;
        affected_lessons: number;
        recovery_plans: {
            id: string;
            name: string;
            description: string;
            action: string;
        }[];
    }>;
    resolveDisruption(body: {
        school_id: string;
        date: string;
        plan_id: string;
        plan_name: string;
    }): Promise<{
        status: string;
        message: string;
        dispatched_to: string;
        timestamp: string;
    }>;
    getNEPReport(schoolId: string): Promise<{
        school_id: string;
        academic_year: string;
        report_type: string;
        generated_at: string;
        summary: {
            art_integration: {
                status: string;
                value: string;
                target: string;
                evidence: string;
            };
            bagless_days: {
                status: string;
                value: string;
                target: string;
                evidence: string;
            };
            vocational_ratio: {
                status: string;
                value: string;
                target: string;
                evidence: string;
            };
        };
        certification: {
            statement: string;
            inspector_ready: boolean;
            verification_id: string;
        };
    }>;
    getTeacherHealthRadar(schoolId: string): Promise<{
        teacher_id: string;
        teacher_name: string;
        velocity: number;
        density_score: string;
        diagnosis: string;
        rationale: string;
        recommendation: string;
        action_label: string;
    }[]>;
    saveGlobalConfig(config: {
        school_id: string;
        year_id: string;
        start_date: string;
        end_date: string;
        holidays: any[];
    }): Promise<import("@lumiqos/shared/index").SchoolCalendar[]>;
    getResourceAudit(schoolId: string): Promise<{
        audit_timestamp: string;
        status: string;
        alerts: {
            teacher_id: string;
            teacher_name: string;
            weekly_periods: number;
            limit: number;
            risk_level: string;
            message: string;
            affected_sections: string[];
        }[];
    }>;
    getAcademicGaps(schoolId: string, yearId: string): Promise<{
        subject_id: any;
        subject_name: string | undefined;
        last_date: any;
        buffer_days: number;
        risk: string;
        message: string;
    }[]>;
    rippleMove(body: {
        schedule_id: string;
        new_date: string;
    }): Promise<{
        shifted: number;
    } | undefined>;
}
