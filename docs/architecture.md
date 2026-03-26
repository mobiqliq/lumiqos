# LumiqOS Architecture

LumiqOS is an AI-powered operating system for modern schools that prioritizes Multi-Tenancy, Role-Based Access Control (RBAC), and Tenant Data Isolation out-of-the-box.

## Multi-Tenant SaaS Model

The architecture is designed to support thousands of schools operating independently on a shared infrastructure instance without data leakage.

### Shared Database Strategy (MVP)
For rapid delivery of the Initial Prototype (MVP), we utilize a **Shared Database, Shared Schema** model using PostgreSQL:
- **`lumiqos` database**: All data from all microservices resides here.
- Entities (`schools`, `users`, `roles`, `permissions`) share relational connections.
- Microservice boundaries govern API access to this data (e.g., `school-service` handles all `/schools` mutations).

## Role-Based Access Control (RBAC)

RBAC governs every user action in the system. The hierarchy relies on standard `Role` types pre-seeded during school onboarding:
- Super Admin
- School Owner
- Principal
- Teacher
- Parent
- Student

### JWT Context
Authentication tokens encode critical identity parameters:
- `user_id`
- `school_id`
- `role`
- `permissions` (Flattened array: `module:action`)

This eliminates database hits on every request while checking permissions:
- Guard: `@RequirePermissions('finance:read')` verifies the token contains `finance:read`.

## Tenant Isolation Mechanism

Data leakage is the largest risk in multi-tenant shared-schema architectures. LumiqOS mitigates this using a **3-Layer Isolation Approach**:

1. **Token Unpacking**: `JwtAuthGuard` extracts `school_id` from the secure payload.
2. **Execution Context**: `TenantInterceptor` uses Node.js `AsyncLocalStorage` to store the Context Payload for the lifecycle of that request.
3. **Repository Interception**: A custom `TenantRepository` extending `TypeORM` intercepts all read/write queries globally and automatically applies a `AND WHERE school_id = context.school_id` clause. This ensures developers cannot accidentally fetch cross-tenant data.

*(Super Admins have distinct routing mechanisms allowing them to bypass the `school_id` filter when resolving cross-tenant aggregate analytics).*

## Academic Hierarchy Model

The structural foundation of a multi-tenant LumiqOS School operates upon the following extensible hierarchy:

\`\`\`text
School
 └ Academic Year
    └ Classes
       └ Sections
          └ Subjects
             └ Teacher Assignments
\`\`\`

- **Academic Year**: Only one active tracking year exists at any epoch.
- **Classes**: Represent abstract grade paradigms (e.g. "Grade 10").
- **Sections**: Represent physical cohorts within that grade (e.g. "Grade 10 - Section A").
- **Subjects**: Independent domains of study, universally categorized per school.
- **Teacher Assignments**: Highly normalized mapping binding a User (`role=teacher`), Subject, Class, and Section into one discrete unit of accountability.

## Student Lifecycle Model

The Student entity acts as the central anchor for all individual academic and behavioral history across years. The lifecycle maps as follows:

```text
Student
 ├ Guardians
 ├ Documents
 ├ Health Records
 └ Enrollments (per Academic Year)
```

- **Student Status**: A robust `status` enum (`active`, `inactive`, `transferred`, `graduated`, `archived`) manages the progression of a student. System integrity requires using soft-deletes (`status = archived`) to preserve historical attendance, financial, and academic records.
- **Admission Integrity**: A strict constraint enforces unique `admission_number` per school.
- **Guardians**: A student can have multiple guardians (parents, relatives), governed by an `is_primary_guardian` flag for system notifications and app access. The system enforces that there is only **one** primary guardian per student.
- **Enrollments**: A mapping associating the Student to an Academic Year, Class, and Section. A student may logically hold only ONE `active` enrollment per academic year to prevent duplicate grading tracking. Promotion logic completes the historical record (`status = completed`) and mints a new active one for the target academic year.

## Attendance Data Model

The Attendance Engine records daily attendance events with an optimized composite structure for fast retrieval and bulk operations. The lifecycle maps as follows:

```text
AttendanceSession
 └ StudentAttendance
```

- **AttendanceSession**: Defines the cohort context (Class, Section, Subject, Date, Time, Teacher). This ensures no duplicate sessions exist for the same logical event block.
- **StudentAttendance**: Tied one-to-one with a `student_id` inside a `session_id`. Status is updated individually (`present`, `absent`, `late`, `excused`) but initially populated as `present` in bulk for performance optimization. An Event Emitter dispatches `student.absent` dynamically for parent notifications.

## Homework Data Model

The Homework & Assignment system manages teacher-led assignments and student-led submissions effectively, laying groundwork for future AI grading features.

```text
HomeworkAssignment
 └ HomeworkSubmission
