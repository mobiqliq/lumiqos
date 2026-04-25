# XceliQOS — Architecture Memory

> Mandatory context loader. Read BEFORE any code changes.
> Last Updated: 2026-04-25 — Phase 33.1 COMPLETE
> Branch: main | HEAD: cfe602a

---

## Product Identity

- **Name**: XceliQOS  
- **Stack**: NestJS + React/Vite + PostgreSQL + TypeORM + Docker Compose
- **Rebrand**: LumiqOS → XceliQOS (2026-04-23)

---

## Service Registry (verified 2026-04-24)

| Service        | External Port | Internal Port | Location                |
|----------------|--------------|---------------|-------------------------|
| API Gateway    | 3000         | 3000          | backend/api-gateway/    |
| School Service | 3001         | 3000          | backend/school-service/ |
| Auth Service   | 3002         | 3002          | backend/auth-service/   |
| AI Service     | 3005 (TCP)   | 3005          | backend/ai-service/     |
| PostgreSQL     | 5432         | 5432          | Docker volume           |
| Frontend Docker| 5173→5175    | 5173          | frontend/school-portal/ |

---

## Critical Gotchas

- User PK is `id` (uuid) NOT `user_id`
- ai-service TCP ONLY — never add HTTP routes
- Gateway/auth connection drop — RESOLVED: AUTH_SERVICE_PORT was 3003 (wrong), fixed to 3002. AppController missing from school-service. Healthchecks + depends_on added to docker-compose.
- TypeORM create() needs `as any` cast for complex partial objects
- Apostrophes in single-quoted TS strings break compiler — use double quotes
- OpenAI = primary (gpt-4o-mini), Anthropic = fallback (claude-haiku-4-5-20251001)
- heredoc fails silently in Codespaces — ALWAYS use python3 << PYEOF
- TenantContext.getStore() returns null — all callers must null-check
- Internal gateway→service calls must NOT require JWT

---

## Build Protocol

1. shared/ changed → compile inside Docker only
2. docker rmi <service>
3. docker compose build <service> api-gateway
4. docker compose up -d <service> api-gateway
5. docker logs xceliqos-<service>-1 --tail 5
6. curl test before proceeding

---

## Database

- PostgreSQL 15 | DB: xceliq | User: postgres | Pass: postgres
- Host: xceliqos_db (Docker) / localhost:5432 (host)
- Tenant isolation: school_id on every query
- TypeORM synchronize:false — migration system live (33.1 complete)

### Seeded Test UUIDs
| Entity        | UUID                                   |
|---------------|----------------------------------------|
| Test School   | 11111111-1111-1111-1111-111111111111   |
| Academic Year | 22222222-2222-2222-2222-222222222222   |
| Class 10      | 33333333-3333-3333-3333-333333333333   |
| Subject Math  | 44444444-4444-4444-4444-444444444444   |
| Exam          | 77777777-7777-7777-7777-777777777777   |
| Test Student  | 55555555-5555-5555-5555-555555555555   |
| Enrollment    | eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee (TEST-001) |

### Seeded Staff (password="password")
principal@testschool.edu, teacher1-4@testschool.edu, admin@testschool.edu,
finance@testschool.edu, hr@testschool.edu, parent@testschool.edu, student@testschool.edu

### Auth
- POST /api/auth/login → { access_token, refresh_token, user{} }
- JWT secret: dev_jwt_secret_change_in_production
- JWT payload: { user_id, school_id, role, permissions[] }
- 20 permissions seeded, 7 roles mapped

---

## API Gateway — Controllers (44 total, verified 2026-04-25)

AppController, HealthController, TeacherController,
IntelligenceGraphController, DashboardController,
FinanceController, ParentController, HrController,
SubstitutionController, TimetableController,
ReportCardsController, ExamsController, HomeworkController,
CommunicationController, AuthController, AdminController,
SchoolConfigController, StudentIdentityController,
XceliQScoreController, SchoolTierController,
XceliQChatController, ParentCommsController,
HomeworkTransparencyController, ExamEngineController,
CurriculumCalendarController, XceliQReviseController,
XceliQAssistantController, PredictiveAnalyticsController,
PTCMController, TeacherWellbeingController,
StudentWellbeingController, ComplianceController,
FinanceV2Controller, AdmissionsController, OperationsController, LearningDNAController,
SELIntelligenceController, PortfolioController,
SchoolGroupController, AlumniController, BoardReportingController, PLCController, XceliQReflectController,
GrowthMindsetController

---

## School Service — Modules (44 total)

