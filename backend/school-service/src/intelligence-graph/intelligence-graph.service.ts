import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { 
  Student, 
  StudentLearningProfile,
  Skill,
  Concept,
  StudentSkillMastery,
  StudentConceptMastery,
  TopicSkillMap,
  TopicConceptMap,
  SyllabusTopic,
  StudentMarks,
  HomeworkSubmission,
  StudentAttendance,
  TenantContext
} from '@lumiqos/shared';

interface PerformanceMetrics {
  examScores: number[];
  homeworkGrades: { grade: string; feedback: string }[];
  attendanceRate: number;
  consistencyScore: number;
}

@Injectable()
export class IntelligenceGraphService {
  private readonly logger = new Logger(IntelligenceGraphService.name);

  constructor(
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(StudentLearningProfile)
    private profileRepo: Repository<StudentLearningProfile>,
    @InjectRepository(Skill)
    private skillRepo: Repository<Skill>,
    @InjectRepository(Concept)
    private conceptRepo: Repository<Concept>,
    @InjectRepository(StudentSkillMastery)
    private skillMasteryRepo: Repository<StudentSkillMastery>,
    @InjectRepository(StudentConceptMastery)
    private conceptMasteryRepo: Repository<StudentConceptMastery>,
    @InjectRepository(TopicSkillMap)
    private topicSkillMapRepo: Repository<TopicSkillMap>,
    @InjectRepository(TopicConceptMap)
    private topicConceptMapRepo: Repository<TopicConceptMap>,
    @InjectRepository(SyllabusTopic)
    private topicRepo: Repository<SyllabusTopic>,
    @InjectRepository(StudentMarks)
    private marksRepo: Repository<StudentMarks>,
    @InjectRepository(HomeworkSubmission)
    private homeworkRepo: Repository<HomeworkSubmission>,
    @InjectRepository(StudentAttendance)
    private attendanceRepo: Repository<StudentAttendance>,
  ) {}

  /**
   * Calculate comprehensive student skill mastery using all available data
   */
  async calculateStudentSkillMastery(studentId: string, schoolId: string): Promise<{
    skillsAssessed: number;
    averageMastery: number;
    insights: string[];
  }> {
    this.logger.log(`Calculating comprehensive skill mastery for student: ${studentId}`);
    
    // Gather all performance data
    const metrics = await this.gatherPerformanceMetrics(studentId, schoolId);
    
    // Get all skills for the student's grade/subject
    const skills = await this.getRelevantSkills(studentId, schoolId);
    
    const insights: string[] = [];
    let totalMastery = 0;
    let skillsAssessed = 0;

    for (const skill of skills) {
      const masteryLevel = this.calculateSkillMastery(skill, metrics);
      
      if (masteryLevel !== null) {
        await this.saveSkillMastery(studentId, skill.id, masteryLevel, metrics, schoolId);
        totalMastery += masteryLevel;
        skillsAssessed++;
      }
    }

    // Generate insights from the data
    const generatedInsights = await this.generateStudentInsights(studentId, metrics);
    insights.push(...generatedInsights);

    // Update student learning profile with calculated metrics
    await this.updateLearningProfile(studentId, metrics, schoolId);

    return {
      skillsAssessed,
      averageMastery: skillsAssessed > 0 ? totalMastery / skillsAssessed : 0,
      insights
    };
  }

  /**
   * Gather all performance metrics for a student
   */
  private async gatherPerformanceMetrics(
    studentId: string, 
    schoolId: string
  ): Promise<PerformanceMetrics> {
    // Get exam marks
    const marks = await this.marksRepo.find({
      where: { student_id: studentId, school_id: schoolId }
    });

    const examScores = marks
      .filter(m => m.marks_obtained !== null)
      .map(m => m.marks_obtained as number);

    // Get homework submissions with grades
    const homework = await this.homeworkRepo.find({
      where: { student_id: studentId, school_id: schoolId }
    });

    const homeworkGrades = homework
      .filter(h => h.grade || h.teacher_feedback)
      .map(h => ({
        grade: h.grade || 'N/A',
        feedback: h.teacher_feedback || ''
      }));

    // Calculate attendance rate
    const attendance = await this.attendanceRepo.find({
      where: { student_id: studentId, school_id: schoolId }
    });

    const presentCount = attendance.filter(a => 
      a.status?.toLowerCase() === 'present'
    ).length;
    
    const attendanceRate = attendance.length > 0 
      ? (presentCount / attendance.length) * 100 
      : 100;

    // Calculate consistency score based on score variance and attendance
    const consistencyScore = this.calculateConsistencyScore(examScores, attendanceRate);

    return {
      examScores,
      homeworkGrades,
      attendanceRate,
      consistencyScore
    };
  }

