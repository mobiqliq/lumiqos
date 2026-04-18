export interface StudentGraphData {
  studentId: string;
  skills: Array<{
    id: string;
    name: string;
    mastery: number;
    attempts: number;
    confidence: number;
  }>;
  concepts: Array<{
    id: string;
    name: string;
    mastery: number;
    understanding: string;
  }>;
  summary: {
    averageMastery: number;
    skillsAssessed: number;
  };
}

export interface LearningRecommendation {
  type: 'intervention' | 'enrichment' | 'practice' | 'review';
  priority: 'high' | 'medium' | 'low';
  skillName?: string;
  conceptName?: string;
  title: string;
  description: string;
  suggestedResources: string[];
  estimatedTimeMinutes: number;
  expectedImprovement: number;
}

export interface PersonalizedLearningPath {
  studentId: string;
  generatedAt: string;
  overallMastery: number;
  focusAreas: Array<{
    area: string;
    currentMastery: number;
    targetMastery: number;
    priority: number;
  }>;
  recommendations: LearningRecommendation[];
  weeklyPlan: Array<{
    day: number;
    focus: string;
    activities: string[];
    duration: number;
  }>;
  longTermGoals: string[];
}