SchoolModule, AcademicPlanningModule, IntelligenceGraphModule,
DashboardModule, FinanceModule, ParentModule, HrModule,
SubstitutionModule, TimetableModule, ReportCardsModule,
ExamsModule, HomeworkModule, CommunicationModule,
SeederModule, AdminModule, SchoolConfigModule,
StudentIdentityModule, XceliQScoreModule, SchoolTierModule,
XceliQChatModule, ParentCommsModule, HomeworkTransparencyModule,
ExamEngineModule, CurriculumCalendarModule, XceliQReviseModule,
XceliQAssistantModule, PredictiveAnalyticsModule, PTCMModule,
TeacherWellbeingModule, StudentWellbeingModule, ComplianceModule,
FinanceV2Module, AdmissionsModule, OperationsModule, LearningDNAModule, SELIntelligenceModule, PortfolioModule,
SchoolGroupModule, AlumniModule, BoardReportingModule, PLCModule, XceliQReflectModule,
GrowthMindsetModule

---

## Entity Registry — backend/shared/src/entities/

All entities extend XceliQosBaseEntity (id, school_id, metadata, timestamps, soft-delete).
Export every new entity from backend/shared/src/entities/index.ts.

Sprint 1: SchoolCalendarConfig, TimetablePeriod, WeeklyTimetable, SubjectAllocation,
          StudentIdentity, StudentPassport, XceliQScore, XceliQScoreDimension,
          SchoolTierConfig, RoleBundle

Sprint 2: ChatChannel, ChatMessage, ChatMember,
          ParentMessageThread, ParentMessage, BroadcastAnnouncement, BroadcastReadReceipt,
          HomeworkFeedback

Sprint 3: QuestionBank, ExamQuestion, ExamAnswerSheet, StudentAnswerSheet, ItemAnalysis,
          BoardSyllabus, SchoolCurriculumMap,
          CurriculumCalendar, CurriculumCalendarEntry,
          RetrievalTask, ForgettingCurve

Sprint 4: AssistantInteraction, PredictiveAlert, PTCMeeting, PTCMeetingCommitment

Sprint 5: WorkloadIndex, WorkloadRule, WellbeingFlag, ComplianceIndicator, ComplianceRecord

Sprint 6: FinanceLedger, FinanceEntry, TaxInvoice, TaxWithholding, FeeStructureVersion,
          AdmissionApplication, AdmissionDocument, WaitlistEntry, ReservationConfig,
          LibraryRecord, TransportRoute, TransportAssignment, VisitorLog, OperationsConfig

Sprint 7: LearningDNAProfile, LearningDNAObservation, ChronobioConfig, CognitiveLoadRule,
          SELObservation, EQProfile, FlowStateLog, SELFrameworkConfig,
          Portfolio, PortfolioItem, PortfolioConfig,
          SchoolGroup, SchoolGroupMember, SchoolGroupConfig,
          AlumniRecord, AlumniConfig

Sprint 8: BoardReport,
          PLCGroup, PLCSession, PLCResource,
          ReflectionEntry, MetacognitiveScore,
          MindsetMoment, ParentMindsetProgress

---

## Phase 31 Sprint Status

| Sprint | Items       | Status      |
|--------|-------------|-------------|
| 1      | 31.0–31.3   | COMPLETE    |
| 2      | 31.4–31.6   | COMPLETE    |
| 3      | 31.7–31.9   | COMPLETE    |
| 4      | 31.10–31.12 | COMPLETE    |
| 5      | 31.13–31.15 | COMPLETE    |
| 6      | 31.16–31.18 | COMPLETE    |
| 7      | 31.19–31.22 | COMPLETE    |
| 8      | 31.23–31.26 | COMPLETE    |

---

## Sprint 6 — Finance & Operations (START HERE)

### 31.16 Finance System v2.0
- Double-entry bookkeeping compatibility
- GST invoice generation (HSN codes)
- TDS tracking for staff salary payments
- Export: Tally Prime XML, Xero CSV, Zoho Books, QuickBooks IIF
- Fee structure versioning
- NEW ENTITIES: FinanceLedger, FinanceEntry, GSTInvoice, TDSRecord

### 31.17 Admissions System
- Pipeline: Inquiry → Application → Document Upload → Assessment → Offer → Payment → Onboarding
- Waitlist auto-promotion on offer decline
- RTE 25% reservation tracking
- NEW ENTITIES: AdmissionApplication, AdmissionDocument, WaitlistEntry

### 31.18 Resource & Operations Management
- Library: issuance, return, reading record → XceliQScore impact
- Transport: route mapping, parent location alerts (opt-in)
- Visitor & security: digital log, pre-registration
- NEW ENTITIES: LibraryRecord, TransportRoute, TransportAssignment, VisitorLog

---

## Sprint 7 — Advanced Intelligence (Pending)

