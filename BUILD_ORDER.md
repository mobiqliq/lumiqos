# XceliQOS — Build Order

> This file tracks the ordered build phases of XceliQOS.
> New features MUST be appended as the next phase. Never insert or reorder.
> **Phase Lock Rule**: No phase advances until all tasks in the current phase are verified and committed.
> Last Updated: 2026-04-25

---

## Phase Gate Legend

- ✅ 🔒 Complete and locked
- 🔄 In progress
- ⬚ Upcoming

---

## Completed Phases

### Phase 1: Core Foundation ✅ 🔒
- [x] Project scaffolding (NestJS monorepo)
- [x] Shared entities library (`backend/shared/`)
- [x] PostgreSQL + TypeORM configuration
- [x] Docker Compose setup

### Phase 2: Authentication & Authorization ✅ 🔒
- [x] Auth Service (JWT issue/verify)
- [x] JwtAuthGuard
- [x] RbacGuard
- [x] User entity + roles/permissions

### Phase 3: School Management ✅ 🔒
- [x] School CRUD
- [x] Academic Year management
- [x] Class/Section/Subject hierarchy
- [x] TeacherSubject assignment mapping

### Phase 4: Student Lifecycle ✅ 🔒
- [x] Student entity with status enum
- [x] StudentEnrollment (one active per year)
- [x] StudentGuardian (primary guardian flag)
- [x] StudentDocument + StudentHealthRecord

### Phase 5: Attendance Engine ✅ 🔒
- [x] AttendanceSession + StudentAttendance entities
- [x] Bulk marking with exception-based input
- [x] Event emitter for `student.absent`
- [x] Teacher-side daily/weekly/monthly analytics

### Phase 6: Homework & Assignments ✅ 🔒
- [x] HomeworkAssignment entity
- [x] HomeworkSubmission with late detection
- [x] Teacher grading flow

### Phase 7: Assessment & Exams ✅ 🔒
- [x] ExamType/Exam/ExamSubject/StudentMarks entities
- [x] GradeScale with non-overlapping bands
- [x] Mark validation and locking

### Phase 8: Report Cards ✅ 🔒
- [x] ReportCard + ReportCardSubject generation
- [x] Percentage/grade/rank calculation
- [x] Missing-mark safety handling

### Phase 9: Communication ✅ 🔒
- [x] Notification + fan-out recipients
- [x] MessageThread + Message (1-on-1)

### Phase 10: Finance v1 ✅ 🔒
- [x] FeeCategory + FeeStructure
- [x] StudentFeeAccount ledger
- [x] FeeInvoice + FeePayment (immutable)
- [x] Inventory predictions

### Phase 11: Dashboards ✅ 🔒
- [x] Admin/Principal overview dashboard
- [x] Teacher workflow dashboard
- [x] Parent read-only dashboard

### Phase 12: API Gateway ✅ 🔒
- [x] Proxy middleware with path rewriting
- [x] CORS configuration
- [x] Service routing (auth, school, user, billing)

### Phase 13: Frontend Portal Scaffold ✅ 🔒
- [x] Vite + React scaffold
- [x] Role-based routing
- [x] PWA configuration
- [x] i18n support

### Phase 14: SaaS & Billing Foundation ✅ 🔒
- [x] TenantSubscription entity
- [x] Billing service with onboarding flow
- [x] AnalyticsSnapshot for Command Center

### Phase 15: AI Service ✅ 🔒
- [x] AiService with LLM prompt engine
- [x] Subject-specific pedagogical templates
- [x] Board-aligned (CBSE/IB) lesson generation

### Phase 16: Curriculum Intelligence ✅ 🔒
- [x] Syllabus entity + progress tracking
- [x] AcademicCalendarEvent mapping
- [x] CurriculumMapping (daily schedule)
- [x] LessonPlan generation + storage

### Phase 17: Lesson Planner ✅ 🔒
- [x] Teacher assignment-based selection
- [x] Syllabus-aware topic recommendations
- [x] AI lesson plan generation
- [x] Execute lesson + update syllabus

