# LumiqOS — Build Rules (Read Once, Follow Always)

> **Project**: LumiqOS  
> **Type**: AI-First School Intelligence OS  
> **Architecture**: Layered Microservices (NestJS + React + PostgreSQL)

---

## Golden Rules

| # | Rule | Why |
|---|------|-----|
| 1 | **Never generate large code in one prompt** | Prevents hallucination, merge conflicts, and untestable blocks |
| 2 | **Always build module by module** | Each module = one testable, deployable unit |
| 3 | **Never change schema without migration** | Protects production data; every column change needs a TypeORM migration |
| 4 | **Never rename folders after creation** | Prevents broken imports, CI failures, and lost git history |
| 5 | **Always use same product name: LumiqOS** | Consistency in code, docs, UI, and communication |
| 6 | **Always load architecture before prompting AI** | AI must read `docs/architecture.md` + `ARCHITECTURE_MEMORY.md` first |
| 7 | **Never let AI invent new structure** | All new modules must follow the existing pattern in `BUILD_ORDER.md` |
| 8 | **Always save files before next step** | No orphan changes; every edit is persisted |
| 9 | **Always commit to GitHub after each step** | Atomic commits = safe rollback points |
| 10 | **If error, fix before continuing** | Never stack broken code; debug in place |

---

## Build Discipline

The system must grow like a building: **Foundation → Walls → Roof. Not random.**

```
❌ Wrong: Build UI → realize API missing → build API → realize schema missing
✅ Right: Schema → Service → API → UI (always bottom-up)
```

---

## Layer Order (Strict)

Every new feature MUST be built in this exact sequence:

| Layer | Name | Description |
|-------|------|-------------|
| 1 | **Core** | Shared entities, DTOs, constants, enums |
| 2 | **Schema** | TypeORM entities + migrations |
| 3 | **Events** | EventEmitter patterns, domain events |
| 4 | **Services** | Business logic (`.service.ts`) |
| 5 | **Task** | Background jobs, cron tasks |
| 6 | **Automation** | Workflow triggers, auto-notifications |
| 7 | **Crawler** | External data ingestion (board syllabi, etc.) |
| 8 | **Audit** | Logging, change tracking, compliance |
| 9 | **API** | Controllers, guards, interceptors |
| 10 | **UI** | React components, pages, hooks |
| 11 | **AI** | LLM prompts, AI service integrations |
| 12 | **Autopilot** | Autonomous AI agents, scheduled intelligence |

---

## Contracts

- **No module without contract** — Every module must have a defined interface before implementation
- **No code without spec** — Write the expected input/output before the function body
- **No UI before API** — Frontend only consumes; backend must exist first
- **No API before services** — Controllers are thin wrappers; logic lives in services
- **No services before schema** — You cannot query what doesn't exist in the DB

---

## File Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Entity | `{name}.entity.ts` | `student.entity.ts` |
| Service | `{name}.service.ts` | `attendance.service.ts` |
| Controller | `{name}.controller.ts` | `attendance.controller.ts` |
| Module | `{name}.module.ts` | `attendance.module.ts` |
| Migration | `{timestamp}-{description}.ts` | `1710000000000-add-board-to-school.ts` |
| React Page | `{Name}.jsx` | `LessonPlanner.jsx` |
| React Component | `{Name}.jsx` | `InsightCard.jsx` |

---

## Commit Message Format

```
[layer] module: description

Examples:
[schema] student: add health_records entity
[service] attendance: implement AI trend analysis
[api] curriculum: expose generate-lesson-plan HTTP endpoint
[ui] lesson-planner: connect to real assignment data
```

---

## Pre-Flight Checklist (Before Every Change)

- [ ] Read `docs/architecture.md`
- [ ] Read `ARCHITECTURE_MEMORY.md`
- [ ] Check `BUILD_ORDER.md` for current phase
- [ ] Identify which layer the change belongs to
- [ ] Confirm schema exists before writing service
- [ ] Confirm service exists before writing controller
- [ ] Confirm API exists before writing UI
- [ ] Save all files
- [ ] Run build to verify no errors
- [ ] Commit to GitHub