```

- **HomeworkAssignment**: Links a Teacher to a specific Class/Section/Subject. Tracks descriptions, attachments, and due dates. Employs editing locks to protect modifications after submissions begin.
- **HomeworkSubmission**: Unique mapping per `student_id` to an assignment. Enforces grade locking logic and late marking based on automatic temporal checks against the assignment due date. Support for future AI inference scores.

## Assessment Data Model

The Assessment & Exam Engine governs test schedules, subjects mapping, mark validation, and automated grading loops.

```text
ExamType
 └ Exam
    └ ExamSubject
       └ StudentMarks
```

- **ExamType**: Defines broad event classifications like Unit Test or Semi-Finals holding global weightage scales.
- **Exam**: Instantiation mapping a Type to an Academic Year within a Date Range enforcing the master publishing `status`.
- **ExamSubject**: Maps exact Subjects to Classes/Sections binding `max_marks` limitations logic preventing overgrading.
- **StudentMarks**: Final output mapped individually retaining auto-calculated `grade` scales (e.g., A/B/C/D) via non-overlapping grading band logic. Securely locks modifications instantly upon Exam publication.

## Report Card Data Model

Translates raw assessment and marks data into aggregated standardized forms with rankings.

```text
ReportCard
 └ ReportCardSubject
```

- **ReportCard**: Aggregates all completed or missing assessments computing standard `percentage`, bounding against `GradeScale` entities yielding the `overall_grade`, and algorithmically compiling a class-wide `rank` (with `null` safety for absent markers).
- **ReportCardSubject**: Child entity explicitly storing individualized feedback, teacher remarks, and subject-level grades per student per exam cycle. Validates explicitly against missing flags (e.g. `status = 'missing'`) preventing raw zeros from crashing standard percentage calculations.

## Communication Data Model

Manages real-time automated and direct interactions between the school, teachers, and parents.

```text
Notification
 └ NotificationRecipient

MessageThread
 └ Message
```

- **Notification**: A centralized broad-cast payload carrying specific categories (e.g., `attendance_alert`, `announcement`). Dispatched to targets efficiently.
- **NotificationRecipient**: The fan-out relation tracking individual Inbox drops for optimized cross-parent broadcasting mappings via relational graphs, equipped with `read_status` tracking.
- **MessageThread**: The 1-on-1 isolated connection establishing RBAC validation exclusively between Authorized Teachers and Verified Parent/Guardians preventing scope leaks.
- **Message**: Immutable chat entries indexed purely to the internal thread ensuring robust historical integrity tracking.

## Finance Data Model

Provides configurable billing components capable of handling class-oriented templates scaling down to individual student transactional ledgers.

```text
FeeCategory
 └ FeeStructure

StudentFeeAccount
 └ FeeInvoice
    └ FeePayment
```

- **FeeCategory**: The root classification identifying streams like Tuition or Transportation uniquely.
- **FeeStructure**: Automatically templates pricing targets against precise Classes utilizing dynamic combinations of categorical assignments.
- **StudentFeeAccount**: Master accumulator rolling all categorical invoices into unified Ledger representations per-student natively (`balance`, tracking remaining totals).
- **FeeInvoice**: Generating explicitly matched billing boundaries preventing exact duplicates across periods (`[student, academic_year, fee_category, due_date]`) natively. Includes exact `remaining_balance` calculations scaling partial payment thresholds securely.
- **FeePayment**: Appends inherently immutable ledger entries verifying `payment_method` rules continuously—safeguarding against accidental deletions and locking overpayments strictly.

## Dashboard Data Model

Provides high-performance aggregated snapshots querying over complex relational domains scoped sequentially.

```text
Dashboard Aggregation Layer
 ├ Students
 ├ Attendance
 ├ Academics
 ├ Homework
 ├ Finance
 └ Communication
```

- **Metrics Collection**: Runs isolated `.sum()`, `.count()`, and `.avg()` triggers synchronously across active structures mapping current properties securely.
- **Tenant Bounding**: Enforces raw bounds linking explicitly to `Active Academic Year` states preventing historical data skewing current operation tracking natively.

## Teacher Workflow Layer

Fast API paths specifically mapped for Mobile experiences prioritizing minimal payload transmissions and maximum RBAC encapsulation.

```text
Teacher Workflow Layer
 ├ Teacher Dashboard
 ├ Class Sessions
 ├ Quick Attendance
 ├ Homework Assignment
 ├ Homework Submissions
 └ Teacher Messaging
