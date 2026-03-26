"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassroomInsights = void 0;
class ClassroomInsights {
    static analyze(profiles) {
        if (!profiles || profiles.length === 0) {
            return {
                struggling_topics: [],
                class_average_exam_index: 0,
                engagement_level: "unknown",
                recommended_actions: ["Analyze active assessments to generate baseline insights"]
            };
        }
        const topicFailCount = {};
        let totalEngagement = 0;
        let totalExamIndex = 0;
        for (const p of profiles) {
            totalEngagement += Number(p.engagement_score || 0);
            totalExamIndex += Number(p.exam_performance_index || 0);
            if (Array.isArray(p.subject_weaknesses)) {
                for (const w of p.subject_weaknesses) {
                    topicFailCount[w] = (topicFailCount[w] || 0) + 1;
                }
            }
        }
        const struggling = Object.entries(topicFailCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(entry => entry[0]);
        const avgEngagement = totalEngagement / profiles.length;
        const avgExamIndex = totalExamIndex / profiles.length;
        let engagementStatus = "medium";
        if (avgEngagement > 0.8)
            engagementStatus = "high";
        else if (avgEngagement < 0.5)
            engagementStatus = "low";
        const recs = [];
        if (struggling.length > 0)
            recs.push(`Review core fundamentals strictly for: \${struggling.join(', ')}\`);
        if (engagementStatus === "low") recs.push("Initiate interactive learning structures bridging engagement gaps securely.");
        else recs.push("Maintain current instructional velocity dynamically.");

        return {
            struggling_topics: struggling,
            class_average_exam_index: avgExamIndex.toFixed(2),
            engagement_level: engagementStatus,
            recommended_actions: recs
        };
    }
}
            );
    }
}
exports.ClassroomInsights = ClassroomInsights;
//# sourceMappingURL=classroom-insights.js.map