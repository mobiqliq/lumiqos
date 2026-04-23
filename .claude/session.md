# XceliQOS Session — Phase 28
Last updated: 2026-04-21
Branch: main | Last commit: 6da5c4b

## Phase 28 Progress
- [x] Priority 1 — Seed staff data ✅
- [x] Priority 2 — Wire auth service ✅
- [x] Priority 3 — Gateway proxies for remaining modules ✅
- [x] Priority 4 — Fix AI service ✅
- [ ] Priority 5 — API versioning
- [ ] Priority 6 — Replace synchronize:true with migrations
- [ ] Priority 7 — Typography/design consistency
- [ ] Priority 8 — Admin dashboard analytics pages

## Services Status
- api-gateway:3000 ✅
- school-service:3001 ✅
- auth-service:3002 ✅
- ai-service:3005 ✅ (OPENAI_API_KEY set, gitignored)
- frontend:5173 ✅
- postgres:5432 ✅

## Verified Live Endpoints
- POST /api/auth/login → JWT ✅
- GET /api/hr/overview → 8 staff ✅
- GET /api/dashboard/overview → 200 ✅
- GET /api/finance/overview → 200 ✅
- GET /api/substitution/absences → 200 ✅
- GET /api/exams → 200 ✅
- GET /api/homework/class → 200 ✅
- GET /api/report-cards/class?exam_id=...&class_id=... → 200 ✅
- GET /api/intelligence-graph/class/:id/heatmap → mastery data ✅
- GET /api/intelligence-graph/student/:id/radar → radar data ✅

## Known Issues / Constraints
- Communication endpoints require JWT user context (by design)
- permissions[] empty in JWT — RolePermission not linked to seeded roles
- synchronize:true still in TypeORM (Priority 6)
- No report card data until exams/marks entered via teacher flow
- backend/ai-service/.env gitignored — must manually set OPENAI_API_KEY on fresh clone

## Next Step
Priority 5: API versioning — implement /api/v1/ prefix pattern across all routes.
Impact: ALL frontend fetch calls must be updated. High blast radius — seek confirmation before proceeding.