### Phase 18: Parent Intelligence ✅ 🔒
- [x] Kitchen Table Hooks (conversation starters)
- [x] Parent insights API
- [x] LessonPlan-to-CurriculumMapping linkage

### Phase 19: Timetable & Substitution ✅ 🔒
- [x] Timetable generation endpoint
- [x] Substitution absence tracking
- [x] Auto-allocation + notification

### Phase 20: Role-Based Attendance Insights ✅ 🔒
- [x] Principal/Admin: numerical overview + graphs
- [x] Teacher: interactive daily marking + AI trend insights

### Phase 21: Production Hardening (Round 1) ✅ 🔒
- [x] TypeORM migrations for all entities at time of phase
- [x] Idempotent seeder
- [x] Real JWT validation in JwtAuthGuard
- [x] Real login flow
- [x] Fixed nest start --watch path resolution
- [x] Login page uses real auth API

### Phase 22: Academic Planning Engine ✅ 🔒
- [x] AcademicPlanningService (backward planning logic)
- [x] Generate Academic Plan endpoint
- [x] Map AcademicPlan → CurriculumPlan
- [x] Populate PlanningDay from AcademicCalendarEvent
- [x] Feasibility + constraint checks

### Phase 23: Data Integrity & Validation ✅ 🔒
- [x] Database indexes on frequently queried columns
- [x] Input validation (class-validator DTOs)
- [x] Tenant isolation (TenantInterceptor)
- [x] Request logging middleware

### Phase 24: Intelligence Graph Foundation ✅ 🔒
- [x] StudentLearningProfile, Skill, Concept entities
- [x] StudentSkillMastery, StudentConceptMastery
- [x] TopicSkillMap, TopicConceptMap
- [x] Graph population from syllabus topics
- [x] Mastery calculation (60% exams, 30% homework, 10% attendance)

### Phase 25: AI-Powered Recommendations ✅ 🔒
- [x] Shared service discovery endpoints
- [x] Resilient HTTP client with circuit breaker
- [x] AI recommendation endpoints
- [x] AIClientService in school-service with graceful degradation
- [x] Type-safe interfaces for AI contracts

### Phase 26: Teacher Dashboard Analytics ✅ 🔒
- [x] Class heatmap endpoint (students × skills)
- [x] Struggling students identification
- [x] Student radar chart data
- [x] Caching via @nestjs/cache-manager (TTL 5min)

### Phase 27: XceliQ Score & School Tier ✅ 🔒
- [x] XceliQScore composite scoring engine
- [x] SchoolTier entity + tier enforcement
- [x] Score dimensions: academic, attendance, homework, co-curricular, SEL

### Phase 28: XceliQ AI Suite ✅ 🔒
- [x] XceliQChat (REST)
- [x] XceliQRevise (adaptive revision engine)
- [x] XceliQAssistant (teacher assistant)
- [x] ExamEngine (AI-generated question papers)
- [x] HomeworkTransparency (parent-facing AI explanation)
- [x] ParentComms (AI-drafted parent messages)

### Phase 29: Student Wellbeing & Teacher Wellbeing ✅ 🔒
- [x] StudentWellbeing module
- [x] TeacherWellbeing module
- [x] PTCM (Parent-Teacher Communication Manager)
- [x] PredictiveAnalytics module

### Phase 30: Finance v2, Admissions, Operations ✅ 🔒
- [x] FinanceLedger, FinanceEntry, TaxInvoice, TaxWithholding, FeeStructureVersion
- [x] AdmissionApplication, AdmissionDocument, WaitlistEntry, ReservationConfig
- [x] LibraryRecord, TransportRoute, TransportAssignment, VisitorLog, OperationsConfig

### Phase 31: Deep Intelligence Layer ✅ 🔒
- [x] 31.19 LearningDNA — LearningDNAProfile, LearningDNAObservation, ChronobioConfig, CognitiveLoadRule
- [x] 31.20 SEL Intelligence — SELObservation, EQProfile, FlowStateLog, SELFrameworkConfig
- [x] 31.21 Student Portfolio — Portfolio, PortfolioItem, PortfolioConfig
- [x] 31.22a School Groups — SchoolGroup, SchoolGroupMember, SchoolGroupConfig (houses, sports, co-curricular, committees)
- [x] 31.22 XceliQAlumni — AlumniRecord, AlumniConfig (full lifecycle, invite codes, consent paths)
- [x] ChatChannel extended: ALUMNI + GROUP types
- [x] BroadcastAnnouncement extended: ALUMNI + GROUP audience

