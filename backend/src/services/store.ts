import dbBridge from "./dbBridge";

export interface StudentRecord {
  id: number;
  rollNo: string;
  fullName: string;
  classId: number;
  className: string;
  section: string;
  parentName: string;
  fatherCnic?: string;
  bFormNo?: string;
  dob?: string;
  bloodGroup?: string;
  phone: string;
  address: string;
  concessionType?: string;
  academicNotes?: string;
  status: "active" | "inactive";
  admissionDate: string;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface TeacherRecord {
  id: number;
  employeeId: string;
  fullName: string;
  designation: string;
  subjectSpecialization: string;
  qualification: string;
  phone: string;
  email: string;
  address: string;
  status: "active" | "inactive";
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface ClassRecord {
  id: number;
  name: string;
  section: string;
  gradeLevel: number;
  roomNumber: string;
  capacity: number;
  classTeacherId?: number;
  classTeacherName: string;
  studentCount: number;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface SubjectRecord {
  id: number;
  name: string;
  code: string;
  description: string;
  type: "compulsory" | "elective";
  periodsPerWeek: number;
  isDeleted: boolean;
  deletedAt?: string | null;
}

export interface ClassSubjectRecord {
  id: number;
  classId: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
}

export interface TeacherAssignmentRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  academicSession: string;
}

export interface ClassInchargeHistoryRecord {
  id: number;
  classId: number;
  className: string;
  teacherId: number;
  teacherName: string;
  academicSession: string;
  assignedByAdminName: string;
  assignedAt: string;
  relievedAt?: string | null;
  reason?: string;
  status: "active" | "relieved";
}

export interface AttendanceRecord {
  id: number;
  studentId: number;
  studentName: string;
  rollNo: string;
  classId: number;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "leave" | "late";
  markedByTeacherId?: number;
  markedByName?: string;
}

export interface TeacherAttendanceRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  status: "present" | "absent" | "late" | "leave" | "pending_verification";
  verificationMethod: "QR_SCAN" | "PIN_VERIFIED" | "GEOFENCE" | "ADMIN_MANUAL" | "ADMIN_VERIFIED";
  verifiedByAdminName?: string;
  verifiedAt?: string;
  remarks?: string;
}

export interface TeacherLeaveRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  leaveType: string; // "Casual" | "Medical" | "Emergency" | "Annual"
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  reviewedByAdminName?: string;
  reviewedAt?: string;
  adminRemarks?: string;
  substituteTeacherId?: number;
  substituteTeacherName?: string;
  affectedClasses: string[];
  createdAt: string;
}

export interface AdminNotificationRecord {
  id: number;
  type: "TEACHER_LEAVE_REQUEST" | "TEACHER_ABSENT" | "STUDENT_ALERT" | "SYSTEM";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface HomeworkRecord {
  id: number;
  title: string;
  description: string;
  classId: number;
  className: string;
  section: string;
  subjectId: number;
  subjectName: string;
  assignedByTeacherId: number;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  attachmentUrl?: string;
  status: "active" | "past_due";
  createdAt: string;
}

export interface AuditLogRecord {
  id: number;
  actorId: number;
  actorName: string;
  actorRole: string; // "admin" | "teacher" | "system"
  action: string; // "CREATE" | "UPDATE" | "DELETE" | "OVERRIDE" | "APPROVE_LEAVE" | "ASSIGN_INCHARGE" | "SUBSTITUTE"
  entityType: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  timestamp: string;
}

export interface MarkRecord {
  id: number;
  studentId: number;
  studentName: string;
  rollNo: string;
  classId: number;
  examType: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks: string;
}

export interface TimetableRecord {
  id: number;
  classId: number;
  className: string;
  dayOfWeek: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  roomNumber: string;
}

export interface FeeRecord {
  id: number;
  studentId: number;
  studentName: string;
  rollNo: string;
  className: string;
  challanNo: string;
  month: string;
  year: number;
  amount: number;
  tuitionFee?: number;
  examFee?: number;
  labCharges?: number;
  lateFeeSurcharge?: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "verification_pending";
  paidDate?: string;
  paymentMethod?: string;
  transactionRef?: string;
  proofScreenshotUrl?: string;
  proofSubmittedAt?: string;
  paymentRemarks?: string;
  verifiedByAdminName?: string;
  verifiedAt?: string;
  rejectionReason?: string;
  concessionApplied?: string;
}

export interface TeacherSalaryRecord {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  designation: string;
  month: string;
  year: number;
  basicSalary: number;
  medicalAllowance: number;
  houseRentAllowance: number;
  transportAllowance: number;
  bonus: number;
  taxDeduction: number;
  absenceDeduction: number;
  providentFund: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  status: "paid" | "pending" | "processing";
  paymentDate?: string;
  paymentMethod?: string;
  transactionRef?: string;
  remarks?: string;
  createdAt: string;
}

export interface ReportCardData {
  student: StudentRecord;
  examType: string;
  academicSession: string;
  marks: MarkRecord[];
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  resultStatus: "PASS" | "FAIL";
  position: string;
  attendancePercentage: number;
  teacherRemarks: string;
  principalSignature: string;
}

export interface NoticeRecord {
  id: number;
  title: string;
  content: string;
  targetAudience: "all" | "teachers" | "students";
  postedBy: string;
  createdAt: string;
}

export interface SchoolSettingsRecord {
  schoolName: string;
  academicSession: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  lateFeeSurcharge: number;
}

// Initial In-Memory Seed State
class SchoolStore {
  private subjects: SubjectRecord[] = [
    { id: 1, name: "Mathematics", code: "MTH-101", description: "Algebra, Geometry & Trigonometry", type: "compulsory", periodsPerWeek: 6, isDeleted: false },
    { id: 2, name: "Physics", code: "PHY-102", description: "Mechanics, Thermodynamics & Electromagnetism", type: "compulsory", periodsPerWeek: 5, isDeleted: false },
    { id: 3, name: "Chemistry", code: "CHM-103", description: "Organic, Inorganic & Physical Chemistry", type: "compulsory", periodsPerWeek: 5, isDeleted: false },
    { id: 4, name: "English Literature", code: "ENG-104", description: "Grammar, Composition & Literary Analysis", type: "compulsory", periodsPerWeek: 5, isDeleted: false },
    { id: 5, name: "Urdu", code: "URD-105", description: "Urdu Adab, Qawaid & Insha", type: "compulsory", periodsPerWeek: 4, isDeleted: false },
    { id: 6, name: "Computer Science", code: "CS-106", description: "Programming, Web Tech & Data Structures", type: "elective", periodsPerWeek: 5, isDeleted: false },
    { id: 7, name: "Biology", code: "BIO-107", description: "Cellular Biology, Genetics & Physiology", type: "elective", periodsPerWeek: 5, isDeleted: false },
    { id: 8, name: "Pakistan Studies", code: "PST-108", description: "History, Geography & Civics of Pakistan", type: "compulsory", periodsPerWeek: 3, isDeleted: false },
    { id: 9, name: "Islamiat", code: "ISL-109", description: "Islamic Studies & Ethics", type: "compulsory", periodsPerWeek: 3, isDeleted: false },
  ];

  private teachers: TeacherRecord[] = [
    {
      id: 1,
      employeeId: "TCH-001",
      fullName: "Sir Tariq Aziz",
      designation: "Head of Sciences & Senior Lecturer",
      subjectSpecialization: "Physics & Mathematics",
      qualification: "M.Sc. Physics (Punjab University)",
      phone: "0300-8765432",
      email: "tariq.aziz@brightstar.edu.pk",
      address: "Allama Iqbal Town, Lahore",
      status: "active",
      isDeleted: false,
    },
    {
      id: 2,
      employeeId: "TCH-002",
      fullName: "Madam Farzana Kausar",
      designation: "Senior Mathematics Specialist",
      subjectSpecialization: "Mathematics",
      qualification: "M.Phil. Mathematics",
      phone: "0322-9988776",
      email: "farzana@brightstar.edu.pk",
      address: "Gulberg III, Lahore",
      status: "active",
      isDeleted: false,
    },
    {
      id: 3,
      employeeId: "TCH-003",
      fullName: "Sir Usman Ali",
      designation: "Subject Specialist",
      subjectSpecialization: "English Literature",
      qualification: "M.A. English",
      phone: "0344-5566778",
      email: "usman.ali@brightstar.edu.pk",
      address: "Model Town, Lahore",
      status: "active",
      isDeleted: false,
    },
    {
      id: 4,
      employeeId: "TCH-004",
      fullName: "Sir Rashid Minhas",
      designation: "Senior Teacher",
      subjectSpecialization: "Pakistan Studies & Urdu",
      qualification: "M.A. History",
      phone: "0331-1122334",
      email: "rashid.minhas@brightstar.edu.pk",
      address: "Johar Town, Lahore",
      status: "active",
      isDeleted: false,
    },
    {
      id: 5,
      employeeId: "TCH-005",
      fullName: "Engr. Zeeshan Haider",
      designation: "Computer Lab In-Charge",
      subjectSpecialization: "Computer Science",
      qualification: "BS Software Engineering",
      phone: "0313-4455667",
      email: "zeeshan@brightstar.edu.pk",
      address: "Faisal Town, Lahore",
      status: "active",
      isDeleted: false,
    },
  ];

  private classes: ClassRecord[] = [
    {
      id: 1,
      name: "Class 10 - Blue",
      section: "Blue",
      gradeLevel: 10,
      roomNumber: "Room 14",
      capacity: 40,
      classTeacherId: 1, // Sir Tariq Aziz is designated In-Charge
      classTeacherName: "Sir Tariq Aziz",
      studentCount: 38,
      isDeleted: false,
    },
    {
      id: 2,
      name: "Class 10 - Green",
      section: "Green",
      gradeLevel: 10,
      roomNumber: "Room 15",
      capacity: 40,
      classTeacherId: 2, // Madam Farzana Kausar is In-Charge
      classTeacherName: "Madam Farzana Kausar",
      studentCount: 36,
      isDeleted: false,
    },
    {
      id: 3,
      name: "Class 9 - Blue",
      section: "Blue",
      gradeLevel: 9,
      roomNumber: "Room 11",
      capacity: 45,
      classTeacherId: 3, // Sir Usman Ali is In-Charge
      classTeacherName: "Sir Usman Ali",
      studentCount: 40,
      isDeleted: false,
    },
    {
      id: 4,
      name: "Class 9 - Green",
      section: "Green",
      gradeLevel: 9,
      roomNumber: "Room 12",
      capacity: 40,
      classTeacherId: 4, // Sir Rashid Minhas is In-Charge
      classTeacherName: "Sir Rashid Minhas",
      studentCount: 35,
      isDeleted: false,
    },
  ];

  private classSubjects: ClassSubjectRecord[] = [
    { id: 1, classId: 1, subjectId: 1, subjectName: "Mathematics", subjectCode: "MTH-101" },
    { id: 2, classId: 1, subjectId: 2, subjectName: "Physics", subjectCode: "PHY-102" },
    { id: 3, classId: 1, subjectId: 3, subjectName: "Chemistry", subjectCode: "CHM-103" },
    { id: 4, classId: 1, subjectId: 4, subjectName: "English Literature", subjectCode: "ENG-104" },
    { id: 5, classId: 1, subjectId: 5, subjectName: "Urdu", subjectCode: "URD-105" },
    { id: 6, classId: 1, subjectId: 6, subjectName: "Computer Science", subjectCode: "CS-106" },
    { id: 7, classId: 2, subjectId: 1, subjectName: "Mathematics", subjectCode: "MTH-101" },
    { id: 8, classId: 2, subjectId: 2, subjectName: "Physics", subjectCode: "PHY-102" },
    { id: 9, classId: 3, subjectId: 4, subjectName: "English Literature", subjectCode: "ENG-104" },
  ];

