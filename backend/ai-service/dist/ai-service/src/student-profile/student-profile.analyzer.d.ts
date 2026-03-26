export declare class StudentProfileAnalyzer {
    static clamp(val: number, min: number, max: number): number;
    static stdDev(array: number[]): number;
    static calculateAttendanceIndex(present: number, total: number): number;
    static calculateHomeworkIndex(submitted: number, total: number): number;
    static calculateExamIndex(studentAvg: number, classAvg: number): number;
    static calculateConsistencyScore(scores: number[]): number;
    static calculateEngagementScore(attIndex: number, hwIndex: number, participation?: number): number;
    static calculateGrowthTrend(recentAvg: number, prevAvg: number): string;
    static detectStrengthsAndWeaknesses(subjectScores: {
        subject: string;
        studentScore: number;
        classAvg: number;
    }[]): {
        strengths: string[];
        weaknesses: string[];
    };
    static calculateRiskIndex(attPercentage: number, hwPercentage: number, recentExamDrop: number): {
        risk_index: string;
        risk_signals: string[];
    };
}