---

## 🔄 Current Phase

### Phase 32: Sprint 8 — Board, PLC, Reflect, Mindset ✅ 🔒
- [x] Board Reporting Portal — BoardReport entity, AI narrative, approval workflow
- [x] Professional Learning Community — PLCGroup, PLCSession, PLCResource
- [x] XceliQReflect — ReflectionEntry, MetacognitiveScore
- [x] Growth Mindset Integration — MindsetMoment, ParentMindsetProgress

---

## ⬚ Upcoming Phases

### Phase 33: Foundation Hardening ⬚
*Make everything built so far production-safe before adding more.*

| # | Task |
|---|---|
| 33.1 | TypeORM migration system — replace synchronize:true across all services |
| 33.2 | Secrets manager integration (Doppler/Vault) — remove keys from Docker image |
| 33.3 | Structured logging (Winston + correlation IDs across all services) |
| 33.4 | Global error handler + standardised error codes at gateway |
| 33.5 | Rate limiting at gateway (per-IP and per-tenant) |
| 33.6 | Deep health checks (DB, Redis, AI service, auth service) |
| 33.7 | API versioning — /api/v1/ prefix across all routes |

### Phase 34: Persona Modularity Engine ⬚
*Any school structure. No orphaned functions. Auto-adjusting dashboards.*

| # | Task |
|---|---|
| 34.1 | FunctionCatalog entity — enumerate every system function with default persona owner |
| 34.2 | FunctionAllocation entity — school maps any function to any user/role |
| 34.3 | Permission resolution engine — derive JWT permissions from allocations at login |
| 34.4 | Dashboard widget registry — each widget declares required function, auto-hides if unallocated |
| 34.5 | Onboarding wizard API — school configures personas and allocations on first login |
| 34.6 | Migrate all 39 existing modules to allocation-aware guards |

### Phase 35: Notification Engine ⬚
*Every alert, trigger, and communication in the system needs a delivery mechanism.*

| # | Task |
|---|---|
| 35.1 | NotificationTemplate entity — channel-agnostic templates with variable substitution |
| 35.2 | NotificationLog entity — delivery tracking, read receipts, bounce handling |
| 35.3 | Email delivery adapter (SendGrid/SES — school provides SMTP or uses platform) |
| 35.4 | SMS delivery adapter (Twilio — optional, school-configured) |
| 35.5 | In-app notification feed endpoint (REST, upgraded to WS in Phase 36) |
| 35.6 | Wire all existing trigger points (fee overdue, attendance, exam, alumni invite, intervention) |
| 35.7 | Notification preferences — per-user channel opt-in/out |

### Phase 36: Real-Time Layer ⬚
*Chat is REST-only. Not acceptable at launch.*

| # | Task |
|---|---|
| 36.1 | WebSocket gateway (NestJS @WebSocketGateway — Socket.io adapter) |
| 36.2 | Chat message delivery over WebSocket (XceliQChat, group channels, alumni channels) |
| 36.3 | Real-time notification delivery over WebSocket |
| 36.4 | Presence indicators (online/offline — opt-in, privacy-safe) |
| 36.5 | Typing indicators for direct messages |
| 36.6 | Redis adapter for WebSocket horizontal scaling |

### Phase 37: File Infrastructure ⬚
*Portfolio, answer sheets, report cards, and compliance exports are all blocked on this.*

| # | Task |
|---|---|
| 37.1 | S3-compatible storage adapter (AWS S3 / Cloudflare R2 / MinIO for self-hosted) |
| 37.2 | Signed URL generation — scoped by school_id, time-limited |
| 37.3 | File upload service — virus scan hook, size limits, MIME type validation |
| 37.4 | Wire Portfolio file_ref to actual upload/download |
| 37.5 | Answer sheet image upload + OCR pipeline (Google Vision / Tesseract) |
| 37.6 | PDF generation service (Puppeteer) — report cards, portfolios, compliance exports |
| 37.7 | Excel export service (ExcelJS) — finance, compliance, attendance |

