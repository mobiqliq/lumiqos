# Session Mind Map — 2026-04-24 Phase 31 Sprint 4 COMPLETE

## HEAD: 14b0a0d
## Session date: 2026-04-24

## Commits This Session
- 4841933 feat(31.4): XceliQChat
- f969f99 docs: ARCHITECTURE_MEMORY 31.4
- 2ea9d82 feat(31.5): Parent-School Comms + guardian enrichment
- feat(31.6): Homework Transparency Triangle
- 3666973 docs: Sprint 2 COMPLETE
- 5566926 feat(31.7): Exam Engine + Board Syllabus + Curriculum Map
- feat(31.8): Curriculum Calendar v2.0
- feat(31.9): XceliQRevise Spaced Repetition
- 7aa62d4 docs: Sprint 3 COMPLETE
- a4a4041 feat(31.10): XceliQ Assistant v1.0
- f51614e fix(31.10): OpenAI primary + Anthropic fallback
- feat(31.11): Predictive Analytics v1.0
- feat(31.12): PTCM Intelligence
- 14b0a0d docs: ARCHITECTURE_MEMORY full update Sprint 2-4

## Sprint Status
- Sprint 1 (31.0-31.3): COMPLETE
- Sprint 2 (31.4-31.6): COMPLETE
- Sprint 3 (31.7-31.9): COMPLETE
- Sprint 4 (31.10-31.12): COMPLETE
- Sprint 5 (31.13-31.15): PENDING

## Critical Session Learnings
- User PK in DB is `id` (uuid), not `user_id` (legacy varchar, null in seeded data)
- ai-service is TCP microservice ONLY — no HTTP — do not add HTTP routes
- OPENAI_API_KEY + ANTHROPIC_API_KEY both in school-service .env
- OpenAI = primary, Anthropic = fallback for all LLM calls
- School.board field already existed — used as board_affiliation
- Gateway loses connection to school-service after restart — restart gateway too
- TypeORM create() with as any cast required for complex objects
- apostrophes in string literals break TS parser — use double quotes

## All Modules (school-service) — 25 total
SchoolModule, AcademicPlanningModule, IntelligenceGraphModule,
DashboardModule, FinanceModule, ParentModule, HrModule,
SubstitutionModule, TimetableModule, ReportCardsModule,
ExamsModule, HomeworkModule, CommunicationModule,
SeederModule, AdminModule, SchoolConfigModule,
StudentIdentityModule, XceliQScoreModule, SchoolTierModule,
XceliQChatModule, ParentCommsModule, HomeworkTransparencyModule,
ExamEngineModule, CurriculumCalendarModule, XceliQReviseModule,
XceliQAssistantModule, PredictiveAnalyticsModule, PTCMModule

## All New Entities Sprint 2-4 (16 total)
ChatChannel, ChatMessage, ChatMember,
ParentMessageThread, ParentMessage, BroadcastAnnouncement, BroadcastReadReceipt,
HomeworkFeedback,
QuestionBank, ExamQuestion, ExamAnswerSheet, StudentAnswerSheet, ItemAnalysis,
BoardSyllabus, SchoolCurriculumMap,
CurriculumCalendar, CurriculumCalendarEntry,
RetrievalTask, ForgettingCurve,
AssistantInteraction, PredictiveAlert,
PTCMeeting, PTCMeetingCommitment

## Next Session — Sprint 5 (31.13-31.15)
- 31.13: Teacher Wellbeing & Rotation System (WorkloadIndex, WorkloadRule entities)
- 31.14: Student Wellbeing Radar (multi-signal flagging, trauma-informed routing)
- 31.15: NEP Compliance Engine (47 indicators, 8 domains, PDF/Excel/JSON export)

## Seeded Test Data
- School: 11111111-1111-1111-1111-111111111111
- AY: 22222222-2222-2222-2222-222222222222
- Class 10: 33333333-3333-3333-3333-333333333333
- Subject Math: 44444444-4444-4444-4444-444444444444
- Student: 55555555-5555-5555-5555-555555555555
- Enrollment: eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee (admission TEST-001)
- All staff: teacher1-4, principal, admin, finance, hr, parent, student @testschool.edu / password
