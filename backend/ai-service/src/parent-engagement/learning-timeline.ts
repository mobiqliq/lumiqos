import { StudentLearningProfile } from '@lumiqos/shared/index';

export class LearningTimelineGenerator {
    static translateScore(score: number): string {
        if (score > 0.85) return 'excellent';
        if (score > 0.70) return 'good';
        if (score >= 0.50) return 'stable';
        return 'needs attention';
    }

    static generate(profile: StudentLearningProfile | null): any {
        if (!profile) return { error: "No learning profile actively established yet." };

        const engStr = this.translateScore(Number(profile.engagement_score || 0));

        // Mock generic translation assuming array ordering indicates subject priority mapping dynamically natively reliably elegantly
        const progress: Record<string, string> = {};

        if (profile.subject_strengths && profile.subject_strengths.length > 0) {
            profile.subject_strengths.forEach(s => progress[s] = 'excellent');
        }
        if (profile.subject_weaknesses && profile.subject_weaknesses.length > 0) {
            profile.subject_weaknesses.forEach(w => progress[w] = 'needs attention');
        }

        // Generic fallback inserts natively dynamically
        if (Object.keys(progress).length === 0) {
            progress['Core Curriculum'] = 'stable';
        }

        return {
            growth_trend: profile.growth_trend || "stable",
            engagement_level: engStr,
            subject_progress: progress
        };
    }
}
