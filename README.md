# Bright Star School Management System (SMS) - Production Monorepo

A production-ready, full-stack School Management System (SMS) built as a monorepo featuring **React 18 + Vite + TypeScript + Plain CSS** on the frontend and **Node.js + Express + TypeScript + Drizzle ORM** on the backend.

---

## 📁 Repository Structure

```text
school-portal/
├── frontend/             # React 18 + Vite + TypeScript + Plain CSS (React Router v6)
│   ├── src/
│   │   ├── components/   # AppShell, UI components, ChallanModal, ReportCardModal, StudentIdCardModal, SmsBroadcastModal
│   │   ├── lib/          # api.ts (native fetch wrapper with Bearer token & automatic error parsing)
│   │   ├── pages/
│   │   │   ├── admin/    # Admin Dashboard, Students, Teachers, Classes & Mapping, Subjects, Teacher Attendance, Leaves, Fees, Notices, Audit Trail, Settings
│   │   │   ├── teacher/  # Teacher Dashboard, My Classes, Daily Attendance, Homework & Tasks, Student Directory, Leave Requests, Marks Entry, Timetable, Notices
│   │   │   ├── student/  # Student Dashboard, Homework Planner, Attendance History, Results & DMC, Timetable, Fees & Vouchers, Circulars
│   │   │   └── Login.tsx # Unified authentication portal with role auto-detection
│   │   ├── styles/       # tokens.css (light/dark variables), global.css, ui.css, appshell.css
│   │   ├── config.ts     # SCHOOL_NAME and API_BASE_URL
│   │   ├── App.tsx       # Route definitions for all 3 roles
│   │   └── main.tsx      # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts    # Port 3000
│
├── backend/              # Node.js + Express + TypeScript + Drizzle ORM
│   ├── src/
│   │   ├── config/env.ts # Zod-validated environment config
│   │   ├── db/schema.ts  # Full relational Drizzle schema for all 8 modules + existing tables
│   │   ├── middleware/   # authMiddleware (JWT), rbacMiddleware (RBAC guards)
│   │   ├── controllers/  # authController, schoolController (all 8 modules + academic operations)
│   │   ├── services/     # store.ts (data store, audit logging, daily rotating PIN generator)
│   │   ├── routes/       # Central Express router mounting authenticated & RBAC endpoints
│   │   ├── app.ts        # Express app configuration & CORS
│   │   ├── index.ts      # Server entry point on PORT 4000
│   │   └── test_features.ts # Automated end-to-end integration test suite (26 tests)
│   ├── package.json
│   └── tsconfig.json
│
└── README.md             # System documentation & deployment guide
```

---

## 🔐 Demo Credentials for Multi-Role Testing