  private teacherAssignments: TeacherAssignmentRecord[] = [
    { id: 1, teacherId: 1, teacherName: "Sir Tariq Aziz", classId: 1, className: "Class 10 - Blue", subjectId: 2, subjectName: "Physics", academicSession: "2026-2027" },
    { id: 2, teacherId: 2, teacherName: "Madam Farzana Kausar", classId: 1, className: "Class 10 - Blue", subjectId: 1, subjectName: "Mathematics", academicSession: "2026-2027" },
    { id: 3, teacherId: 3, teacherName: "Sir Usman Ali", classId: 1, className: "Class 10 - Blue", subjectId: 4, subjectName: "English Literature", academicSession: "2026-2027" },
    { id: 4, teacherId: 2, teacherName: "Madam Farzana Kausar", classId: 2, className: "Class 10 - Green", subjectId: 1, subjectName: "Mathematics", academicSession: "2026-2027" },
    { id: 5, teacherId: 1, teacherName: "Sir Tariq Aziz", classId: 2, className: "Class 10 - Green", subjectId: 2, subjectName: "Physics", academicSession: "2026-2027" },
    { id: 6, teacherId: 5, teacherName: "Engr. Zeeshan Haider", classId: 1, className: "Class 10 - Blue", subjectId: 6, subjectName: "Computer Science", academicSession: "2026-2027" },
  ];

  private classInchargeHistory: ClassInchargeHistoryRecord[] = [
    {
      id: 1,
      classId: 1,
      className: "Class 10 - Blue",
      teacherId: 1,
      teacherName: "Sir Tariq Aziz",
      academicSession: "2026-2027",
      assignedByAdminName: "Prof. Tariq Mehmood",
      assignedAt: "2026-03-01T08:00:00Z",
      status: "active",
      reason: "Annual Session 2026-27 In-Charge Allocation",
    },
    {
      id: 2,
      classId: 2,
      className: "Class 10 - Green",
      teacherId: 2,
      teacherName: "Madam Farzana Kausar",
      academicSession: "2026-2027",
      assignedByAdminName: "Prof. Tariq Mehmood",
      assignedAt: "2026-03-01T08:00:00Z",
      status: "active",
      reason: "Annual Session 2026-27 In-Charge Allocation",
    },
  ];

  private students: StudentRecord[] = [
    {
      id: 1,
      rollNo: "BS-2024-101",
      fullName: "Muhammad Hamza",
      classId: 1,
      className: "Class 10 - Blue",
      section: "Blue",
      parentName: "Tariq Mehmood",
      fatherCnic: "35202-1234567-1",
      bFormNo: "35202-9876543-1",
      dob: "2009-08-14",
      bloodGroup: "B+",
      phone: "0300-1234567",
      address: "Model Town, Lahore",
      concessionType: "Regular",
      academicNotes: "Consistently excels in theoretical physics and mathematics.",
      status: "active",
      admissionDate: "2024-03-15",
      isDeleted: false,
    },
    {
      id: 2,
      rollNo: "BS-2024-102",
      fullName: "Ayesha Fatima",
      classId: 1,
      className: "Class 10 - Blue",
      section: "Blue",
      parentName: "Sohail Ahmed",
      fatherCnic: "35202-2345678-2",
      bFormNo: "35202-8765432-2",
      dob: "2009-11-20",
      bloodGroup: "O+",
      phone: "0321-7654321",
      address: "Gulberg III, Lahore",
      concessionType: "Sibling Discount (25%)",
      academicNotes: "Strong analytical capability; active in science projects.",
      status: "active",
      admissionDate: "2024-03-16",
      isDeleted: false,
    },
    {
      id: 3,
      rollNo: "BS-2024-103",
      fullName: "Bilal Ahmed Khan",
      classId: 2,
      className: "Class 10 - Green",
      section: "Green",
      parentName: "Ahmed Khan",
      fatherCnic: "35202-3456789-3",
      bFormNo: "35202-7654321-3",
      dob: "2009-05-10",
      bloodGroup: "A+",
      phone: "0333-9876543",
      address: "Johar Town, Lahore",
      concessionType: "Regular",
      academicNotes: "Active sportsman and team leader.",
      status: "active",
      admissionDate: "2024-03-18",
      isDeleted: false,
    },
    {
      id: 4,
      rollNo: "BS-2024-104",
      fullName: "Zainab Noor",
      classId: 3,
      className: "Class 9 - Blue",
      section: "Blue",
      parentName: "Noor ul Hassan",
      fatherCnic: "35202-4567890-4",
      bFormNo: "35202-6543210-4",
      dob: "2010-02-18",
      bloodGroup: "O+",
      phone: "0345-4567890",
      address: "DHA Phase 5, Lahore",
      concessionType: "Staff Child (50%)",
      status: "active",
      admissionDate: "2024-03-20",
      isDeleted: false,
    },
    {
      id: 5,
      rollNo: "BS-2024-105",
      fullName: "Usman Raza",
      classId: 4,
      className: "Class 9 - Green",
      section: "Green",
      parentName: "Muhammad Raza",
      phone: "0312-3456789",
      address: "Faisal Town, Lahore",
      status: "inactive",
      admissionDate: "2024-03-22",
      isDeleted: false,
    },
  ];

  private attendance: AttendanceRecord[] = [
    { id: 1, studentId: 1, studentName: "Muhammad Hamza", rollNo: "BS-2024-101", classId: 1, date: "2026-11-17", status: "present", markedByTeacherId: 1, markedByName: "Sir Tariq Aziz" },
    { id: 2, studentId: 2, studentName: "Ayesha Fatima", rollNo: "BS-2024-102", classId: 1, date: "2026-11-17", status: "present", markedByTeacherId: 1, markedByName: "Sir Tariq Aziz" },
    { id: 3, studentId: 3, studentName: "Bilal Ahmed Khan", rollNo: "BS-2024-103", classId: 2, date: "2026-11-17", status: "present", markedByTeacherId: 2, markedByName: "Madam Farzana Kausar" },
  ];

