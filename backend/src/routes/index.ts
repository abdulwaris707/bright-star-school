import { Router, Request, Response } from "express";
import { checkDbConnection } from "../db";
import { login, getCurrentUser } from "../controllers/authController";
import { authMiddleware, optionalAuth } from "../middleware/authMiddleware";
import {
  requireRoles,
  requireClassInchargeOrAdmin,
  requireAssignedTeacherOrAdmin,
} from "../middleware/rbacMiddleware";
import {
  // Module 1: Subjects
  getSubjects,
  getSubject,
  createSubject,
  updateSubject,
  deleteSubject,

  // Module 1 & 7: Students
  getStudents,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
  transferStudent,

  // Module 1: Teachers
  getTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,

  // Module 1: Classes
  getClasses,
  getClass,
  createClass,
  updateClass,
  deleteClass,

  // Module 2: Academic Mapping & Class In-Charge
  getClassSubjects,
  assignSubjectToClass,
  removeSubjectFromClass,
  getTeacherAssignments,
  assignTeacherToClassSubject,
  removeTeacherAssignment,
  assignClassIncharge,
  getClassInchargeHistory,

  // Module 3: Restricted Student Attendance
  getAttendance,
  saveAttendance,

  // Module 4: Teacher Attendance & Verification
  getDailyRotatingCode,
  teacherSelfCheckIn,
  getTeacherAttendance,
  adminVerifyTeacherAttendance,
  adminMarkTeacherAttendance,

  // Module 5: Teacher Leaves & Admin Notifications
  getTeacherLeaves,
  submitLeaveRequest,
  reviewLeaveRequest,
  getAdminNotifications,
  markNotificationRead,
  markAllNotificationsRead,

  // Module 6: Homework & Task Assignment
  getHomework,
  createHomework,
  updateHomework,
  deleteHomework,

  // Module 8: Audit Logs
  getAuditLogs,

  // Preserved Modules: Marks, Timetable, Fees, SMS, Notices, Settings, Stats
  getMarks,
  saveMark,
  getReportCard,
  getTimetable,
  createTimetableEntry,
  getFees,
  getFee,
  generateFeeChallan,
  generateBulkClassFees,
  submitFeePaymentProof,
  verifyFeePayment,
  payFeeChallan,
  getDefaulters,
  getTeacherSalaries,
  getTeacherSalary,
  generateMonthlyPayroll,
  disburseTeacherSalary,
  updateTeacherSalary,
  recordTeacherAdvance,
  sendSmsBroadcast,
  getNotices,
  createNotice,
  deleteNotice,
  getSettings,
  updateSettings,
  getStats,
  getPerformanceAnalytics,
} from "../controllers/schoolController";

const router = Router();

// =================================================================
// 0. HEALTH CHECK & AUTHENTICATION
// =================================================================
router.get("/health", async (_req: Request, res: Response) => {
  const isDbConnected = await checkDbConnection();
  res.status(200).json({
    status: "ok",
    db: isDbConnected,
    timestamp: new Date().toISOString(),
  });
});

router.post("/auth/login", login);
router.get("/auth/me", authMiddleware, getCurrentUser);
router.get("/stats", optionalAuth, getStats);
router.get("/analytics", optionalAuth, getPerformanceAnalytics);

// =================================================================
// MODULE 1: SUBJECTS CRUD
// =================================================================
router.get("/subjects", optionalAuth, getSubjects);
router.get("/subjects/:id", optionalAuth, getSubject);
router.post("/subjects", authMiddleware, requireRoles(["admin"]), createSubject);
router.put("/subjects/:id", authMiddleware, requireRoles(["admin"]), updateSubject);
router.delete("/subjects/:id", authMiddleware, requireRoles(["admin"]), deleteSubject);

// =================================================================
// MODULE 1 & 7: STUDENTS CRUD & SCOPED TEACHER OPERATIONS
// =================================================================
router.get("/students", optionalAuth, getStudents);
router.get("/students/:id", optionalAuth, getStudent);
router.post("/students", authMiddleware, requireRoles(["admin", "teacher"]), createStudent);
router.put("/students/:id", authMiddleware, requireRoles(["admin", "teacher"]), updateStudent);
router.delete("/students/:id", authMiddleware, requireRoles(["admin", "teacher"]), deleteStudent);
router.post("/students/:id/transfer", authMiddleware, requireRoles(["admin"]), transferStudent);

// =================================================================
// MODULE 1: TEACHERS CRUD
// =================================================================
router.get("/teachers", optionalAuth, getTeachers);
router.get("/teachers/:id", optionalAuth, getTeacher);
router.post("/teachers", authMiddleware, requireRoles(["admin"]), createTeacher);
router.put("/teachers/:id", authMiddleware, requireRoles(["admin"]), updateTeacher);
router.delete("/teachers/:id", authMiddleware, requireRoles(["admin"]), deleteTeacher);

// =================================================================
// MODULE 1: CLASSES CRUD
// =================================================================
router.get("/classes", optionalAuth, getClasses);
router.get("/classes/:id", optionalAuth, getClass);
router.post("/classes", authMiddleware, requireRoles(["admin"]), createClass);
router.put("/classes/:id", authMiddleware, requireRoles(["admin"]), updateClass);
router.delete("/classes/:id", authMiddleware, requireRoles(["admin"]), deleteClass);

// =================================================================
// MODULE 2: ACADEMIC MAPPING & CLASS IN-CHARGE
// =================================================================
router.get("/classes/:classId/subjects", optionalAuth, getClassSubjects);
router.post("/classes/:classId/subjects", authMiddleware, requireRoles(["admin"]), assignSubjectToClass);
router.delete("/classes/:classId/subjects/:subjectId", authMiddleware, requireRoles(["admin"]), removeSubjectFromClass);

