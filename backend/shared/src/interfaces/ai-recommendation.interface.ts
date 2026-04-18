export interface StudentGraphData {
  studentId: string;
  skills: StudentSkillData[];
  concepts: StudentConceptData[];
  learningProfiles: LearningProfileData[];
  summary: GraphSummary;
}

export interface StudentSkillData {
  id: string;
  name: string;
  mastery: number;
  attempts: number;
  successes: number;
  confidence: number;
  lastAssessed: Date;
}

export interface StudentConceptData {
  id: string;
  name: string;
  mastery: number;
  understanding: string;
}

export interface LearningProfileData {
  profile_type: string;
  profile_data: Record<string, any>;
  confidence_score: number;
}

export interface GraphSummary {
  averageMastery: number;
  skillsAssessed: number;
  conceptsMapped: number;
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
  focusAreas: FocusArea[];
  recommendations: LearningRecommendation[];
  weeklyPlan: DailyPlan[];
  longTermGoals: string[];
}

export interface FocusArea {
  area: string;
  currentMastery: number;
  targetMastery: number;
  priority: number;
}

export interface DailyPlan {
  day: number;
  focus: string;
  activities: string[];
  duration: number;
}

export interface InterventionStrategies {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
}
