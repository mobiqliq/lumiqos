import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ILessonPlan } from '@xceliqos/shared';
import { StudentGraphData, LearningRecommendation, PersonalizedLearningPath } from './interfaces/recommendation.interface';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async createLessonPlan(topic: string): Promise<ILessonPlan> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are an expert NCERT pedagogical assistant. Respond ONLY in JSON." },
          { role: "user", content: `Generate a lesson plan for: "${topic}". Include topic, objectives (array), content (string), duration (number), and assessment.` }
        ],
        response_format: { type: "json_object" }
      });

      const result = response.choices[0].message.content;
      return JSON.parse(result || '{}') as ILessonPlan;
    } catch (error) {
      this.logger.error('OpenAI Error:', error);
      throw new InternalServerErrorException('AI Generation Failed');
    }
  }

  /**
   * Generate personalized learning recommendations based on student graph data
   */
  async generateRecommendations(graphData: StudentGraphData): Promise<{
    recommendations: LearningRecommendation[];
    analysis: string;
  }> {
    try {
      // Identify weak areas (mastery < 50)
      const weakSkills = graphData.skills.filter(s => s.mastery < 50);
      const weakConcepts = graphData.concepts.filter(c => c.mastery < 50);
      
      // Identify strong areas (mastery > 80)
      const strongSkills = graphData.skills.filter(s => s.mastery > 80);
      const strongConcepts = graphData.concepts.filter(c => c.mastery > 80);

      const recommendations: LearningRecommendation[] = [];

      // Generate intervention recommendations for weak areas
      for (const skill of weakSkills.slice(0, 3)) {
        recommendations.push({
          type: 'intervention',
          priority: skill.mastery < 30 ? 'high' : 'medium',
          skillName: skill.name,
          title: `Strengthen ${skill.name}`,
          description: `Focused practice to improve ${skill.name} mastery from ${skill.mastery.toFixed(1)}%`,
          suggestedResources: await this.suggestResources(skill.name, 'skill'),
          estimatedTimeMinutes: 30,
          expectedImprovement: 15,
        });
      }

      // Generate enrichment for strong areas
      for (const skill of strongSkills.slice(0, 2)) {
        recommendations.push({
          type: 'enrichment',
          priority: 'medium',
          skillName: skill.name,
          title: `Advanced ${skill.name}`,
          description: `Challenge yourself with advanced ${skill.name} concepts`,
          suggestedResources: await this.suggestResources(skill.name, 'advanced'),
          estimatedTimeMinutes: 45,
          expectedImprovement: 10,
        });
      }

      // Generate practice recommendations
      if (graphData.summary.averageMastery < 70) {
        recommendations.push({
          type: 'practice',
          priority: 'high',
          title: 'Daily Practice Routine',
          description: 'Consistent practice to build foundational skills',
          suggestedResources: ['Practice worksheets', 'Online exercises', 'Peer study groups'],
          estimatedTimeMinutes: 20,
          expectedImprovement: 20,
        });
      }

      // Use AI to enhance recommendations with natural language analysis
      const analysis = await this.generateAnalysis(graphData, weakSkills, strongSkills);

      return { recommendations, analysis };
    } catch (error) {
      this.logger.error('Recommendation generation error:', error);
      throw new InternalServerErrorException('Failed to generate recommendations');
    }
  }

  /**
   * Generate personalized learning path
   */
  async generateLearningPath(graphData: StudentGraphData): Promise<PersonalizedLearningPath> {
    const weakSkills = graphData.skills.filter(s => s.mastery < 50);
    const sortedByWeakness = [...graphData.skills].sort((a, b) => a.mastery - b.mastery);
    
    const focusAreas = sortedByWeakness.slice(0, 5).map(skill => ({
      area: skill.name,
      currentMastery: skill.mastery,
      targetMastery: Math.min(skill.mastery + 20, 90),
      priority: skill.mastery < 30 ? 1 : skill.mastery < 50 ? 2 : 3,
    }));

    const { recommendations } = await this.generateRecommendations(graphData);

    // Create weekly plan
    const weeklyPlan = [];
    for (let day = 1; day <= 7; day++) {
      const focus = focusAreas[day % focusAreas.length];
      weeklyPlan.push({
        day,
        focus: focus?.area || 'General Review',
        activities: await this.generateDailyActivities(focus?.area, day),
        duration: day <= 5 ? 30 : 45, // Longer on weekends
      });
    }

    return {
      studentId: graphData.studentId,
      generatedAt: new Date().toISOString(),
      overallMastery: graphData.summary.averageMastery,
      focusAreas,
      recommendations,
      weeklyPlan,
      longTermGoals: await this.generateLongTermGoals(graphData),
    };
  }

  /**
   * Generate AI-powered analysis of student performance
   */
  private async generateAnalysis(
    graphData: StudentGraphData,
    weakSkills: any[],
    strongSkills: any[]
  ): Promise<string> {
    try {
      const prompt = `
        Analyze this student's learning profile:
        - Overall Mastery: ${graphData.summary.averageMastery.toFixed(1)}%
        - Skills Assessed: ${graphData.summary.skillsAssessed}
        - Weak Areas: ${weakSkills.map(s => s.name).join(', ') || 'None'}
        - Strong Areas: ${strongSkills.map(s => s.name).join(', ') || 'None'}
        
        Provide a concise, encouraging 2-3 sentence analysis with actionable advice.
      `;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a supportive educational advisor. Be concise and encouraging." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
      });

      return response.choices[0].message.content || 'Keep practicing consistently!';
    } catch (error) {
      this.logger.warn('AI analysis failed, using fallback');
      return graphData.summary.averageMastery < 70
        ? 'Focus on foundational skills and consistent practice.'
        : 'Good progress! Challenge yourself with advanced material.';
    }
  }

  /**
   * Suggest learning resources based on topic
   */
  private async suggestResources(topic: string, type: string): Promise<string[]> {
    // Phase 1: Rule-based suggestions
    const resourceMap: Record<string, string[]> = {
      'Addition': ['Khan Academy - Addition', 'Math worksheets', 'Number line activities'],
      'Subtraction': ['Khan Academy - Subtraction', 'Word problems', 'Mental math games'],
      'Multiplication': ['Times tables practice', 'Multiplication games', 'Array models'],
      'Division': ['Division strategies', 'Long division practice', 'Real-world problems'],
      'Reading': ['Guided reading', 'Comprehension passages', 'Vocabulary builders'],
      'Writing': ['Writing prompts', 'Grammar exercises', 'Essay structure guides'],
    };

    for (const [key, resources] of Object.entries(resourceMap)) {
      if (topic.toLowerCase().includes(key.toLowerCase())) {
        return resources;
      }
    }

    return ['Online practice exercises', 'Peer tutoring', 'Teacher consultation'];
  }

  /**
   * Generate daily activities
   */
  private async generateDailyActivities(focusArea: string | undefined, day: number): Promise<string[]> {
    if (!focusArea) {
      return ['Review previous topics', 'Practice mixed problems', 'Self-assessment quiz'];
    }

    const activities = [
      `Warm-up: Quick review of ${focusArea}`,
      `Core practice: ${focusArea} exercises`,
      `Challenge: Advanced ${focusArea} problem`,
    ];

    if (day === 7) {
      activities.push('Weekly reflection and goal setting');
    }

    return activities;
  }

  /**
   * Generate long-term learning goals
   */
  private async generateLongTermGoals(graphData: StudentGraphData): Promise<string[]> {
    const goals: string[] = [];
    
    if (graphData.summary.averageMastery < 60) {
      goals.push('Achieve 70% mastery in core skills within 2 months');
      goals.push('Build consistent daily practice habit');
    } else if (graphData.summary.averageMastery < 80) {
      goals.push('Reach 85% mastery in all assessed skills');
      goals.push('Begin exploring advanced topics in strong areas');
    } else {
      goals.push('Maintain excellence while exploring enrichment topics');
      goals.push('Develop peer tutoring skills');
    }

    goals.push('Complete personalized learning path milestones');
    
    return goals;
  }

  /**
   * Generate intervention strategies for struggling students
   */
  async generateInterventionStrategies(graphData: StudentGraphData): Promise<{
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  }> {
    const criticalSkills = graphData.skills.filter(s => s.mastery < 30);
    
    return {
      immediate: criticalSkills.map(s => `One-on-one support for ${s.name}`),
      shortTerm: [
        'Daily 15-minute targeted practice',
        'Weekly progress check-ins',
      ],
      longTerm: [
        'Develop personalized learning plan',
        'Consider peer tutoring arrangement',
        'Schedule monthly reassessment',
      ],
    };
  }
}