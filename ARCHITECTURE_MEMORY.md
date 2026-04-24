# XceliQOS — Architecture Memory

> This file is the AI's mandatory context loader. Read this BEFORE making any code changes.
> Last Updated: 2026-04-24 — Phase 31 Sprint 3 COMPLETE (31.7–31.9)
> Branch: main | HEAD: 2ea9d82

---

## Product Identity

- **Name**: XceliQOS
- **Tagline**: AI-First School Intelligence OS
- **Type**: Multi-Tenant SaaS Platform for K-12 Education
- **Stack**: NestJS + React/Vite + PostgreSQL + TypeORM + Docker Compose
- **Rebrand**: Renamed from LumiqOS → XceliQOS (2026-04-23) — 260 files + Dockerfiles updated

---

## Service Registry (CURRENT — verified running)

| Service        | External Port | Internal Port | Location                    |
|----------------|--------------|---------------|-----------------------------|
| API Gateway    | 3000         | 3000          | backend/api-gateway/        |
| School Service | 3001         | 3000          | backend/school-service/     |
| Auth Service   | 3002         | 3002          | backend/auth-service/       |
| AI Service     | 3005 (TCP)   | 3005          | backend/ai-service/         |
| PostgreSQL     | 5432         | 5432          | Docker volume               |
| Frontend Docker| 5173         | 5173          | frontend/school-portal/     |
| Admin Dev      | 5173 (dev)   | —             | frontend/admin-dashboard/   |
| Portal Dev     | 5175 (dev)   | —             | frontend/school-portal/     |

NOTE: User Service and Billing Service from original spec do NOT exist yet.

---

## Database

- **Engine**: PostgreSQL 15
- **Database**: xceliq | **User**: postgres | **Pass**: postgres
- **Host**: xceliqos_db (Docker) / localhost:5432 (host)
- **Strategy**: Shared schema, tenant isolation via school_id on every query
- **ORM**: TypeORM — synchronize:true (dev) — MUST replace with migrations before prod

### Seeded Test Data
| Entity        | ID                                   | Notes                        |
|---------------|--------------------------------------|------------------------------|
| Test School   | 11111111-1111-1111-1111-111111111111 | Primary test tenant          |
| Academic Year | 22222222-2222-2222-2222-222222222222 |                              |
| Class 10      | 33333333-3333-3333-3333-333333333333 |                              |
| Subject Math  | 44444444-4444-4444-4444-444444444444 |                              |
| Exam          | 77777777-7777-7777-7777-777777777777 |                              |

### Seeded Staff (all password="password")
| Email                        | Role          |
|------------------------------|---------------|
| principal@testschool.edu     | Principal     |
| teacher1-4@testschool.edu    | teacher       |
| admin@testschool.edu         | administrator |
| finance@testschool.edu       | finance       |
| hr@testschool.edu            | hr            |
| parent@testschool.edu        | parent        |
| student@testschool.edu       | student       |
Note: All password_hash values verified correct (bcrypt of 'password'). Seeder auto-repairs empty hashes on boot.

### SaaS Plans: Starter, Growth, Enterprise (1 subscription per school, all active)
### Known DB issue: 2 duplicate "Test School" rows, no school_code — harmless in dev

---

## API Gateway

- Global prefix: /api/
- Single entry point for all client traffic
- Internal calls (gateway → school-service) do NOT require JWT
- Auth guards (@UseGuards) on user-facing endpoints only
- Vite dev proxy: /api → http://localhost:3000 (NO rewrite — rewrite was removed in phase 29)

### Registered Controllers (app.module.ts)
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
PTCMController

---

## School Service

### Registered Modules (app.module.ts)
SchoolModule, AcademicPlanningModule, IntelligenceGraphModule,
DashboardModule, FinanceModule, ParentModule, HrModule,
SubstitutionModule, TimetableModule, ReportCardsModule,
ExamsModule, HomeworkModule, CommunicationModule,
SeederModule, AdminModule, SchoolConfigModule,
StudentIdentityModule, XceliQScoreModule, SchoolTierModule,
XceliQChatModule, ParentCommsModule, HomeworkTransparencyModule,
ExamEngineModule, CurriculumCalendarModule, XceliQReviseModule,
XceliQAssistantModule, PredictiveAnalyticsModule, PTCMModule

