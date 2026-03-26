"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AiService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
let AiService = AiService_1 = class AiService {
    logger = new common_1.Logger(AiService_1.name);
    async generateLessonPlan(subject, topic, grade, board) {
        this.logger.log(`Generating AI Lesson Plan for Grade ${grade} ${subject} (${board}): ${topic}`);
        let pedagogy = 'Standard';
        let activityType = 'Class Activity';
        if (grade >= 1 && grade <= 5) {
            pedagogy = 'Inquiry-Based & Gamified';
            activityType = 'Interactive Game / Hands-on Exploration';
        }
        else if (grade >= 6 && grade <= 8) {
            pedagogy = 'Experiential & Project-Based';
            activityType = 'Collaborative Project / Mini-Lab';
        }
        else if (grade >= 9 && grade <= 12) {
            pedagogy = 'Analytical & Exam-Aligned';
            activityType = 'Critical Analysis / Case Study';
        }
        const isIndianBoard = ['CBSE', 'ICSE', 'State Board'].includes(board);
        const benchmarkLabel = isIndianBoard ? 'NEP 2020 / NCERT' : 'Global Standards / Bloom\'s';
        const benchmarkGoal = isIndianBoard
            ? `Aligned with ${board} competency-based learning as per NEP 2020.`
            : `Aligned with ${board} learning objectives and critical thinking skills.`;
        const templates = {
            'Mathematics': {
                objective: `Students will master the logical derivation and application of ${topic}.`,
                structure: [
                    { time: '10 Mins', phase: 'Mental Math / Prior Knowledge', desc: `Quick retrieval of foundational concepts required for ${topic}.` },
                    { time: '15 Mins', phase: 'Theorem & Proof', desc: `Step-by-step logical derivation of the core mathematical principles of ${topic}.` },
                    { time: '20 Mins', phase: 'Guided Problem Solving', desc: `Work through 3 levels of complexity: Simple Application, Algebraic Manipulation, and Word Problems.` }
                ],
                misconceptions: [
                    { trap: 'Applying the rule without checking preconditions.', solution: 'Use a "Pre-flight Checklist" before starting the calculation.' }
                ]
            },
            'Science': {
                objective: `Students will understand ${topic} through the lens of the scientific method and empirical observation.`,
                structure: [
                    { time: '10 Mins', phase: 'The Phenomenon', desc: `Observe a real-world demonstration or video of ${topic} in action.` },
                    { time: '10 Mins', phase: 'Theoretical Framework', desc: `The underlying laws or biological/chemical mechanisms of ${topic}.` },
                    { time: '25 Mins', phase: 'Experimental Design/Observation', desc: `Design a hypothetical experiment or analyze lab data related to ${topic}.` }
                ],
                misconceptions: [
                    { trap: 'Confusing a scientific theory with a "guess".', solution: 'Explain the evidence-based rigor of this specific topic.' }
                ]
            },
            'English': {
                objective: `Students will analyze ${topic} for thematic depth, linguistic nuance, and structural composition.`,
                structure: [
                    { time: '10 Mins', phase: 'Textual Immersion', desc: `Reading an excerpt or analyzing a prompt related to ${topic}.` },
                    { time: '15 Mins', phase: 'Contextual Analysis', desc: `Deep dive into the symbolism, rhetoric, or historical context of ${topic}.` },
                    { time: '20 Mins', phase: 'Composition / Creative Response', desc: `Drafting a peer-reviewed response or creative application of the concept.` }
                ],
                misconceptions: [
                    { trap: 'Believing there is only one correct interpretation.', solution: 'Facilitate a "Perspective Gallery Walk" to show valid alternative readings.' }
                ]
            },
            'Social Studies': {
                objective: `Students will analyze ${topic} through historical, geographical, and civic perspectives.`,
                structure: [
                    { time: '10 Mins', phase: 'Contextualization', desc: `Setting the scene for ${topic} in history/society.` },
                    { time: '20 Mins', phase: 'Analysis', desc: `Exploring primary sources or maps related to ${topic}.` },
                    { time: '15 Mins', phase: 'Discussion', desc: 'Critical debate on societal impact.' }
                ],
                misconceptions: [
                    { trap: 'Assuming history is a static set of dates.', solution: 'Present history as a series of evolving narratives.' }
                ]
            }
        };
        const defaultTemplate = {
            objective: `Students will understand ${topic} and its practical applications.`,
            structure: [
                { time: '10 Mins', phase: 'Introduction', desc: `Overview of ${topic}.` },
                { time: '20 Mins', phase: activityType, desc: `Interactive application of ${topic} aligned with ${benchmarkLabel}.` },
                { time: '10 Mins', phase: 'Conclusion', desc: `Summary and assessment of ${topic}.` }
            ],
            misconceptions: []
        };
        const template = templates[subject] || defaultTemplate;
        const benchmark = {
            label: benchmarkLabel,
            goal: benchmarkGoal,
            attributes: isIndianBoard
                ? ['Holistic Development', 'Multilingualism', 'Cognitive Skills']
                : ['Critical Thinking', 'Global Citizenship', 'Interdisciplinary']
        };
        return {
            topic,
            subject,
            ...template,
            pedagogy,
            benchmark,
            differentiation: {
                advanced: `[${board} Advanced] Research task: Compare ${topic} with advanced theories.`,
                struggling: `[${board} Scaffolded] Visual aids and simplified terminology for ${topic}.`,
                creative: `Create a multimedia project explaining ${topic} for Grade ${grade}.`
            },
            exitTicket: {
                title: 'Formative Assessment (Exit Ticket)',
                q1: `Predict the next development in ${topic} based on today\'s lesson.`,
                q2: `What is the most significant impact of ${topic} on daily life?`
            },
            blooms: [
                { level: 'Remember', q: `Define ${topic}.`, type: 'Flashcard' },
                { level: 'Analyze', q: `How does ${topic} relate to previous units?`, type: 'Short Answer' },
                { level: 'Create', q: `Design a system that solves a problem using ${topic}.`, type: 'Project' }
            ]
        };
    }
    async generateExam(board, subject, classLevel, type) {
        this.logger.log(`Generating AI Exam for ${board} ${subject} Class ${classLevel}`);
        return {
            status: 'Success',
            alignment: `${board} Guidelines 2024-25`,
            bloomsTaxonomySpan: ['Remembering', 'Understanding', 'Applying', 'Analyzing'],
            sections: [
                {
                    name: 'Section A: Objective (Knowledge & Understanding)',
                    marks: 20,
                    type: 'Multiple Choice & Short Answer',
                    questions: 15
                },
                {
                    name: 'Section B: Subjective (Application)',
                    marks: 30,
                    type: 'Long Answer & Case Studies',
                    questions: 5
                }
            ]
        };
    }
    async generateCurriculumRefactoring(lostDays, reason) {
        this.logger.log(`Refactoring curriculum for ${lostDays} lost days due to ${reason}`);
        return {
            title: '🤖 AI Schedule Adjusted',
            body: `${lostDays} days lost due to ${reason}. Curriculum automatically refactored. Compensatory Saturday classes added to complete units on time.`
        };
    }
    async generateSubstituteAllocation(absentTeacherId, periods) {
        this.logger.log(`Allocating substitute for absent teacher: ${absentTeacherId}`);
        const substitutes = [
            { id: 'usr_t_002', name: 'Mrs. Davis', subjectMatch: 'High', availablePeriods: [1] },
            { id: 'usr_t_003', name: 'Mr. Smith', subjectMatch: 'Medium', availablePeriods: [2] }
        ];
        return {
            status: 'Success',
            allocated: periods.map(p => {
                const sub = substitutes.find(s => s.availablePeriods.includes(p.period));
                return {
                    period: p.period,
                    class: p.class,
                    subject: p.subject,
                    original_teacher: 'Mr. Brown',
                    allocated_substitute: sub ? sub.name : 'Unassigned',
                    substitute_id: sub ? sub.id : null,
                    match_confidence: sub ? sub.subjectMatch : 'Low'
                };
            })
        };
    }
    async generateAttendanceInsights(data) {
        this.logger.log(`Generating AI Attendance Insights...`);
        const trend = data.weeklyTrend[data.weeklyTrend.length - 1] > data.weeklyTrend[0] ? 'improving' : 'declining';
        return {
            summary: `Attendance is currently ${trend} with a monthly average of ${data.dailyAvg}%.`,
            insight: `Alert: ${data.mostAbsentDay || 'Mondays'} showing a persistent 12% dip. LUMIQ AI suggests scheduling high-engagement activities like 'Lab Practical' or 'Gamified Quizzes' on these days to bridge the attendance gap.`,
            prediction: `Predicted attendance for next week: ${Math.min(data.dailyAvg + 2, 100)}% based on current engagement patterns.`
        };
    }
    async generateAcademicPlan(board, schoolType, totalTeachers, subjects) {
        this.logger.log(`Generating AI Academic Plan for ${board} (${schoolType}) with ${totalTeachers} teachers.`);
        const isNEP = ['CBSE', 'ICSE', 'State Board'].includes(board);
        const stages = [
            { name: 'Foundational (G1-2)', focus: 'Play/Discovery', periodsPerWeek: 30 },
            { name: 'Preparatory (G3-5)', focus: 'Interactive Learning', periodsPerWeek: 35 },
            { name: 'Middle (G6-8)', focus: 'Experiential Science/Arts', periodsPerWeek: 40 },
            { name: 'Secondary (G9-12)', focus: 'Multidisciplinary / Depth', periodsPerWeek: 45 }
        ];
        const weightage = subjects.map(s => ({
            subject: s,
            weight: s === 'Mathematics' || s === 'Science' ? '25%' : '15%',
            nepGoal: `Integrated ${s} pedagogy as per NCF 2023.`
        }));
        return {
            structuralFramework: isNEP ? '5+3+3+4 (NEP 2020)' : 'Standard K-12',
            boardAlignment: board,
            stages,
            subjectWeightage: weightage,
            teacherOptimization: {
                ratio: `1:${Math.round(30 / (totalTeachers / subjects.length))}`,
                recommendation: totalTeachers < subjects.length ? 'Consider subject-sharing for Middle Stage.' : 'Optimal capacity.'
            },
            milestones: [
                { term: 'Term 1', goal: 'Foundational literacy & numeracy focus' },
                { term: 'Term 2', goal: 'Vocational integration / Bagless days' },
                { term: 'Term 3', goal: 'Final holistic assessment' }
            ]
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = AiService_1 = __decorate([
    (0, common_1.Injectable)()
], AiService);
//# sourceMappingURL=ai.service.js.map