  /**
   * Calculate consistency score (0-100)
   */
  private calculateConsistencyScore(scores: number[], attendanceRate: number): number {
    if (scores.length === 0) return 50; // Neutral if no data

    // Calculate variance
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    // Lower standard deviation = higher consistency
    const scoreConsistency = Math.max(0, 100 - (stdDev * 5));
    
    // Combine with attendance (weighted average)
    return (scoreConsistency * 0.6) + (attendanceRate * 0.4);
  }

  /**
   * Calculate mastery level for a specific skill
   */
  private calculateSkillMastery(
    skill: Skill, 
    metrics: PerformanceMetrics
  ): number | null {
    // Base score from exam performance
    const examAverage = metrics.examScores.length > 0
      ? metrics.examScores.reduce((a, b) => a + b, 0) / metrics.examScores.length
      : null;

    // Homework performance indicator
    const homeworkQuality = this.assessHomeworkQuality(metrics.homeworkGrades);

    // If no data, return null (skill not assessed)
    if (examAverage === null && homeworkQuality === null) {
      return null;
    }

    // Weighted calculation
    let masteryScore = 0;
    let totalWeight = 0;

    if (examAverage !== null) {
      masteryScore += examAverage * 0.6; // 60% weight
      totalWeight += 0.6;
    }

    if (homeworkQuality !== null) {
      masteryScore += homeworkQuality * 0.3; // 30% weight
      totalWeight += 0.3;
    }

    // Add consistency factor (10% weight)
    masteryScore += metrics.consistencyScore * 0.1;
    totalWeight += 0.1;

    // Apply skill difficulty adjustment
    const finalMastery = masteryScore / totalWeight;
    
    return Math.min(100, Math.max(0, finalMastery));
  }

  /**
   * Assess homework quality from grades and feedback
   */
  private assessHomeworkQuality(grades: Array<{ grade: string; feedback: string }>): number | null {
    if (grades.length === 0) return null;

    let qualityScore = 0;
    
    for (const item of grades) {
      // Parse letter grades
      const gradeMap: Record<string, number> = {
        'A+': 100, 'A': 95, 'A-': 90,
        'B+': 87, 'B': 85, 'B-': 80,
        'C+': 77, 'C': 75, 'C-': 70,
        'D+': 67, 'D': 65, 'D-': 60,
        'F': 50
      };

      const numericGrade = gradeMap[item.grade.toUpperCase()] || 75;
      
      // Check feedback for positive indicators
      const positiveKeywords = ['excellent', 'good', 'great', 'well done', 'improved'];
      const hasPositiveFeedback = positiveKeywords.some(kw => 
        item.feedback.toLowerCase().includes(kw)
      );
      
      qualityScore += hasPositiveFeedback ? numericGrade + 5 : numericGrade;
    }

    return qualityScore / grades.length;
  }

  /**
   * Get skills relevant to the student based on their class/subject
   */
  private async getRelevantSkills(studentId: string, schoolId: string): Promise<Skill[]> {
    // Get student's enrolled class/subject
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    
    if (!student) return [];

    // Get all skills for the school
    return this.skillRepo.find({
      where: { school_id: schoolId }
    });
  }

  /**
   * Save or update skill mastery record
   */
  private async saveSkillMastery(
    studentId: string,
    skillId: string,
    masteryLevel: number,
    metrics: PerformanceMetrics,
    schoolId: string
  ): Promise<void> {
    let mastery = await this.skillMasteryRepo.findOne({
      where: { student_id: studentId, skill_id: skillId }
    });

    const now = new Date();
    const attempts = metrics.examScores.length + metrics.homeworkGrades.length;

    if (!mastery) {
      mastery = this.skillMasteryRepo.create({
        student_id: studentId,
        skill_id: skillId,
        school_id: schoolId,
        mastery_level: masteryLevel,
        attempts,
        successes: Math.floor(attempts * (masteryLevel / 100)),
        confidence_score: metrics.consistencyScore,
        last_assessed_at: now,
        assessment_source: 'comprehensive_analysis',
        evidence: {
          examCount: metrics.examScores.length,
          homeworkCount: metrics.homeworkGrades.length,
          attendanceRate: metrics.attendanceRate,
          calculatedAt: now.toISOString()
        }
      });
    } else {
      // Exponential moving average for smooth updates
      const alpha = 0.3; // Weight for new data
      mastery.mastery_level = (mastery.mastery_level * (1 - alpha)) + (masteryLevel * alpha);
      mastery.attempts = (mastery.attempts || 0) + attempts;
      mastery.successes = Math.floor(mastery.attempts * (mastery.mastery_level / 100));
      mastery.confidence_score = metrics.consistencyScore;
      mastery.last_assessed_at = now;
      mastery.evidence = {
        ...mastery.evidence,
        updatedAt: now.toISOString(),
        previousMastery: mastery.mastery_level
      };
    }

    await this.skillMasteryRepo.save(mastery);
  }

