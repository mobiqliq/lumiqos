# LumiqOS — Build Order

> This file tracks the ordered build phases of LumiqOS.  
> New features MUST be appended as the next phase. Never insert or reorder.  
> **Phase Lock Rule**: See [PHASE_LOCK.md](./PHASE_LOCK.md) — no phase advances until the gate clears.  
> Last Updated: 2026-03-19

---

## Phase Gate Legend

```
✅ = Phase complete, gate cleared
🔄 = Active phase (in progress)
⬚  = Planned (not started)
🔒 = Gate: ✔ build ✔ runtime ✔ commit ✔ snapshot ✔ architecture
```

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

---

## 🔄 Current Phase

### Phase 23: Data Integrity & Validation 🔄
**Started**: 2026-03-19  
**Gate**: 🔒 CLEARED

| Sub-Phase | Layer | Task | Status |
|-----------|-------|------|--------|
| 21.1 | Schema | Add TypeORM migrations for all existing entities | [x] |
| 21.2 | Service | Make seeder idempotent (skip if data exists) | [x] |
| 21.3 | Service | Implement real JWT validation in `JwtAuthGuard` | [x] |
| 21.4 | API | Implement real login flow (replace demo token) | [x] |
| 21.5 | API | Fix `nest start --watch` path resolution | [x] |
| 21.6 | UI | Update Login page to use real auth API | [x] |

**Gate Checklist**:
- [x] All 21.x tasks complete
- [x] `npm run build` passes for all services
- [x] All services start and respond to health checks
- [x] Git committed: `[phase-21] production hardening complete`
- [x] This file updated with ✅ 🔒
- [x] No architecture changes outside scope

---

## ⬚ Upcoming Phases (Planned)

### Phase 22: Academic Planning Engine 🔄
**Started**: 2026-04-17  
**Gate**: 🔒 CLEARED
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 22.1 | Service | AcademicPlanningService (backward planning logic) |
| 22.2 | API | Generate Academic Plan endpoint |
| 22.3 | Integration | Map AcademicPlan → CurriculumPlan |
| 22.4 | Calendar | Populate PlanningDay from AcademicCalendarEvent |
| 22.5 | Validation | Feasibility + constraint checks |

### Phase 23: Data Integrity & Validation 🔄
**Started**: 2026-04-17  
**Gate**: 🔓 OPEN
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 23.1 | Schema | Add database indexes on frequently queried columns |
| 23.2 | Service | Add input validation (class-validator DTOs) |
| 23.3 | Service | Implement tenant isolation (TenantInterceptor) |
| 23.4 | Audit | Add request logging middleware |

### Phase 24: Student Intelligence Graph ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 24.1 | Schema | Create `StudentProfile` / `LearningEvent` entities |
| 24.2 | Service | Learning velocity calculation |
| 24.3 | Service | Behavioral pattern analysis |
| 24.4 | AI | At-risk student identification model |
| 24.5 | API | Student intelligence endpoints |
| 24.6 | UI | Student profile dashboard |

### Phase 25: AI Teacher Copilot ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 25.1 | Service | Contextual teaching suggestions engine |
| 25.2 | AI | Workload optimization alerts |
| 25.3 | AI | Peer benchmarking analysis |
| 25.4 | UI | Teacher copilot sidebar |

### Phase 26: Advanced Analytics ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 26.1 | Schema | Analytics materialized views |
| 26.2 | Service | Command Center data aggregation |
| 26.3 | AI | Predictive dropout model |
| 26.4 | AI | Financial forecasting |
| 25.5 | UI | Command Center dashboard |

### Phase 27: Mobile Apps ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 27.1 | Core | React Native project scaffold |
| 27.2 | UI | Teacher mobile app |
| 27.3 | UI | Parent mobile app |
| 27.4 | Automation | Push notification service |

### Phase 28: Autopilot ⬚
| Sub-Phase | Layer | Task |
|-----------|-------|------|
| 28.1 | Automation | Scheduled report generation |
| 28.2 | Automation | Auto fee reminders |
| 28.3 | AI | Autonomous insight generation |
| 28.4 | AI | Proactive parent engagement |