31.19 Learning DNA v1.0 — Gardner 8 intelligences, cognitive load (Sweller), chronobio timetable
31.20 SEL Intelligence — CASEL 5, flow state detection | NEW: SELObservation, EQProfile
31.21 Student Portfolio — teacher-curated + student self-curation (Class 6+) | NEW: Portfolio, PortfolioItem
31.22 XceliQAlumni — opt-in 18+, DPDP Act 2023 compliant | NEW: AlumniRecord

---

## Sprint 8 — Governance, Community & Mindset (Pending)

31.23 Board Reporting Portal — read-only, automated reports | NEW: BoardReport
31.24 Professional Learning Community — lesson plan sharing, cross-school network
31.25 XceliQReflect — weekly metacognition prompts Class 3+ | NEW: ReflectionEntry, MetacognitiveScore
31.26 Growth Mindset Integration Layer — cross-cutting, all feedback surfaces | NEW: MindsetMoment, ParentMindsetProgress

---

## AI Architecture

- Primary: OpenAI gpt-4o-mini (school-service .env)
- Fallback: Anthropic claude-haiku-4-5-20251001 (school-service .env)
- ai-service: TCP microservice only — NOT used for LLM calls
- All LLM calls via native fetch (Node 20) from school-service directly
- All outputs marked is_draft=true — no autonomous actions
- Growth Mindset language mandatory in all AI feedback

---

## Frontend

