# LumiqOS — Architecture Memory

> This file is the AI's mandatory context loader. Read this BEFORE making any code changes.  
> Last Updated: 2026-03-19

---

## Product Identity

- **Name**: LumiqOS
- **Tagline**: AI-First School Intelligence OS
- **Type**: Multi-Tenant SaaS Platform for K-12 Education
- **Tech Stack**: NestJS (Backend) + React/Vite (Frontend) + PostgreSQL + TypeORM

---

## Service Registry

| Service | Port (HTTP) | Port (TCP) | Location |
|---------|-------------|------------|----------|
| API Gateway | 3000 | — | `backend/api-gateway/` |
| School Service | 3002 | 3001 | `backend/school-service/` |
| Auth Service | 3003 | — | `backend/auth-service/` |
| User Service | 3004 | — | `backend/user-service/` |
| AI Service | 3005 | — | `backend/ai-service/` |
| Billing Service | 3006 | — | `backend/billing-service/` |
| Frontend Portal | 5174 | — | `frontend/school-portal/` |

---

## Database

- **Engine**: PostgreSQL
- **Database Name**: `lumiqos`
- **Schema Strategy**: Shared Database, Shared Schema (tenant isolation via `school_id`)
- **ORM**: TypeORM with synchronize (dev) / migrations (prod)

---

## Module Map (Current State)

### Shared (`backend/shared/`)
All cross-service entities, guards, DTOs, and decorators live here.

**Entities**: School, User, Role, Permission, RolePermission, AcademicYear, Class, Section, Subject, TeacherSubject, Student, StudentEnrollment, StudentGuardian, StudentDocument, StudentHealthRecord, AttendanceSession, StudentAttendance, HomeworkAssignment, HomeworkSubmission, ExamType, Exam, ExamSubject, StudentMarks, GradeScale, ReportCard, ReportCardSubject, Notification, NotificationRecipient, MessageThread, Message, FeeCategory, FeeStructure, StudentFeeAccount, FeeInvoice, FeePayment, InventoryItem, Syllabus, AcademicCalendarEvent, LessonPlan, CurriculumMapping, TenantSubscription, AnalyticsSnapshot

**Guards**: JwtAuthGuard, RbacGuard

### School Service Modules
| Module | Controller Prefix | Key Endpoints |
|--------|-------------------|---------------|
| Schools | `/schools` | CRUD, academic hierarchy |
| Academic | `/academic` | Years, classes, sections, subjects |
| Students | `/students` | Lifecycle, enrollment, promotion |
| Attendance | `/attendance` | Sessions, marking, analytics |
| Homework | `/homework` | Assignments, submissions, grading |
| Exams | `/exams` | Types, scheduling, marks, results |
| Report Cards | `/report-cards` | Generation, per-student views |
| Communication | `/notifications`, `/messages` | Alerts, threads |
| Finance | `/finance` | Fees, invoices, payments, inventory |
| Dashboard | `/dashboard` | Overview aggregations |
| Teacher | `/teacher` | Teacher-specific mobile APIs |
| Parent | `/parent` | Parent-specific read-only APIs |
| Curriculum | `/curriculum` | Syllabus, calendar, lesson plans, execution |
| Timetable | `/timetable` | Schedule generation |
| Substitution | `/substitution` | Absence tracking, auto-allocation |
| AI | (internal) | LLM prompt engine, lesson generation |

---

## Frontend Pages (React/Vite)

| Page | Route | Role |
|------|-------|------|
| Login | `/login` | All |
| Dashboard | `/` | Admin/Principal |
| My Classroom | `/classroom` | Teacher |
| Lesson Planner | `/lesson-planner` | Teacher |
| Attendance | `/attendance` | Teacher/Admin |
| Homework | `/homework` | Teacher |
| Exams | `/exams` | Teacher/Admin |
| Report Cards | `/report-cards` | Teacher/Admin |
| Messages | `/messages` | Teacher/Parent |
| Finance | `/finance` | Admin |
| Settings | `/settings` | Admin |
| Parent Dashboard | `/parent` | Parent |

---

## Key Design Decisions (Do NOT Override)

1. **Tenant Isolation**: All queries MUST scope by `school_id`. No cross-tenant data leakage.
2. **RBAC via JWT**: Token carries `user_id`, `school_id`, `role`, `permissions[]`.
3. **Soft Deletes**: Students are never hard-deleted. Use `status = 'archived'`.
4. **One Active Enrollment**: A student has exactly ONE active enrollment per academic year.
5. **Primary Guardian**: Exactly ONE guardian per student is flagged `is_primary_guardian = true`.
6. **Admission Uniqueness**: `admission_number` is unique per `school_id`.
7. **Proxy Routing**: API Gateway strips `/api` prefix before forwarding to downstream services.
8. **AI Service**: Stateless prompt engine — no persistent state, pure function calls.

---

## Known Technical Debt

| Item | Status | Notes |
|------|--------|-------|
| JwtAuthGuard is a placeholder (`return true`) | ⚠️ Open | Needs real JWT validation |
| Login uses hardcoded demo token | ⚠️ Open | Needs real auth flow |
| Seeder runs on every startup | ⚠️ Open | Should be idempotent or CLI-only |
| `nest start --watch` fails (looks for `dist/main`) | ⚠️ Open | Use `node dist/school-service/src/main.js` instead |
