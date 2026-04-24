# Session Mind Map — 2026-04-24 Phase 31 Sprint 3 COMPLETE

## Commits This Session
- 4841933 feat(31.4): XceliQChat
- f969f99 docs: ARCHITECTURE_MEMORY 31.4
- 2ea9d82 feat(31.5): Parent-School Comms + guardian enrichment
- feat(31.6): Homework Transparency Triangle
- 3666973 docs: Sprint 2 COMPLETE
- 5566926 feat(31.7): Exam Engine + Board Syllabus + Curriculum Map
- docs: Sprint 3 in progress
- feat(31.8): Curriculum Calendar v2.0
- feat(31.9): XceliQRevise Spaced Repetition
- 7aa62d4 docs: Sprint 3 COMPLETE

## Sprint Status
- Sprint 2 (31.4-31.6): COMPLETE
- Sprint 3 (31.7-31.9): COMPLETE
- Sprint 4 (31.10-31.12): PENDING

## All New Entities This Session
Sprint 2: ChatChannel, ChatMessage, ChatMember, ParentMessageThread, ParentMessage,
          BroadcastAnnouncement, BroadcastReadReceipt, HomeworkFeedback
Sprint 3: QuestionBank, ExamQuestion, ExamAnswerSheet, StudentAnswerSheet, ItemAnalysis,
          BoardSyllabus, SchoolCurriculumMap, CurriculumCalendar, CurriculumCalendarEntry,
          RetrievalTask, ForgettingCurve

## All New Modules (school-service)
XceliQChatModule, ParentCommsModule, HomeworkTransparencyModule,
ExamEngineModule, CurriculumCalendarModule, XceliQReviseModule

## All New Gateway Controllers
xceliq-chat, parent-comms, homework-transparency,
exam-engine, curriculum-calendar, xceliq-revise

## Key Architectural Decisions
- Global-first: IANA timezone, configurable working days, regulatory_framework enum covers 8 frameworks
- Board affiliation: School.board field (existed), QuestionBank.metadata.board_id (jsonb)
- Curriculum map: versioned+archived never deleted, one-click restore from history
- SM-2 algorithm: standard SuperMemo-2 implementation, ease_factor floor 1.3
- Ebbinghaus: R = e^(-t/S), stability grows with quality of recall
- Teacher confirmation mandatory before any result shared with student/parent
- Growth Mindset language in all encouragement notes

## Open Threads / Next Session
- Sprint 4: 31.10 XceliQ Assistant v1.0 (Role-Aware Context Injection)
- Sprint 4: 31.11 Predictive Analytics v1.0
- Sprint 4: 31.12 PTCM Intelligence
- OCR Vision API for StudentAnswerSheet (needs image upload infra)
- BoardSyllabus operator UI (admin dashboard frontend)
- PDF answer sheet generation (puppeteer)
- WebSocket layer for XceliQChat (Sprint 3 infra deferred)

## Architecture State
- school-service: 25+ modules
- api-gateway: 35+ controllers
- shared/entities: 70+ entities
- All containers healthy: db, school-service, api-gateway, auth-service, ai-service, frontend
