# XceliQOS — Architecture Memory

> This file is the AI's mandatory context loader. Read this BEFORE making any code changes.
> Last Updated: 2026-04-23 — Phase 31 Sprint 1 In Progress (31.0, 31.1 Complete)
> Branch: main | HEAD: ca53386

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
CommunicationController, AuthController, AdminController

---

## School Service

### Registered Modules (app.module.ts)
SchoolModule, AcademicPlanningModule, IntelligenceGraphModule,
DashboardModule, FinanceModule, ParentModule, HrModule,
SubstitutionModule, TimetableModule, ReportCardsModule,
ExamsModule, HomeworkModule, CommunicationModule,
SeederModule, AdminModule

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

### Current Focus: 31.2 XceliQScore v1.0
- Previously completed: 31.0 School Calendar & Timetable Config, 31.1 Student Persistent Identity Layer
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

### New Entities (31.1)
- StudentIdentity — federated UUID above school_id, school_history, consent flags
- StudentPassport — cross-school mastery map, intervention record, XceliQScore history, SEL observations, transfer log

### Sprint 1 Items
| Item | Description | Status |
|------|-------------|--------|
| 31.0 | School Calendar & Timetable Config Engine | ✅ Complete |
| 31.1 | Student Persistent Identity Layer | ✅ Complete |
| 31.2 | XceliQScore v1.0 (10-dimension scoring) | 🔲 Pending |
| 31.3 | Adaptive Role Architecture (Tier 1/2/3) | 🔲 Pending |


---

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