---

## Auth Service

- Port: 3002
- POST /auth/login → { access_token, refresh_token, user{} }
- POST /auth/register
- JWT secret: dev_jwt_secret_change_in_production
- JWT payload: { user_id, school_id, role, permissions[] }
- permissions[] POPULATED — 20 permissions seeded, 7 roles mapped

---

## Verified Live Endpoints (phase 29)

### Platform Admin (no auth, no x-school-id)
| Method | Path                              | Returns                              |
|--------|-----------------------------------|--------------------------------------|
| GET    | /api/admin/overview               | KPIs + plan_breakdown + recent_activity |
| GET    | /api/admin/schools                | schools + subscriptions              |
| GET    | /api/admin/analytics/usage        | active users + engagement per school |
| GET    | /api/admin/analytics/engagement   | teacher login rates                  |
| GET    | /api/admin/finance/overview       | subscription revenue summary         |
| GET    | /api/admin/system/health          | service status + db_stats            |

### School Portal (requires x-school-id header)
| Method | Path                                        | Returns              |
|--------|---------------------------------------------|----------------------|
| GET    | /api/dashboard/overview                     | school KPIs          |
| GET    | /api/finance/overview                       | finance summary      |
| GET    | /api/hr/overview                            | staff + assignments  |
| GET    | /api/parent/summary/:id                     | student summary      |
| GET    | /api/intelligence-graph/class/:id/heatmap   | mastery heatmap      |
| GET    | /api/intelligence-graph/student/:id/radar   | radar data           |
| GET    | /api/substitution/absences                  | absences list        |
| GET    | /api/exams                                  | exam list            |
| GET    | /api/homework/class                         | homework list        |
| GET    | /api/report-cards/class                     | report cards         |

---

## Frontend Architecture

### Design System — "Adaptive Depth"
- Token file: frontend/shared/src/design/tokens.css (single source of truth)
- Inlined into each app's index.css (Vite relative @import path broken — inline instead)
- Two surfaces via data-surface attribute on <html>:
  - operator: dark #0D0F14 base, #141720 surface
  - school: light #F8F9FC base, #FFFFFF surface
- Single accent: #5B6CFF across both surfaces
- Semantic: --positive #10B981 | --warning #F59E0B | --danger #EF4444
- Fonts: --font-sans Inter variable | --font-mono JetBrains Mono
- Spacing: 8px base grid (--sp-1 through --sp-16)
- Layout: --sidebar-icon 72px | --sidebar-full 240px | --topbar-h 56px

### Admin Dashboard (frontend/admin-dashboard/)
- Dev port: 5173 | data-surface="operator" (dark)
- Shell: DashboardShell.jsx — icon sidebar 72px, hover→240px, backdrop topbar
- All 9 pages routed and built:
  / → Dashboard (live: /api/admin/overview)
  /schools → Schools (live: /api/admin/schools)
  /analytics/usage → UsageMetrics (live)
  /analytics/engagement → Engagement (live)
  /finance/subscriptions → Subscriptions (live)
  /finance/revenue → Revenue (live)
  /system/health → SystemHealth (live)
  /system/audit → AuditLogs (static mock)
  /system/settings → Settings (static mock)
- Shared components: KPICard, DataTable, StatusBadge, AIInsightStrip, PageHeader
- Auth: xceliq_token in localStorage

### School Portal (frontend/school-portal/)
- Dev port: 5175 | Docker port: 5173 | data-surface="school" (light)
- Shell: DashboardShell.jsx — same sidebar pattern, light surface, role-aware nav
- 7 roles: principal, teacher, administrator, finance, hr, parent, student
- DASHBOARD_BY_ROLE maps both 'admin' and 'administrator' keys → AdminDashboard
- Login page: ✅ renders correctly, real JWT auth, all 7 personas login
- Role dashboards: ✅ all 7 redesigned, new tokens, wired via api/client.js
- Shared components: KPICard, PageHeader, DataTable, StatusBadge, AIInsightStrip
- Docker image: needs rebuild to pick up phase 30 changes
- PWA: devOptions.enabled=false (Codespace SW CORS issue)
- Auth: school_token + school_role + school_user + school_id in localStorage

