import { Injectable, HttpException, HttpStatus, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentLearningProfile, AcademicYear } from '@lumiqos/shared/index';
import { LessonPlanner } from './lesson-planner';
import { ClassroomInsights } from './classroom-insights';
import { HomeworkGenerator } from './homework-generator';
import { ReportCommentGenerator } from './report-comment-generator';

@Injectable()
export class TeacherCopilotService {
    // In-memory caching and simple rate-limiting mechanisms protecting <1.5s constraints 
    private lessonCache: Map<string, { data: any, expiresAt: number }> = new Map();
    private TTL_24H = 24 * 60 * 60 * 1000;

    // Rate limits (TeacherID -> { day: string, lessonCount: number, hwCount: number, reportCount: number })
    private rateLimits: Map<string, { day: string, lessonCount: number, hwCount: number, reportCount: number }> = new Map();

    constructor(
        @InjectRepository(StudentLearningProfile) private profileRepo: Repository<StudentLearningProfile>,
        @InjectRepository(AcademicYear) private yrRepo: Repository<AcademicYear>
    ) { }

    private async getActiveYear(schoolId: string): Promise<string> {
        const yr = await this.yrRepo.findOne({ where: { school_id: schoolId, status: 'active' } });
        if (!yr) throw new InternalServerErrorException("No active academic year found.");
        return yr.academic_year_id;
    }

    private checkRateLimit(teacherId: string, type: 'lesson' | 'hw' | 'report') {
        const today = new Date().toISOString().split('T')[0];
        let limits = this.rateLimits.get(teacherId) || { day: today, lessonCount: 0, hwCount: 0, reportCount: 0 };

        if (limits.day !== today) {
            limits = { day: today, lessonCount: 0, hwCount: 0, reportCount: 0 };
        }

        if (type === 'lesson' && limits.lessonCount >= 20) throw new HttpException('Lesson plan limit reached', HttpStatus.TOO_MANY_REQUESTS);
        if (type === 'hw' && limits.hwCount >= 30) throw new HttpException('Homework limit reached', HttpStatus.TOO_MANY_REQUESTS);
        if (type === 'report' && limits.reportCount >= 100) throw new HttpException('Report limit reached', HttpStatus.TOO_MANY_REQUESTS);

        if (type === 'lesson') limits.lessonCount++;
        if (type === 'hw') limits.hwCount++;
        if (type === 'report') limits.reportCount++;

        this.rateLimits.set(teacherId, limits);
    }

    async generateLessonPlan(teacherId: string, payload: any) {
        this.checkRateLimit(teacherId, 'lesson');
        const { subject, grade_level, topic, board, duration_minutes, learning_objective_level } = payload;

        const cacheKey = \`lesson_plan:\${subject}:\${grade_level}:\${topic}:\${learning_objective_level}\`;
        if (this.lessonCache.has(cacheKey) && this.lessonCache.get(cacheKey)!.expiresAt > Date.now()) {
            return this.lessonCache.get(cacheKey)!.data;
        }

        const data = LessonPlanner.generateMockLessonPlan(subject, topic, duration_minutes, learning_objective_level || 'conceptual');
        this.lessonCache.set(cacheKey, { data, expiresAt: Date.now() + this.TTL_24H });
        return data;
    }

    async getClassInsights(schoolId: string) {
        // Scans ALL global profiles organically securely bypassing live schema reads elegantly.
        const yearId = await this.getActiveYear(schoolId);
        const profiles = await this.profileRepo.find({ where: { school_id: schoolId, academic_year_id: yearId } });
        return ClassroomInsights.analyze(profiles);
    }

    async generateHomework(teacherId: string, payload: any) {
        this.checkRateLimit(teacherId, 'hw');
        const { subject, grade_level, topic, difficulty, question_count } = payload;
        return HomeworkGenerator.generateHomework(subject, topic, question_count || 5, difficulty || 'standard');
    }

    async generateDifferentiatedHomework(teacherId: string, schoolId: string, payload: any) {
        this.checkRateLimit(teacherId, 'hw');
        const { subject, topic } = payload;
        const yearId = await this.getActiveYear(schoolId);
        const profiles = await this.profileRepo.find({ where: { school_id: schoolId, academic_year_id: yearId } });
        
        return HomeworkGenerator.generateDifferentiatedHomework(subject, topic, profiles);
    }

    async generateReportComment(teacherId: string, payload: any) {
        this.checkRateLimit(teacherId, 'report');
        const { student_id, subject, performance_level } = payload;
        return {
             student_id,
             subject,
             comment: ReportCommentGenerator.generateComment(performance_level, subject)
        };
    }

    async getPTMSummary(schoolId: string, studentId: string) {
        const yearId = await this.getActiveYear(schoolId);
        const profile = await this.profileRepo.findOne({ where: { school_id: schoolId, student_id: studentId, academic_year_id: yearId } });
        return ReportCommentGenerator.generatePTMSummary(profile as StudentLearningProfile);
    }
}
