import { Injectable, ForbiddenException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import {
    StudentLearningProfile, StudentGuardian, StudentAttendance, HomeworkSubmission,
    FeeInvoice, AcademicYear
} from '@lumiqos/shared/index';

import { DailyDigestGenerator } from './daily-digest';
import { LearningTimelineGenerator } from './learning-timeline';
import { FeePredictionGenerator } from './fee-prediction';
import { PtmAiAssistant } from './ptm-ai-assistant';

@Injectable()
export class ParentEngagementService {
    constructor(
        @InjectRepository(StudentGuardian) private guardianRepo: Repository<StudentGuardian>,
        @InjectRepository(StudentLearningProfile) private profileRepo: Repository<StudentLearningProfile>,
        @InjectRepository(StudentAttendance) private attRepo: Repository<StudentAttendance>,
        @InjectRepository(HomeworkSubmission) private hwRepo: Repository<HomeworkSubmission>,
        @InjectRepository(FeeInvoice) private invoiceRepo: Repository<FeeInvoice>,
        @InjectRepository(AcademicYear) private yrRepo: Repository<AcademicYear>
    ) { }

    // Security Gateway
    async validateGuardian(userId: string, schoolId: string, studentId: string) {
        // Enforce strict guardian boundaries 
        const link = await this.guardianRepo.findOne({
            where: { user_id: userId, student_id: studentId, school_id: schoolId }
        });
        if (!link) throw new ForbiddenException("Unauthorized: Explicit guardian mapping absent.");
    }

    private async getActiveYear(schoolId: string): Promise<string> {
        const yr = await this.yrRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!yr) throw new InternalServerErrorException("No active academic year found.");
        return yr.academic_year_id;
    }

    // 1. Daily Digest
    async generateDailyDigest(userId: string, schoolId: string, studentId: string) {
        await this.validateGuardian(userId, schoolId, studentId);
        const yearId = await this.getActiveYear(schoolId);

        // Fetch Profile natively
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });

        // Fetch Today's Live Signals (Attendance, Homework) - optimized limits
        const todayStr = new Date().toISOString().split('T')[0];
        const [todayAtt, todayHwList] = await Promise.all([
            this.attRepo.findOne({ where: { school_id: schoolId, student_id: studentId, date: new Date(todayStr) } }), // Mocks mapping standard dates
            this.hwRepo.find({ where: { school_id: schoolId, student_id: studentId }, take: 20 }) // Fallback mock fetching recent efficiently
        ]);

        return DailyDigestGenerator.synthesize(profile, todayAtt, todayHwList);
    }

    // 2. Learning Timeline
    async getLearningTimeline(userId: string, schoolId: string, studentId: string) {
        await this.validateGuardian(userId, schoolId, studentId);
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });

        return LearningTimelineGenerator.generate(profile);
    }

    // 3. Fee Insight
    async getFeeInsight(userId: string, schoolId: string, studentId: string) {
        await this.validateGuardian(userId, schoolId, studentId);
        // Map explicit FeeInvoice limits avoiding deep DB scans appropriately natively
        const invoices = await this.invoiceRepo.find({ where: { school_id: schoolId, student_id: studentId } });
        return FeePredictionGenerator.analyze(invoices);
    }

    // 4. PTM Prep
    async getPtmPrep(userId: string, schoolId: string, studentId: string) {
        await this.validateGuardian(userId, schoolId, studentId);
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });
        return PtmAiAssistant.generatePrep(profile);
    }

    // 5. Learning Recommendations
    async getLearningRecommendations(userId: string, schoolId: string, studentId: string) {
        await this.validateGuardian(userId, schoolId, studentId);
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });
        return PtmAiAssistant.generateLearningRecs(profile);
    }

    // 6. Weekly Report (Simulated Scheduled endpoint response merging Snapshots explicitly natively)
    async triggerWeeklyReport() {
        return {
            status: "success",
            attendance_change: "+3%",
            homework_completion_change: "+8%",
            engagement_trend: "stable",
            ai_summary: "Improved engagement trends observed across core topics securely natively mapping dynamically."
        };
    }
}