---

## Key Architectural Rules (DO NOT VIOLATE)

1. All queries MUST scope by school_id — no cross-tenant leakage
2. Internal gateway→service calls must NOT require JWT
3. TenantContext.getStore() returns null — all callers must null-check
4. RbacGuard uses @Optional() Reflector
5. Soft deletes only — never hard-delete students
6. One active enrollment per student per academic year
7. One primary guardian per student (is_primary_guardian=true)
8. admission_number unique per school_id
9. AI Service is stateless — no persistent state
10. Seeder is idempotent — safe to run on every startup
11. No hardcoded UUIDs in production code paths (seeder.service.ts only)

---

## Build Protocol

If shared/ changed:
  1. Rebuild shared first
  2. Rebuild ALL dependent services
  3. Verify all containers on network
  4. Test affected endpoints with curl

Command: docker compose build <service> && docker compose up -d <service>

---

## Phase 31 — Sprint 1 In Progress

### Sprint 1 STATUS: COMPLETE
- 31.0 School Calendar & Timetable Config ✅
- 31.1 Student Persistent Identity Layer ✅
- 31.2 XceliQScore v1.0 ✅
- 31.3 Adaptive Role Architecture ✅

### Current Focus: Sprint 2 — Communication & Collaboration (31.4–31.6)
- Prerequisite for: all curriculum/workload/compliance calculations
- New entities required: SchoolCalendarConfig, TimetablePeriod, WeeklyTimetable, SubjectAllocation
- New module: SchoolConfigModule (school-config-service long term, school-service for now)

### New Endpoints (31.0)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/school-config/calendar?academic_year_id= | Get calendar config |
| POST | /api/school-config/calendar | Upsert calendar config |
| GET | /api/school-config/periods?academic_year_id= | Get timetable periods |
| POST | /api/school-config/periods | Upsert timetable periods |
| GET | /api/school-config/timetable?academic_year_id=&class_id= | Get weekly timetable |
| POST | /api/school-config/timetable | Upsert weekly timetable entries |
| GET | /api/school-config/allocations?academic_year_id=&class_id= | Get subject allocations |
| POST | /api/school-config/allocations | Upsert subject allocations |
| GET | /api/students/:id/passport | Get/create student passport (auto-creates identity) |
| POST | /api/students/:id/transfer | Initiate inter-school transfer (consent-gated, audit-logged) |



All require: x-school-id header

### New Entities (31.0)
- SchoolCalendarConfig — year-level config, exam windows, event days, holidays
- TimetablePeriod — typed period slots (period/break/recess/assembly/co_curricular)
- WeeklyTimetable — subject-period-class-teacher allocation per day
- SubjectAllocation — periods per week per subject per class, NEP compliance flag

| GET | /api/xceliq-score/config?academic_year_id= | Get/create dimension weight config |
| POST | /api/xceliq-score/config | Upsert dimension weights (must sum to 100) |
| GET | /api/xceliq-score/:student_id?academic_year_id= | Get current score + trajectory |
| POST | /api/xceliq-score/:student_id/calculate | Calculate score from dimension inputs |

| GET | /api/school-config/tier | Get/auto-create tier config (auto-detects from student count) |
| POST | /api/school-config/tier | Upsert tier config |
| GET | /api/school-config/tier/priority-queue | Get Tier 3 Smart Priority Queue |
| GET | /api/school-config/tier/bundles | Get all role bundles for school |
| POST | /api/school-config/tier/bundles | Upsert role bundle |

### New Entities (31.3)
- SchoolTierConfig — tier (1/2/3), auto-detection, solo mode, priority queue, active bundles
- RoleBundle — merged role sets (principal+admin, finance+hr, solo), per-tier, unified dashboard flag

### New Entities (31.2)
- XceliQScore — composite + 10 dimension scores, growth delta, Growth Mindset narrative
- XceliQScoreDimension — school-configurable weights (default: Academic Mastery 25%, etc.)

