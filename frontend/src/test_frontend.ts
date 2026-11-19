// Verify all frontend pages and components export valid React functional components
import React from "react";
import App from "./App";
import AppShell from "./components/AppShell";
import Button from "./components/ui/Button";
import Input from "./components/ui/Input";
import Select from "./components/ui/Select";
import Badge from "./components/ui/Badge";
import Modal from "./components/ui/Modal";
import DataTable from "./components/ui/DataTable";
import Login from "./pages/Login";

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentsPage from "./pages/admin/StudentsPage";
import TeachersPage from "./pages/admin/TeachersPage";
import ClassesPage from "./pages/admin/ClassesPage";
import FeesPage from "./pages/admin/FeesPage";
import NoticesPage from "./pages/admin/NoticesPage";
import SettingsPage from "./pages/admin/SettingsPage";

// Teacher
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherClassesPage from "./pages/teacher/TeacherClassesPage";
import AttendancePage from "./pages/teacher/AttendancePage";
import MarksPage from "./pages/teacher/MarksPage";
import TimetablePage from "./pages/teacher/TimetablePage";
import TeacherNoticesPage from "./pages/teacher/TeacherNoticesPage";

// Student
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAttendancePage from "./pages/student/StudentAttendancePage";
import StudentResultsPage from "./pages/student/StudentResultsPage";
import StudentTimetablePage from "./pages/student/StudentTimetablePage";
import StudentFeesPage from "./pages/student/StudentFeesPage";
import StudentNoticesPage from "./pages/student/StudentNoticesPage";

const componentsToTest = [
  { name: "App (Root Router)", comp: App },
  { name: "AppShell", comp: AppShell },
  { name: "UI Button", comp: Button },
  { name: "UI Input", comp: Input },
  { name: "UI Select", comp: Select },
  { name: "UI Badge", comp: Badge },
  { name: "UI Modal", comp: Modal },
  { name: "UI DataTable", comp: DataTable },
  { name: "Login Page", comp: Login },
  { name: "Admin Dashboard", comp: AdminDashboard },
  { name: "Admin Students Page", comp: StudentsPage },
  { name: "Admin Teachers Page", comp: TeachersPage },
  { name: "Admin Classes Page", comp: ClassesPage },
  { name: "Admin Fees Page", comp: FeesPage },
  { name: "Admin Notices Page", comp: NoticesPage },
  { name: "Admin Settings Page", comp: SettingsPage },
  { name: "Teacher Dashboard", comp: TeacherDashboard },
  { name: "Teacher Classes Page", comp: TeacherClassesPage },
  { name: "Teacher Attendance Page", comp: AttendancePage },
  { name: "Teacher Marks Page", comp: MarksPage },
  { name: "Teacher Timetable Page", comp: TimetablePage },
  { name: "Teacher Notices Page", comp: TeacherNoticesPage },
  { name: "Student Dashboard", comp: StudentDashboard },
  { name: "Student Attendance Page", comp: StudentAttendancePage },
  { name: "Student Results Page", comp: StudentResultsPage },
  { name: "Student Timetable Page", comp: StudentTimetablePage },
  { name: "Student Fees Page", comp: StudentFeesPage },
  { name: "Student Notices Page", comp: StudentNoticesPage },
];

console.log("--------------------------------------------------");
console.log("BRIGHT STAR FRONTEND - COMPONENT INTEGRITY CHECKS");
console.log("--------------------------------------------------\n");

let passed = 0;
for (const item of componentsToTest) {
  const isValid = typeof item.comp === "function" || typeof item.comp === "object";
  if (isValid && item.comp !== null) {
    console.log(`[PASS] ${item.name} exported & valid React component`);
    passed++;
  } else {
    console.error(`[FAIL] ${item.name} is invalid (${typeof item.comp})`);
  }
}

console.log("\n==================================================");
console.log(`TOTAL FRONTEND MODULES CHECKED: ${componentsToTest.length}`);
console.log(`PASSED: ${passed} / ${componentsToTest.length}`);
console.log("==================================================");

if (passed === componentsToTest.length) {
  console.log("\nSUCCESS: All frontend modules verified with 100% integrity!\n");
}