### Phase 38: Intervention & Care Engine ⬚
*The feature that makes XceliQOS irreplaceable. Closes the loop on every risk signal.*

| # | Task |
|---|---|
| 38.1 | InterventionFlag entity — any module raises a flag (attendance, SEL, academic, wellbeing) |
| 38.2 | InterventionCase entity — assign to staff, track status, link evidence |
| 38.3 | InterventionAction entity — log actions taken, outcomes, closure |
| 38.4 | Triage dashboard endpoint — principal sees all open cases by severity and assignee |
| 38.5 | AI triage suggestion — Growth Mindset framing, evidence-based intervention options |
| 38.6 | Safeguarding workflow — escalation path, external agency referral log |
| 38.7 | Wire all existing risk signals (SEL, wellbeing, attendance, LearningDNA) into flag engine |

### Phase 39: Payment & Billing ⬚
*Finance module exists. Actual money movement does not.*

| # | Task |
|---|---|
| 39.1 | Payment gateway adapter (Stripe / Razorpay / Flutterwave — region-configurable) |
| 39.2 | Fee collection workflow — generate demand, send link, collect, auto-reconcile |
| 39.3 | Instalment plan engine |
| 39.4 | Scholarship and concession management |
| 39.5 | Parent payment history and receipt download |
| 39.6 | Platform billing — XceliQOS SaaS subscription engine |
| 39.7 | Usage metering — student count, storage GB, AI call volume |

### Phase 40: Advanced Academic Intelligence ⬚
*The core IP moat. Deepens switching cost.*

| # | Task |
|---|---|
| 40.1 | Student goal-setting engine — SMART goals linked to XceliQScore dimensions |
| 40.2 | Predictive at-risk model — attendance + academic + SEL signals → composite risk score |
| 40.3 | Curriculum gap analysis — exam performance mapped to curriculum coverage |
| 40.4 | Differentiated homework engine — difficulty auto-adjusts to LearningDNA profile |
| 40.5 | Parent engagement index — composite score from portal usage, meeting attendance, comms |
| 40.6 | Teacher effectiveness index — student growth adjusted for intake profile |
| 40.7 | Timetable conflict resolution engine — constraint solver for period/room/teacher clashes |

### Phase 41: Compliance & Audit ⬚
*Required for enterprise and government school contracts.*

| # | Task |
|---|---|
| 41.1 | Audit log viewer — searchable, filterable, exportable (currently logs exist, no UI/API) |
| 41.2 | GDPR/DPDP/FERPA/PDPA data subject request workflow (access, erasure, portability) |
| 41.3 | Data retention policy engine — auto-archive/delete per AlumniConfig jurisdiction config |
| 41.4 | Consent management dashboard — all consents, withdrawals, timestamps in one view |
| 41.5 | Compliance report export (PDF/Excel) — regulator-ready formats |
| 41.6 | Signal Protocol E2E encryption for alumni comms (libsignal-client) |
| 41.7 | External penetration test + security audit |

### Phase 42: Multi-School & District ⬚
*Required for school group chains and government contracts.*

| # | Task |
|---|---|
| 42.1 | District/Chain org entity — sits above School in hierarchy |
| 42.2 | District rollup analytics — aggregate KPIs across schools, normalised |
| 42.3 | Cross-school benchmarking — anonymised, opt-in per school |
| 42.4 | Central admin portal — manage multiple schools from one login |
| 42.5 | Shared resource library — district shares curriculum resources, PLC materials |
| 42.6 | District-level compliance reporting |

### Phase 43: Mobile Application ⬚
*Parents and students will not use a web portal. This is not optional.*