### New Entities (31.1)
- StudentIdentity — federated UUID above school_id, school_history, consent flags
- StudentPassport — cross-school mastery map, intervention record, XceliQScore history, SEL observations, transfer log

### Sprint 1 Items
| Item | Description | Status |
|------|-------------|--------|
| 31.0 | School Calendar & Timetable Config Engine | ✅ Complete |
| 31.1 | Student Persistent Identity Layer | ✅ Complete |
| 31.2 | XceliQScore v1.0 (10-dimension scoring) | ✅ Complete |
| 31.3 | Adaptive Role Architecture (Tier 1/2/3) | ✅ Complete |


---


## Phase 31 — Sprint 2 Status

| Item | Description | Status |
|------|-------------|--------|
| 31.4 | XceliQChat — Internal Staff Communication | ✅ Complete |
| 31.5 | Parent-School Communication Platform | ✅ Complete |
| 31.6 | Homework Transparency Triangle | ✅ Complete |

### New Entities (31.4)
- ChatChannel — channel with type enum: class/subject/department/whole_school/direct
- ChatMessage — message with sender, channel, parent threading, attachment, poll ref, ai flag
- ChatMember — user↔channel membership, role, status (active/muted/in_class), ack, last_read_at

### New Endpoints (31.4) — all require x-school-id + x-user-id
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/chat/channels | List channels for user |
| POST | /api/chat/channels | Create channel |
| GET | /api/chat/channels/:id/members | List members |
| POST | /api/chat/channels/:id/members | Add member |
| PATCH | /api/chat/channels/:id/members/:userId/status | Update member status |
| GET | /api/chat/channels/:id/messages | Get messages (paginated, cursor) |
| POST | /api/chat/channels/:id/messages | Send message |
| POST | /api/chat/channels/:id/polls | Create poll |
| POST | /api/chat/channels/:id/polls/:messageId/vote | Cast vote |
| POST | /api/chat/channels/:id/acknowledge | Acknowledge announcement |
| POST | /api/chat/channels/:id/read | Mark channel read |


### New Entities (31.5)
- ParentMessageThread — parent↔school thread, SLA tracking, escalation, resolve/open status
- ParentMessage — in-platform message, sender_type, sentiment flag, read tracking (staff+parent side)
- BroadcastAnnouncement — principal/admin broadcast, audience type, trigger type, read_count
- BroadcastReadReceipt — per-user read receipt for broadcasts

### New Endpoints (31.5) — all require x-school-id + x-user-id
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/parent-comms/threads | Create thread (parent initiates) |
| GET | /api/parent-comms/threads | List threads for user (role-aware) |
| GET | /api/parent-comms/threads/:id | Get thread + messages (enriched: parent/student/guardian names) |
| POST | /api/parent-comms/threads/:id/messages | Send message in thread |
| PATCH | /api/parent-comms/threads/:id/status | Resolve/escalate thread |
| POST | /api/parent-comms/broadcasts | Create broadcast |
| GET | /api/parent-comms/broadcasts | List broadcasts |
| POST | /api/parent-comms/broadcasts/:id/read | Mark broadcast read |
| GET | /api/parent-comms/broadcasts/:id/receipts | Read receipt list (admin) |

### New Entities (31.6)
- HomeworkFeedback — Growth Mindset triad (strength/improvement/encouragement), AI draft (jsonb), teacher_confirmed, is_late, parent_visible, parent_notified

### New Endpoints (31.6) — all require x-school-id
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/homework-transparency/student/:studentId | Student view: assignments + status + countdown |
| GET | /api/homework-transparency/parent/:studentId | Parent view: assignments + feedback (parent_visible only) |
| GET | /api/homework-transparency/teacher/queue | Teacher correction queue (submitted, no confirmed feedback) |
| POST | /api/homework-transparency/submissions/:id/feedback | Submit structured feedback |
| POST | /api/homework-transparency/submissions/:id/notify-parent | Trigger parent notification |
| GET | /api/homework-transparency/analytics/class?class_id= | Completion rates by subject/type |