  private teacherAttendance: TeacherAttendanceRecord[] = [
    // Today's Records
    {
      id: 1,
      teacherId: 1,
      teacherName: "Sir Tariq Aziz",
      employeeId: "TCH-001",
      date: new Date().toISOString().split("T")[0],
      checkInTime: "07:48 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-11-19T08:00:00Z",
      remarks: "On-time biometric QR scan at staff entrance",
    },
    {
      id: 2,
      teacherId: 2,
      teacherName: "Madam Farzana Kausar",
      employeeId: "TCH-002",
      date: new Date().toISOString().split("T")[0],
      checkInTime: "07:55 AM",
      status: "present",
      verificationMethod: "PIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-11-19T08:05:00Z",
      remarks: "Daily rotating PIN check-in verified",
    },
    {
      id: 3,
      teacherId: 3,
      teacherName: "Sir Usman Ali",
      employeeId: "TCH-003",
      date: new Date().toISOString().split("T")[0],
      checkInTime: "08:15 AM",
      status: "late",
      verificationMethod: "ADMIN_MANUAL",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-11-19T08:20:00Z",
      remarks: "Traffic delay on Canal Road; reported to office",
    },
    {
      id: 4,
      teacherId: 4,
      teacherName: "Sir Rashid Minhas",
      employeeId: "TCH-004",
      date: new Date().toISOString().split("T")[0],
      status: "leave",
      verificationMethod: "ADMIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-11-19T07:30:00Z",
      remarks: "Approved medical leave - 2-day sick leave granted",
    },
    {
      id: 5,
      teacherId: 5,
      teacherName: "Engr. Zeeshan Haider",
      employeeId: "TCH-005",
      date: new Date().toISOString().split("T")[0],
      checkInTime: "07:50 AM",
      status: "present",
      verificationMethod: "PIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-11-19T08:02:00Z",
      remarks: "Lab inventory and morning check-in verified",
    },
    // Historical Logs: 2026-11-18
    {
      id: 6,
      teacherId: 1,
      teacherName: "Sir Tariq Aziz",
      employeeId: "TCH-001",
      date: "2026-11-18",
      checkInTime: "07:45 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Normal morning arrival",
    },
    {
      id: 7,
      teacherId: 2,
      teacherName: "Madam Farzana Kausar",
      employeeId: "TCH-002",
      date: "2026-11-18",
      checkInTime: "07:50 AM",
      status: "present",
      verificationMethod: "PIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Morning staff assembly",
    },
    {
      id: 8,
      teacherId: 3,
      teacherName: "Sir Usman Ali",
      employeeId: "TCH-003",
      date: "2026-11-18",
      checkInTime: "07:58 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    {
      id: 9,
      teacherId: 4,
      teacherName: "Sir Rashid Minhas",
      employeeId: "TCH-004",
      date: "2026-11-18",
      status: "leave",
      verificationMethod: "ADMIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Medical leave approved",
    },
    {
      id: 10,
      teacherId: 5,
      teacherName: "Engr. Zeeshan Haider",
      employeeId: "TCH-005",
      date: "2026-11-18",
      checkInTime: "07:40 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "IT lab preparation",
    },
    // Historical Logs: 2026-11-17
    {
      id: 11,
      teacherId: 1,
      teacherName: "Sir Tariq Aziz",
      employeeId: "TCH-001",
      date: "2026-11-17",
      checkInTime: "07:47 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Morning duty",
    },
    {
      id: 12,
      teacherId: 2,
      teacherName: "Madam Farzana Kausar",
      employeeId: "TCH-002",
      date: "2026-11-17",
      checkInTime: "07:52 AM",
      status: "present",
      verificationMethod: "PIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    {
      id: 13,
      teacherId: 3,
      teacherName: "Sir Usman Ali",
      employeeId: "TCH-003",
      date: "2026-11-17",
      checkInTime: "08:12 AM",
      status: "late",
      verificationMethod: "ADMIN_MANUAL",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Late arrival marked by admin",
    },
    {
      id: 14,
      teacherId: 4,
      teacherName: "Sir Rashid Minhas",
      employeeId: "TCH-004",
      date: "2026-11-17",
      checkInTime: "07:56 AM",
      status: "present",
      verificationMethod: "ADMIN_MANUAL",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    {
      id: 15,
      teacherId: 5,
      teacherName: "Engr. Zeeshan Haider",
      employeeId: "TCH-005",
      date: "2026-11-17",
      checkInTime: "07:45 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    // Historical Logs: 2026-11-16
    {
      id: 16,
      teacherId: 1,
      teacherName: "Sir Tariq Aziz",
      employeeId: "TCH-001",
      date: "2026-11-16",
      checkInTime: "07:44 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    {
      id: 17,
      teacherId: 2,
      teacherName: "Madam Farzana Kausar",
      employeeId: "TCH-002",
      date: "2026-11-16",
      checkInTime: "07:54 AM",
      status: "present",
      verificationMethod: "PIN_VERIFIED",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    {
      id: 18,
      teacherId: 3,
      teacherName: "Sir Usman Ali",
      employeeId: "TCH-003",
      date: "2026-11-16",
      status: "absent",
      verificationMethod: "ADMIN_MANUAL",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Uninformed absence; admin alert generated",
    },
    {
      id: 19,
      teacherId: 4,
      teacherName: "Sir Rashid Minhas",
      employeeId: "TCH-004",
      date: "2026-11-16",
      checkInTime: "07:50 AM",
      status: "present",
      verificationMethod: "ADMIN_MANUAL",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
    {
      id: 20,
      teacherId: 5,
      teacherName: "Engr. Zeeshan Haider",
      employeeId: "TCH-005",
      date: "2026-11-16",
      checkInTime: "07:42 AM",
      status: "present",
      verificationMethod: "QR_SCAN",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      remarks: "Verified",
    },
  ];

  private teacherLeaves: TeacherLeaveRecord[] = [
    {
      id: 1,
      teacherId: 4,
      teacherName: "Sir Rashid Minhas",
      leaveType: "Medical",
      startDate: "2026-11-18",
      endDate: "2026-11-19",
      reason: "High fever and medical consultation required",
      status: "pending",
      affectedClasses: ["Class 9 - Green (PST)", "Class 10 - Green (Urdu)"],
      createdAt: "2026-11-18T07:15:00Z",
    },
  ];

  private adminNotifications: AdminNotificationRecord[] = [
    {
      id: 1,
      type: "TEACHER_LEAVE_REQUEST",
      title: "Teacher Leave Alert: Sir Rashid Minhas",
      message: "Sir Rashid Minhas requested Medical leave for 2026-11-18 to 2026-11-19. Affected Classes: Class 9 - Green, Class 10 - Green.",
      data: { teacherId: 4, leaveId: 1 },
      isRead: false,
      createdAt: "2026-11-18T07:15:00Z",
    },
  ];

  private homework: HomeworkRecord[] = [
    {
      id: 1,
      title: "Newton's Laws of Motion - Chapter 3 Problem Set",
      description: "Solve numerical questions 3.1 to 3.8 from Physics textbook Page 78 in homework notebooks.",
      classId: 1,
      className: "Class 10 - Blue",
      section: "Blue",
      subjectId: 2,
      subjectName: "Physics",
      assignedByTeacherId: 1,
      teacherName: "Sir Tariq Aziz",
      assignedDate: "2026-11-17",
      dueDate: "2026-11-20",
      maxMarks: 20,
      attachmentUrl: "https://brightstar.edu.pk/resources/physics-ch3.pdf",
      status: "active",
      createdAt: "2026-11-17T10:00:00Z",
    },
    {
      id: 2,
      title: "Quadratic Equations - Exercise 1.2",
      description: "Complete all questions of Exercise 1.2 utilizing the quadratic formula.",
      classId: 1,
      className: "Class 10 - Blue",
      section: "Blue",
      subjectId: 1,
      subjectName: "Mathematics",
      assignedByTeacherId: 2,
      teacherName: "Madam Farzana Kausar",
      assignedDate: "2026-11-16",
      dueDate: "2026-11-19",
      maxMarks: 25,
      status: "active",
      createdAt: "2026-11-16T11:00:00Z",
    },
  ];

  private auditLogs: AuditLogRecord[] = [
    {
      id: 1,
      actorId: 1,
      actorName: "Prof. Tariq Mehmood",
      actorRole: "admin",
      action: "ASSIGN_INCHARGE",
      entityType: "CLASS_INCHARGE",
      entityId: 1,
      newValue: "Sir Tariq Aziz assigned as Class Teacher In-Charge for Class 10 - Blue",
      timestamp: "2026-03-01T08:00:00Z",
    },
  ];

  private marks: MarkRecord[] = [
    { id: 1, studentId: 1, studentName: "Muhammad Hamza", rollNo: "BS-2024-101", classId: 1, examType: "Mid-Term", subject: "Physics", totalMarks: 100, obtainedMarks: 94, grade: "A+", remarks: "Outstanding conceptual mastery" },
    { id: 2, studentId: 1, studentName: "Muhammad Hamza", rollNo: "BS-2024-101", classId: 1, examType: "Mid-Term", subject: "Mathematics", totalMarks: 100, obtainedMarks: 98, grade: "A+", remarks: "Perfect problem solving" },
    { id: 3, studentId: 1, studentName: "Muhammad Hamza", rollNo: "BS-2024-101", classId: 1, examType: "Mid-Term", subject: "Chemistry", totalMarks: 100, obtainedMarks: 88, grade: "A", remarks: "Great lab and theory work" },
    { id: 4, studentId: 1, studentName: "Muhammad Hamza", rollNo: "BS-2024-101", classId: 1, examType: "Mid-Term", subject: "English Literature", totalMarks: 100, obtainedMarks: 85, grade: "A", remarks: "Fluent expression" },
    { id: 5, studentId: 1, studentName: "Muhammad Hamza", rollNo: "BS-2024-101", classId: 1, examType: "Mid-Term", subject: "Computer Science", totalMarks: 100, obtainedMarks: 96, grade: "A+", remarks: "Exemplary code quality" },
  ];

  private timetable: TimetableRecord[] = [
    { id: 1, classId: 1, className: "Class 10 - Blue", dayOfWeek: "Monday", periodNumber: 1, startTime: "08:00 AM", endTime: "08:45 AM", subject: "Physics", teacherName: "Sir Tariq Aziz", roomNumber: "Room 14" },
    { id: 2, classId: 1, className: "Class 10 - Blue", dayOfWeek: "Monday", periodNumber: 2, startTime: "08:45 AM", endTime: "09:30 AM", subject: "Mathematics", teacherName: "Madam Farzana Kausar", roomNumber: "Room 14" },
  ];

  private fees: FeeRecord[] = [
    {
      id: 1,
      studentId: 1,
      studentName: "Muhammad Hamza",
      rollNo: "BS-2024-101",
      className: "Class 10 - Blue",
      challanNo: "CH-2026-1001",
      month: "November",
      year: 2026,
      amount: 6500,
      tuitionFee: 5500,
      examFee: 500,
      labCharges: 500,
      lateFeeSurcharge: 500,
      dueDate: "2026-11-20",
      status: "paid",
      paidDate: "2026-11-15",
      paymentMethod: "EasyPaisa",
      transactionRef: "EP-88492019",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-11-15T11:20:00Z",
    },
    {
      id: 2,
      studentId: 2,
      studentName: "Ayesha Fatima",
      rollNo: "BS-2024-102",
      className: "Class 10 - Blue",
      challanNo: "CH-2026-1002",
      month: "November",
      year: 2026,
      amount: 4875,
      tuitionFee: 4125,
      examFee: 500,
      labCharges: 250,
      lateFeeSurcharge: 500,
      dueDate: "2026-11-20",
      status: "verification_pending",
      paymentMethod: "JazzCash",
      transactionRef: "JC-99482103",
      proofSubmittedAt: "2026-11-18T10:15:00Z",
      proofScreenshotUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'><rect width='400' height='260' rx='12' fill='%231e293b'/><rect x='20' y='20' width='360' height='50' rx='8' fill='%23e11d48'/><text x='200' y='52' fill='white' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'>JazzCash Transaction Receipt</text><text x='30' y='105' fill='%2394a3b8' font-family='sans-serif' font-size='13'>Transferred To: Bright Star Grammar School</text><text x='30' y='135' fill='%2394a3b8' font-family='sans-serif' font-size='13'>Amount: PKR 4,875</text><text x='30' y='165' fill='%2394a3b8' font-family='sans-serif' font-size='13'>TID: JC-99482103</text><text x='30' y='195' fill='%2394a3b8' font-family='sans-serif' font-size='13'>Payer: Sohail Ahmed (0321-7654321)</text><text x='200' y='235' fill='%2322c55e' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>PAYMENT SUCCESSFUL</text></svg>",
      paymentRemarks: "Paid via father Sohail Ahmed JazzCash wallet",
      concessionApplied: "Sibling Discount (25%)",
    },
    {
      id: 3,
      studentId: 3,
      studentName: "Bilal Ahmed Khan",
      rollNo: "BS-2024-103",
      className: "Class 10 - Green",
      challanNo: "CH-2026-1003",
      month: "November",
      year: 2026,
      amount: 6500,
      tuitionFee: 5500,
      examFee: 500,
      labCharges: 500,
      lateFeeSurcharge: 500,
      dueDate: "2026-11-10",
      status: "overdue",
    },
    {
      id: 4,
      studentId: 1,
      studentName: "Muhammad Hamza",
      rollNo: "BS-2024-101",
      className: "Class 10 - Blue",
      challanNo: "CH-2026-0901",
      month: "October",
      year: 2026,
      amount: 6500,
      tuitionFee: 5500,
      examFee: 500,
      labCharges: 500,
      dueDate: "2026-10-15",
      status: "paid",
      paidDate: "2026-10-12",
      paymentMethod: "Bank Deposit",
      transactionRef: "HBL-DEP-00918",
      verifiedByAdminName: "Prof. Tariq Mehmood",
      verifiedAt: "2026-10-12T14:00:00Z",
    },
  ];

  private teacherSalaries: TeacherSalaryRecord[] = [
    {
      id: 1,
      teacherId: 1,
      teacherName: "Sir Tariq Aziz",
      employeeId: "TCH-001",
      designation: "Head of Sciences & Senior Lecturer",
      month: "November",
      year: 2026,
      basicSalary: 75000,
      medicalAllowance: 6000,
      houseRentAllowance: 12000,
      transportAllowance: 5000,
      bonus: 0,
      taxDeduction: 4500,
      absenceDeduction: 0,
      providentFund: 5000,
      grossSalary: 98000,
      totalDeductions: 9500,
      netSalary: 88500,
      status: "paid",
      paymentDate: "2026-11-02",
      paymentMethod: "HBL Direct Corporate Transfer",
      transactionRef: "SAL-2026-11-001",
      remarks: "Disbursed via automated corporate payroll",
      createdAt: "2026-11-01T09:00:00Z",
    },
    {
      id: 2,
      teacherId: 2,
      teacherName: "Madam Farzana Kausar",
      employeeId: "TCH-002",
      designation: "Senior Mathematics Specialist",
      month: "November",
      year: 2026,
      basicSalary: 68000,
      medicalAllowance: 5000,
      houseRentAllowance: 10000,
      transportAllowance: 5000,
      bonus: 0,
      taxDeduction: 3800,
      absenceDeduction: 0,
      providentFund: 4500,
      grossSalary: 88000,
      totalDeductions: 8300,
      netSalary: 79700,
      status: "paid",
      paymentDate: "2026-11-02",
      paymentMethod: "HBL Direct Corporate Transfer",
      transactionRef: "SAL-2026-11-002",
      remarks: "Monthly disbursement approved",
      createdAt: "2026-11-01T09:00:00Z",
    },
    {
      id: 3,
      teacherId: 3,
      teacherName: "Sir Usman Ali",
      employeeId: "TCH-003",
      designation: "Subject Specialist",
      month: "November",
      year: 2026,
      basicSalary: 60000,
      medicalAllowance: 5000,
      houseRentAllowance: 8000,
      transportAllowance: 4000,
      bonus: 0,
      taxDeduction: 2500,
      absenceDeduction: 2000,
      providentFund: 4000,
      grossSalary: 77000,
      totalDeductions: 8500,
      netSalary: 68500,
      status: "pending",
      remarks: "Pending month-end clearance for unannounced absence",
      createdAt: "2026-11-01T09:00:00Z",
    },
    {
      id: 4,
      teacherId: 4,
      teacherName: "Sir Rashid Minhas",
      employeeId: "TCH-004",
      designation: "Senior Teacher",
      month: "November",
      year: 2026,
      basicSalary: 58000,
      medicalAllowance: 5000,
      houseRentAllowance: 8000,
      transportAllowance: 4000,
      bonus: 0,
      taxDeduction: 2200,
      absenceDeduction: 0,
      providentFund: 3800,
      grossSalary: 75000,
      totalDeductions: 6000,
      netSalary: 69000,
      status: "processing",
      paymentMethod: "Bank Cheque",
      transactionRef: "CHQ-98102",
      remarks: "Cheque #CHQ-98102 prepared at accounts office",
      createdAt: "2026-11-01T09:00:00Z",
    },
    {
      id: 5,
      teacherId: 5,
      teacherName: "Engr. Zeeshan Haider",
      employeeId: "TCH-005",
      designation: "Computer Lab In-Charge",
      month: "November",
      year: 2026,
      basicSalary: 55000,
      medicalAllowance: 5000,
      houseRentAllowance: 7000,
      transportAllowance: 4000,
      bonus: 2500,
      taxDeduction: 2000,
      absenceDeduction: 0,
      providentFund: 3500,
      grossSalary: 73500,
      totalDeductions: 5500,
      netSalary: 68000,
      status: "paid",
      paymentDate: "2026-11-02",
      paymentMethod: "HBL Direct Corporate Transfer",
      transactionRef: "SAL-2026-11-005",
      remarks: "Includes IT lab maintenance bonus",
      createdAt: "2026-11-01T09:00:00Z",
    },
  ];

  private notices: NoticeRecord[] = [
    { id: 1, title: "Winter Vacations Schedule 2026", content: "School will remain closed for winter break from Dec 24, 2026 to Jan 02, 2027.", targetAudience: "all", postedBy: "Principal Office", createdAt: "2026-11-15" },
  ];

  private settings: SchoolSettingsRecord = {
    schoolName: "Bright Star Grammar High School",
    academicSession: "2026-2027",
    contactEmail: "info@brightstar.edu.pk",
    contactPhone: "042-35889900",
    address: "Main Boulevard, Model Town, Lahore, Pakistan",
    lateFeeSurcharge: 500,
  };

  // --- MODULE 1: SUBJECTS CRUD ---
  getSubjects(includeDeleted: boolean = false): SubjectRecord[] {
    return this.subjects.filter((s) => includeDeleted || !s.isDeleted);
  }

  getSubject(id: number): SubjectRecord | null {
    return this.subjects.find((s) => s.id === id && !s.isDeleted) || null;
  }

  addSubject(data: Omit<SubjectRecord, "id" | "isDeleted" | "deletedAt">, actor?: { id: number; name: string; role: string }): SubjectRecord {
    const existing = this.subjects.find((s) => s.code.toLowerCase() === data.code.toLowerCase() && !s.isDeleted);
    if (existing) {
      throw new Error(`Subject with code "${data.code}" already exists.`);
    }

    const nextId = this.subjects.length > 0 ? Math.max(...this.subjects.map((s) => s.id)) + 1 : 1;
    const newSubject: SubjectRecord = {
      ...data,
      id: nextId,
      isDeleted: false,
    };
    this.subjects.push(newSubject);

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "CREATE",
        entityType: "SUBJECT",
        entityId: nextId,
        newValue: JSON.stringify(newSubject),
      });
    }

    return newSubject;
  }

  updateSubject(id: number, data: Partial<SubjectRecord>, actor?: { id: number; name: string; role: string }): SubjectRecord | null {
    const idx = this.subjects.findIndex((s) => s.id === id && !s.isDeleted);
    if (idx === -1) return null;

    const oldVal = JSON.stringify(this.subjects[idx]);
    this.subjects[idx] = { ...this.subjects[idx], ...data };

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "UPDATE",
        entityType: "SUBJECT",
        entityId: id,
        oldValue: oldVal,
        newValue: JSON.stringify(this.subjects[idx]),
      });
    }

