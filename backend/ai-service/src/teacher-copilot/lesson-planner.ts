export class LessonPlanner {
    static generateMockLessonPlan(subject: string, topic: string, duration: number, objective: string): any {
        return {
            lesson_objectives: [
                \`Understand core concepts of \${topic} (\${objective})\`,
                \`Apply \${subject} principles to standard problems correctly.\`
            ],
            lesson_flow: [
                { time: "0-5 min", activity: "Introduction & Context Setting" },
                { time: \`5-\${Math.floor(duration/2)} min\`, activity: \`Conceptual Deep Dive into \${topic}\` },
                { time: \`\${Math.floor(duration/2)}-\${duration - 10} min\`, activity: "Guided Practice and Application" },
                { time: \`\${duration - 10}-\${duration} min\`, activity: "Summary and Q&A" }
            ],
            activities: [
                \`Classroom collaborative problem solving resolving \${topic}.\`,
                \`Individual worksheet evaluation focused on \${objective}.\`
            ],
            assessment_questions: [
                \`Explain the primary function of \${topic}?\`,
                \`Solve a fundamental \${subject} problem applying \${objective} logic.\`
            ]
        };
    }
}