### Test Data Note
- Student enrollment seeded directly: id=eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee, admission_number=TEST-001
- Links student 55555555 → class 33333333, school 11111111, year 22222222

### WS Deferral Note
Real-time WebSocket layer deferred to Sprint 3 infrastructure.
REST API + full data model complete. WS will consume same entities.


## Phase 31 — Sprint 3 Status

| Item | Description | Status |
|------|-------------|--------|
| 31.7 | Exam Creation Engine + Board Syllabus + Curriculum Map | ✅ Complete |
| 31.8 | Curriculum Calendar v2.0 | ✅ Complete |
| 31.9 | XceliQRevise (Spaced Repetition) | ✅ Complete |

### New Entities (31.7)
- QuestionBank — board_id+board_topic_id scoped, Bloom level, difficulty, NEP competency, all question types
- ExamQuestion — exam assembly junction, section label, allocated marks, answer sheet zone coords
- ExamAnswerSheet — PDF template config, QR payload, section structure, draft/published/archived
- StudentAnswerSheet — image upload, OCR extraction result, confidence map, teacher confirmation, result notification
- ItemAnalysis — discrimination index, difficulty index, option distribution, flagging
- BoardSyllabus — operator-managed canonical topics per board+grade+subject, versioned
- SchoolCurriculumMap — textbook+chapter→board_topic mapping, versioned, archived never deleted, one-click restore

### New Endpoints (31.7) — all require x-school-id
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/exam-engine/questions | Add question to bank |
| GET | /api/exam-engine/questions | List/filter questions |
| POST | /api/exam-engine/questions/bulk | Bulk import |
| GET | /api/exam-engine/questions/:id | Get question |
| PATCH | /api/exam-engine/questions/:id | Update question |
| POST | /api/exam-engine/exams/:id/assemble | AI assemble exam from params |
| GET | /api/exam-engine/exams/:id/questions | Get assembled questions |
| POST | /api/exam-engine/exams/:id/answer-sheet | Create answer sheet template |
| POST | /api/exam-engine/exams/:id/sheets/upload | Upload student answer sheet photo |
| GET | /api/exam-engine/exams/:id/sheets | List student sheets |
| POST | /api/exam-engine/sheets/:id/confirm | Teacher confirms marks |
| POST | /api/exam-engine/sheets/:id/notify-result | Notify student+parent |
| POST | /api/exam-engine/exams/:id/item-analysis | Run item analysis |
| GET | /api/exam-engine/exams/:id/item-analysis | Get item analysis |
| GET | /api/exam-engine/board-syllabus | Get board syllabus topics |
| POST | /api/exam-engine/curriculum-map | Create curriculum map |
| GET | /api/exam-engine/curriculum-map | Get active curriculum map |
| GET | /api/exam-engine/curriculum-map/history | Full version history |
| POST | /api/exam-engine/curriculum-map/:id/restore | One-click restore archived map |
| GET | /api/exam-engine/curriculum-map/coverage | Coverage % + unmapped topics |

### Board Affiliation Architecture
- School.board field = board_affiliation (already existed)
- Operator sets board during onboarding only
- QuestionBank.metadata.board_id = board filter (jsonb)
- All question queries auto-filter by school board
- BoardSyllabus: canonical, operator-managed, never school-editable
- SchoolCurriculumMap: school-managed, academic-year scoped, versioned+archived


## Phase 31 — Sprint 4 Status

| Item | Description | Status |
|------|-------------|--------|
| 31.10 | XceliQ Assistant v1.0 — Role-Aware Context Injection | ✅ Complete |
| 31.11 | Predictive Analytics v1.0 | ✅ Complete |
| 31.12 | PTCM Intelligence | ✅ Complete |

### New Entities (31.10)
- AssistantInteraction — full audit log per query: persona, query, response, tokens, model, response_time_ms, helpfulness_rating

### XceliQ Assistant Architecture
- 8 personas: principal, teacher, parent, student, finance, hr, front_desk, counselor
- Primary: OpenAI gpt-4o-mini | Fallback: Anthropic claude-haiku-4-5-20251001
- Both keys in school-service .env (baked into Docker image)
- All outputs marked is_draft=true — never autonomous actions
- Full audit trail in assistant_interaction table

