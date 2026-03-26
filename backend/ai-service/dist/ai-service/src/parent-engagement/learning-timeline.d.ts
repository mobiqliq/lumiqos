import { StudentLearningProfile } from '@lumiqos/shared/index';
export declare class LearningTimelineGenerator {
    static translateScore(score: number): string;
    static generate(profile: StudentLearningProfile | null): any;
}
