---
description: How to build a new module in XceliQOS following layered architecture
---

# Build Module Workflow

Follow these steps IN ORDER when adding any new module to XceliQOS.

## Pre-Flight
1. Read `BUILD_RULES.md`
2. Read `ARCHITECTURE_MEMORY.md`
3. Read `BUILD_ORDER.md` — identify the current phase
4. Confirm the module does not already exist

## Layer 1: Schema
5. Create entity file in `backend/shared/src/entities/{name}.entity.ts`
6. Export from `backend/shared/src/entities/index.ts`
7. Register in the target service's `AppModule` TypeORM imports
// turbo
8. Run `npm run build` in the service to verify entity compiles

## Layer 2: Service
9. Create `{name}.service.ts` in the target service module folder
10. Inject repositories and implement business logic
11. Create `{name}.module.ts` — imports TypeORM, provides service

## Layer 3: Controller
12. Create `{name}.controller.ts` with REST endpoints
13. Apply `@UseGuards(JwtAuthGuard)` at controller level
14. Register controller in the module

## Layer 4: Gateway
15. Add proxy route in `backend/api-gateway/src/main.ts`

## Layer 5: Frontend (if applicable)
16. Create React page in `frontend/school-portal/src/pages/{Name}.jsx`
17. Add route in `App.jsx`
18. Connect to API via axios

## Post-Flight
// turbo
19. Run `npm run build` in affected services
20. Verify with `curl` that the endpoint responds
21. Commit to GitHub: `git add -A && git commit -m "[layer] module: description"`
22. Update `BUILD_ORDER.md` with the new phase
