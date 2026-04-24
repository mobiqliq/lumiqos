# Session Mind Map — 2026-04-23 Phase 31 Sprint 3 In Progress

## Commits This Session
- 4841933 feat(31.4): XceliQChat
- f969f99 docs: ARCHITECTURE_MEMORY 31.4
- 2ea9d82 feat(31.5): Parent-School Comms + guardian enrichment
- last    feat(31.6): Homework Transparency Triangle
- 3666973 docs: ARCHITECTURE_MEMORY Sprint 2 COMPLETE
- 5566926 feat(31.7): Exam Engine + Board Syllabus + Curriculum Map + docs

## Sprint Status
- Sprint 2 (31.4-31.6): COMPLETE
- Sprint 3 (31.7): COMPLETE — 31.8, 31.9 pending

## New Entities This Session (Sprint 3)
- QuestionBank, ExamQuestion, ExamAnswerSheet, StudentAnswerSheet
- ItemAnalysis, BoardSyllabus, SchoolCurriculumMap

## New Modules (school-service)
- ExamEngineModule

## New Gateway Controllers
- exam-engine.controller.ts

## Key Decisions
- School.board field already existed — used as board_affiliation, no entity modification
- board_id stored in QuestionBank.metadata (jsonb) — avoids schema change to legacy entity
- BoardSyllabus: operator-managed canonical, never school-editable
- SchoolCurriculumMap: school-managed, academic_year scoped, archive never delete, restore detection
- StudentAnswerSheet: teacher_confirmed mandatory before result_notified — architectural invariant
- ItemAnalysis: point-biserial discrimination approximation (top/bottom half split)
- flagReason null→undefined fix required for TypeORM update overload

## Open Threads
- 31.8: Curriculum Calendar v2.0 (depends on 31.0 periods — ready)
- 31.9: XceliQRevise (Spaced Repetition)
- OCR/Vision API integration for StudentAnswerSheet — deferred (needs image upload infra)
- BoardSyllabus operator UI (admin dashboard) — deferred to frontend sprint
- PDF answer sheet generation (puppeteer/pdfkit) — deferred to frontend sprint

## Architecture State (end of session)
- 20+ modules in school-service
- 30+ gateway controllers
- 60+ shared entities
- All containers running and healthy