### New Endpoints (31.10)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/xceliq-assistant/query | Role-aware AI query |
| POST | /api/xceliq-assistant/interactions/:id/rate | Rate helpfulness |
| GET | /api/xceliq-assistant/history | Interaction history |

### New Entities (31.11)
- PredictiveAlert — explainable factors jsonb, risk_score 0-100, risk_level enum, route_to, acknowledgment, previous_risk tracking

### Predictive Models
- dropout_risk: attendance(40%) + assessment(35%) + retrieval_engagement(25%)
- assessment_failure: forgetting curve retrievability gaps
- fee_default: overdue invoice ratio + count (medium+ only)
- curriculum_shortfall: coverage rate vs remaining periods
- teacher_burnout: deferred (no workload index data yet)

### New Endpoints (31.11)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/predictive-analytics/run/dropout-risk | Run dropout model |
| POST | /api/predictive-analytics/run/assessment-failure | Run assessment model |
| POST | /api/predictive-analytics/run/fee-default | Run fee default model |
| POST | /api/predictive-analytics/run/curriculum-shortfall | Run shortfall model |
| POST | /api/predictive-analytics/run/all | Run all models |
| GET | /api/predictive-analytics/alerts | Get alerts (filterable) |
| POST | /api/predictive-analytics/alerts/:id/acknowledge | Acknowledge alert |

### New Entities (31.12)
- PTCMeeting — scheduled conference, AI briefs (teacher+parent), digital agenda, notes, summary, followup tracking
- PTCMeetingCommitment — owner (parent/teacher/school), due_date, completion, overdue auto-flag

### PTCM AI Brief Architecture
- Teacher brief: 3 strengths + 2 growth areas + 1 ask of parent (Growth Mindset framed)
- Parent brief: 3 achievements + 2 discussion points + 1 home support tip
- Brief cached on meeting record after first generation
- OpenAI primary + Anthropic fallback

### New Endpoints (31.12)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/ptcm/meetings | Schedule meeting |
| GET | /api/ptcm/meetings | List meetings (role-aware) |
| GET | /api/ptcm/meetings/:id | Get meeting + commitments |
| GET | /api/ptcm/meetings/:id/teacher-brief | AI teacher brief |
| GET | /api/ptcm/meetings/:id/parent-brief | AI parent brief |
| POST | /api/ptcm/meetings/:id/notes | Log during-meeting notes |
| POST | /api/ptcm/meetings/:id/commitments | Log post-meeting commitments |
| PATCH | /api/ptcm/meetings/:id/status | Update status |
| GET | /api/ptcm/commitments | List open commitments |
| PATCH | /api/ptcm/commitments/:id | Complete commitment |

### New Entities (Sprint 2-4 complete list)
Sprint 2: ChatChannel, ChatMessage, ChatMember, ParentMessageThread, ParentMessage,
          BroadcastAnnouncement, BroadcastReadReceipt, HomeworkFeedback
Sprint 3: QuestionBank, ExamQuestion, ExamAnswerSheet, StudentAnswerSheet, ItemAnalysis,
          BoardSyllabus, SchoolCurriculumMap, CurriculumCalendar, CurriculumCalendarEntry,
          RetrievalTask, ForgettingCurve
Sprint 4: AssistantInteraction, PredictiveAlert, PTCMeeting, PTCMeetingCommitment

### AI Key Architecture (school-service)
- OPENAI_API_KEY: in school-service .env (primary)
- ANTHROPIC_API_KEY: in school-service .env (fallback)
- ai-service: TCP microservice only — NOT used for assistant queries
- All LLM calls via native fetch (Node 20) from school-service directly

### Known Technical Debt (updated)
- synchronize:true in TypeORM — replace with migrations before prod
- ai-service is TCP only — no HTTP endpoint — do not add HTTP routes there
- OPENAI_API_KEY + ANTHROPIC_API_KEY baked into Docker image — use secrets manager in prod
- Teacher burnout model (31.11) deferred — no WorkloadIndex entity yet (Sprint 5)
- WS layer for XceliQChat deferred — REST API complete
- OCR Vision API for StudentAnswerSheet deferred — needs image upload infra


