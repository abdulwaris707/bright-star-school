import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell, { NavItem } from "./components/AppShell";
import Login from "./pages/Login";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import ClassesPage from "./pages/admin/ClassesPage";
import SubjectsPage from "./pages/admin/SubjectsPage";
import TeacherAttendancePage from "./pages/admin/TeacherAttendancePage";
import TeacherLeavesPage from "./pages/admin/TeacherLeavesPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";
import FeesPage from "./pages/admin/FeesPage";
import SalariesPage from "./pages/admin/SalariesPage";
import NoticesPage from "./pages/admin/NoticesPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Teacher Pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClassesPage from "./pages/teacher/TeacherClassesPage";
import AttendancePage from "./pages/teacher/AttendancePage";
import HomeworkPage from "./pages/teacher/HomeworkPage";
import TeacherStudentsPage from "./pages/teacher/TeacherStudentsPage";
import TeacherLeavesAppPage from "./pages/teacher/TeacherLeavesPage";
import MarksPage from "./pages/teacher/MarksPage";
import TimetablePage from "./pages/teacher/TimetablePage";
import TeacherNoticesPage from "./pages/teacher/TeacherNoticesPage";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentHomeworkPage from "./pages/student/StudentHomeworkPage";
import StudentAttendancePage from "./pages/student/StudentAttendancePage";
import StudentResultsPage from "./pages/student/StudentResultsPage";
import StudentTimetablePage from "./pages/student/StudentTimetablePage";
import StudentFeesPage from "./pages/student/StudentFeesPage";
import StudentNoticesPage from "./pages/student/StudentNoticesPage";

const ADMIN_NAV: NavItem[] = [
  { label: "Dashboard", path: "/admin" },
  { label: "Analytics & Graphs", path: "/admin/analytics" },
  { label: "Students", path: "/admin/students" },
  { label: "Teachers", path: "/admin/teachers" },
  { label: "Classes & Mapping", path: "/admin/classes" },
  { label: "Subjects", path: "/admin/subjects" },
  { label: "Faculty Attendance", path: "/admin/teacher-attendance" },
  { label: "Leaves & Coverage", path: "/admin/leaves" },
  { label: "Fees & Challans", path: "/admin/fees" },
  { label: "Teacher Payroll", path: "/admin/salaries" },
  { label: "Notices", path: "/admin/notices" },
  { label: "Audit Trail", path: "/admin/audit-logs" },
  { label: "Settings", path: "/admin/settings" },
];

const TEACHER_NAV: NavItem[] = [
  { label: "Dashboard", path: "/teacher" },
  { label: "My Classes", path: "/teacher/classes" },
  { label: "Daily Attendance", path: "/teacher/attendance" },
  { label: "Homework & Tasks", path: "/teacher/homework" },
  { label: "Student Directory", path: "/teacher/students" },
  { label: "Leave Requests", path: "/teacher/leaves" },
  { label: "Marks Entry", path: "/teacher/marks" },
  { label: "Timetable", path: "/teacher/timetable" },
  { label: "Notices", path: "/teacher/notices" },
];

const STUDENT_NAV: NavItem[] = [
  { label: "Dashboard", path: "/student" },
  { label: "Homework & Tasks", path: "/student/homework" },
  { label: "Attendance", path: "/student/attendance" },
  { label: "Results & DMC", path: "/student/results" },
  { label: "Timetable", path: "/student/timetable" },
  { label: "Fees", path: "/student/fees" },
  { label: "Notices", path: "/student/notices" },
];

export const App: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect to /login */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Login Page */}
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <AdminDashboard />
          </AppShell>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <AnalyticsPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/students"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <StudentsPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <TeachersPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/classes"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <ClassesPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/subjects"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <SubjectsPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/teacher-attendance"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <TeacherAttendancePage />
          </AppShell>
        }
      />
      <Route
        path="/admin/leaves"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <TeacherLeavesPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <AuditLogsPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/fees"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <FeesPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/salaries"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <SalariesPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/notices"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <NoticesPage />
          </AppShell>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AppShell role="admin" navItems={ADMIN_NAV}>
            <SettingsPage />
          </AppShell>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <TeacherDashboard />
          </AppShell>
        }
      />
      <Route
        path="/teacher/classes"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <TeacherClassesPage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/attendance"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <AttendancePage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/homework"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <HomeworkPage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/students"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <TeacherStudentsPage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/leaves"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <TeacherLeavesAppPage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/marks"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <MarksPage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/timetable"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <TimetablePage />
          </AppShell>
        }
      />
      <Route
        path="/teacher/notices"
        element={
          <AppShell role="teacher" navItems={TEACHER_NAV}>
            <TeacherNoticesPage />
          </AppShell>
        }
      />

      {/* Student Routes */}
      <Route
        path="/student"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentDashboard />
          </AppShell>
        }
      />
      <Route
        path="/student/homework"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentHomeworkPage />
          </AppShell>
        }
      />
      <Route
        path="/student/attendance"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentAttendancePage />
          </AppShell>
        }
      />
      <Route
        path="/student/results"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentResultsPage />
          </AppShell>
        }
      />
      <Route
        path="/student/timetable"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentTimetablePage />
          </AppShell>
        }
      />
      <Route
        path="/student/fees"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentFeesPage />
          </AppShell>
        }
      />
      <Route
        path="/student/notices"
        element={
          <AppShell role="student" navItems={STUDENT_NAV}>
            <StudentNoticesPage />
          </AppShell>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;