  /**
   * Generate insights about student performance
   */
  private async generateStudentInsights(
    studentId: string, 
    metrics: PerformanceMetrics
  ): Promise<string[]> {
    const insights: string[] = [];

    // Exam performance insight
    if (metrics.examScores.length > 0) {
      const avgScore = metrics.examScores.reduce((a, b) => a + b, 0) / metrics.examScores.length;
      if (avgScore >= 85) {
        insights.push('Student demonstrates strong academic performance in exams');
      } else if (avgScore < 60) {
        insights.push('Student may need additional academic support based on exam scores');
      }
    }

    // Attendance insight
    if (metrics.attendanceRate < 80) {
      insights.push(`Attendance rate of ${metrics.attendanceRate.toFixed(1)}% may be impacting learning consistency`);
    } else if (metrics.attendanceRate >= 95) {
      insights.push('Excellent attendance record supporting consistent learning');
    }

    // Consistency insight
    if (metrics.consistencyScore < 50) {
      insights.push('Performance shows high variability - may benefit from structured routine');
    } else if (metrics.consistencyScore >= 80) {
      insights.push('Student demonstrates consistent performance across assessments');
    }

    // Homework insight
    if (metrics.homeworkGrades.length > 0) {
      const hasFeedback = metrics.homeworkGrades.some(h => h.feedback.length > 0);
      if (hasFeedback) {
        insights.push('Teacher feedback available on homework submissions');
      }
    }

    return insights;
  }

  /**
   * Update student learning profile with calculated metrics
   */
  private async updateLearningProfile(
    studentId: string,
    metrics: PerformanceMetrics,
    schoolId: string
  ): Promise<void> {
    const profileData = {
      academic_consistency: metrics.consistencyScore,
      attendance_rate: metrics.attendanceRate,
      exam_performance_avg: metrics.examScores.length > 0
        ? metrics.examScores.reduce((a, b) => a + b, 0) / metrics.examScores.length
        : null,
      homework_submissions: metrics.homeworkGrades.length,
      last_calculated: new Date().toISOString()
    };

    // Update or create learning profile
    let profile = await this.profileRepo.findOne({
      where: { student_id: studentId, profile_type: 'academic_metrics' }
    });

    if (!profile) {
      profile = this.profileRepo.create({
        student_id: studentId,
        school_id: schoolId,
        profile_type: 'academic_metrics',
        profile_data: profileData,
        confidence_score: metrics.examScores.length > 2 ? 80 : 50,
        source: 'intelligence_graph'
      });
    } else {
      profile.profile_data = { ...profile.profile_data, ...profileData };
      profile.updated_at = new Date();
    }

    await this.profileRepo.save(profile);
  }

  // ... (keep existing populateGraphFromAcademicData and other methods) ...
  
  /**
   * Populate graph nodes and edges from existing syllabus topics
   */
  async populateGraphFromAcademicData(schoolId: string): Promise<{
    skillsCreated: number;
    conceptsCreated: number;
    topicSkillMaps: number;
    topicConceptMaps: number;
  }> {
    this.logger.log(`Populating graph for school: ${schoolId}`);
    
    const result = {
      skillsCreated: 0,
      conceptsCreated: 0,
      topicSkillMaps: 0,
      topicConceptMaps: 0,
    };

    const topics = await this.topicRepo.find();
    this.logger.log(`Found ${topics.length} syllabus topics`);

    for (const topic of topics) {
      const extractedSkills = await this.extractSkillsFromTopic(topic, schoolId);
      const extractedConcepts = await this.extractConceptsFromTopic(topic, schoolId);
      
      result.skillsCreated += extractedSkills.length;
      result.conceptsCreated += extractedConcepts.length;
      result.topicSkillMaps += extractedSkills.length;
      result.topicConceptMaps += extractedConcepts.length;
    }

    return result;
  }

