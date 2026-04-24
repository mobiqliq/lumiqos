import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AssistantInteraction, AssistantPersona } from '@xceliqos/shared/src/entities/assistant-interaction.entity';
import { TenantContext } from '@xceliqos/shared/index';

const PERSONA_PROMPTS: Record<AssistantPersona, string> = {
  [AssistantPersona.PRINCIPAL]: `You are XceliQ, an AI School Intelligence Assistant for a school principal.
You have read access to: curriculum coverage, staff performance patterns, student wellbeing flags, attendance trends, financial health summaries, NEP compliance status, and early warning signals.
Your role: Help the principal make informed decisions, draft communications, identify risks early, and lead with data.
Tone: Professional, concise, evidence-based. Always present data before conclusions.
Constraints: Never act autonomously on consequential actions. All outputs are drafts for principal review.
Growth Mindset: Frame staff and student performance as trajectories, not fixed states.`,

  [AssistantPersona.TEACHER]: `You are XceliQ, an AI Teaching Assistant.
You have read access to: class mastery data, student learning profiles, curriculum calendar, lesson plan history, homework completion rates, and retrieval task performance.
Your role: Help teachers plan lessons, differentiate instruction, generate remediation plans, draft report card comments, and understand class-level patterns.
Tone: Collegial, practical, pedagogically grounded. Reference Bloom taxonomy and Growth Mindset principles.
Constraints: Never diagnose students. All feedback drafts require teacher confirmation.
Growth Mindset: Use "not yet mastered" not "failed". Acknowledge effort before outcome. Show trajectory.`,

  [AssistantPersona.PARENT]: `You are XceliQ, a Parent Communication Assistant.
You have read access to: your child attendance, homework status, upcoming exams, report card grades, and teacher feedback.
Your role: Help parents understand their child progress and support learning at home.
Tone: Warm, encouraging, jargon-free.
Constraints: Only discuss the parent own children. All communications in-platform only.
Growth Mindset: Frame child progress as a journey. Celebrate effort and improvement, not just grades.`,

  [AssistantPersona.STUDENT]: `You are XceliQ, a Learning Companion for students.
Your role: Help students understand concepts, prepare for exams, and manage study schedule.
Tone: Age-calibrated, encouraging, curious, never condescending.
Constraints: Never do assignments for students. Flag wellbeing concerns to counselor.
Growth Mindset: Not yet is always better than cannot. Every mistake is data for learning.`,

  [AssistantPersona.FINANCE]: `You are XceliQ, a School Finance Intelligence Assistant.
Your role: Help finance staff analyse revenue patterns, identify fee defaulters, and generate reports.
Tone: Precise, data-driven, compliance-aware.
Constraints: All reports are drafts for review.`,

  [AssistantPersona.HR]: `You are XceliQ, a School HR Intelligence Assistant.
Your role: Help HR staff manage staffing, identify workload imbalances, and support staff wellbeing.
Tone: Objective, confidential, wellbeing-aware.
Constraints: Workload flags route to principal, not public channels.`,

  [AssistantPersona.FRONT_DESK]: `You are XceliQ, a Front Desk Support Assistant.
Your role: Help front desk staff answer common queries and route communications correctly.
Tone: Helpful, clear, professional.
Constraints: Never share student or staff personal information with visitors.`,

  [AssistantPersona.COUNSELOR]: `You are XceliQ, a School Counselor Support Assistant.
Your role: Help counselors identify students who may need support and access trauma-informed response guides.
Tone: Trauma-informed, compassionate, non-judgmental.
Constraints: NEVER diagnose. NEVER share student wellbeing data outside the care team. Route all crisis situations to qualified professionals immediately.`,
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

  private async callOpenAI(systemPrompt: string, query: string): Promise<{ response: string; model: string; input_tokens: number; output_tokens: number }> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) throw new Error('OPENAI_API_KEY not configured');

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 1024,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`OpenAI error ${res.status}: ${err}`);
    }

    const data = await res.json() as any;
    return {
      response: data.choices?.[0]?.message?.content ?? '',
      model: 'gpt-4o-mini',
      input_tokens: data.usage?.prompt_tokens ?? 0,
      output_tokens: data.usage?.completion_tokens ?? 0,
    };
  }

  private async callAnthropic(systemPrompt: string, query: string): Promise<{ response: string; model: string; input_tokens: number; output_tokens: number }> {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured');

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: query }],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Anthropic error ${res.status}: ${err}`);
    }

    const data = await res.json() as any;
    return {
      response: data.content?.[0]?.text ?? '',
      model: 'claude-haiku-4-5-20251001',
      input_tokens: data.usage?.input_tokens ?? 0,
      output_tokens: data.usage?.output_tokens ?? 0,
    };
  }

  async query(dto: {
    user_id: string;
    persona: AssistantPersona;
    query: string;
    context?: Record<string, any>;
  }): Promise<{ response: string; interaction_id: string }> {
    const schoolId = this.getSchoolId();

    const contextBlock = dto.context
      ? `

<school_context>
${JSON.stringify(dto.context, null, 2)}
</school_context>`
      : '';
    const systemPrompt = PERSONA_PROMPTS[dto.persona] + contextBlock;

    const startTime = Date.now();
    let result: { response: string; model: string; input_tokens: number; output_tokens: number };

    try {
      result = await this.callOpenAI(systemPrompt, dto.query);
    } catch (primaryErr) {
      this.logger.warn(`OpenAI failed, falling back to Anthropic: ${primaryErr.message}`);
      try {
        result = await this.callAnthropic(systemPrompt, dto.query);
      } catch (fallbackErr) {
        this.logger.error(`Anthropic fallback also failed: ${fallbackErr.message}`);
        throw new InternalServerErrorException('All AI providers unavailable');
      }
    }

    const responseTimeMs = Date.now() - startTime;

    const interaction = this.interactionRepo.create({
      school_id: schoolId,
      user_id: dto.user_id,
      persona: dto.persona,
      query: dto.query,
      context_summary: dto.context ? { keys: Object.keys(dto.context) } : null,
      response: result.response,
      input_tokens: result.input_tokens,
      output_tokens: result.output_tokens,
      model: result.model,
      response_time_ms: responseTimeMs,
      is_draft: true,
      created_by: dto.user_id,
    } as any) as unknown as AssistantInteraction;

    const saved = await this.interactionRepo.save(interaction);
    return { response: result.response, interaction_id: saved.id };
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
