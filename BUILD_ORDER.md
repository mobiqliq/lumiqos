# LumiqOS — Build Order

> This file tracks the ordered build phases of LumiqOS.  
> New features MUST be appended as the next phase. Never insert or reorder.  
> **Phase Lock Rule**: See [PHASE_LOCK.md](./PHASE_LOCK.md) — no phase advances until the gate clears.  
> Last Updated: 2026-04-19

---

## Phase Gate Legend


---

## Completed Phases

### Phase 1: Core Foundation ✅ 🔒
- [x] Project scaffolding (NestJS monorepo)
- [x] Shared entities library (`backend/shared/`)
- [x] PostgreSQL + TypeORM configuration
- [x] Docker Compose setup

### Phase 2: Authentication & Authorization ✅ 🔒
- [x] Auth Service (JWT issue/verify)
- [x] JwtAuthGuard (placeholder)
- [x] RbacGuard (placeholder)
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

### Phase 10: Finance ✅ 🔒
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

### Phase 13: Frontend Portal ✅ 🔒
- [x] Vite + React scaffold
- [x] Role-based routing
- [x] PWA configuration
- [x] i18n support

### Phase 14: SaaS & Billing ✅ 🔒
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

### Phase 17: Lesson Planner (Teacher) ✅ 🔒
- [x] Teacher assignment-based selection
- [x] Syllabus-aware topic recommendations
- [x] AI lesson plan generation (HTTP endpoint)
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
- [x] Principal/Admin: numerical overview + graphs (view-only)
- [x] Teacher: interactive daily marking + AI trend insights

### Phase 21: Production Hardening ✅ 🔒
- [x] TypeORM migrations for all existing entities
- [x] Idempotent seeder
- [x] Real JWT validation in `JwtAuthGuard`
- [x] Real login flow (replaced demo token)
- [x] Fixed `nest start --watch` path resolution
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
- [x] AI recommendation endpoints (generateRecommendations, learningPath, interventions)
- [x] AIClientService in school-service with graceful degradation
- [x] Type-safe interfaces for AI contracts

### Phase 26: Teacher Dashboard Analytics ✅ 🔒
- [x] Class heatmap endpoint (students × skills)
- [x] Struggling students identification (avg mastery <70 or weak skills)
- [x] Student radar chart data (domain-wise mastery)
- [x] Caching via `@nestjs/cache-manager` (TTL 5min)
- [x] Test data with 3 students across two classes

---

## 🔄 Current Phase

### Phase 27: Frontend Teacher Dashboard UI 🔄
**Started**: Not yet  
**Gate**: 🔓 OPEN

| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 27.1 | UI | Create Teacher Dashboard route with class selector |
| 27.2 | UI | Implement heatmap visualization (Chart.js or react-table) |
| 27.3 | UI | Display struggling students list with intervention links |
| 27.4 | UI | Build radar chart component for individual student view |
| 27.5 | Integration | Connect all three new endpoints to frontend components |

---

## ⬚ Upcoming Phases (Planned)

### Phase 28: Advanced Analytics ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 28.1 | Schema | Analytics materialized views |
| 28.2 | Service | Command Center data aggregation |
| 28.3 | AI | Predictive dropout model |
| 28.4 | AI | Financial forecasting |
| 28.5 | UI | Command Center dashboard |

### Phase 29: Mobile Apps ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 29.1 | Core | React Native project scaffold |
| 29.2 | UI | Teacher mobile app |
| 29.3 | UI | Parent mobile app |
| 29.4 | Automation | Push notification service |

### Phase 30: Autopilot ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 30.1 | Automation | Scheduled report generation |
| 30.2 | Automation | Auto fee reminders |
| 30.3 | AI | Autonomous insight generation |
| 30.4 | AI | Proactive parent engagement |
