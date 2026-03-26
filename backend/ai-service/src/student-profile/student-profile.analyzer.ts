export class StudentProfileAnalyzer {
    // Math Utilities
    static clamp(val: number, min: number, max: number): number {
        return Math.min(Math.max(val, min), max);
    }

    static stdDev(array: number[]): number {
        if (array.length < 2) return 0;
        const n = array.length;
        const mean = array.reduce((a, b) => a + b) / n;
        const variance = array.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1);
        return Math.sqrt(variance);
    }

    // Core Metrics
    static calculateAttendanceIndex(present: number, total: number): number {
        if (total === 0) return 0;
        return this.clamp(present / total, 0, 1.5);
    }

    static calculateHomeworkIndex(submitted: number, total: number): number {
        if (total === 0) return 0;
        return this.clamp(submitted / total, 0, 1.5);
    }

    static calculateExamIndex(studentAvg: number, classAvg: number): number {
        if (classAvg === 0) return 1;
        return this.clamp(studentAvg / classAvg, 0, 1.5);
    }

    static calculateConsistencyScore(scores: number[]): number {
        // scores are 0-100 percentages limits
        if (scores.length < 2) return 1;
        const sd = this.stdDev(scores);
        // Normalize SD assuming max practical SD is ~50.
        const normalizedSD = this.clamp(sd / 50, 0, 1);
        return this.clamp(1 - normalizedSD, 0, 1);
    }

    static calculateEngagementScore(attIndex: number, hwIndex: number, participation: number = 0.5): number {
        // attIndex and hwIndex could be up to 1.5, we should bound engagement 0-1
        const attNorm = this.clamp(attIndex, 0, 1);
        const hwNorm = this.clamp(hwIndex, 0, 1);
        const partNorm = this.clamp(participation, 0, 1);

        const score = (attNorm * 0.4) + (hwNorm * 0.4) + (partNorm * 0.2);
        return this.clamp(score, 0, 1);
    }

    static calculateGrowthTrend(recentAvg: number, prevAvg: number): string {
        if (prevAvg === 0) return 'stable';
        if (recentAvg > prevAvg + 5) return 'improving';
        if (recentAvg < prevAvg - 5) return 'declining';
        return 'stable';
    }

    static detectStrengthsAndWeaknesses(subjectScores: { subject: string, studentScore: number, classAvg: number }[]): { strengths: string[], weaknesses: string[] } {
        const strengths = new Set<string>();
        const weaknesses = new Set<string>();

        // Group by subject to count samples
        const groups: Record<string, { scores: number[], avgs: number[] }> = {};
        for (const s of subjectScores) {
            if (!groups[s.subject]) groups[s.subject] = { scores: [], avgs: [] };
            groups[s.subject].scores.push(s.studentScore);
            groups[s.subject].avgs.push(s.classAvg);
        }

        for (const [subj, data] of Object.entries(groups)) {
            if (data.scores.length >= 3) {
                const sAvg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
                const cAvg = data.avgs.reduce((a, b) => a + b, 0) / data.avgs.length;

                if (sAvg > cAvg + 10) strengths.add(subj);
                else if (sAvg < cAvg - 10) weaknesses.add(subj);
            }
        }

        return { strengths: Array.from(strengths), weaknesses: Array.from(weaknesses) };
    }

    static calculateRiskIndex(attPercentage: number, hwPercentage: number, recentExamDrop: number): { risk_index: string, risk_signals: string[] } {
        let signals = 0;
        const reasons = [];

        if (attPercentage < 75) { signals++; reasons.push('attendance below 75%'); }
        if (hwPercentage < 60) { signals++; reasons.push('homework completion below 60%'); }
        if (recentExamDrop > 15) { signals++; reasons.push('declining exam performance > 15%'); }

        let riskLevel = 'low';
        if (signals === 3) riskLevel = 'high';
        else if (signals >= 1) riskLevel = 'medium'; // mapping 1-2 signals to medium bounds as per standard

        return { risk_index: riskLevel, risk_signals: reasons };
    }
}