```

- **Quick Attendance**: Maps sparse `exceptions` payload lists iterating backwards automatically setting `present` defaults natively checking only against globally Active Enrollments minimizing input requirements severely.
- **Homework Assign & Grade**: Validates dynamically against `teacher_subject` bounding hooks rendering it impossible for unauthorized class interactions securely updating global assignment nodes.
- **Dashboard Mapping**: Connects natively onto individual message thread previews blocking global scans utilizing `Promise.all` aggregation endpoints limiting response buffers < 200ms natively.

## Parent Mobile Layer

Read-Only high-performance API mapping extracting child-specific aggregated states linking deeply connected Guardian maps robustly shielding cross-family scopes dynamically.

```text
Parent Mobile Layer
 ├ Parent Dashboard
 ├ Attendance Tracking
 ├ Homework Monitoring
 ├ Report Cards
 ├ Fee Status
 └ Messaging
```

- **Guardian Isolation**: Natively queries the `StudentGuardian` bounds explicitly before routing any `:student_id`. A multi-child parent retrieves each specific timeline cleanly whereas unauthorized bounds trip native `403` exceptions gracefully.
- **Data Fidelity Constraints**: Enforces mapping on explicit DB-native bounds: Fetching `Paid` values dynamically through aggregate sums mapped over exact `FeePayment` records natively, and dropping `overdue` counts correctly mapped across past-due thresholds seamlessly.

## Strategic Layer (School Intelligence Cloud)
LumiqOS transforms from an ERP into a Multi-Region Investor-Grade SaaS platform tracking Executive forecasts natively isolating generic billing structures formally.

```text
Strategic Layer
 ├ Command Center
 ├ Predictive Operations
 └ SaaS Provisioning (billing-service)
```

- **SaaS Provisioning (`POST /saas/tenants/onboard`)**: Fully automated global provisioning logic instantiating `School`, `AcademicYear`, Default `Role`, and assigning `TenantSubscription` states natively bounding `region` drops globally.
- **Analytics Snapshot Table (`AnalyticsSnapshot`)**: Command Center queries track trailing daily aggregated snapshots cleanly bypassing LIVE DB scans ensuring operational integrity persists dynamically protecting performance limits.
- **Strategic Aggregations**: AI engines predict dropouts, teacher workloads (`>5 classes`, `>20 sessions`), and financial projections scaling safely tracking historical DB vectors implicitly gracefully.

## Global 5-Tier Architecture Tree

```text
LumiqOS Enterprise
│
├ Platform Layer
│   ├ API Gateway
│   ├ Auth Service
│   └ Tenant Management
│
├ Operational Layer
│   └ School Service
│
├ Experience Layer
│   ├ Teacher Mobile APIs
│   └ Parent Mobile APIs
│
├ Intelligence Layer
│   ├ AI Service
│   ├ Student Intelligence Graph
│   ├ AI Teacher Copilot (Generative Logic)
│   └ Parent Engagement Network
│
└ Strategic Layer
    ├ AI Command Center
    ├ Predictive Operations
    └ SaaS Infrastructure
```

## Running LumiqOS with Docker

LumiqOS supports full local development using Docker Compose. A single command launches the entire microservices platform including the PostgreSQL database.

### Prerequisites
- Docker Desktop installed and running

### Quick Start

```bash
# From the project root (school-intelligence-os/)
docker compose up --build
```

### Services & Ports

| Service | Container Name | Port | URL |
|---------|---------------|------|-----|
| API Gateway | lumiqos_gateway | 3000 | http://localhost:3000 |
| School Service | lumiqos_school | 3001 | http://localhost:3001 |
| Auth Service | lumiqos_auth | 3002 | http://localhost:3002 |
| AI Service | lumiqos_ai | 3005 | http://localhost:3005 |
| Billing Service | lumiqos_billing | 3006 | http://localhost:3006 |
| PostgreSQL | lumiqos_db | 5432 | localhost:5432 |

### Health Checks

Each service exposes a `GET /health` endpoint:
```bash
curl http://localhost:3000/health   # API Gateway
curl http://localhost:3001/health   # School Service
curl http://localhost:3002/health   # Auth Service
curl http://localhost:3005/health   # AI Service
curl http://localhost:3006/health   # Billing Service
```

### Environment Configuration

Docker services use the following database connection:
- **Host**: `postgres` (Docker service name)
- **Port**: `5432`
- **User**: `lumiq`
- **Password**: `lumiq`
- **Database**: `lumiqos`

Environment variables are set in `docker-compose.yml`. For local (non-Docker) development, services fall back to `localhost`.

### Stopping Services

```bash
docker compose down          # Stop containers
docker compose down -v       # Stop and remove database volume
```

