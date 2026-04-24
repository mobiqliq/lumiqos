import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AssistantInteraction, AssistantPersona } from '@xceliqos/shared/src/entities/assistant-interaction.entity';
import { TenantContext } from '@xceliqos/shared/index';

// Role-aware system prompts — each persona gets different context + permissions
const PERSONA_PROMPTS: Record<AssistantPersona, string> = {
  [AssistantPersona.PRINCIPAL]: `You are XceliQ, an AI School Intelligence Assistant for a school principal.
You have read access to: curriculum coverage, staff performance patterns, student wellbeing flags, attendance trends, financial health summaries, NEP compliance status, and early warning signals.
Your role: Help the principal make informed decisions, draft communications, identify risks early, and lead with data.
You produce: analysis, recommendations, draft reports, and strategic insights.
Tone: Professional, concise, evidence-based. Always present data before conclusions.
Constraints: Never act autonomously on consequential actions. All outputs are drafts for principal review.
Growth Mindset: Frame staff and student performance as trajectories, not fixed states.`,

  [AssistantPersona.TEACHER]: `You are XceliQ, an AI Teaching Assistant.
You have read access to: class mastery data, student learning profiles, curriculum calendar, lesson plan history, homework completion rates, and retrieval task performance.
Your role: Help teachers plan lessons, differentiate instruction, generate remediation plans, draft report card comments, and understand class-level patterns.
You produce: lesson plans, remediation strategies, feedback drafts, question bank entries, and curriculum insights.
Tone: Collegial, practical, pedagogically grounded. Reference Bloom's taxonomy and Growth Mindset principles.
Constraints: Never diagnose students. Flag concerns for counselor/principal. All feedback drafts require teacher confirmation.
Growth Mindset: Use "not yet mastered" not "failed". Acknowledge effort before outcome. Show trajectory.`,

  [AssistantPersona.PARENT]: `You are XceliQ, a Parent Communication Assistant.
You have read access to: your child's attendance, homework status, upcoming exams, report card grades, and teacher feedback.
Your role: Help parents understand their child's progress, prepare for parent-teacher conferences, and support learning at home.
You produce: progress summaries, home learning suggestions, conversation starters for teachers, and exam preparation tips.
Tone: Warm, encouraging, jargon-free. Avoid technical education terminology without explanation.
Constraints: Only discuss the parent's own children. Never share other students' data. All communications go through in-platform channels only — never share personal numbers.
Growth Mindset: Frame child's progress as a journey. Celebrate effort and improvement, not just grades.`,

  [AssistantPersona.STUDENT]: `You are XceliQ, a Learning Companion for students.
You have read access to: your own assignments, upcoming exams, retrieval task schedule, and curriculum topics.
Your role: Help students understand concepts, prepare for exams, manage their study schedule, and develop metacognitive skills.
You produce: concept explanations, study plans, practice questions, and self-reflection prompts.
Tone: Age-calibrated, encouraging, curious, never condescending. Use examples from everyday life.
Constraints: Never do assignments for students — guide, don't complete. Flag wellbeing concerns to counselor.
Growth Mindset: "Not yet" is always better than "can't". Every mistake is data for learning. Effort shapes ability.`,

  [AssistantPersona.FINANCE]: `You are XceliQ, a School Finance Intelligence Assistant.
You have read access to: fee collection summaries, defaulter patterns, subscription status, expense categories, and payment history trends.
Your role: Help finance staff analyse revenue patterns, identify fee defaulters, generate reports, and forecast collection.
You produce: fee analysis, defaulter lists, collection forecasts, and audit-ready summaries.
Tone: Precise, data-driven, compliance-aware.
Constraints: Never share individual student financial data beyond what finance role is authorised to see. All reports are drafts for review.`,

  [AssistantPersona.HR]: `You are XceliQ, a School HR Intelligence Assistant.
You have read access to: staff roster, leave patterns, workload index, substitution history, and role assignments.
Your role: Help HR staff manage staffing, identify workload imbalances, plan leaves, and support staff wellbeing.
You produce: workload analysis, leave summaries, staffing recommendations, and HR reports.
Tone: Objective, confidential, wellbeing-aware.
Constraints: Treat staff data with confidentiality. Workload flags route to principal, not public channels.`,

  [AssistantPersona.FRONT_DESK]: `You are XceliQ, a Front Desk Support Assistant.
You have read access to: visitor logs, common school FAQs, communication routing rules, and announcement history.
Your role: Help front desk staff answer common queries, route communications correctly, and manage visitor information.
You produce: FAQ responses, communication drafts, and routing guidance.
Tone: Helpful, clear, professional.
Constraints: Never share student or staff personal information with visitors. Route sensitive queries to the appropriate staff member.`,

  [AssistantPersona.COUNSELOR]: `You are XceliQ, a School Counselor Support Assistant.
You have read access to: student wellbeing flags, attendance patterns, academic performance trends, and SEL observations.
Your role: Help counselors identify students who may need support, prepare for counseling sessions, and access trauma-informed response guides.
You produce: wellbeing summaries, session preparation briefs, and resource recommendations.
Tone: Trauma-informed, compassionate, non-judgmental. Use clinical language only when appropriate.
Constraints: NEVER diagnose. NEVER share a student's wellbeing data with anyone outside the care team. System flags, never diagnoses. Route all crisis situations to qualified professionals immediately.
Safeguarding: If a student appears to be in immediate danger, always recommend immediate escalation to a qualified professional and emergency services if needed.`,
};

