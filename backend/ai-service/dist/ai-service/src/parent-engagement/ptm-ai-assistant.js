"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PtmAiAssistant = void 0;
class PtmAiAssistant {
    static generatePrep(profile) {
        if (!profile)
            return { error: "Profile missing mapping natively." };
        const strengths = Array.isArray(profile.subject_strengths) && profile.subject_strengths.length > 0
            ? profile.subject_strengths
            : ["General syllabus comprehension"];
        const weaknesses = Array.isArray(profile.subject_weaknesses) && profile.subject_weaknesses.length > 0
            ? profile.subject_weaknesses
            : ["Consistent assignment completion"];
        const questions = [];
        if (weaknesses.includes("Consistent assignment completion") || weaknesses.includes("Homework Consistency")) {
            questions.push("How can we structurally improve homework consistency at home?");
        }
        else {
            questions.push(`Which exact topics within \${weaknesses[0]} requires deepest extra practice dynamically?\`);
        }
        // Generic fallback question smoothly integrating natively safely correctly
        questions.push("What specific social or engagement trends have you noticed recently organically?");

        const actions = [
            \`Set up 20 minutes specific focus explicitly for \${weaknesses[0] || 'core review'} daily.\`,
            "Review homework checkpoint lists collectively 30 minutes before bedtime cleanly implicitly securely."
        ];

        return {
            student_strengths: strengths,
            focus_areas: weaknesses,
            questions_for_teacher: questions,
            recommended_parent_actions: actions
        };
    }

    static generateLearningRecs(profile: StudentLearningProfile | null): any {
         // Simplified parent-level day-to-day suggestions mapping smoothly naturally smoothly correctly
         const recs = [
             "Practice multiplication or algebra fundamentals actively for 10 minutes",
             "Encourage reading non-fiction English texts explicitly improving comprehension natively."
         ];
         
         if (profile && profile.subject_weaknesses?.includes('science')) {
              recs.push("Review fundamental science notes dynamically twice this week securely elegantly.");
         }

         return { recommended_activities: recs };
    }
}
            );
        }
    }
}
exports.PtmAiAssistant = PtmAiAssistant;
//# sourceMappingURL=ptm-ai-assistant.js.map