  private async extractSkillsFromTopic(topic: SyllabusTopic, schoolId: string): Promise<Skill[]> {
    const createdSkills: Skill[] = [];
    const skillNames = this.parseSkillsFromText(topic.topic_name);
    
    for (const skillName of skillNames) {
      let skill = await this.skillRepo.findOne({
        where: { name: skillName, school_id: schoolId }
      });

      if (!skill) {
        skill = await this.skillRepo.save({
          name: skillName,
          school_id: schoolId,
          category: 'cognitive',
          metadata: { source: 'syllabus_topic', topic_id: topic.id }
        });
        createdSkills.push(skill);
      }

      const existingMap = await this.topicSkillMapRepo.findOne({
        where: { topic_id: topic.id, skill_id: skill.id }
      });

      if (!existingMap) {
        await this.topicSkillMapRepo.save({
          topic_id: topic.id,
          skill_id: skill.id,
          school_id: schoolId,
          relevance_weight: 5,
          skill_type: 'core'
        });
      }
    }

    return createdSkills;
  }

  private async extractConceptsFromTopic(topic: SyllabusTopic, schoolId: string): Promise<Concept[]> {
    const createdConcepts: Concept[] = [];
    const conceptNames = this.parseConceptsFromText(topic.topic_name);
    
    for (const conceptName of conceptNames) {
      let concept = await this.conceptRepo.findOne({
        where: { name: conceptName, school_id: schoolId }
      });

      if (!concept) {
        concept = await this.conceptRepo.save({
          name: conceptName,
          school_id: schoolId,
          domain: 'general',
          metadata: { source: 'syllabus_topic', topic_id: topic.id }
        });
        createdConcepts.push(concept);
      }

      const existingMap = await this.topicConceptMapRepo.findOne({
        where: { topic_id: topic.id, concept_id: concept.id }
      });

      if (!existingMap) {
        await this.topicConceptMapRepo.save({
          topic_id: topic.id,
          concept_id: concept.id,
          school_id: schoolId,
          relevance_weight: 5,
          is_core_concept: true
        });
      }
    }

    return createdConcepts;
  }

  private parseSkillsFromText(text: string): string[] {
    const skillKeywords = [
      'addition', 'subtraction', 'multiplication', 'division',
      'reading', 'comprehension', 'writing', 'grammar',
      'analysis', 'problem-solving', 'critical thinking'
    ];
    
    const foundSkills: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of skillKeywords) {
      if (lowerText.includes(keyword)) {
        foundSkills.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    return foundSkills.length > 0 ? foundSkills : [`Topic: ${text}`];
  }

  private parseConceptsFromText(text: string): string[] {
    const conceptKeywords = [
      'number', 'fraction', 'decimal', 'percentage',
      'sentence', 'paragraph', 'essay', 'story',
      'equation', 'function', 'graph', 'data'
    ];
    
    const foundConcepts: string[] = [];
    const lowerText = text.toLowerCase();
    
    for (const keyword of conceptKeywords) {
      if (lowerText.includes(keyword)) {
        foundConcepts.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
      }
    }
    
    return foundConcepts.length > 0 ? foundConcepts : [text];
  }

  async getStudentGraphData(studentId: string): Promise<any> {
    const skills = await this.skillMasteryRepo.find({
      where: { student_id: studentId },
      relations: ['skill']
    });

    const concepts = await this.conceptMasteryRepo.find({
      where: { student_id: studentId },
      relations: ['concept']
    });

    const profiles = await this.profileRepo.find({
      where: { student_id: studentId }
    });

    return {
      studentId,
      skills: skills.map(s => ({
        id: s.skill_id,
        name: s.skill?.name || 'Unknown',
        mastery: s.mastery_level,
        attempts: s.attempts,
        successes: s.successes,
        confidence: s.confidence_score,
        lastAssessed: s.last_assessed_at
      })),
      concepts: concepts.map(c => ({
        id: c.concept_id,
        name: c.concept?.name || 'Unknown',
        mastery: c.mastery_level,
        understanding: c.understanding_level
      })),
      learningProfiles: profiles,
      summary: {
        averageMastery: skills.length > 0 
          ? skills.reduce((sum, s) => sum + s.mastery_level, 0) / skills.length 
          : 0,
        skillsAssessed: skills.length,
        conceptsMapped: concepts.length
      }
    };
  }
}
