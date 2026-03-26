import { StudentLearningProfile, StudentAttendance, HomeworkSubmission } from '@lumiqos/shared/index';

export class DailyDigestGenerator {
    static synthesize(
        profile: StudentLearningProfile | null,
        todayAtt: StudentAttendance | null,
        todayHwList: HomeworkSubmission[] | null
    ): any {
        // Attendance Status
        let attendanceStatus = 'unknown';
        if (todayAtt) attendanceStatus = todayAtt.status;
        else if (profile) attendanceStatus = 'assumed_present'; // fallback if no specific session taken today

        // Homework Status
        let pendingHwCount = 0;
        let submittedHwCount = 0;
        if (todayHwList) {
            for (const hw of todayHwList) {
                if (hw.status === 'pending') pendingHwCount++;
                else if (hw.status === 'submitted' || hw.status === 'graded') submittedHwCount++;
            }
        }
        const hwString = pendingHwCount > 0 ?\`\${pendingHwCount} pending\` : (submittedHwCount > 0 ? 'All completed' : 'None assigned');

        // Engagement Level Mapping
        let engagementStr = 'medium';
        if (profile) {
              const engScore = Number(profile.engagement_score || 0);
              if (engScore > 0.85) engagementStr = 'high';
              else if (engScore < 0.50) engagementStr = 'low';
        }

        // Mock Teacher Note (Ordinarily queried via NotificationRecipient matching today's date)
        const teacherNote = engagementStr === 'high' 
              ? "Active participation noted in core classes." 
              : (engagementStr === 'low' ? "Needs encouragement maintaining focus." : "Standard participation observed.");

        // AI Summary Synthesis
        let summary = \`\`;
        if (engagementStr === 'high') summary += "Strong engagement observed today. ";
        else if (engagementStr === 'low') summary += "Engagement was below baseline today. ";
        else summary += "A consistent learning day. ";

        if (pendingHwCount > 0) summary += \`Please ensure the \${pendingHwCount} pending assignment(s) are completed.\`;
        else summary += "Excellent work staying up to date with assignments.";

        return {
             attendance: attendanceStatus,
             homework_status: hwString,
             class_engagement: engagementStr,
             teacher_note: teacherNote,
             ai_summary: summary.trim()
        };
    }
}
