import { pgTable, text, serial, integer, timestamp, boolean, varchar } from "drizzle-orm/pg-core";

// --- USERS & AUTHENTICATION ---
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).notNull(), // 'admin' | 'teacher' | 'student'
  fullName: varchar("full_name", { length: 128 }).notNull(),
  email: varchar("email", { length: 128 }),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 1: TEACHERS (EXTENDED WITH SOFT-DELETE & DESIGNATION) ---
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  employeeId: varchar("employee_id", { length: 32 }).notNull().unique(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  designation: varchar("designation", { length: 64 }).default("Senior Teacher").notNull(),
  subjectSpecialization: varchar("subject_specialization", { length: 64 }).notNull(),
  qualification: varchar("qualification", { length: 64 }).notNull(),
  phone: varchar("phone", { length: 32 }).notNull(),
  email: varchar("email", { length: 128 }).notNull(),
  address: text("address").default("Lahore"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'inactive'
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 1: CLASSES & SECTIONS (EXTENDED WITH CAPACITY & SOFT-DELETE) ---
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(), // e.g. "Class 10"
  section: varchar("section", { length: 16 }).notNull(), // e.g. "Blue"
  gradeLevel: integer("grade_level").default(10).notNull(), // 1 - 12
  roomNumber: varchar("room_number", { length: 32 }).notNull(),
  capacity: integer("capacity").default(40).notNull(),
  classTeacherId: integer("class_teacher_id"),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 1: SUBJECTS (NEW TABLE) ---
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  code: varchar("code", { length: 32 }).notNull().unique(),
  description: text("description"),
  type: varchar("type", { length: 20 }).default("compulsory").notNull(), // 'compulsory' | 'elective'
  periodsPerWeek: integer("periods_per_week").default(6).notNull(),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 1: STUDENTS (EXTENDED WITH SOFT-DELETE & ACADEMIC NOTES) ---
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  rollNo: varchar("roll_no", { length: 32 }).notNull().unique(),
  fullName: varchar("full_name", { length: 128 }).notNull(),
  classId: integer("class_id").notNull(),
  section: varchar("section", { length: 16 }).notNull(),
  parentName: varchar("parent_name", { length: 128 }).notNull(),
  fatherCnic: varchar("father_cnic", { length: 32 }),
  bFormNo: varchar("b_form_no", { length: 32 }),
  dob: varchar("dob", { length: 32 }),
  bloodGroup: varchar("blood_group", { length: 8 }),
  phone: varchar("phone", { length: 32 }).notNull(),
  address: text("address").notNull(),
  concessionType: varchar("concession_type", { length: 64 }).default("Regular"),
  academicNotes: text("academic_notes"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'inactive'
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  admissionDate: varchar("admission_date", { length: 32 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 2: SUBJECT-TO-CLASS MAPPING ---
export const classSubjects = pgTable("class_subjects", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 2: TEACHER-TO-SUBJECT/CLASS MAPPING ---
export const teacherAssignments = pgTable("teacher_assignments", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  classId: integer("class_id").notNull(),
  subjectId: integer("subject_id").notNull(),
  academicSession: varchar("academic_session", { length: 32 }).default("2026-2027").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 2: CLASS TEACHER IN-CHARGE ASSIGNMENT & REASSIGNMENT HISTORY ---
export const classInchargeHistory = pgTable("class_incharge_history", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  teacherId: integer("teacher_id").notNull(),
  academicSession: varchar("academic_session", { length: 32 }).default("2026-2027").notNull(),
  assignedByAdminId: integer("assigned_by_admin_id").notNull(),
  assignedAt: timestamp("assigned_at").defaultNow().notNull(),
  relievedAt: timestamp("relieved_at"),
  reason: text("reason"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'relieved'
});

// --- MODULE 3: STUDENT ATTENDANCE (IN-CHARGE VERIFIED) ---
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  classId: integer("class_id").notNull(),
  date: varchar("date", { length: 16 }).notNull(), // YYYY-MM-DD
  status: varchar("status", { length: 16 }).notNull(), // 'present' | 'absent' | 'leave' | 'late'
  markedByTeacherId: integer("marked_by_teacher_id"),
  markedByName: varchar("marked_by_name", { length: 128 }),
  markedByRole: varchar("marked_by_role", { length: 32 }), // 'class_incharge' | 'admin'
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 4: TEACHER ATTENDANCE & VERIFICATION ---
export const teacherAttendance = pgTable("teacher_attendance", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  date: varchar("date", { length: 16 }).notNull(), // YYYY-MM-DD
  checkInTime: varchar("check_in_time", { length: 16 }),
  checkOutTime: varchar("check_out_time", { length: 16 }),
  status: varchar("status", { length: 24 }).notNull(), // 'present' | 'absent' | 'late' | 'leave' | 'pending_verification'
  verificationMethod: varchar("verification_method", { length: 32 }).default("QR_SCAN"), // 'QR_SCAN' | 'PIN_VERIFIED' | 'GEOFENCE' | 'ADMIN_MANUAL'
  verifiedByAdminId: integer("verified_by_admin_id"),
  verifiedByAdminName: varchar("verified_by_admin_name", { length: 128 }),
  verifiedAt: timestamp("verified_at"),
  remarks: text("remarks"),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 5: TEACHER LEAVES & SUBSTITUTIONS ---
export const teacherLeaves = pgTable("teacher_leaves", {
  id: serial("id").primaryKey(),
  teacherId: integer("teacher_id").notNull(),
  teacherName: varchar("teacher_name", { length: 128 }).notNull(),
  leaveType: varchar("leave_type", { length: 32 }).notNull(), // 'Casual' | 'Medical' | 'Emergency' | 'Annual'
  startDate: varchar("start_date", { length: 16 }).notNull(),
  endDate: varchar("end_date", { length: 16 }).notNull(),
  reason: text("reason").notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  reviewedByAdminId: integer("reviewed_by_admin_id"),
  reviewedAt: timestamp("reviewed_at"),
  adminRemarks: text("admin_remarks"),
  substituteTeacherId: integer("substitute_teacher_id"),
  substituteTeacherName: varchar("substitute_teacher_name", { length: 128 }),
  affectedClasses: text("affected_classes"), // JSON array string
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 5: REAL-TIME ADMIN NOTIFICATIONS ---
export const adminNotifications = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: varchar("type", { length: 32 }).notNull(), // 'TEACHER_LEAVE_REQUEST' | 'TEACHER_ABSENT' | 'STUDENT_ALERT' | 'SYSTEM'
  title: varchar("title", { length: 256 }).notNull(),
  message: text("message").notNull(),
  data: text("data"), // optional JSON metadata
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 6: HOMEWORK & TASK ASSIGNMENT ---
export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  description: text("description").notNull(),
  classId: integer("class_id").notNull(),
  className: varchar("class_name", { length: 64 }).notNull(),
  section: varchar("section", { length: 16 }).notNull(),
  subjectId: integer("subject_id").notNull(),
  subjectName: varchar("subject_name", { length: 64 }).notNull(),
  assignedByTeacherId: integer("assigned_by_teacher_id").notNull(),
  teacherName: varchar("teacher_name", { length: 128 }).notNull(),
  assignedDate: varchar("assigned_date", { length: 16 }).notNull(),
  dueDate: varchar("due_date", { length: 16 }).notNull(),
  maxMarks: integer("max_marks").default(100),
  attachmentUrl: text("attachment_url"),
  status: varchar("status", { length: 20 }).default("active").notNull(), // 'active' | 'past_due'
  createdAt: timestamp("created_at").defaultNow(),
});

// --- MODULE 8: UNIFIED AUDIT LOGGING ---
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").notNull(),
  actorName: varchar("actor_name", { length: 128 }).notNull(),
  actorRole: varchar("actor_role", { length: 32 }).notNull(), // 'admin' | 'teacher' | 'system'
  action: varchar("action", { length: 32 }).notNull(), // 'CREATE' | 'UPDATE' | 'DELETE' | 'OVERRIDE' | 'APPROVE_LEAVE' | 'ASSIGN_INCHARGE' | 'SUBSTITUTE'
  entityType: varchar("entity_type", { length: 32 }).notNull(), // 'STUDENT' | 'TEACHER' | 'ATTENDANCE' | 'CLASS_INCHARGE' | 'TEACHER_ATTENDANCE' | 'LEAVE_REQUEST' | 'HOMEWORK' | 'SUBJECT'
  entityId: integer("entity_id"),
  oldValue: text("old_value"),
  newValue: text("new_value"),
  ipAddress: varchar("ip_address", { length: 64 }),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// --- EXISTING ACADEMIC & FINANCIAL TABLES (PRESERVED) ---
export const marks = pgTable("marks", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  examType: varchar("exam_type", { length: 32 }).notNull(),
  subject: varchar("subject", { length: 64 }).notNull(),
  totalMarks: integer("total_marks").notNull(),
  obtainedMarks: integer("obtained_marks").notNull(),
  grade: varchar("grade", { length: 8 }).notNull(),
  remarks: varchar("remarks", { length: 256 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timetable = pgTable("timetable", {
  id: serial("id").primaryKey(),
  classId: integer("class_id").notNull(),
  dayOfWeek: varchar("day_of_week", { length: 16 }).notNull(),
  periodNumber: integer("period_number").notNull(),
  startTime: varchar("start_time", { length: 16 }).notNull(),
  endTime: varchar("end_time", { length: 16 }).notNull(),
  subject: varchar("subject", { length: 64 }).notNull(),
  teacherName: varchar("teacher_name", { length: 128 }).notNull(),
  roomNumber: varchar("room_number", { length: 32 }),
});

export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  challanNo: varchar("challan_no", { length: 32 }).notNull().unique(),
  month: varchar("month", { length: 32 }).notNull(),
  year: integer("year").notNull(),
  amount: integer("amount").notNull(),
  dueDate: varchar("due_date", { length: 32 }).notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(),
  paidDate: varchar("paid_date", { length: 32 }),
  paymentMethod: varchar("payment_method", { length: 32 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const notices = pgTable("notices", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  targetAudience: varchar("target_audience", { length: 32 }).default("all").notNull(),
  postedBy: varchar("posted_by", { length: 128 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const schoolSettings = pgTable("school_settings", {
  id: serial("id").primaryKey(),
  schoolName: varchar("school_name", { length: 256 }).notNull(),
  academicSession: varchar("academic_session", { length: 32 }).notNull(),
  contactEmail: varchar("contact_email", { length: 128 }).notNull(),
  contactPhone: varchar("contact_phone", { length: 32 }).notNull(),
  address: text("address").notNull(),
  lateFeeSurcharge: integer("late_fee_surcharge").default(500),
});