## Phase 31 — Sprint 5 Status

| Item | Description | Status |
|------|-------------|--------|
| 31.13 | Teacher Wellbeing & Rotation System | ✅ Complete |
| 31.14 | Student Wellbeing Radar | ✅ Complete |
| 31.15 | NEP/Regulatory Compliance Engine | ✅ Complete |

### New Entities (31.13)
- WorkloadIndex: periods_taught, substitutions, correction_queue_depth, consecutive_periods_max, workload_score, risk_level (green/amber/red), violations jsonb
- WorkloadRule: school-configurable limits, hard_block_on_violation, amber/red thresholds

### New Endpoints (31.13)
| Method | Path | Description |
|--------|------|-------------|
| GET | /api/teacher-wellbeing/rules | Get workload rules |
| POST | /api/teacher-wellbeing/rules | Upsert rules |
| POST | /api/teacher-wellbeing/workload/compute | Compute workload for all teachers |
| GET | /api/teacher-wellbeing/workload | Principal heatmap |
| GET | /api/teacher-wellbeing/workload/:staffId | Individual staff history |
| POST | /api/teacher-wellbeing/check-assignment | Pre-assignment workload check |
| POST | /api/teacher-wellbeing/referral | Confidential self-referral |
| PATCH | /api/teacher-wellbeing/workload/:id/acknowledge | Acknowledge flag |

### New Entities (31.14)
- WellbeingFlag: signal_type (4 types), tier (1/2/3), route_to, signals jsonb (explainable), severity_score, trauma-informed guide_key, care_notes, acknowledgment

### Signal Detectors (31.14)
- attendance_drop: recent 10 sessions < 75% attendance rate
- mastery_regression: >30% of forgetting curve topics at-risk
- retrieval_avoidance: >40% of recent tasks skipped/overdue
- homework_decline: <50% homework completion rate

### New Endpoints (31.14)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/student-wellbeing/scan/:studentId | Run multi-signal scan |
| POST | /api/student-wellbeing/scan/class/:classId | Scan entire class |
| GET | /api/student-wellbeing/flags | Active flags (tier/status filterable) |
| GET | /api/student-wellbeing/flags/:studentId | Student flags |
| PATCH | /api/student-wellbeing/flags/:id/status | Update flag status |
| GET | /api/student-wellbeing/guides/:signal_type | Trauma-informed response guide |

### New Entities (31.15)
- ComplianceIndicator: framework_id, domain, indicator_code, measurement_type, target_value, is_mandatory, data_source
- ComplianceRecord: status (met/partial/not_met/not_assessed), current_value, evidence, corrective_action, manual override

### Compliance Engine Architecture (31.15)
- Framework-agnostic: framework_id free-form varchar (NEP/Ofsted/IB/Common Core/CBSE)
- 36 NEP 2020 indicators seeded across 8 domains: Curriculum, Assessment, Pedagogy, Teacher Development, Inclusion, Infrastructure, Governance, Wellbeing, Community
- Auto-assessment: curriculum coverage + attendance data-driven
- Manual assessment: principal/admin marks indicators with evidence
- Report: compliance_score, mandatory_compliance_score, by_domain breakdown, corrective_actions list
- Export: JSON/CSV live; PDF/Excel deferred to frontend layer

### New Endpoints (31.15)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/compliance/seed/nep | Seed 36 NEP indicators |
| GET | /api/compliance/indicators?framework_id= | Get indicators |
| POST | /api/compliance/assess | Run assessment |
| PATCH | /api/compliance/records/:id | Manual assessment update |
| GET | /api/compliance/report | Full compliance report |
| GET | /api/compliance/report/export?format=json|csv | Export report |

## Known Issues / Technical Debt