    return this.subjects[idx];
  }

  deleteSubject(id: number, actor?: { id: number; name: string; role: string }): boolean {
    const idx = this.subjects.findIndex((s) => s.id === id && !s.isDeleted);
    if (idx === -1) return false;

    // Soft delete
    this.subjects[idx].isDeleted = true;
    this.subjects[idx].deletedAt = new Date().toISOString();

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "DELETE",
        entityType: "SUBJECT",
        entityId: id,
        newValue: "Soft deleted subject",
      });
    }

    return true;
  }

  // --- MODULE 1: TEACHERS CRUD (WITH SOFT-DELETE & CREDENTIALS) ---
  getTeachers(query?: string, includeDeleted: boolean = false): TeacherRecord[] {
    let list = this.teachers.filter((t) => includeDeleted || !t.isDeleted);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (t) =>
          t.fullName.toLowerCase().includes(q) ||
          t.subjectSpecialization.toLowerCase().includes(q) ||
          t.employeeId.toLowerCase().includes(q) ||
          t.designation.toLowerCase().includes(q)
      );
    }
    return list;
  }

  getTeacher(id: number): TeacherRecord | null {
    return this.teachers.find((t) => t.id === id && !t.isDeleted) || null;
  }

  addTeacher(data: Omit<TeacherRecord, "id" | "isDeleted" | "deletedAt">, actor?: { id: number; name: string; role: string }): TeacherRecord {
    const existing = this.teachers.find((t) => t.employeeId.toLowerCase() === data.employeeId.toLowerCase() && !t.isDeleted);
    if (existing) {
      throw new Error(`Teacher with Employee ID "${data.employeeId}" already exists.`);
    }

    const nextId = this.teachers.length > 0 ? Math.max(...this.teachers.map((t) => t.id)) + 1 : 1;
    const newTeacher: TeacherRecord = {
      ...data,
      id: nextId,
      designation: data.designation || "Senior Teacher",
      address: data.address || "Lahore",
      isDeleted: false,
    };
    this.teachers.push(newTeacher);

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "CREATE",
        entityType: "TEACHER",
        entityId: nextId,
        newValue: JSON.stringify(newTeacher),
      });
    }

    return newTeacher;
  }

  updateTeacher(id: number, data: Partial<TeacherRecord>, actor?: { id: number; name: string; role: string }): TeacherRecord | null {
    const idx = this.teachers.findIndex((t) => t.id === id && !t.isDeleted);
    if (idx === -1) return null;

    const oldVal = JSON.stringify(this.teachers[idx]);
    this.teachers[idx] = { ...this.teachers[idx], ...data };

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "UPDATE",
        entityType: "TEACHER",
        entityId: id,
        oldValue: oldVal,
        newValue: JSON.stringify(this.teachers[idx]),
      });
    }

    return this.teachers[idx];
  }

  deleteTeacher(id: number, actor?: { id: number; name: string; role: string }): boolean {
    const idx = this.teachers.findIndex((t) => t.id === id && !t.isDeleted);
    if (idx === -1) return false;

    this.teachers[idx].isDeleted = true;
    this.teachers[idx].deletedAt = new Date().toISOString();

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "DELETE",
        entityType: "TEACHER",
        entityId: id,
        newValue: "Soft deleted teacher record",
      });
    }

    return true;
  }

  // --- MODULE 1: CLASSES CRUD ---
  getClasses(includeDeleted: boolean = false): ClassRecord[] {
    return this.classes.filter((c) => includeDeleted || !c.isDeleted);
  }

  getClass(id: number): ClassRecord | null {
    return this.classes.find((c) => c.id === id && !c.isDeleted) || null;
  }

  addClass(data: Omit<ClassRecord, "id" | "isDeleted" | "deletedAt">, actor?: { id: number; name: string; role: string }): ClassRecord {
    const nextId = this.classes.length > 0 ? Math.max(...this.classes.map((c) => c.id)) + 1 : 1;
    const newClass: ClassRecord = {
      ...data,
      id: nextId,
      gradeLevel: data.gradeLevel || 10,
      capacity: data.capacity || 40,
      studentCount: data.studentCount || 0,
      isDeleted: false,
    };
    this.classes.push(newClass);

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "CREATE",
        entityType: "CLASS",
        entityId: nextId,
        newValue: JSON.stringify(newClass),
      });
    }

    return newClass;
  }

  updateClass(id: number, data: Partial<ClassRecord>, actor?: { id: number; name: string; role: string }): ClassRecord | null {
    const idx = this.classes.findIndex((c) => c.id === id && !c.isDeleted);
    if (idx === -1) return null;

    const oldVal = JSON.stringify(this.classes[idx]);
    this.classes[idx] = { ...this.classes[idx], ...data };

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "UPDATE",
        entityType: "CLASS",
        entityId: id,
        oldValue: oldVal,
        newValue: JSON.stringify(this.classes[idx]),
      });
    }

    return this.classes[idx];
  }

  deleteClass(id: number, actor?: { id: number; name: string; role: string }): boolean {
    const idx = this.classes.findIndex((c) => c.id === id && !c.isDeleted);
    if (idx === -1) return false;

    this.classes[idx].isDeleted = true;
    this.classes[idx].deletedAt = new Date().toISOString();

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "DELETE",
        entityType: "CLASS",
        entityId: id,
        newValue: "Soft deleted class record",
      });
    }

    return true;
  }

  // --- MODULE 1 & 7: STUDENTS CRUD & SCOPED TEACHER OPERATIONS ---
  getStudents(query?: string, classId?: number, status?: string, includeDeleted: boolean = false): StudentRecord[] {
    let list = this.students.filter((s) => includeDeleted || !s.isDeleted);

    if (classId) {
      list = list.filter((s) => s.classId === classId);
    }
    if (status && status !== "all") {
      list = list.filter((s) => s.status === status);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (s) =>
          s.fullName.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.parentName.toLowerCase().includes(q) ||
          s.phone.includes(q)
      );
    }
    return list;
  }

  getStudent(id: number): StudentRecord | null {
    return this.students.find((s) => s.id === id && !s.isDeleted) || null;
  }

  addStudent(data: Omit<StudentRecord, "id" | "isDeleted" | "deletedAt">, actor?: { id: number; name: string; role: string }): StudentRecord {
    // Check duplicate roll number in same class/section
    const existing = this.students.find(
      (s) => s.rollNo.toLowerCase() === data.rollNo.toLowerCase() && !s.isDeleted
    );
    if (existing) {
      throw new Error(`A student with Roll Number "${data.rollNo}" already exists.`);
    }

    const nextId = this.students.length > 0 ? Math.max(...this.students.map((s) => s.id)) + 1 : 1;
    const newStudent: StudentRecord = {
      ...data,
      id: nextId,
      isDeleted: false,
    };
    this.students.push(newStudent);

    // Update class student count
    const cIdx = this.classes.findIndex((c) => c.id === data.classId);
    if (cIdx !== -1) {
      this.classes[cIdx].studentCount++;
    }

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "CREATE",
        entityType: "STUDENT",
        entityId: nextId,
        newValue: JSON.stringify(newStudent),
      });
    }

    dbBridge.persistStudent(newStudent);
    return newStudent;
  }

  updateStudent(id: number, data: Partial<StudentRecord>, actor?: { id: number; name: string; role: string }): StudentRecord | null {
    const idx = this.students.findIndex((s) => s.id === id && !s.isDeleted);
    if (idx === -1) return null;

    if (data.rollNo && data.rollNo !== this.students[idx].rollNo) {
      const duplicate = this.students.find(
        (s) => s.id !== id && s.rollNo.toLowerCase() === data.rollNo?.toLowerCase() && !s.isDeleted
      );
      if (duplicate) {
        throw new Error(`Roll number "${data.rollNo}" is already in use by another student.`);
      }
    }

    const oldVal = JSON.stringify(this.students[idx]);
    this.students[idx] = { ...this.students[idx], ...data };

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "UPDATE",
        entityType: "STUDENT",
        entityId: id,
        oldValue: oldVal,
        newValue: JSON.stringify(this.students[idx]),
      });
    }

    dbBridge.persistStudent(this.students[idx]);
    return this.students[idx];
  }

  deleteStudent(id: number, actor?: { id: number; name: string; role: string }): boolean {
    const idx = this.students.findIndex((s) => s.id === id && !s.isDeleted);
    if (idx === -1) return false;

    this.students[idx].isDeleted = true;
    this.students[idx].deletedAt = new Date().toISOString();

    const classId = this.students[idx].classId;
    const cIdx = this.classes.findIndex((c) => c.id === classId);
    if (cIdx !== -1 && this.classes[cIdx].studentCount > 0) {
      this.classes[cIdx].studentCount--;
    }

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "DELETE",
        entityType: "STUDENT",
        entityId: id,
        newValue: "Soft deleted student record",
      });
    }

    dbBridge.persistStudent(this.students[idx]);
    return true;
  }

  transferStudent(studentId: number, targetClassId: number, reason?: string, actor?: { id: number; name: string; role: string }): StudentRecord | null {
    const student = this.getStudent(studentId);
    if (!student) return null;

    const targetClass = this.getClass(targetClassId);
    if (!targetClass) throw new Error("Target class does not exist.");

    const oldClass = student.className;
    student.classId = targetClass.id;
    student.className = targetClass.name;
    student.section = targetClass.section;

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "TRANSFER",
        entityType: "STUDENT",
        entityId: studentId,
        oldValue: `Class: ${oldClass}`,
        newValue: `Class: ${targetClass.name} | Reason: ${reason || "Academic transfer"}`,
      });
    }

    return student;
  }

  // --- MODULE 2: ACADEMIC MAPPING & CLASS TEACHER IN-CHARGE ASSIGNMENT ---
  getClassSubjects(classId: number): ClassSubjectRecord[] {
    return this.classSubjects.filter((cs) => cs.classId === classId);
  }

  assignSubjectToClass(classId: number, subjectId: number): ClassSubjectRecord {
    const targetClass = this.getClass(classId);
    if (!targetClass) throw new Error("Class not found.");
    const subject = this.getSubject(subjectId);
    if (!subject) throw new Error("Subject not found.");

    const exists = this.classSubjects.find((cs) => cs.classId === classId && cs.subjectId === subjectId);
    if (exists) return exists;

    const nextId = this.classSubjects.length > 0 ? Math.max(...this.classSubjects.map((cs) => cs.id)) + 1 : 1;
    const entry: ClassSubjectRecord = {
      id: nextId,
      classId,
      subjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
    };
    this.classSubjects.push(entry);
    return entry;
  }

  removeSubjectFromClass(classId: number, subjectId: number): boolean {
    const initLen = this.classSubjects.length;
    this.classSubjects = this.classSubjects.filter((cs) => !(cs.classId === classId && cs.subjectId === subjectId));
    return this.classSubjects.length < initLen;
  }

  getTeacherAssignments(filter?: { teacherId?: number; classId?: number; subjectId?: number }): TeacherAssignmentRecord[] {
    let list = [...this.teacherAssignments];
    if (filter?.teacherId) list = list.filter((ta) => ta.teacherId === filter.teacherId);
    if (filter?.classId) list = list.filter((ta) => ta.classId === filter.classId);
    if (filter?.subjectId) list = list.filter((ta) => ta.subjectId === filter.subjectId);
    return list;
  }

  assignTeacherToSubjectClass(teacherId: number, classId: number, subjectId: number, academicSession: string = "2026-2027", actor?: { id: number; name: string; role: string }): TeacherAssignmentRecord {
    const teacher = this.getTeacher(teacherId);
    if (!teacher) throw new Error("Teacher not found.");
    const targetClass = this.getClass(classId);
    if (!targetClass) throw new Error("Class not found.");
    const subject = this.getSubject(subjectId);
    if (!subject) throw new Error("Subject not found.");

    const exists = this.teacherAssignments.find(
      (ta) => ta.teacherId === teacherId && ta.classId === classId && ta.subjectId === subjectId && ta.academicSession === academicSession
    );
    if (exists) return exists;

    const nextId = this.teacherAssignments.length > 0 ? Math.max(...this.teacherAssignments.map((ta) => ta.id)) + 1 : 1;
    const newAssignment: TeacherAssignmentRecord = {
      id: nextId,
      teacherId,
      teacherName: teacher.fullName,
      classId,
      className: targetClass.name,
      subjectId,
      subjectName: subject.name,
      academicSession,
    };
    this.teacherAssignments.push(newAssignment);

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "CREATE",
        entityType: "TEACHER_ASSIGNMENT",
        entityId: nextId,
        newValue: `${teacher.fullName} assigned to teach ${subject.name} in ${targetClass.name}`,
      });
    }

    return newAssignment;
  }

  removeTeacherAssignment(id: number): boolean {
    const initLen = this.teacherAssignments.length;
    this.teacherAssignments = this.teacherAssignments.filter((ta) => ta.id !== id);
    return this.teacherAssignments.length < initLen;
  }

  isTeacherAssignedToClassSubject(teacherId: number, classId: number, subjectId: number): boolean {
    return this.teacherAssignments.some((ta) => ta.teacherId === teacherId && ta.classId === classId && ta.subjectId === subjectId);
  }

  // --- MODULE 2 & 3: CLASS TEACHER IN-CHARGE DESIGNATION & RESTRICTIONS ---
  assignClassIncharge(classId: number, teacherId: number, academicSession: string = "2026-2027", reason?: string, actor?: { id: number; name: string; role: string }): ClassInchargeHistoryRecord {
    const targetClass = this.getClass(classId);
    if (!targetClass) throw new Error("Class not found.");
    const teacher = this.getTeacher(teacherId);
    if (!teacher) throw new Error("Teacher not found.");

    // Relieve any existing active in-charge for this class and session
    this.classInchargeHistory.forEach((h) => {
      if (h.classId === classId && h.academicSession === academicSession && h.status === "active") {
        h.status = "relieved";
        h.relievedAt = new Date().toISOString();
      }
    });

    const nextId = this.classInchargeHistory.length > 0 ? Math.max(...this.classInchargeHistory.map((h) => h.id)) + 1 : 1;
    const historyEntry: ClassInchargeHistoryRecord = {
      id: nextId,
      classId,
      className: targetClass.name,
      teacherId,
      teacherName: teacher.fullName,
      academicSession,
      assignedByAdminName: actor?.name || "Admin Office",
      assignedAt: new Date().toISOString(),
      reason: reason || "Designated Class In-Charge",
      status: "active",
    };
    this.classInchargeHistory.push(historyEntry);

    // Update class record
    targetClass.classTeacherId = teacherId;
    targetClass.classTeacherName = teacher.fullName;

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "ASSIGN_INCHARGE",
        entityType: "CLASS_INCHARGE",
        entityId: classId,
        newValue: `${teacher.fullName} designated as Class Teacher In-Charge for ${targetClass.name}`,
      });
    }

    return historyEntry;
  }

  getClassInchargeHistory(classId?: number): ClassInchargeHistoryRecord[] {
    if (classId) {
      return this.classInchargeHistory.filter((h) => h.classId === classId);
    }
    return [...this.classInchargeHistory];
  }

  isTeacherClassIncharge(teacherIdOrUserId: number, classId: number): boolean {
    const targetClass = this.getClass(classId);
    if (!targetClass) return false;

    // Check if classTeacherId matches directly
    if (targetClass.classTeacherId === teacherIdOrUserId) return true;

    // Check in-charge history for active assignment
    const activeIncharge = this.classInchargeHistory.find(
      (h) => h.classId === classId && h.teacherId === teacherIdOrUserId && h.status === "active"
    );
    if (activeIncharge) return true;

    // Also check teacher's user id mapping if user id 2 corresponds to teacher id 1
    const teacher = this.getTeacher(targetClass.classTeacherId || 0);
    if (teacher && teacher.id === teacherIdOrUserId) return true;

    return false;
  }

  // --- MODULE 3: RESTRICTED STUDENT ATTENDANCE ---
  getAttendance(classId?: number, date?: string, studentId?: number): AttendanceRecord[] {
    let result = [...this.attendance];
    if (classId) result = result.filter((a) => a.classId === classId);
    if (date) result = result.filter((a) => a.date === date);
    if (studentId) result = result.filter((a) => a.studentId === studentId);
    return result;
  }

  saveAttendanceBatch(
    records: { studentId: number; classId: number; date: string; status: "present" | "absent" | "leave" | "late" }[],
    markedBy?: { id: number; name: string; role: string }
  ): number {
    let count = 0;
    records.forEach((rec) => {
      const student = this.students.find((s) => s.id === rec.studentId);
      const existingIdx = this.attendance.findIndex(
        (a) => a.studentId === rec.studentId && a.date === rec.date
      );

      if (existingIdx !== -1) {
        // Update existing (prevent duplicates on same date)
        this.attendance[existingIdx].status = rec.status;
        this.attendance[existingIdx].markedByTeacherId = markedBy?.id;
        this.attendance[existingIdx].markedByName = markedBy?.name;
      } else {
        const nextId = this.attendance.length > 0 ? Math.max(...this.attendance.map((a) => a.id)) + 1 : 1;
        this.attendance.push({
          id: nextId,
          studentId: rec.studentId,
          studentName: student ? student.fullName : `Student #${rec.studentId}`,
          rollNo: student ? student.rollNo : "-",
          classId: rec.classId,
          date: rec.date,
          status: rec.status,
          markedByTeacherId: markedBy?.id,
          markedByName: markedBy?.name,
        });
      }
      count++;
    });

    if (markedBy && records.length > 0) {
      this.logAudit({
        actorId: markedBy.id,
        actorName: markedBy.name,
        actorRole: markedBy.role,
        action: "UPDATE",
        entityType: "ATTENDANCE",
        entityId: records[0].classId,
        newValue: `Recorded attendance for ${count} students on ${records[0].date}`,
      });
    }

    this.attendance
      .filter((a) => records.some((r) => r.studentId === a.studentId && r.date === a.date))
      .forEach((a) => dbBridge.persistAttendance(a));

    return count;
  }

  // --- MODULE 4: TEACHER ATTENDANCE, ROTATING QR/PIN & VERIFICATION ---
  getDailyRotatingCode(): { code: string; date: string; expiresAt: string } {
    const today = new Date().toISOString().split("T")[0];
    // Generates a daily rotating 6-character authentic validation token
    const hash = Math.abs(
      today.split("").reduce((acc, char) => acc + char.charCodeAt(0) * 31, 1000) % 9000
    ) + 1000;
    return {
      code: `BST-${hash}`,
      date: today,
      expiresAt: `${today}T23:59:59Z`,
    };
  }

  teacherCheckIn(teacherId: number, code: string, verificationMethod: "QR_SCAN" | "PIN_VERIFIED" | "GEOFENCE" = "PIN_VERIFIED", remarks?: string): TeacherAttendanceRecord {
    const teacher = this.getTeacher(teacherId);
    if (!teacher) throw new Error("Teacher not found.");

    const dailyCode = this.getDailyRotatingCode();
    if (code.trim().toUpperCase() !== dailyCode.code.toUpperCase()) {
      throw new Error("Invalid or expired daily Check-In PIN/QR code.");
    }

    const today = dailyCode.date;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const existingIdx = this.teacherAttendance.findIndex((ta) => ta.teacherId === teacherId && ta.date === today);
    if (existingIdx !== -1) {
      this.teacherAttendance[existingIdx].checkInTime = timeStr;
      this.teacherAttendance[existingIdx].verificationMethod = verificationMethod;
      this.teacherAttendance[existingIdx].status = "present";
      return this.teacherAttendance[existingIdx];
    }

    const nextId = this.teacherAttendance.length > 0 ? Math.max(...this.teacherAttendance.map((ta) => ta.id)) + 1 : 1;
    const rec: TeacherAttendanceRecord = {
      id: nextId,
      teacherId,
      teacherName: teacher.fullName,
      employeeId: teacher.employeeId,
      date: today,
      checkInTime: timeStr,
      status: "present",
      verificationMethod,
      remarks: remarks || `Self check-in via ${verificationMethod}`,
    };
    this.teacherAttendance.push(rec);

    this.logAudit({
      actorId: teacherId,
      actorName: teacher.fullName,
      actorRole: "teacher",
      action: "CREATE",
      entityType: "TEACHER_ATTENDANCE",
      entityId: nextId,
      newValue: `Self check-in at ${timeStr} (${verificationMethod})`,
    });

    return rec;
  }

  getTeacherAttendance(date?: string, teacherId?: number, all?: boolean): TeacherAttendanceRecord[] {
    let list = [...this.teacherAttendance];
    if (teacherId) {
      list = list.filter((ta) => ta.teacherId === teacherId);
    }
    if (all) {
      return list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
    }
    if (date) {
      list = list.filter((ta) => ta.date === date);
    } else if (!teacherId) {
      const targetDate = new Date().toISOString().split("T")[0];
      list = list.filter((ta) => ta.date === targetDate);
    }
    return list.sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  }

  adminVerifyTeacherAttendance(
    id: number,
    status: "present" | "absent" | "late" | "leave",
    remarks?: string,
    admin?: { id: number; name: string },
    checkInTime?: string
  ): TeacherAttendanceRecord {
    const idx = this.teacherAttendance.findIndex((ta) => ta.id === id);
    if (idx === -1) throw new Error("Teacher attendance record not found.");

    const oldStatus = this.teacherAttendance[idx].status;
    this.teacherAttendance[idx].status = status;
    this.teacherAttendance[idx].verificationMethod = "ADMIN_VERIFIED";
    this.teacherAttendance[idx].verifiedByAdminName = admin?.name || "Admin Office";
    this.teacherAttendance[idx].verifiedAt = new Date().toISOString();
    if (remarks) this.teacherAttendance[idx].remarks = remarks;

    // Apply custom checkInTime if provided, or auto-assign for present/late if missing
    if (checkInTime) {
      this.teacherAttendance[idx].checkInTime = checkInTime;
    } else if ((status === "present" || status === "late") && !this.teacherAttendance[idx].checkInTime) {
      const now = new Date();
      this.teacherAttendance[idx].checkInTime = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    } else if (status === "absent" || status === "leave") {
      this.teacherAttendance[idx].checkInTime = undefined;
    }

    this.logAudit({
      actorId: admin?.id || 1,
      actorName: admin?.name || "Admin",
      actorRole: "admin",
      action: "OVERRIDE",
      entityType: "TEACHER_ATTENDANCE",
      entityId: id,
      oldValue: `Status: ${oldStatus}`,
      newValue: `Verified as ${status}${checkInTime ? ` at ${checkInTime}` : ""} | Remarks: ${remarks || "Admin approved"}`,
    });

    if (status === "absent") {
      this.triggerTeacherAbsentNotification(this.teacherAttendance[idx].teacherId, this.teacherAttendance[idx].date, remarks);
    }

    dbBridge.persistTeacherAttendance(this.teacherAttendance[idx]);
    return this.teacherAttendance[idx];
  }

  adminMarkTeacherAttendance(
    teacherId: number,
    date: string,
    status: "present" | "absent" | "late" | "leave",
    remarks?: string,
    admin?: { id: number; name: string },
    checkInTime?: string
  ): TeacherAttendanceRecord {
    const teacher = this.getTeacher(teacherId);
    if (!teacher) throw new Error("Teacher not found.");

    const existingIdx = this.teacherAttendance.findIndex((ta) => ta.teacherId === teacherId && ta.date === date);
    if (existingIdx !== -1) {
      return this.adminVerifyTeacherAttendance(this.teacherAttendance[existingIdx].id, status, remarks, admin, checkInTime);
    }

    const nextId = this.teacherAttendance.length > 0 ? Math.max(...this.teacherAttendance.map((ta) => ta.id)) + 1 : 1;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

    const finalCheckInTime = checkInTime || ((status === "present" || status === "late") ? timeStr : undefined);

    const rec: TeacherAttendanceRecord = {
      id: nextId,
      teacherId,
      teacherName: teacher.fullName,
      employeeId: teacher.employeeId,
      date,
      checkInTime: finalCheckInTime,
      status,
      verificationMethod: "ADMIN_MANUAL",
      verifiedByAdminName: admin?.name || "Admin",
      verifiedAt: new Date().toISOString(),
      remarks: remarks || `Marked ${status} by Admin`,
    };
    this.teacherAttendance.push(rec);

    this.logAudit({
      actorId: admin?.id || 1,
      actorName: admin?.name || "Admin",
      actorRole: "admin",
      action: "OVERRIDE",
      entityType: "TEACHER_ATTENDANCE",
      entityId: nextId,
      newValue: `Manually marked as ${status} on ${date}${finalCheckInTime ? ` (Time: ${finalCheckInTime})` : ""}`,
    });

    if (status === "absent") {
      this.triggerTeacherAbsentNotification(teacherId, date, remarks);
    }

    dbBridge.persistTeacherAttendance(rec);
    return rec;
  }

  // --- MODULE 5: TEACHER LEAVES & REAL-TIME ADMIN NOTIFICATIONS ---
  getTeacherLeaves(teacherId?: number): TeacherLeaveRecord[] {
    if (teacherId) {
      return this.teacherLeaves.filter((l) => l.teacherId === teacherId);
    }
    return [...this.teacherLeaves];
  }

  submitLeaveRequest(teacherId: number, leaveType: string, startDate: string, endDate: string, reason: string): TeacherLeaveRecord {
    const teacher = this.getTeacher(teacherId);
    if (!teacher) throw new Error("Teacher not found.");

    // Find affected classes for this teacher
    const assignments = this.getTeacherAssignments({ teacherId });
    const affectedClasses = assignments.map((a) => `${a.className} (${a.subjectName})`);
    if (affectedClasses.length === 0) {
      affectedClasses.push("General Academic Duties");
    }

    const nextId = this.teacherLeaves.length > 0 ? Math.max(...this.teacherLeaves.map((l) => l.id)) + 1 : 1;
    const leaveRec: TeacherLeaveRecord = {
      id: nextId,
      teacherId,
      teacherName: teacher.fullName,
      leaveType,
      startDate,
      endDate,
      reason,
      status: "pending",
      affectedClasses,
      createdAt: new Date().toISOString(),
    };
    this.teacherLeaves.push(leaveRec);

    // Auto-create In-App Admin Notification
    this.createAdminNotification({
      type: "TEACHER_LEAVE_REQUEST",
      title: `Leave Request: ${teacher.fullName}`,
      message: `${teacher.fullName} requested ${leaveType} leave for ${startDate} to ${endDate}. Reason: "${reason}". Affected Classes: ${affectedClasses.join(", ")}.`,
      data: { leaveId: nextId, teacherId, startDate, endDate },
    });

    this.logAudit({
      actorId: teacherId,
      actorName: teacher.fullName,
      actorRole: "teacher",
      action: "CREATE",
      entityType: "LEAVE_REQUEST",
      entityId: nextId,
      newValue: `Submitted ${leaveType} leave for ${startDate} to ${endDate}`,
    });

    dbBridge.persistLeave(leaveRec);
    return leaveRec;
  }

  reviewLeaveRequest(leaveId: number, status: "approved" | "rejected", adminRemarks?: string, substituteTeacherId?: number, admin?: { id: number; name: string }): TeacherLeaveRecord {
    const idx = this.teacherLeaves.findIndex((l) => l.id === leaveId);
    if (idx === -1) throw new Error("Leave request not found.");

    let substituteTeacherName: string | undefined;
    if (substituteTeacherId) {
      const sub = this.getTeacher(substituteTeacherId);
      if (sub) substituteTeacherName = sub.fullName;
    }

    this.teacherLeaves[idx].status = status;
    this.teacherLeaves[idx].reviewedByAdminName = admin?.name || "Principal Office";
    this.teacherLeaves[idx].reviewedAt = new Date().toISOString();
    this.teacherLeaves[idx].adminRemarks = adminRemarks;
    this.teacherLeaves[idx].substituteTeacherId = substituteTeacherId;
    this.teacherLeaves[idx].substituteTeacherName = substituteTeacherName;

    this.logAudit({
      actorId: admin?.id || 1,
      actorName: admin?.name || "Admin",
      actorRole: "admin",
      action: "APPROVE_LEAVE",
      entityType: "LEAVE_REQUEST",
      entityId: leaveId,
      newValue: `${status.toUpperCase()} leave. Substitute: ${substituteTeacherName || "None"}`,
    });

    dbBridge.persistLeave(this.teacherLeaves[idx]);
    return this.teacherLeaves[idx];
  }

  triggerTeacherAbsentNotification(teacherId: number, date: string, reason?: string) {
    const teacher = this.getTeacher(teacherId);
    if (!teacher) return;

    const assignments = this.getTeacherAssignments({ teacherId });
    const affected = assignments.map((a) => `${a.className} (${a.subjectName})`).join(", ") || "General Classes";

    this.createAdminNotification({
      type: "TEACHER_ABSENT",
      title: `Teacher Absence Alert: ${teacher.fullName}`,
      message: `${teacher.fullName} is marked Absent on ${date} (${reason || "Unannounced Absence"}). Affected Classes: ${affected}. Please assign substitute coverage.`,
      data: { teacherId, date },
    });
  }

  // --- MODULE 5: IN-APP ADMIN NOTIFICATIONS ---
  getAdminNotifications(): { notifications: AdminNotificationRecord[]; unreadCount: number } {
    const unreadCount = this.adminNotifications.filter((n) => !n.isRead).length;
    return {
      notifications: [...this.adminNotifications].sort((a, b) => b.id - a.id),
      unreadCount,
    };
  }

  createAdminNotification(data: Omit<AdminNotificationRecord, "id" | "isRead" | "createdAt">): AdminNotificationRecord {
    const nextId = this.adminNotifications.length > 0 ? Math.max(...this.adminNotifications.map((n) => n.id)) + 1 : 1;
    const notification: AdminNotificationRecord = {
      ...data,
      id: nextId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.adminNotifications.unshift(notification);
    dbBridge.persistNotification(notification);
    return notification;
  }

  markNotificationRead(id: number): boolean {
    const notif = this.adminNotifications.find((n) => n.id === id);
    if (notif) {
      notif.isRead = true;
      dbBridge.persistNotification(notif);
      return true;
    }
    return false;
  }

  markAllNotificationsRead(): void {
    this.adminNotifications.forEach((n) => (n.isRead = true));
  }

  // --- MODULE 6: HOMEWORK & TASK ASSIGNMENT ---
  getHomework(filter?: { classId?: number; subjectId?: number; teacherId?: number; status?: string }): HomeworkRecord[] {
    let list = [...this.homework];
    if (filter?.classId) list = list.filter((h) => h.classId === filter.classId);
    if (filter?.subjectId) list = list.filter((h) => h.subjectId === filter.subjectId);
    if (filter?.teacherId) list = list.filter((h) => h.assignedByTeacherId === filter.teacherId);
    if (filter?.status && filter.status !== "all") list = list.filter((h) => h.status === filter.status);
    return list.sort((a, b) => b.id - a.id);
  }

  createHomework(data: Omit<HomeworkRecord, "id" | "createdAt" | "status">, actor?: { id: number; name: string; role: string }): HomeworkRecord {
    const nextId = this.homework.length > 0 ? Math.max(...this.homework.map((h) => h.id)) + 1 : 1;
    const newHomework: HomeworkRecord = {
      ...data,
      id: nextId,
      status: "active",
      createdAt: new Date().toISOString(),
    };
    this.homework.unshift(newHomework);

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "CREATE",
        entityType: "HOMEWORK",
        entityId: nextId,
        newValue: `Created homework: ${newHomework.title} for ${newHomework.className}`,
      });
    }

    dbBridge.persistHomework(newHomework);
    return newHomework;
  }

  updateHomework(id: number, data: Partial<HomeworkRecord>, actor?: { id: number; name: string; role: string }): HomeworkRecord | null {
    const idx = this.homework.findIndex((h) => h.id === id);
    if (idx === -1) return null;

    const oldVal = JSON.stringify(this.homework[idx]);
    this.homework[idx] = { ...this.homework[idx], ...data };

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "UPDATE",
        entityType: "HOMEWORK",
        entityId: id,
        oldValue: oldVal,
        newValue: JSON.stringify(this.homework[idx]),
      });
    }

    dbBridge.persistHomework(this.homework[idx]);
    return this.homework[idx];
  }

  deleteHomework(id: number, actor?: { id: number; name: string; role: string }): boolean {
    const idx = this.homework.findIndex((h) => h.id === id);
    if (idx === -1) return false;

    const removed = this.homework.splice(idx, 1)[0];
    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "DELETE",
        entityType: "HOMEWORK",
        entityId: id,
        newValue: `Deleted homework: ${removed.title}`,
      });
    }
    dbBridge.deleteHomework(id);
    return true;
  }

  // --- MODULE 8: UNIFIED AUDIT LOGGING ---
  logAudit(data: Omit<AuditLogRecord, "id" | "timestamp">): AuditLogRecord {
    const nextId = this.auditLogs.length > 0 ? Math.max(...this.auditLogs.map((l) => l.id)) + 1 : 1;
    const log: AuditLogRecord = {
      ...data,
      id: nextId,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs(filter?: { entityType?: string; action?: string; actorRole?: string }): AuditLogRecord[] {
    let list = [...this.auditLogs];
    if (filter?.entityType && filter.entityType !== "all") {
      list = list.filter((l) => l.entityType === filter.entityType);
    }
    if (filter?.action && filter.action !== "all") {
      list = list.filter((l) => l.action === filter.action);
    }
    if (filter?.actorRole && filter.actorRole !== "all") {
      list = list.filter((l) => l.actorRole === filter.actorRole);
    }
    return list;
  }

  // --- EXISTING MARKS, TIMETABLE, FEES, SETTINGS & NOTICES ---
  getMarks(studentId?: number, classId?: number, subject?: string): MarkRecord[] {
    let result = [...this.marks];
    if (studentId) result = result.filter((m) => m.studentId === studentId);
    if (classId) result = result.filter((m) => m.classId === classId);
    if (subject) result = result.filter((m) => m.subject.toLowerCase() === subject.toLowerCase());
    return result;
  }

  addOrUpdateMark(data: Omit<MarkRecord, "id">): MarkRecord {
    const existingIdx = this.marks.findIndex(
      (m) =>
        m.studentId === data.studentId &&
        m.examType === data.examType &&
        m.subject.toLowerCase() === data.subject.toLowerCase()
    );

    if (existingIdx !== -1) {
      this.marks[existingIdx] = { ...this.marks[existingIdx], ...data };
      return this.marks[existingIdx];
    } else {
      const nextId = this.marks.length > 0 ? Math.max(...this.marks.map((m) => m.id)) + 1 : 1;
      const newMark: MarkRecord = { ...data, id: nextId };
      this.marks.push(newMark);
      return newMark;
    }
  }

  getTimetable(classId?: number): TimetableRecord[] {
    if (!classId) return [...this.timetable];
    return this.timetable.filter((t) => t.classId === classId);
  }

  addTimetableEntry(data: Omit<TimetableRecord, "id">): TimetableRecord {
    const nextId = this.timetable.length > 0 ? Math.max(...this.timetable.map((t) => t.id)) + 1 : 1;
    const newEntry: TimetableRecord = { ...data, id: nextId };
    this.timetable.push(newEntry);
    return newEntry;
  }

  getFees(studentId?: number, status?: string, classId?: number): FeeRecord[] {
    let result = [...this.fees];
    if (studentId) result = result.filter((f) => f.studentId === studentId);
    if (status && status !== "all") result = result.filter((f) => f.status === status);
    if (classId) {
      const studentIdsInClass = this.students.filter((s) => s.classId === classId).map((s) => s.id);
      result = result.filter((f) => studentIdsInClass.includes(f.studentId));
    }
    return result.sort((a, b) => b.id - a.id);
  }

  getFee(id: number): FeeRecord | null {
    return this.fees.find((f) => f.id === id) || null;
  }

  getFeeDefaulters(): FeeRecord[] {
    return this.fees.filter((f) => f.status === "pending" || f.status === "overdue");
  }

  generateFee(data: Omit<FeeRecord, "id" | "status" | "paidDate">): FeeRecord {
    const nextId = this.fees.length > 0 ? Math.max(...this.fees.map((f) => f.id)) + 1 : 1;
    const newFee: FeeRecord = {
      ...data,
      id: nextId,
      status: "pending",
    };
    this.fees.push(newFee);
    return newFee;
  }

  generateBulkClassFees(
    classId: number | "all",
    month: string,
    year: number,
    dueDate: string,
    amounts: { tuitionFee: number; examFee?: number; labCharges?: number; lateFeeSurcharge?: number },
    admin?: { id: number; name: string }
  ): { generatedCount: number; fees: FeeRecord[] } {
    const targetStudents = this.students.filter(
      (s) => !s.isDeleted && s.status === "active" && (classId === "all" || s.classId === classId)
    );

    if (targetStudents.length === 0) {
      throw new Error("No active students found in the selected class.");
    }

    const generated: FeeRecord[] = [];
    const tuitionBase = amounts.tuitionFee;
    const examFee = amounts.examFee || 0;
    const labCharges = amounts.labCharges || 0;
    const lateFee = amounts.lateFeeSurcharge || 500;

    targetStudents.forEach((st) => {
      const existing = this.fees.find(
        (f) => f.studentId === st.id && f.month.toLowerCase() === month.toLowerCase() && f.year === year
      );
      if (existing) {
        return;
      }

      let studentTuition = tuitionBase;
      let concessionApplied = st.concessionType || undefined;
      if (st.concessionType?.includes("25%")) {
        studentTuition = Math.round(tuitionBase * 0.75);
      } else if (st.concessionType?.includes("50%")) {
        studentTuition = Math.round(tuitionBase * 0.5);
      } else if (st.concessionType?.toLowerCase().includes("scholarship")) {
        studentTuition = Math.round(tuitionBase * 0.2);
      }

      const totalAmount = studentTuition + examFee + labCharges;
      const nextId = this.fees.length > 0 ? Math.max(...this.fees.map((f) => f.id)) + 1 : 1;
      const challanNo = `CH-${year}-${1000 + nextId}`;

      const feeRec: FeeRecord = {
        id: nextId,
        studentId: st.id,
        studentName: st.fullName,
        rollNo: st.rollNo,
        className: st.className,
        challanNo,
        month,
        year,
        amount: totalAmount,
        tuitionFee: studentTuition,
        examFee,
        labCharges,
        lateFeeSurcharge: lateFee,
        dueDate,
        status: "pending",
        concessionApplied,
      };

      this.fees.push(feeRec);
      generated.push(feeRec);
    });

    if (admin) {
      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "CREATE",
        entityType: "FEES",
        entityId: generated.length > 0 ? generated[0].id : 1,
        newValue: `Bulk generated ${generated.length} fee challans for ${month} ${year} (Class: ${classId})`,
      });
    }

    generated.forEach((f) => dbBridge.persistFee(f));
    return { generatedCount: generated.length, fees: generated };
  }

  submitFeePaymentProof(
    id: number,
    data: { paymentMethod: string; transactionRef: string; proofScreenshotUrl: string; paymentRemarks?: string },
    actor?: { id: number; name: string; role: string }
  ): FeeRecord {
    const idx = this.fees.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("Challan record not found.");

    this.fees[idx].status = "verification_pending";
    this.fees[idx].paymentMethod = data.paymentMethod;
    this.fees[idx].transactionRef = data.transactionRef;
    this.fees[idx].proofScreenshotUrl = data.proofScreenshotUrl;
    this.fees[idx].paymentRemarks = data.paymentRemarks || `Paid via ${data.paymentMethod}`;
    this.fees[idx].proofSubmittedAt = new Date().toISOString();

    if (actor) {
      this.logAudit({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: "UPDATE",
        entityType: "FEES",
        entityId: id,
        newValue: `Payment proof submitted for Challan #${this.fees[idx].challanNo} (${data.paymentMethod} - Ref: ${data.transactionRef})`,
      });
    }

    dbBridge.persistFee(this.fees[idx]);
    return this.fees[idx];
  }

  verifyFeePayment(
    id: number,
    action: "approve" | "reject",
    admin: { id: number; name: string },
    reason?: string
  ): FeeRecord {
    const idx = this.fees.findIndex((f) => f.id === id);
    if (idx === -1) throw new Error("Challan record not found.");

    if (action === "approve") {
      this.fees[idx].status = "paid";
      this.fees[idx].paidDate = new Date().toISOString().split("T")[0];
      this.fees[idx].verifiedByAdminName = admin.name;
      this.fees[idx].verifiedAt = new Date().toISOString();
      delete this.fees[idx].rejectionReason;

      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "OVERRIDE",
        entityType: "FEES",
        entityId: id,
        newValue: `Approved payment proof & issued paid receipt for Challan #${this.fees[idx].challanNo} (Rs. ${this.fees[idx].amount})`,
      });
    } else {
      this.fees[idx].status = "pending";
      this.fees[idx].rejectionReason = reason || "Payment proof could not be verified in school bank account.";

      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "OVERRIDE",
        entityType: "FEES",
        entityId: id,
        newValue: `Rejected payment proof for Challan #${this.fees[idx].challanNo}: ${this.fees[idx].rejectionReason}`,
      });
    }

    dbBridge.persistFee(this.fees[idx]);
    return this.fees[idx];
  }

  payFee(id: number, paymentMethod: string, transactionRef?: string, admin?: { id: number; name: string }): FeeRecord | null {
    const idx = this.fees.findIndex((f) => f.id === id);
    if (idx === -1) return null;
    this.fees[idx].status = "paid";
    this.fees[idx].paidDate = new Date().toISOString().split("T")[0];
    this.fees[idx].paymentMethod = paymentMethod;
    if (transactionRef) this.fees[idx].transactionRef = transactionRef;
    if (admin) {
      this.fees[idx].verifiedByAdminName = admin.name;
      this.fees[idx].verifiedAt = new Date().toISOString();
      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "UPDATE",
        entityType: "FEES",
        entityId: id,
        newValue: `Marked Challan #${this.fees[idx].challanNo} as paid via ${paymentMethod}`,
      });
    }
    dbBridge.persistFee(this.fees[idx]);
    return this.fees[idx];
  }

  // --- TEACHER SALARY & PAYROLL MANAGEMENT ---
  getTeacherSalaries(month?: string, year?: number, teacherId?: number): TeacherSalaryRecord[] {
    let result = [...this.teacherSalaries];
    if (teacherId) result = result.filter((s) => s.teacherId === teacherId);
    if (month && month !== "all") result = result.filter((s) => s.month.toLowerCase() === month.toLowerCase());
    if (year) result = result.filter((s) => s.year === year);
    return result.sort((a, b) => b.id - a.id);
  }

  getTeacherSalary(id: number): TeacherSalaryRecord | null {
    return this.teacherSalaries.find((s) => s.id === id) || null;
  }

  generateMonthlyPayroll(month: string, year: number, admin?: { id: number; name: string }): { generatedCount: number; records: TeacherSalaryRecord[] } {
    const activeTeachers = this.teachers.filter((t) => !t.isDeleted && t.status === "active");
    const generated: TeacherSalaryRecord[] = [];

    activeTeachers.forEach((tch) => {
      const existing = this.teacherSalaries.find(
        (s) => s.teacherId === tch.id && s.month.toLowerCase() === month.toLowerCase() && s.year === year
      );
      if (existing) {
        generated.push(existing);
        return;
      }

      let basic = 60000;
      let medical = 5000;
      let houseRent = 8000;
      let transport = 4000;
      let tax = 2500;
      let pf = 4000;

      if (tch.designation.toLowerCase().includes("head") || tch.designation.toLowerCase().includes("senior lecturer")) {
        basic = 75000; medical = 6000; houseRent = 12000; transport = 5000; tax = 4500; pf = 5000;
      } else if (tch.designation.toLowerCase().includes("specialist")) {
        basic = 68000; medical = 5000; houseRent = 10000; transport = 5000; tax = 3800; pf = 4500;
      } else if (tch.designation.toLowerCase().includes("senior teacher")) {
        basic = 58000; medical = 5000; houseRent = 8000; transport = 4000; tax = 2200; pf = 3800;
      } else if (tch.designation.toLowerCase().includes("computer") || tch.designation.toLowerCase().includes("lab")) {
        basic = 55000; medical = 5000; houseRent = 7000; transport = 4000; tax = 2000; pf = 3500;
      }

      const absences = this.teacherAttendance.filter((ta) => ta.teacherId === tch.id && ta.status === "absent").length;
      const absenceDeduction = absences > 0 ? Math.round((basic / 30) * absences) : 0;

      const grossSalary = basic + medical + houseRent + transport;
      const totalDeductions = tax + pf + absenceDeduction;
      const netSalary = grossSalary - totalDeductions;

      const nextId = this.teacherSalaries.length > 0 ? Math.max(...this.teacherSalaries.map((s) => s.id)) + 1 : 1;
      const rec: TeacherSalaryRecord = {
        id: nextId,
        teacherId: tch.id,
        teacherName: tch.fullName,
        employeeId: tch.employeeId,
        designation: tch.designation,
        month,
        year,
        basicSalary: basic,
        medicalAllowance: medical,
        houseRentAllowance: houseRent,
        transportAllowance: transport,
        bonus: 0,
        taxDeduction: tax,
        absenceDeduction,
        providentFund: pf,
        grossSalary,
        totalDeductions,
        netSalary,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      this.teacherSalaries.push(rec);
      generated.push(rec);
    });

    if (admin) {
      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "CREATE",
        entityType: "SALARIES",
        entityId: generated.length > 0 ? generated[0].id : 1,
        newValue: `Generated monthly payroll for ${generated.length} faculty members for ${month} ${year}`,
      });
    }

    generated.forEach((s) => dbBridge.persistSalary(s));
    return { generatedCount: generated.length, records: generated };
  }

  disburseTeacherSalary(
    id: number,
    data: { paymentMethod: string; transactionRef?: string; paymentDate: string; remarks?: string },
    admin?: { id: number; name: string }
  ): TeacherSalaryRecord {
    const idx = this.teacherSalaries.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Teacher salary record not found.");

    this.teacherSalaries[idx].status = "paid";
    this.teacherSalaries[idx].paymentDate = data.paymentDate || new Date().toISOString().split("T")[0];
    this.teacherSalaries[idx].paymentMethod = data.paymentMethod || "Bank Transfer";
    if (data.transactionRef) this.teacherSalaries[idx].transactionRef = data.transactionRef;
    if (data.remarks) this.teacherSalaries[idx].remarks = data.remarks;

    if (admin) {
      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "OVERRIDE",
        entityType: "SALARIES",
        entityId: id,
        newValue: `Disbursed salary of Rs. ${this.teacherSalaries[idx].netSalary.toLocaleString()} to ${this.teacherSalaries[idx].teacherName} (${data.paymentMethod})`,
      });
    }

    dbBridge.persistSalary(this.teacherSalaries[idx]);
    return this.teacherSalaries[idx];
  }

  updateTeacherSalary(
    id: number,
    updates: Partial<TeacherSalaryRecord>,
    admin?: { id: number; name: string }
  ): TeacherSalaryRecord {
    const idx = this.teacherSalaries.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error("Salary slip not found.");

    const current = this.teacherSalaries[idx];
    const basic = updates.basicSalary !== undefined ? updates.basicSalary : current.basicSalary;
    const medical = updates.medicalAllowance !== undefined ? updates.medicalAllowance : current.medicalAllowance;
    const houseRent = updates.houseRentAllowance !== undefined ? updates.houseRentAllowance : current.houseRentAllowance;
    const transport = updates.transportAllowance !== undefined ? updates.transportAllowance : current.transportAllowance;
    const bonus = updates.bonus !== undefined ? updates.bonus : current.bonus;
    const tax = updates.taxDeduction !== undefined ? updates.taxDeduction : current.taxDeduction;
    const absence = updates.absenceDeduction !== undefined ? updates.absenceDeduction : current.absenceDeduction;
    const pf = updates.providentFund !== undefined ? updates.providentFund : current.providentFund;

    const grossSalary = basic + medical + houseRent + transport + bonus;
    const totalDeductions = tax + absence + pf;
    const netSalary = grossSalary - totalDeductions;

    this.teacherSalaries[idx] = {
      ...current,
      ...updates,
      basicSalary: basic,
      medicalAllowance: medical,
      houseRentAllowance: houseRent,
      transportAllowance: transport,
      bonus,
      taxDeduction: tax,
      absenceDeduction: absence,
      providentFund: pf,
      grossSalary,
      totalDeductions,
      netSalary,
    };

    if (admin) {
      this.logAudit({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: "admin",
        action: "UPDATE",
        entityType: "SALARIES",
        entityId: id,
        newValue: `Updated salary slip of ${current.teacherName} (Net: Rs. ${netSalary.toLocaleString()})`,
      });
    }

    dbBridge.persistSalary(this.teacherSalaries[idx]);
    return this.teacherSalaries[idx];
  }

  getStudentReportCard(studentId: number, examType: string = "Mid-Term"): ReportCardData | null {
    const student = this.students.find((s) => s.id === studentId && !s.isDeleted);
    if (!student) return null;

    let studentMarks = this.marks.filter(
      (m) => m.studentId === studentId && (examType === "all" || m.examType.toLowerCase() === examType.toLowerCase())
    );
    if (studentMarks.length === 0) {
      studentMarks = this.marks.filter((m) => m.studentId === studentId);
    }

    const totalMarks = studentMarks.reduce((sum, m) => sum + m.totalMarks, 0) || 500;
    const obtainedMarks = studentMarks.reduce((sum, m) => sum + m.obtainedMarks, 0) || 0;
    const percentage = Math.round((obtainedMarks / (totalMarks || 1)) * 100);

    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";
    else if (percentage >= 50) grade = "D";

    const allPassed = studentMarks.length > 0 && studentMarks.every((m) => (m.obtainedMarks / m.totalMarks) >= 0.33);
    const resultStatus: "PASS" | "FAIL" = allPassed ? "PASS" : "FAIL";

    const attRecords = this.attendance.filter((a) => a.studentId === studentId);
    const presentCount = attRecords.filter((a) => a.status === "present").length;
    const attendancePercentage = attRecords.length > 0 ? Math.round((presentCount / attRecords.length) * 100) : 94;

    return {
      student,
      examType: studentMarks[0]?.examType || examType,
      academicSession: this.settings.academicSession || "2026-2027",
      marks: studentMarks,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      resultStatus,
      position: percentage >= 85 ? "1st Position" : percentage >= 75 ? "Top 5 in Section" : "Passed",
      attendancePercentage,
      teacherRemarks:
        percentage >= 80
          ? "Outstanding conceptual clarity, active classroom participation, and exemplary discipline."
          : percentage >= 60
          ? "Satisfactory performance with potential for higher grades with consistent revision."
          : "Needs dedicated attention in core analytical subjects.",
      principalSignature: "Prof. Tariq Mehmood",
    };
  }

  // Raw Setters for Real-Time Supabase Synchronization
  setRawSubjects(list: SubjectRecord[]) { if (list.length > 0) this.subjects = list; }
  setRawTeachers(list: TeacherRecord[]) { if (list.length > 0) this.teachers = list; }
  setRawClasses(list: ClassRecord[]) { if (list.length > 0) this.classes = list; }
  setRawStudents(list: StudentRecord[]) { if (list.length > 0) this.students = list; }
  setRawFees(list: FeeRecord[]) { if (list.length > 0) this.fees = list; }
  setRawSalaries(list: TeacherSalaryRecord[]) { if (list.length > 0) this.teacherSalaries = list; }
  setRawAttendance(list: AttendanceRecord[]) { if (list.length > 0) this.attendance = list; }
  setRawTeacherAttendance(list: TeacherAttendanceRecord[]) { if (list.length > 0) this.teacherAttendance = list; }
  setRawTeacherLeaves(list: TeacherLeaveRecord[]) { if (list.length > 0) this.teacherLeaves = list; }
  setRawHomework(list: HomeworkRecord[]) { if (list.length > 0) this.homework = list; }
  setRawNotifications(list: AdminNotificationRecord[]) { if (list.length > 0) this.adminNotifications = list; }

  getNotices(audience?: string): NoticeRecord[] {
    if (!audience || audience === "all") return [...this.notices];
    return this.notices.filter((n) => n.targetAudience === "all" || n.targetAudience === audience);
  }

  addNotice(data: Omit<NoticeRecord, "id" | "createdAt">): NoticeRecord {
    const nextId = this.notices.length > 0 ? Math.max(...this.notices.map((n) => n.id)) + 1 : 1;
    const newNotice: NoticeRecord = {
      ...data,
      id: nextId,
      createdAt: new Date().toISOString().split("T")[0],
    };
    this.notices.unshift(newNotice);
    return newNotice;
  }

  deleteNotice(id: number): boolean {
    const initialLen = this.notices.length;
    this.notices = this.notices.filter((n) => n.id !== id);
    return this.notices.length < initialLen;
  }

  getSettings(): SchoolSettingsRecord {
    return { ...this.settings };
  }

  updateSettings(data: Partial<SchoolSettingsRecord>): SchoolSettingsRecord {
    this.settings = { ...this.settings, ...data };
    return { ...this.settings };
  }

  getDashboardStats() {
    const totalStudents = this.students.filter((s) => !s.isDeleted).length;
    const activeStudents = this.students.filter((s) => !s.isDeleted && s.status === "active").length;
    const totalTeachers = this.teachers.filter((t) => !t.isDeleted).length;
    const totalClasses = this.classes.filter((c) => !c.isDeleted).length;
    const totalSubjects = this.subjects.filter((s) => !s.isDeleted).length;

    const totalCollected = this.fees
      .filter((f) => f.status === "paid")
      .reduce((sum, f) => sum + f.amount, 0);

    const pendingFees = this.fees
      .filter((f) => f.status === "pending" || f.status === "overdue")
      .reduce((sum, f) => sum + f.amount, 0);

    const today = new Date().toISOString().split("T")[0];
    const todayAttendance = this.attendance.filter((a) => a.date === today);
    const presentToday = todayAttendance.filter((a) => a.status === "present").length;
    const attendanceRate =
      todayAttendance.length > 0
        ? Math.round((presentToday / todayAttendance.length) * 100)
        : 95;

    return {
      totalStudents,
      activeStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
      totalCollectedPKR: totalCollected,
      pendingFeesPKR: pendingFees,
      attendanceRate,
    };
  }
}

export const store = new SchoolStore();
export default store;