| Role | Username | Password | Profile & Institutional Privileges |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin123` | **Principal Office** &bull; Full administrative CRUD, subject mapping, teacher attendance verification, leave reviews, and tamper-resistant audit trail. |
| **Teacher 1** | `teacher` (or `tariq`) | `teacher123` | **Sir Tariq Aziz** &bull; **Class In-Charge of Class 10 (Blue)**. Has exclusive authority to take student attendance for Class 10 Blue, assign Physics homework, and submit daily check-in. |
| **Teacher 2** | `teacher2` (or `farzana`) | `teacher123` | **Madam Farzana Kausar** &bull; **Class In-Charge of Class 10 (Green)**. Has exclusive authority for Class 10 Green. *(Attempting to mark attendance for Class 10 Blue triggers strict 403 Forbidden RBAC).* |
| **Student** | `student` | `student123` | **Muhammad Hamza** &bull; Enrolled in Class 10 (Blue). Real-time access to assigned homework, attendance rate, transcript report cards, and fee challans. |

---

## 🏛️ Comprehensive Architecture: The 8 Integrated Modules

### Module 1: Admin Core Entity Management (Full CRUD)
- **Teachers CRUD**: Profile details, NADRA/Emp ID (`TCH-001`), academic rank/designation, qualification, subject specialization, contact info, and soft-delete safeguards.
- **Students CRUD**: Admission roll numbers, full name, NADRA B-Form (`bFormNo`), Father CNIC (`fatherCnic`), guardian phone, fee concession tier, and soft-delete.
- **Classes & Sections**: Grade levels, section letters, room allocations, student capacity limits.
- **Subjects CRUD**: Code (`MTH-101`), curriculum scope, classification (Compulsory / Elective), weekly periods allocation.

### Module 2: Academic Mapping & Class Teacher In-Charge Assignment
- **Subject-to-Class Mapping**: Dynamically link curriculum subjects to grade sections.
- **Teacher-to-Subject/Class Mapping**: Assign qualified faculty to teach designated subjects in specific classrooms.
- **Class Teacher In-Charge Designation**: Enforces exactly one primary Class Teacher In-Charge per section per active academic session.
- **In-Charge Reassignment History**: Permanent historical ledger of past class in-charge designations with timestamps and reasons.

### Module 3: Restricted Student Attendance (Class Teacher In-Charge Only)
- **Strict RBAC Enforcement**:
  - **Class Teacher In-Charge (or Admin)**: Full submission & modification privileges (`Present`, `Absent`, `Late`, `Leave`), with bulk marking tools.
  - **Non-Incharge Faculty**: Blocked at both UI level (read-only mode with alert banner) and API middleware level (`403 Forbidden`).
  - **Duplicate Prevention**: Re-marking on the same date safely updates records without inflating totals.

### Module 4: Authentic Teacher Attendance & Verification System (Admin)
- **Daily Rotating PIN/QR Token**: Generated daily (`BST-XXXX`) with automatic expiration at 23:59:59.
- **Teacher Self Check-In**: Faculty log authentic arrival time on their dashboard using the security code.
- **Admin Verification Console**: Real-time faculty status table with 1-click approvals and direct manual override with mandatory audit remarks.

### Module 5: Teacher Leave/Absence & Real-Time Admin Notification System
- **Faculty Leave Application**: Teachers apply for Casual, Sick, or Emergency leaves with dates and reasons.
- **Automated Affected Class Calculation**: The system automatically computes scheduled timetable periods affected by the teacher's absence.
- **In-App Topbar Bell**: Admin receives instant alerts with an unread badge counter in the topbar.
- **Substitute Teacher Assignment**: Admin reviews leave, designates substitute coverage from active teachers, and enters directions.

### Module 6: Teacher Portal — Homework & Task Assignment Module
- **Scoped Assignment**: Teachers create, edit, and delete homework assignments strictly for classes and subjects mapped to them.
- **Student Homework Planner**: Students view active syllabus tasks, submission deadlines, and maximum marks, with a persistent completion checklist.

### Module 7: Scoped Student Record Management & Transfer
- **Faculty Directory**: Teachers inspect academic profiles, update guardian contacts, and record student conduct remarks for pupils under their care.
- **Class Transfer Engine**: Admin can transfer students across classes and sections, automatically adjusting classroom strengths with full audit logging.

### Module 8: Security, RBAC Middleware & Tamper-Resistant Audit Logging
- **RBAC Middleware**: `requireRoles`, `requireClassInchargeOrAdmin`, and `requireAssignedTeacherOrAdmin` guard all mutation endpoints.
- **Unified Audit Trail Viewer**: Filterable security log showing actor, role, timestamp, action (`CREATE`, `UPDATE`, `DELETE`, `OVERRIDE`, `TRANSFER`, `APPROVE_LEAVE`), and old vs new values.

---

## 🚀 How to Run

### 1. Start the Backend API (Port 4000)
```bash
cd backend
npm install
npm run dev
```

### 2. Start the Frontend UI (Port 3000)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 Automated Test Suite (26 Integration Tests)

Run the backend test suite:
```bash
cd backend
npm test
```
Result: **26 / 26 tests passed (100% success rate)**.

To compile both TypeScript projects for production:
```bash
cd backend && npm run build
cd ../frontend && npm run build
```
Both commands finish with **zero errors**.