router.get("/academic-mapping/teacher-assignments", optionalAuth, getTeacherAssignments);
router.post("/academic-mapping/teacher-assignments", authMiddleware, requireRoles(["admin"]), assignTeacherToClassSubject);
router.delete("/academic-mapping/teacher-assignments/:id", authMiddleware, requireRoles(["admin"]), removeTeacherAssignment);

router.post("/classes/:classId/incharge", authMiddleware, requireRoles(["admin"]), assignClassIncharge);
router.get("/classes/:classId/incharge-history", optionalAuth, getClassInchargeHistory);
router.get("/academic-mapping/incharge-history", optionalAuth, getClassInchargeHistory);

// =================================================================
// MODULE 3: RESTRICTED STUDENT ATTENDANCE (CLASS IN-CHARGE ONLY)
// =================================================================
router.get("/attendance", optionalAuth, getAttendance);
router.post("/attendance", authMiddleware, requireClassInchargeOrAdmin, saveAttendance);

// =================================================================
// MODULE 4: TEACHER ATTENDANCE & VERIFICATION SYSTEM (ADMIN)
// =================================================================
router.get("/teacher-attendance/daily-code", optionalAuth, getDailyRotatingCode);
router.post("/teacher-attendance/check-in", authMiddleware, requireRoles(["teacher", "admin"]), teacherSelfCheckIn);
router.get("/teacher-attendance", optionalAuth, getTeacherAttendance);
router.post("/teacher-attendance/verify/:id", authMiddleware, requireRoles(["admin"]), adminVerifyTeacherAttendance);
router.post("/teacher-attendance/mark", authMiddleware, requireRoles(["admin"]), adminMarkTeacherAttendance);

// =================================================================
// MODULE 5: TEACHER LEAVES & REAL-TIME ADMIN NOTIFICATIONS
// =================================================================
router.get("/teacher-leaves", optionalAuth, getTeacherLeaves);
router.post("/teacher-leaves", authMiddleware, requireRoles(["teacher", "admin"]), submitLeaveRequest);
router.post("/teacher-leaves/:id/review", authMiddleware, requireRoles(["admin"]), reviewLeaveRequest);

router.get("/notifications", optionalAuth, getAdminNotifications);
router.patch("/notifications/:id/read", optionalAuth, markNotificationRead);
router.post("/notifications/mark-all-read", optionalAuth, markAllNotificationsRead);

// =================================================================
// MODULE 6: HOMEWORK & TASK ASSIGNMENT
// =================================================================
router.get("/homework", optionalAuth, getHomework);
router.post("/homework", authMiddleware, requireAssignedTeacherOrAdmin, createHomework);
router.put("/homework/:id", authMiddleware, requireAssignedTeacherOrAdmin, updateHomework);
router.delete("/homework/:id", authMiddleware, requireRoles(["teacher", "admin"]), deleteHomework);

// =================================================================
// MODULE 8: UNIFIED AUDIT LOGGING
// =================================================================
router.get("/audit-logs", authMiddleware, requireRoles(["admin"]), getAuditLogs);

// =================================================================
// PRESERVED MODULES: MARKS, TIMETABLE, FEES, SMS, NOTICES, SETTINGS
// =================================================================
router.get("/marks", optionalAuth, getMarks);
router.post("/marks", authMiddleware, requireRoles(["admin", "teacher"]), saveMark);
router.get("/marks/report-card/:studentId", optionalAuth, getReportCard);

router.get("/timetable", optionalAuth, getTimetable);
router.post("/timetable", authMiddleware, requireRoles(["admin", "teacher"]), createTimetableEntry);

router.get("/fees/defaulters", optionalAuth, getDefaulters);
router.get("/fees", optionalAuth, getFees);
router.get("/fees/:id", optionalAuth, getFee);
router.post("/fees", authMiddleware, requireRoles(["admin"]), generateFeeChallan);
router.post("/fees/generate-bulk", authMiddleware, requireRoles(["admin"]), generateBulkClassFees);
router.post("/fees/:id/submit-proof", authMiddleware, requireRoles(["student", "admin"]), submitFeePaymentProof);
router.post("/fees/:id/verify-proof", authMiddleware, requireRoles(["admin"]), verifyFeePayment);
router.patch("/fees/:id/pay", authMiddleware, requireRoles(["admin", "student"]), payFeeChallan);

// Teacher Salary & Payroll Management Routes
router.get("/salaries", authMiddleware, requireRoles(["admin", "teacher"]), getTeacherSalaries);
router.get("/salaries/:id", authMiddleware, requireRoles(["admin", "teacher"]), getTeacherSalary);
router.post("/salaries/generate", authMiddleware, requireRoles(["admin"]), generateMonthlyPayroll);
router.post("/salaries/:id/disburse", authMiddleware, requireRoles(["admin"]), disburseTeacherSalary);
router.post("/salaries/:id/advance", authMiddleware, requireRoles(["admin"]), recordTeacherAdvance);
router.patch("/salaries/:id", authMiddleware, requireRoles(["admin"]), updateTeacherSalary);

router.post("/sms/broadcast", authMiddleware, requireRoles(["admin"]), sendSmsBroadcast);

router.get("/notices", optionalAuth, getNotices);
router.post("/notices", authMiddleware, requireRoles(["admin"]), createNotice);
router.delete("/notices/:id", authMiddleware, requireRoles(["admin"]), deleteNotice);

router.get("/settings", optionalAuth, getSettings);
router.put("/settings", authMiddleware, requireRoles(["admin"]), updateSettings);

export default router;
