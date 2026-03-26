"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportCommentGenerator = void 0;
class ReportCommentGenerator {
    static generateComment(perfLevel, subject) {
        if (perfLevel === 'high') {
            return ;
            `Demonstrates exceptionally strong conceptual understanding in \${subject} and participates dynamically mapping high instructional velocity comfortably.\`;
        }
        if (perfLevel === 'medium') {
             return \`Maintains a balanced and consistent performance standard in \${subject}. Continued structural focus should elevate capabilities gracefully.\`;
        }
        return \`Encounters consistent challenges processing \${subject} fundamentals natively. Recommended to focus actively on assignment completion bridging conceptual gaps securely.\`;
    }

    static generatePTMSummary(profile: StudentLearningProfile): any {
        if (!profile) return { error: "Profile missing mapping natively." };

        const strengths = Array.isArray(profile.subject_strengths) && profile.subject_strengths.length > 0 ? profile.subject_strengths : ["General comprehension"];
        const weaknesses = Array.isArray(profile.subject_weaknesses) && profile.subject_weaknesses.length > 0 ? profile.subject_weaknesses : ["Assignment consistency"];

        return {
             strengths,
             areas_for_improvement: weaknesses,
             growth_trend: profile.growth_trend || 'stable',
             engagement_level: Number(profile.engagement_score) > 0.8 ? "high" : (Number(profile.engagement_score) < 0.5 ? "low" : "moderate"),
             recommended_parent_support: [
                 "Establish strict 30-minute daily review schedules focusing entirely on improvement scopes.",
                 "Ensure all formative assessments securely loop through parental supervision dynamically."
             ]
        };
    }
}
            ;
        }
    }
}
exports.ReportCommentGenerator = ReportCommentGenerator;
//# sourceMappingURL=report-comment-generator.js.map