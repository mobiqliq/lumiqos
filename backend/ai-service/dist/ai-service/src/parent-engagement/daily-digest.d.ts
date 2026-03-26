import { StudentLearningProfile, StudentAttendance, HomeworkSubmission } from '@lumiqos/shared/index';
export declare class DailyDigestGenerator {
    static synthesize(profile: StudentLearningProfile | null, todayAtt: StudentAttendance | null, todayHwList: HomeworkSubmission[] | null): any;
}