| # | Task |
|---|---|
| 43.1 | React Native (Expo) — shared codebase iOS + Android |
| 43.2 | Parent app — fee status, attendance, homework, comms, mindset moments, notifications |
| 43.3 | Student app — timetable, homework, portfolio, XceliQRevise, XceliQChat |
| 43.4 | Offline-first sync (React Query + local SQLite cache) |
| 43.5 | Push notifications (FCM/APNs via Phase 35 notification engine) |
| 43.6 | Biometric auth (FaceID/fingerprint) |
| 43.7 | App Store + Play Store submission pipeline |

### Phase 44: Frontend Completeness ⬚
*Portal is scaffolded. Every module needs a production UI.*

| # | Task |
|---|---|
| 44.1 | Design system finalisation — tokens, components, accessibility (WCAG 2.1 AA) |
| 44.2 | Principal dashboard — full widget system driven by Phase 34 persona allocations |
| 44.3 | Teacher portal — timetable, homework, marks, interventions, wellbeing, PLC |
| 44.4 | Finance portal — ledger, fee collection, invoices, reports |
| 44.5 | HR portal — staff records, leave, CPD tracking |
| 44.6 | Admissions portal — pipeline, waitlist, documents, communications |
| 44.7 | Operations portal — library, transport, visitors, config |
| 44.8 | Alumni portal — network, career pathway, chat, house affiliation |
| 44.9 | XceliQ AI interfaces — Revise, Assist, Chat, Score, Reflect, Mindset |
| 44.10 | Dark mode, RTL support, i18n baseline (en, ar, hi, fr) |

### Phase 45: CI/CD & Production Infrastructure ⬚
*Nothing above reaches users without this.*

| # | Task |
|---|---|
| 45.1 | GitHub Actions pipeline — lint, typecheck, test, build, deploy on merge to main |
| 45.2 | Staging environment — mirrors prod, seeded with anonymised data |
| 45.3 | Docker → Kubernetes migration (Helm charts per service) |
| 45.4 | Horizontal autoscaling (school-service, api-gateway, WebSocket service) |
| 45.5 | CDN for frontend assets and file downloads |
| 45.6 | Monitoring stack (Datadog or Grafana/Prometheus) + alerting |
| 45.7 | Automated backup + tested disaster recovery (daily backup, monthly DR drill) |
| 45.8 | SLA definition (99.9% uptime target) + uptime monitoring |

### Phase 46: Super-Admin & SaaS Management ⬚
*Required before onboarding paying customers at scale.*

| # | Task |
|---|---|
| 46.1 | Super-admin portal — provision schools, manage tiers, view usage metrics |
| 46.2 | School onboarding automation — wizard to fully provisioned in under 5 minutes |
| 46.3 | Tier enforcement engine — feature gating enforced by SchoolTier at gateway |
| 46.4 | Usage analytics — MAU, feature adoption rates, churn signals per school |
| 46.5 | Support ticket integration (Intercom/Zendesk hook) |
| 46.6 | In-app changelog and release notes |

---

## Summary

| Phase | Focus | Investor Signal |
|---|---|---|
| 1–26 | Core platform | ✅ Complete |
| 27–31 | Deep intelligence + alumni + groups | ✅ Complete |
| 32 | Sprint 8 features | Backend feature complete |
| 33 | Foundation hardening | Production-safe |
| 34 | Persona modularity | Any school, any structure |
| 35 | Notification engine | Platform, not CRUD |
| 36 | Real-time layer | Consumer-grade UX |
| 37 | File infrastructure | Unblocks portfolio, exams, reports |
| 38 | Intervention engine | Safeguarding = trust + stickiness |
| 39 | Payments | Revenue infrastructure |
| 40 | Advanced academic intelligence | Core IP moat |
| 41 | Compliance + audit | Enterprise and government contracts |
| 42 | Multi-school + district | Chain and district deals |
| 43 | Mobile | Parent and student adoption |
| 44 | Frontend completeness | Shippable product |
| 45 | CI/CD + infrastructure | Scale-ready |
| 46 | Super-admin + SaaS | Operationally independent |

**Remaining: 15 phases, 112 tasks.**
**Estimated with 3-engineer team: 14–18 months to Phase 45. Phase 46 runs in parallel from Phase 39.**