### Design Tokens
- Token file: frontend/shared/src/design/tokens.css
- Surfaces: operator (dark #0D0F14) | school (light #F8F9FC)
- Accent: #5B6CFF | Positive: #10B981 | Warning: #F59E0B | Danger: #EF4444

### Admin Dashboard — dev :5173, data-surface=operator, 9 pages wired
### School Portal — dev :5175, Docker :5173, data-surface=school, 7 roles

---

## Non-Negotiable Design Principles

1. Growth Mindset language — never deficit-first
2. SDT filter — autonomy, competence, relatedness on every feature
3. Tier 1/2/3 adaptive — no feature assumes full staffing
4. Offline-first for core workflows
5. Prediction without prescription — AI output always human-approved
6. No personal numbers shared — all comms in-platform, auditable
7. Student data sovereignty — full export always available
8. Trauma-informed defaults — wellbeing flags → care, not discipline
9. Teacher protection first — workload rules enforced before assignments
10. Evidence-based — every pedagogical choice traceable to research
11. GLOBAL-FIRST — IANA timezone, configurable working days, no hardcoded India assumptions

---

## Technical Debt

| Issue                             | Severity | Notes                              |
|-----------------------------------|----------|------------------------------------|
| synchronize:true TypeORM          | RESOLVED | 33.1 — migrations system live      |
| AI keys baked into Docker image   | High     | Secrets manager in prod            |
| No API versioning /api/v1/        | Medium   | Deferred                           |
| Communication endpoints need JWT  | Medium   | createThread/sendMessage user ctx  |
| WS layer XceliQChat               | Medium   | REST done, WS deferred             |
| OCR for StudentAnswerSheet        | Medium   | Needs image upload infra           |
| PDF answer sheet generation       | Medium   | Needs puppeteer/pdfkit             |
| Teacher burnout model incomplete  | Low      | No attendance in WorkloadIndex yet |
| PDF/Excel compliance export       | Low      | Frontend layer needed              |
| Two duplicate Test School rows    | Low      | Harmless in dev                    |

---

## Protocol Enforcement Reminders

These are recurring violation patterns. Check before every action:

1. NEVER issue a restart/rebuild to unblock a test failure without first reading logs and identifying root cause.
2. NEVER assume field names, module paths, or file locations — grep/cat the actual file first.
3. NEVER workaround a bug — if root cause is unclear, STOP and state what data is needed.
4. Data is truth. Logs, file contents, grep output = truth. Memory, assumption, "likely" = violation.
5. If a known issue in this file is marked UNDIAGNOSED — diagnose it before working around it.

---

## Session Log (append after every successful commit)

| Commit | Date | Items Completed | Key Decisions | Open Issues |
|--------|------|-----------------|---------------|-------------|
| f7c1de8 | 2026-04-24 | ARCHITECTURE_MEMORY.md created | Correct path: backend/shared/src/entities/ | Gateway/auth drop undiagnosed |
| 9d19649 | 2026-04-24 | Fixed shared entities path in memory | Path was wrong in initial write | — |
| (Sprint 6 start) | 2026-04-25 | JwtStrategy missing from FinanceV2Module — added as provider | PassportModule not in school-service deps — use JwtStrategy directly | — |
| (31.16) | 2026-04-25 | Finance System v2.0 complete | FinanceLedger, FinanceEntry, TaxInvoice, TaxWithholding, FeeStructureVersion | Gateway/auth drop still undiagnosed |
| (31.17 in progress) | 2026-04-25 | Admissions System built, routes mapped | AdmissionApplication, AdmissionDocument, WaitlistEntry, ReservationConfig | Auth drop triggered — diagnosing root cause before proceeding |
| fix: infra | 2026-04-25 | ROOT CAUSE FIXED — gateway/auth drop | AUTH_SERVICE_PORT was 3003 in both envs, should be 3002. AppController missing from school-service. docker-compose healthchecks + depends_on added. All services now start healthy. | None — issue closed |
| 31.17 complete | 2026-04-25 | Admissions System v1.0 | Global-first pipeline, quota framework-agnostic, waitlist auto-promote | Pending: 31.17 endpoint tests, then 31.18 |
| 31.18 complete | 2026-04-25 | Resource & Operations v1.0 | LibraryRecord, TransportRoute, TransportAssignment, VisitorLog, OperationsConfig — all 200 | Sprint 7 ready |
| 31.19 complete | 2026-04-25 | Learning DNA v1.0 | Gardner 8 + Sweller CLT + Chronobio — weighted aggregation, narrative gate, all 200 | 31.20 next |
| 31.20 complete | 2026-04-25 | SEL Intelligence Layer | CASEL 5 + flow state + EQProfile → XceliQScore feed, framework-agnostic config, all 200 | 31.21 next |
| 31.21 complete | 2026-04-25 | Student Portfolio | Portfolio+PortfolioItem+PortfolioConfig, self-curation, approval workflow, visibility ceiling, share consent, all 200 | 31.22 next |
| fix: secrets | 2026-04-25 | .env files untracked, git history rewritten, force pushed | git rm --cached + filter-repo scrubbed all 120 commits. .env.docker added to .gitignore. Keys rotated. | Never use heredoc for file creation |
| 31.22a complete | 2026-04-25 | SchoolGroup — houses, sports teams, co-curricular, committees, projects | SchoolGroup+SchoolGroupMember+SchoolGroupConfig. Self-referential sub-groups (max depth 2). Student moderators. Points system. ChatChannelType+BroadcastAudienceType extended with ALUMNI+GROUP. group_id FK added to ChatChannel. Alumni affiliation hook ready for 31.22. All endpoints 200. | 31.22 AlumniModule next |
| 31.22 complete | 2026-04-25 | XceliQAlumni — full lifecycle | AlumniRecord+AlumniConfig. Invite code: 32-byte crypto random, bcryptjs hash, single-use, 90-day expiry. Consent paths: underage (parent) + of-age (direct). house_group_id FK to SchoolGroup. Career pathway separately consented. ConsentJurisdiction renamed AlumniConsentJurisdiction to avoid collision. bcrypt→bcryptjs. All endpoints 200. Sprint 7 COMPLETE. | Sprint 8 next: 31.23 Board Reporting |
| 31.23 complete | 2026-04-25 | Board Reporting Portal | BoardReport entity + BoardReportingModule. Enums: BoardReportType, BoardReportStatus, BoardReportVisibility. 7 endpoints all 200. Fix: JwtStrategy now maps payload.user_id → req.user.user_id (was undefined, caused empty created_by across all modules). Systemic fix, zero breaking changes. | 31.24 next: PLCModule |
| 31.24 complete | 2026-04-25 | Professional Learning Community | PLCGroup+PLCSession+PLCResource. Full CRUD 15 endpoints all 200. Group→Session→Resource FK chain validated. PLCResourceType enum. All created_by/shared_by populated. | 31.25 next: XceliQReflect |
| 31.25 complete | 2026-04-25 | XceliQReflect | ReflectionEntry+MetacognitiveScore. ReflectionType+ReflectionVisibility+MetacognitiveDimension enums. word_count auto-computed. ai-feedback endpoint (Growth Mindset language). score 0-100 validation. evidence_ref FK. All 7 endpoints 200. | 31.26 next: GrowthMindsetModule |
| 31.26 complete | 2026-04-25 | Growth Mindset Integration | MindsetMoment+ParentMindsetProgress. MindsetMomentType enum. share-with-parent auto-refreshes moments_count. Growth Mindset ai_narrative on ParentMindsetProgress. All 6 endpoints 200. PHASE 31 COMPLETE. | Phase 32 pending |
| cfe602a | 2026-04-25 | 33.1 TypeORM Migration System | synchronize:false both services. school-service: BaselineSchema migration (4 delta ops). auth-service: explicit 15-entity boundary in data-source.ts — never grows automatically with school-service entities. migrations table stamped. migrationsRun:true on startup. All services healthy. | 33.2 next: Secrets Manager |