| Issue                              | Severity | Notes                                        |
|------------------------------------|----------|----------------------------------------------|
| permissions[] empty in JWT         | ✅ Fixed  | 20 permissions seeded, 7 roles mapped, JWT populated |
| synchronize:true in TypeORM        | High     | Replace with migrations before prod          |
| Docker frontend image stale        | ✅ Fixed  | Rebuilt with phase 29 redesign, port 5173:5175 mapped |
| School portal fetch failures       | ✅ Fixed  | Real JWT auth, x-school-id wired in api/client.js |
| School portal pages not redesigned | ✅ Fixed  | All 7 role dashboards redesigned, new tokens, api/client wired |
| No API versioning (/api/v1/)       | Medium   | Deferred                                     |
| Communication needs JWT context    | Medium   | createThread/sendMessage need user context   |
| Two duplicate "Test School" rows   | Low      | No school_code, harmless in dev              |
| Seeder FK violations on fresh DB   | ✅ Fixed  | School/Class/Subject hardcoded UUIDs inserted via SQL on fresh volume |
| recent_activity timestamps static  | Low      | School entity has no created_at field        |
| AuditLogs/Settings no backend      | Low      | Static mock only                             |
| OPENAI_API_KEY not in git          | Note     | Set manually: backend/ai-service/.env        |

---

## Phase 30 — Next Steps (ordered by priority)

1. ✅ Seed role_permission table → RBAC live, 19 permissions in JWT
2. ✅ Rebuild Docker frontend image → port 5173:5175 fixed
3. ✅ Wire school_token + x-school-id → all 7 personas login with real JWT
4. ✅ School portal role dashboard visual redesign — all 7 dashboards done
5. Replace synchronize:true with TypeORM migrations
6. API versioning /api/v1/
7. Communication endpoints JWT user context


### New Entities (31.8)
- CurriculumCalendar: regulatory_framework (NEP/Common Core/IB/Cambridge/IGCSE/Australian/Custom), IANA timezone, compliance enforcement, rebalance summary
- CurriculumCalendarEntry: per-day teaching plan, mark-taught, substitution tracking, rebalance scenario

### New Endpoints (31.8)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/curriculum-calendar/generate | Auto-generate from timetable + curriculum map |
| GET | /api/curriculum-calendar | Get calendar with entries |
| PATCH | /api/curriculum-calendar/:id/publish | Publish (blocks if non-compliant) |
| POST | /api/curriculum-calendar/entries/:id/mark-taught | Teacher marks lesson taught |
| POST | /api/curriculum-calendar/:id/rebalance | Get 3 rebalance scenarios |
| POST | /api/curriculum-calendar/:id/rebalance/apply | Apply chosen scenario |
| GET | /api/curriculum-calendar/coverage | Coverage % + topic coverage |

### New Entities (31.9)
- RetrievalTask: SM-2 quality scoring (0-5), task types, response + response_time_ms tracking
- ForgettingCurve: Ebbinghaus stability/retrievability R=e^(-t/S), SM-2 ease_factor, at_risk flag

### New Endpoints (31.9)
| Method | Path | Description |
|--------|------|-------------|
| POST | /api/xceliq-revise/schedule/:studentId | Generate retrieval schedule from taught topics |
| GET | /api/xceliq-revise/tasks/:studentId | Get due tasks (hydrated with questions) |
| POST | /api/xceliq-revise/tasks/:taskId/respond | Submit response, update SM-2 state |
| GET | /api/xceliq-revise/curve/:studentId | Forgetting curve state per topic |
| GET | /api/xceliq-revise/analytics/:studentId | Retention analytics + at-risk topics |

### Global-First Architecture Notes
- CurriculumCalendar.regulatory_framework covers NEP/Common Core/IB/Cambridge/Australian/Custom
- CurriculumCalendar.timezone: IANA string — no hardcoded Indian assumptions
- working_day_numbers on SchoolCalendarConfig handles Mon-Fri/Sun-Thu/Sat-Wed globally
- RetrievalTask/ForgettingCurve use board_topic_id as universal identifier — works for any board/curriculum
- BoardSyllabus.board_id free-form varchar — CBSE/ICSE/IB/Cambridge/State boards

| 31.8 | Curriculum Calendar v2.0 | ✅ Complete |
| 31.9 | XceliQRevise (Spaced Repetition) | ✅ Complete |
