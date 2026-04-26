# Session Mind Map — 2026-04-24 Phase 31 Sprint 5 COMPLETE

## HEAD: 5131f42

## Sprint Status
- Sprint 1 (31.0-31.3): COMPLETE
- Sprint 2 (31.4-31.6): COMPLETE
- Sprint 3 (31.7-31.9): COMPLETE
- Sprint 4 (31.10-31.12): COMPLETE
- Sprint 5 (31.13-31.15): COMPLETE
- Sprint 6 (31.16-31.18): PENDING
- Sprint 7 (31.19-31.22): PENDING
- Sprint 8 (31.23-31.26): PENDING

## All Modules (school-service) — 31 total
SchoolModule, AcademicPlanningModule, IntelligenceGraphModule,
DashboardModule, FinanceModule, ParentModule, HrModule,
SubstitutionModule, TimetableModule, ReportCardsModule,
ExamsModule, HomeworkModule, CommunicationModule,
SeederModule, AdminModule, SchoolConfigModule,
StudentIdentityModule, XceliQScoreModule, SchoolTierModule,
XceliQChatModule, ParentCommsModule, HomeworkTransparencyModule,
ExamEngineModule, CurriculumCalendarModule, XceliQReviseModule,
XceliQAssistantModule, PredictiveAnalyticsModule, PTCMModule,
TeacherWellbeingModule, StudentWellbeingModule, ComplianceModule

## All New Entities Sprint 5 (6 total)
WorkloadIndex, WorkloadRule,
WellbeingFlag,
ComplianceIndicator, ComplianceRecord

## Next Session — Sprint 6 (31.16-31.18)
- 31.16: Finance System v2.0 (double-entry, GST, TDS, Tally/Xero/Zoho export)
- 31.17: Admissions System (pipeline: Inquiry→Application→Document→Assessment→Offer→Payment→Onboarding)
- 31.18: Resource & Operations Management (Library, Transport, Visitor)

## Critical Notes
- NEP indicators: 36 seeded, school must run /api/compliance/assess to populate records
- Wellbeing guides: 5 trauma-informed guides in service memory (not DB) — always available
- WorkloadIndex: computed from timetable slots (proxy) — real-time data improves with attendance module integration
- OPENAI_API_KEY + ANTHROPIC_API_KEY in school-service .env
- Gateway ECONNREFUSED fix: restart gateway after school-service restart

## Seeded Test Data
- School: 11111111 | AY: 22222222 | Class: 33333333 | Subject: 44444444
- Student: 55555555 | Enrollment: eeeeeeee (TEST-001)
- Staff: teacher1-4, principal, admin, finance, hr, parent, student @testschool.edu / password

## 2026-04-26 — Phase 33.5 validation fix map
- Files:
  - backend/api-gateway/src/app.module.ts (restore throttler module/providers)
  - backend/api-gateway/src/guards/tenant-throttler.guard.ts (recreated guard)
  - backend/api-gateway/src/health/health.controller.ts (SkipThrottle default+tenant)
  - backend/api-gateway/src/main.ts, backend/auth-service/src/main.ts, backend/school-service/src/main.ts (shared root imports)
  - backend/shared/src/index.ts, backend/shared/src/filters/error-codes.ts, backend/shared/src/filters/http-exception.filter.ts
- Rationale:
  - Fix runtime resolution failure from @xceliqos/shared/src/* imports.
  - Reinstate dropped throttler wiring.
  - Ensure health endpoints bypass both default and named tenant throttles.
- Open threads:
  - Keep DB host/runtime alignment between Docker and local shell starts.
- Dependencies:
  - shared build required before gateway/auth/school builds.
  - postgres required up for runtime smoke tests.
- Architectural state:
  - /api/health exempt verified under burst.
  - non-exempt routes throttle verified with 429 under burst.