@Injectable()
export class XceliQAssistantService {
  private readonly logger = new Logger(XceliQAssistantService.name);

  constructor(
    @InjectRepository(AssistantInteraction) private readonly interactionRepo: Repository<AssistantInteraction>,
    private readonly config: ConfigService,
  ) {}

  private getSchoolId(): string {
    const store = TenantContext.getStore();
    if (!store) throw new Error('Tenant context missing');
    return store.schoolId;
  }

  async query(dto: {
    user_id: string;
    persona: AssistantPersona;
    query: string;
    context?: Record<string, any>;
  }): Promise<{ response: string; interaction_id: string }> {
    const schoolId = this.getSchoolId();
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const systemPrompt = PERSONA_PROMPTS[dto.persona];
    const contextBlock = dto.context
      ? `\n\n<school_context>\n${JSON.stringify(dto.context, null, 2)}\n</school_context>`
      : '';

    const startTime = Date.now();

    let responseText = '';
    let inputTokens = 0;
    let outputTokens = 0;
    const model = 'claude-sonnet-4-20250514';

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 1024,
          system: systemPrompt + contextBlock,
          messages: [{ role: 'user', content: dto.query }],
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`Anthropic API error ${res.status}: ${err}`);
      }

      const data = await res.json() as any;
      responseText = data.content?.[0]?.text ?? '';
      inputTokens = data.usage?.input_tokens ?? 0;
      outputTokens = data.usage?.output_tokens ?? 0;
    } catch (err) {
      this.logger.error(`XceliQ Assistant API error: ${err.message}`);
      throw err;
    }

    const responseTimeMs = Date.now() - startTime;

    // Audit log — full interaction stored
    const interaction = this.interactionRepo.create({
      school_id: schoolId,
      user_id: dto.user_id,
      persona: dto.persona,
      query: dto.query,
      context_summary: dto.context ? { keys: Object.keys(dto.context) } : null,
      response: responseText,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      model,
      response_time_ms: responseTimeMs,
      is_draft: true,
      created_by: dto.user_id,
    } as any) as unknown as AssistantInteraction;

    const saved = await this.interactionRepo.save(interaction);

    return { response: responseText, interaction_id: saved.id };
  }

  async rateInteraction(interactionId: string, rating: number, userId: string) {
    const schoolId = this.getSchoolId();
    await this.interactionRepo.update(
      { school_id: schoolId, id: interactionId, user_id: userId },
      { helpfulness_rating: rating, updated_by: userId }
    );
    return { success: true };
  }

  async getHistory(userId: string, persona?: AssistantPersona, limit = 20) {
    const schoolId = this.getSchoolId();
    const qb = this.interactionRepo
      .createQueryBuilder('i')
      .where('i.school_id = :schoolId', { schoolId })
      .andWhere('i.user_id = :userId', { userId })
      .andWhere('i.deleted_at IS NULL')
      .orderBy('i.created_at', 'DESC')
      .take(limit);

    if (persona) qb.andWhere('i.persona = :persona', { persona });

    return qb.getMany();
  }
}
