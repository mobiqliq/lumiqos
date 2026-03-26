import { StudentLearningProfile } from '@lumiqos/shared/index';

export class HomeworkGenerator {
    static generateHomework(subject: string, topic: string, count: number, difficulty: string): any {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const type = i % 2 === 0 ? 'mcq' : 'short_answer';
            questions.push({
                type,
                difficulty, // 'easy' | 'standard' | 'advanced'
                question: \`Generate a \${difficulty} \${type} solving \${topic} contexts dynamically inside \${subject} [Mock Q\${i+1}]\`
             });
        }
        return { questions };
    }

    static clusterStudents(profiles: StudentLearningProfile[]): any {
        const advanced = [];
        const standard = [];
        const remedial = [];

        for (const p of profiles) {
             const index = Number(p.exam_performance_index || 0);
             if (index > 1.1) advanced.push(p.student_id);
             else if (index >= 0.9) standard.push(p.student_id);
             else remedial.push(p.student_id);
        }

        return {
            advanced_group_students: advanced,
            standard_group_students: standard,
            remedial_group_students: remedial
        };
    }

    // Smart Differentiated Generation
    static generateDifferentiatedHomework(subject: string, topic: string, profiles: StudentLearningProfile[]): any {
        const clusters = this.clusterStudents(profiles);
        return {
             clusters,
             assignments: {
                 advanced: this.generateHomework(subject, topic, 5, 'advanced'),
                 standard: this.generateHomework(subject, topic, 5, 'standard'),
                 remedial: this.generateHomework(subject, topic, 5, 'easy')
             }
        };
    }
}
