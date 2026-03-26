# LumiqOS — Phase Lock Protocol

> **No phase advances until the gate clears. No exceptions.**

---

## Phase Gate Checklist

Before moving to the next phase, ALL five conditions must be true:

| # | Gate | Check |
|---|------|-------|
| 1 | **Phase Completed** | Every task in the phase checklist is `[x]` |
| 2 | **Project Runs** | `npm run build` passes for all affected services. Frontend loads. No runtime errors. |
| 3 | **Commit Done** | All changes committed to GitHub with proper message format |
| 4 | **Snapshot Saved** | `BUILD_ORDER.md` updated with completion timestamp |
| 5 | **Architecture Unchanged** | No new entities, no renamed folders, no port changes outside the phase scope |

```
Phase N ──► [Gate] ──► Phase N+1
              │
              ├── ✔ phase completed
              ├── ✔ project runs
              ├── ✔ commit done
              ├── ✔ snapshot saved
              └── ✔ architecture unchanged
              
         ALL PASS? ──► proceed
         ANY FAIL? ──► fix in place, do NOT start next phase
```

---

## Gate Enforcement Rules

1. **No skipping** — Phase 3 cannot start if Phase 2 gate is open
2. **No parallel phases** — Only ONE phase is active at any time
3. **No scope creep** — If you discover work outside the current phase, log it in `BUILD_ORDER.md` as a future phase. Do NOT do it now.
4. **Fix in place** — If a gate check fails, fix it within the current phase. Never carry broken state forward.
5. **Rollback rule** — If a fix introduces a new break, `git stash` or `git revert` back to the last passing gate.

---

## Gate Verification Commands

```bash
# 1. Build check
cd backend/school-service && npm run build
cd backend/api-gateway && npm run build
cd backend/auth-service && npm run build

# 2. Runtime check  
node backend/api-gateway/dist/main.js &
node backend/school-service/dist/school-service/src/main.js &
curl http://localhost:3000/api/curriculum/teacher/assignments  # should return 200

# 3. Frontend check
cd frontend/school-portal && npm run dev
# Open http://localhost:5174 — should load without console errors

# 4. Commit
git add -A
git status  # review changes
git commit -m "[phase-N] description of what was completed"

# 5. Snapshot
# Update BUILD_ORDER.md with ✅ and timestamp
```

---

## Phase Snapshot Format

When a phase completes, record it in `BUILD_ORDER.md` like this:

```markdown
### Phase N: [Name] ✅
**Completed**: 2026-03-19
**Gate**: ✔ build ✔ runtime ✔ commit ✔ snapshot ✔ architecture
- [x] Task 1
- [x] Task 2
- [x] Task 3
```

---

## Current Phase Status

> **Active Phase**: 21 — Production Hardening  
> **Gate Status**: 🔓 OPEN (in progress)  
> **Previous Gate**: Phase 20 ✅ (Role-Based Attendance Insights)
