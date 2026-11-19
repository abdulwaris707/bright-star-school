import { Request, Response } from "express";
import store from "../services/store";
import { AuthRequest } from "../middleware/authMiddleware";

const getId = (param: string | string[] | undefined): number =>
  parseInt(Array.isArray(param) ? param[0] : (param || "0"), 10);

const getActor = (req: Request) => {
  const u = (req as AuthRequest).user;
  if (u) {
    return { id: u.id, name: u.fullName || u.username, role: u.role };
  }
  return { id: 1, name: "Admin (Direct)", role: "admin" };
};

// =================================================================
// MODULE 1: SUBJECTS CRUD
// =================================================================
export function getSubjects(req: Request, res: Response): void {
  const includeDeleted = req.query.includeDeleted === "true";
  res.status(200).json(store.getSubjects(includeDeleted));
}

export function getSubject(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const subject = store.getSubject(id);
  if (!subject) {
    res.status(404).json({ message: "Subject not found." });
    return;
  }
  res.status(200).json(subject);
}

export function createSubject(req: Request, res: Response): void {
  const { name, code, description, type, periodsPerWeek } = req.body;
  if (!name || !code) {
    res.status(400).json({ message: "Subject name and code are required." });
    return;
  }

  try {
    const actor = getActor(req);
    const newSubject = store.addSubject(
      {
        name,
        code,
        description: description || "",
        type: type === "elective" ? "elective" : "compulsory",
        periodsPerWeek: periodsPerWeek ? parseInt(periodsPerWeek, 10) : 5,
      },
      actor
    );
    res.status(201).json(newSubject);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to create subject." });
  }
}

export function updateSubject(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const updated = store.updateSubject(id, req.body, actor);
  if (!updated) {
    res.status(404).json({ message: "Subject not found." });
    return;
  }
  res.status(200).json(updated);
}

export function deleteSubject(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const success = store.deleteSubject(id, actor);
  if (!success) {
    res.status(404).json({ message: "Subject not found." });
    return;
  }
  res.status(200).json({ message: "Subject deleted successfully." });
}

// =================================================================
// MODULE 1 & 7: STUDENTS CRUD & SCOPED TEACHER OPERATIONS
// =================================================================
export function getStudents(req: Request, res: Response): void {
  const query = req.query.query as string | undefined;
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  const status = req.query.status as string | undefined;
  const includeDeleted = req.query.includeDeleted === "true";

  const students = store.getStudents(query, classId, status, includeDeleted);
  res.status(200).json(students);
}

export function getStudent(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const student = store.getStudent(id);
  if (!student) {
    res.status(404).json({ message: "Student record not found." });
    return;
  }
  res.status(200).json(student);
}

export function createStudent(req: Request, res: Response): void {
  const {
    rollNo,
    fullName,
    classId,
    className,
    section,
    parentName,
    guardianName,
    fatherCnic,
    bFormNo,
    dob,
    bloodGroup,
    phone,
    address,
    status,
    admissionDate,
    concessionType,
    academicNotes,
  } = req.body;

  if (!fullName) {
    res.status(400).json({ message: "Full name is required." });
    return;
  }

  const generatedRoll = rollNo || `BS-2026-${Math.floor(100 + Math.random() * 900)}`;
  const resolvedSection = section || "A";
  const actor = getActor(req);

  try {
    const newStudent = store.addStudent(
      {
        rollNo: generatedRoll,
        fullName,
        classId: classId ? parseInt(classId, 10) : 1,
        className: className || `Class 10 - ${resolvedSection}`,
        section: resolvedSection,
        parentName: parentName || guardianName || "Guardian",
        fatherCnic: fatherCnic || "",
        bFormNo: bFormNo || "",
        dob: dob || "2009-01-01",
        bloodGroup: bloodGroup || "O+",
        phone: phone || "0300-0000000",
        address: address || "Lahore",
        concessionType: concessionType || "Regular",
        academicNotes: academicNotes || "",
        status: status === "inactive" ? "inactive" : "active",
        admissionDate: admissionDate || new Date().toISOString().split("T")[0],
      },
      actor
    );

    res.status(201).json(newStudent);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to enroll student." });
  }
}

export function updateStudent(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  try {
    const updated = store.updateStudent(id, req.body, actor);
    if (!updated) {
      res.status(404).json({ message: "Student not found." });
      return;
    }
    res.status(200).json(updated);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to update student." });
  }
}

export function deleteStudent(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const deleted = store.deleteStudent(id, actor);
  if (!deleted) {
    res.status(404).json({ message: "Student not found." });
    return;
  }
  res.status(200).json({ message: "Student deleted successfully." });
}

export function transferStudent(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const targetClassId = parseInt(req.body.targetClassId, 10);
  const reason = req.body.reason as string | undefined;
  const actor = getActor(req);

  if (!targetClassId) {
    res.status(400).json({ message: "Target Class ID is required for student transfer." });
    return;
  }

  try {
    const transferred = store.transferStudent(id, targetClassId, reason, actor);
    if (!transferred) {
      res.status(404).json({ message: "Student not found." });
      return;
    }
    res.status(200).json(transferred);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to transfer student." });
  }
}

// =================================================================
// MODULE 1: TEACHERS CRUD
// =================================================================
export function getTeachers(req: Request, res: Response): void {
  const query = req.query.query as string | undefined;
  const includeDeleted = req.query.includeDeleted === "true";
  const teachers = store.getTeachers(query, includeDeleted);
  res.status(200).json(teachers);
}

export function getTeacher(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const teacher = store.getTeacher(id);
  if (!teacher) {
    res.status(404).json({ message: "Teacher record not found." });
    return;
  }
  res.status(200).json(teacher);
}

export function createTeacher(req: Request, res: Response): void {
  const {
    employeeId,
    fullName,
    designation,
    subjectSpecialization,
    subject,
    qualification,
    phone,
    email,
    address,
    status,
  } = req.body;

  if (!fullName) {
    res.status(400).json({ message: "Full name is required." });
    return;
  }

  const generatedId = employeeId || `TCH-${Math.floor(100 + Math.random() * 900)}`;
  const spec = subjectSpecialization || subject || "General Faculty";
  const actor = getActor(req);

  try {
    const newTeacher = store.addTeacher(
      {
        employeeId: generatedId,
        fullName,
        designation: designation || "Senior Teacher",
        subjectSpecialization: spec,
        qualification: qualification || "Master's Degree",
        phone: phone || "0300-0000000",
        email: email || `${generatedId.toLowerCase()}@brightstar.edu.pk`,
        address: address || "Lahore",
        status: status === "inactive" ? "inactive" : "active",
      },
      actor
    );

    res.status(201).json(newTeacher);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to add teacher." });
  }
}

export function updateTeacher(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const updated = store.updateTeacher(id, req.body, actor);
  if (!updated) {
    res.status(404).json({ message: "Teacher not found." });
    return;
  }
  res.status(200).json(updated);
}

export function deleteTeacher(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const deleted = store.deleteTeacher(id, actor);
  if (!deleted) {
    res.status(404).json({ message: "Teacher not found." });
    return;
  }
  res.status(200).json({ message: "Teacher removed." });
}

// =================================================================
// MODULE 1: CLASSES CRUD
// =================================================================
export function getClasses(req: Request, res: Response): void {
  const includeDeleted = req.query.includeDeleted === "true";
  res.status(200).json(store.getClasses(includeDeleted));
}

export function getClass(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const c = store.getClass(id);
  if (!c) {
    res.status(404).json({ message: "Class not found." });
    return;
  }
  res.status(200).json(c);
}

export function createClass(req: Request, res: Response): void {
  const { name, section, gradeLevel, roomNumber, capacity, classTeacherName, classTeacherId, studentCount } = req.body;
  if (!name || !section || !roomNumber) {
    res.status(400).json({ message: "Class name, section, and room number are required." });
    return;
  }

  const actor = getActor(req);
  const newClass = store.addClass(
    {
      name,
      section,
      gradeLevel: gradeLevel ? parseInt(gradeLevel, 10) : 10,
      roomNumber,
      capacity: capacity ? parseInt(capacity, 10) : 40,
      classTeacherId: classTeacherId ? parseInt(classTeacherId, 10) : undefined,
      classTeacherName: classTeacherName || "Staff Faculty",
      studentCount: studentCount ? parseInt(studentCount, 10) : 0,
    },
    actor
  );

  res.status(201).json(newClass);
}

export function updateClass(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const updated = store.updateClass(id, req.body, actor);
  if (!updated) {
    res.status(404).json({ message: "Class not found." });
    return;
  }
  res.status(200).json(updated);
}

export function deleteClass(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const success = store.deleteClass(id, actor);
  if (!success) {
    res.status(404).json({ message: "Class not found." });
    return;
  }
  res.status(200).json({ message: "Class deleted successfully." });
}

// =================================================================
// MODULE 2: ACADEMIC MAPPING & CLASS TEACHER IN-CHARGE ASSIGNMENT
// =================================================================
export function getClassSubjects(req: Request, res: Response): void {
  const classId = getId(req.params.classId);
  res.status(200).json(store.getClassSubjects(classId));
}

export function assignSubjectToClass(req: Request, res: Response): void {
  const classId = getId(req.params.classId);
  const subjectId = parseInt(req.body.subjectId, 10);
  if (!subjectId) {
    res.status(400).json({ message: "Subject ID is required." });
    return;
  }

  try {
    const mapping = store.assignSubjectToClass(classId, subjectId);
    res.status(201).json(mapping);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to assign subject." });
  }
}

export function removeSubjectFromClass(req: Request, res: Response): void {
  const classId = getId(req.params.classId);
  const subjectId = getId(req.params.subjectId);
  const success = store.removeSubjectFromClass(classId, subjectId);
  if (!success) {
    res.status(404).json({ message: "Mapping not found." });
    return;
  }
  res.status(200).json({ message: "Subject removed from class." });
}

export function getTeacherAssignments(req: Request, res: Response): void {
  const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string, 10) : undefined;
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string, 10) : undefined;

  res.status(200).json(store.getTeacherAssignments({ teacherId, classId, subjectId }));
}

export function assignTeacherToClassSubject(req: Request, res: Response): void {
  const { teacherId, classId, subjectId, academicSession } = req.body;
  if (!teacherId || !classId || !subjectId) {
    res.status(400).json({ message: "Teacher ID, Class ID, and Subject ID are required." });
    return;
  }

  const actor = getActor(req);
  try {
    const assignment = store.assignTeacherToSubjectClass(
      parseInt(teacherId, 10),
      parseInt(classId, 10),
      parseInt(subjectId, 10),
      academicSession || "2026-2027",
      actor
    );
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to assign teacher." });
  }
}

export function removeTeacherAssignment(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const success = store.removeTeacherAssignment(id);
  if (!success) {
    res.status(404).json({ message: "Assignment not found." });
    return;
  }
  res.status(200).json({ message: "Teacher assignment removed." });
}

export function assignClassIncharge(req: Request, res: Response): void {
  const classId = getId(req.params.classId);
  const teacherId = parseInt(req.body.teacherId, 10);
  const reason = req.body.reason as string | undefined;
  const academicSession = (req.body.academicSession as string) || "2026-2027";

  if (!teacherId) {
    res.status(400).json({ message: "Teacher ID is required to designate Class In-Charge." });
    return;
  }

  const actor = getActor(req);
  try {
    const history = store.assignClassIncharge(classId, teacherId, academicSession, reason, actor);
    res.status(200).json({
      message: "Class Teacher In-Charge designated successfully.",
      history,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to assign in-charge." });
  }
}

export function getClassInchargeHistory(req: Request, res: Response): void {
  const classId = req.params.classId ? getId(req.params.classId) : undefined;
  res.status(200).json(store.getClassInchargeHistory(classId));
}

// =================================================================
// MODULE 3: RESTRICTED STUDENT ATTENDANCE (CLASS IN-CHARGE ONLY)
// =================================================================
export function getAttendance(req: Request, res: Response): void {
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  const date = req.query.date as string | undefined;
  const studentId = req.query.studentId ? parseInt(req.query.studentId as string, 10) : undefined;

  const records = store.getAttendance(classId, date, studentId);
  res.status(200).json(records);
}

export function saveAttendance(req: Request, res: Response): void {
  const { records } = req.body;
  if (!records || !Array.isArray(records) || records.length === 0) {
    res.status(400).json({ message: "An array of attendance records is required." });
    return;
  }

  const classId = parseInt(records[0].classId, 10);
  const user = (req as AuthRequest).user;

  // RBAC Enforcement: If marked by a teacher, verify they are the designated Class Teacher In-Charge!
  if (user && user.role === "teacher") {
    const isIncharge = store.isTeacherClassIncharge(user.id, classId);
    if (!isIncharge) {
      const classRecord = store.getClass(classId);
      res.status(403).json({
        message: `Access denied. Only the designated Class Teacher In-Charge (${classRecord?.classTeacherName || "Assigned Faculty"}) can record or modify attendance for ${classRecord?.name || "this class"}.`,
        classInchargeName: classRecord?.classTeacherName,
      });
      return;
    }
  }

  const actor = getActor(req);
  const count = store.saveAttendanceBatch(records, actor);
  res.status(200).json({ message: "Attendance saved successfully.", count });
}

// =================================================================
// MODULE 4: TEACHER ATTENDANCE & VERIFICATION SYSTEM (ADMIN)
// =================================================================
export function getDailyRotatingCode(_req: Request, res: Response): void {
  res.status(200).json(store.getDailyRotatingCode());
}

export function teacherSelfCheckIn(req: Request, res: Response): void {
  const { code, verificationMethod, remarks } = req.body;
  if (!code) {
    res.status(400).json({ message: "Daily rotating Check-In PIN or QR code is required." });
    return;
  }

  const user = (req as AuthRequest).user;
  const teacherId = user && user.role === "teacher" ? user.id : parseInt(req.body.teacherId || "1", 10);

  try {
    const checkIn = store.teacherCheckIn(teacherId, code, verificationMethod || "PIN_VERIFIED", remarks);
    res.status(200).json({
      message: `Check-in recorded successfully at ${checkIn.checkInTime}.`,
      checkIn,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to record check-in." });
  }
}

export function getTeacherAttendance(req: Request, res: Response): void {
  const date = req.query.date as string | undefined;
  const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string, 10) : undefined;
  const all = req.query.all === "true";
  res.status(200).json(store.getTeacherAttendance(date, teacherId, all));
}

export function adminVerifyTeacherAttendance(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const { status, remarks, checkInTime } = req.body;
  if (!status) {
    res.status(400).json({ message: "Verification status is required." });
    return;
  }

  const admin = getActor(req);
  try {
    const verified = store.adminVerifyTeacherAttendance(id, status, remarks, admin, checkInTime);
    res.status(200).json({ message: "Teacher attendance verified successfully.", record: verified });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to verify teacher attendance." });
  }
}

export function adminMarkTeacherAttendance(req: Request, res: Response): void {
  const { teacherId, date, status, remarks, checkInTime } = req.body;
  if (!teacherId || !date || !status) {
    res.status(400).json({ message: "Teacher ID, date, and status are required." });
    return;
  }

  const admin = getActor(req);
  try {
    const record = store.adminMarkTeacherAttendance(
      parseInt(teacherId, 10),
      date,
      status,
      remarks,
      admin,
      checkInTime
    );
    res.status(200).json({ message: "Teacher attendance marked successfully.", record });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to mark attendance." });
  }
}

// =================================================================
// MODULE 5: TEACHER LEAVES & REAL-TIME ADMIN NOTIFICATIONS
// =================================================================
export function getTeacherLeaves(req: Request, res: Response): void {
  const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string, 10) : undefined;
  res.status(200).json(store.getTeacherLeaves(teacherId));
}

export function submitLeaveRequest(req: Request, res: Response): void {
  const { leaveType, startDate, endDate, reason } = req.body;
  if (!leaveType || !startDate || !endDate || !reason) {
    res.status(400).json({ message: "Leave type, start date, end date, and reason are required." });
    return;
  }

  const user = (req as AuthRequest).user;
  const teacherId = user && user.role === "teacher" ? user.id : parseInt(req.body.teacherId || "1", 10);

  try {
    const leaveRec = store.submitLeaveRequest(teacherId, leaveType, startDate, endDate, reason);
    res.status(201).json({
      message: "Leave request submitted successfully. Principal office notified.",
      leave: leaveRec,
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to submit leave request." });
  }
}

export function reviewLeaveRequest(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const { status, adminRemarks, substituteTeacherId } = req.body;
  if (!status || !["approved", "rejected"].includes(status)) {
    res.status(400).json({ message: "Valid status ('approved' or 'rejected') is required." });
    return;
  }

  const admin = getActor(req);
  try {
    const updated = store.reviewLeaveRequest(
      id,
      status,
      adminRemarks,
      substituteTeacherId ? parseInt(substituteTeacherId, 10) : undefined,
      admin
    );
    res.status(200).json({ message: `Leave request ${status}.`, leave: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to review leave request." });
  }
}

export function getAdminNotifications(_req: Request, res: Response): void {
  res.status(200).json(store.getAdminNotifications());
}

export function markNotificationRead(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const success = store.markNotificationRead(id);
  res.status(200).json({ success });
}

export function markAllNotificationsRead(_req: Request, res: Response): void {
  store.markAllNotificationsRead();
  res.status(200).json({ success: true });
}

// =================================================================
// MODULE 6: HOMEWORK & TASK ASSIGNMENT
// =================================================================
export function getHomework(req: Request, res: Response): void {
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string, 10) : undefined;
  const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string, 10) : undefined;
  const status = req.query.status as string | undefined;

  res.status(200).json(store.getHomework({ classId, subjectId, teacherId, status }));
}

export function createHomework(req: Request, res: Response): void {
  const {
    title,
    description,
    classId,
    className,
    section,
    subjectId,
    subjectName,
    assignedDate,
    dueDate,
    maxMarks,
    attachmentUrl,
  } = req.body;

  if (!title || !description || !classId || !subjectId || !dueDate) {
    res.status(400).json({ message: "Title, description, class, subject, and due date are required." });
    return;
  }

  const user = (req as AuthRequest).user;
  const teacherId = user && user.role === "teacher" ? user.id : parseInt(req.body.assignedByTeacherId || "1", 10);
  const teacherName = user?.fullName || req.body.teacherName || "Assigned Faculty";
  const actor = getActor(req);

  const cRecord = store.getClass(parseInt(classId, 10));
  const sRecord = store.getSubject(parseInt(subjectId, 10));

  try {
    const newHomework = store.createHomework(
      {
        title,
        description,
        classId: parseInt(classId, 10),
        className: className || cRecord?.name || `Class ${classId}`,
        section: section || cRecord?.section || "A",
        subjectId: parseInt(subjectId, 10),
        subjectName: subjectName || sRecord?.name || "Subject",
        assignedByTeacherId: teacherId,
        teacherName,
        assignedDate: assignedDate || new Date().toISOString().split("T")[0],
        dueDate,
        maxMarks: maxMarks ? parseInt(maxMarks, 10) : 20,
        attachmentUrl: attachmentUrl || "",
      },
      actor
    );

    res.status(201).json(newHomework);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to create homework." });
  }
}

export function updateHomework(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const updated = store.updateHomework(id, req.body, actor);
  if (!updated) {
    res.status(404).json({ message: "Homework not found." });
    return;
  }
  res.status(200).json(updated);
}

export function deleteHomework(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const actor = getActor(req);
  const success = store.deleteHomework(id, actor);
  if (!success) {
    res.status(404).json({ message: "Homework not found." });
    return;
  }
  res.status(200).json({ message: "Homework deleted successfully." });
}

// =================================================================
// MODULE 8: UNIFIED AUDIT LOGGING
// =================================================================
export function getAuditLogs(req: Request, res: Response): void {
  const entityType = req.query.entityType as string | undefined;
  const action = req.query.action as string | undefined;
  const actorRole = req.query.actorRole as string | undefined;

  res.status(200).json(store.getAuditLogs({ entityType, action, actorRole }));
}

// =================================================================
// EXISTING MARKS, TIMETABLE, FEES, SETTINGS & NOTICES (PRESERVED)
// =================================================================
export function getMarks(req: Request, res: Response): void {
  const studentId = req.query.studentId ? parseInt(req.query.studentId as string, 10) : undefined;
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  const subject = req.query.subject as string | undefined;

  const records = store.getMarks(studentId, classId, subject);
  res.status(200).json(records);
}

export function saveMark(req: Request, res: Response): void {
  if (req.body.records && Array.isArray(req.body.records)) {
    const savedList = req.body.records.map((r: any) => {
      const tMarks = parseInt(r.totalMarks, 10) || 100;
      const oMarks = parseInt(r.obtainedMarks, 10) || 0;
      const pct = (oMarks / tMarks) * 100;
      let grade = "F";
      if (pct >= 90) grade = "A+";
      else if (pct >= 80) grade = "A";
      else if (pct >= 70) grade = "B";
      else if (pct >= 60) grade = "C";
      else if (pct >= 50) grade = "D";

      return store.addOrUpdateMark({
        studentId: parseInt(r.studentId, 10),
        studentName: r.studentName || "Student",
        rollNo: r.rollNo || "-",
        classId: r.classId ? parseInt(r.classId, 10) : 1,
        examType: r.examType || "Mid-Term",
        subject: r.subject || "General",
        totalMarks: tMarks,
        obtainedMarks: oMarks,
        grade,
        remarks: r.remarks || "",
      });
    });
    res.status(200).json({ message: "Marks batch saved successfully", count: savedList.length });
    return;
  }

  const { studentId, studentName, rollNo, classId, examType, subject, totalMarks, obtainedMarks, remarks } = req.body;
  if (!studentId || !subject || totalMarks === undefined || obtainedMarks === undefined) {
    res.status(400).json({ message: "Student, subject, total marks, and obtained marks are required." });
    return;
  }

  const tMarks = parseInt(totalMarks, 10) || 100;
  const oMarks = parseInt(obtainedMarks, 10) || 0;
  const percentage = (oMarks / tMarks) * 100;

  let grade = "F";
  if (percentage >= 90) grade = "A+";
  else if (percentage >= 80) grade = "A";
  else if (percentage >= 70) grade = "B";
  else if (percentage >= 60) grade = "C";
  else if (percentage >= 50) grade = "D";

  const saved = store.addOrUpdateMark({
    studentId: parseInt(studentId, 10),
    studentName: studentName || "Student",
    rollNo: rollNo || "-",
    classId: classId ? parseInt(classId, 10) : 1,
    examType: examType || "Mid-Term",
    subject,
    totalMarks: tMarks,
    obtainedMarks: oMarks,
    grade,
    remarks: remarks || "",
  });

  res.status(200).json(saved);
}

export function getTimetable(req: Request, res: Response): void {
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  res.status(200).json(store.getTimetable(classId));
}

export function createTimetableEntry(req: Request, res: Response): void {
  const { classId, className, dayOfWeek, periodNumber, startTime, endTime, subject, teacherName, roomNumber, room } = req.body;

  const entry = store.addTimetableEntry({
    classId: classId ? parseInt(classId, 10) : 1,
    className: className || "Class 10 - Blue",
    dayOfWeek: dayOfWeek || "Monday",
    periodNumber: periodNumber ? parseInt(periodNumber, 10) : 1,
    startTime: startTime || "08:00 AM",
    endTime: endTime || "08:45 AM",
    subject: subject || "Physics",
    teacherName: teacherName || "Sir Tariq Aziz",
    roomNumber: roomNumber || room || "Room 14",
  });

  res.status(201).json(entry);
}

export function getFees(req: Request, res: Response): void {
  const studentId = req.query.studentId ? parseInt(req.query.studentId as string, 10) : undefined;
  const status = req.query.status as string | undefined;
  const classId = req.query.classId ? parseInt(req.query.classId as string, 10) : undefined;
  res.status(200).json(store.getFees(studentId, status, classId));
}

export function getFee(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const fee = store.getFee(id);
  if (!fee) {
    res.status(404).json({ message: "Fee challan not found." });
    return;
  }
  res.status(200).json(fee);
}

export function generateFeeChallan(req: Request, res: Response): void {
  const {
    studentId,
    studentName,
    rollNo,
    className,
    challanNo,
    month,
    year,
    amount,
    tuitionFee,
    examFee,
    otherCharges,
    dueDate,
  } = req.body;

  const calculatedAmount =
    amount !== undefined
      ? parseInt(amount, 10)
      : parseInt(tuitionFee || 0, 10) + parseInt(examFee || 0, 10) + parseInt(otherCharges || 0, 10);

  if (!studentId || !month || !calculatedAmount) {
    res.status(400).json({ message: "Student ID, month, and valid amount are required." });
    return;
  }

  const fee = store.generateFee({
    studentId: parseInt(studentId, 10),
    studentName: studentName || "Student",
    rollNo: rollNo || "-",
    className: className || "Class 10",
    challanNo: challanNo || `CH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    month,
    year: year ? parseInt(year, 10) : 2026,
    amount: calculatedAmount,
    dueDate: dueDate || "2026-11-20",
  });

  res.status(201).json(fee);
}

export function generateBulkClassFees(req: Request, res: Response): void {
  const { classId, month, year, dueDate, tuitionFee, examFee, labCharges, lateFeeSurcharge } = req.body;
  if (!classId || !month || !tuitionFee) {
    res.status(400).json({ message: "Class ID, month, and tuition fee are required." });
    return;
  }

  const admin = getActor(req);
  try {
    const result = store.generateBulkClassFees(
      classId === "all" ? "all" : parseInt(classId, 10),
      month,
      year ? parseInt(year, 10) : 2026,
      dueDate || "2026-11-25",
      {
        tuitionFee: parseInt(tuitionFee, 10),
        examFee: examFee ? parseInt(examFee, 10) : 0,
        labCharges: labCharges ? parseInt(labCharges, 10) : 0,
        lateFeeSurcharge: lateFeeSurcharge ? parseInt(lateFeeSurcharge, 10) : 500,
      },
      admin
    );
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to generate class fee challans." });
  }
}

export function submitFeePaymentProof(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const { paymentMethod, transactionRef, proofScreenshotUrl, paymentRemarks } = req.body;

  if (!paymentMethod || !transactionRef) {
    res.status(400).json({ message: "Payment method and transaction reference are required." });
    return;
  }

  const actor = getActor(req);
  try {
    const fee = store.submitFeePaymentProof(
      id,
      {
        paymentMethod,
        transactionRef,
        proofScreenshotUrl: proofScreenshotUrl || "",
        paymentRemarks,
      },
      actor
    );
    res.status(200).json({ message: "Payment proof submitted successfully.", fee });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to submit payment proof." });
  }
}

export function verifyFeePayment(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const { action, reason } = req.body;

  if (!action || (action !== "approve" && action !== "reject")) {
    res.status(400).json({ message: "Action must be either 'approve' or 'reject'." });
    return;
  }

  const admin = getActor(req);
  try {
    const fee = store.verifyFeePayment(id, action, admin, reason);
    res.status(200).json({ message: `Payment proof ${action}d successfully.`, fee });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to verify fee payment." });
  }
}

export function payFeeChallan(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const { paymentMethod, transactionRef } = req.body;
  const admin = getActor(req);

  const updated = store.payFee(id, paymentMethod || "Cash Counter", transactionRef, admin);
  if (!updated) {
    res.status(404).json({ message: "Challan record not found." });
    return;
  }

  res.status(200).json(updated);
}

// =================================================================
// TEACHER SALARY & PAYROLL MANAGEMENT
// =================================================================
export function getTeacherSalaries(req: Request, res: Response): void {
  const month = req.query.month as string | undefined;
  const year = req.query.year ? parseInt(req.query.year as string, 10) : undefined;
  const teacherId = req.query.teacherId ? parseInt(req.query.teacherId as string, 10) : undefined;
  res.status(200).json(store.getTeacherSalaries(month, year, teacherId));
}

export function getTeacherSalary(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const salary = store.getTeacherSalary(id);
  if (!salary) {
    res.status(404).json({ message: "Salary slip not found." });
    return;
  }
  res.status(200).json(salary);
}

export function generateMonthlyPayroll(req: Request, res: Response): void {
  const { month, year } = req.body;
  if (!month) {
    res.status(400).json({ message: "Month is required for payroll generation." });
    return;
  }

  const admin = getActor(req);
  try {
    const result = store.generateMonthlyPayroll(month, year ? parseInt(year, 10) : 2026, admin);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to generate monthly payroll." });
  }
}

export function disburseTeacherSalary(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const { paymentMethod, transactionRef, paymentDate, remarks } = req.body;
  const admin = getActor(req);

  try {
    const disbursed = store.disburseTeacherSalary(
      id,
      {
        paymentMethod: paymentMethod || "Bank Transfer",
        transactionRef,
        paymentDate: paymentDate || new Date().toISOString().split("T")[0],
        remarks,
      },
      admin
    );
    res.status(200).json({ message: "Salary disbursed successfully.", salary: disbursed });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to disburse salary." });
  }
}

export function updateTeacherSalary(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const admin = getActor(req);
  try {
    const updated = store.updateTeacherSalary(id, req.body, admin);
    res.status(200).json({ message: "Salary slip updated successfully.", salary: updated });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Failed to update salary slip." });
  }
}

export function getNotices(req: Request, res: Response): void {
  const audience = req.query.audience as string | undefined;
  res.status(200).json(store.getNotices(audience));
}

export function createNotice(req: Request, res: Response): void {
  const { title, content, targetAudience, postedBy } = req.body;
  if (!title || !content) {
    res.status(400).json({ message: "Title and content are required." });
    return;
  }

  const notice = store.addNotice({
    title,
    content,
    targetAudience: targetAudience || "all",
    postedBy: postedBy || "School Administration",
  });

  res.status(201).json(notice);
}

export function deleteNotice(req: Request, res: Response): void {
  const id = getId(req.params.id);
  const deleted = store.deleteNotice(id);
  if (!deleted) {
    res.status(404).json({ message: "Notice not found." });
    return;
  }
  res.status(200).json({ message: "Notice deleted." });
}

export function getSettings(_req: Request, res: Response): void {
  res.status(200).json(store.getSettings());
}

export function updateSettings(req: Request, res: Response): void {
  const updated = store.updateSettings(req.body);
  res.status(200).json(updated);
}

export function getStats(_req: Request, res: Response): void {
  res.status(200).json(store.getDashboardStats());
}

export function getDefaulters(_req: Request, res: Response): void {
  res.status(200).json(store.getFeeDefaulters());
}

export function getReportCard(req: Request, res: Response): void {
  const studentId = getId(req.params.studentId);
  const examType = (req.query.examType as string) || "Mid-Term";
  const report = store.getStudentReportCard(studentId, examType);
  if (!report) {
    res.status(404).json({ message: "Student or marks not found." });
    return;
  }
  res.status(200).json(report);
}

export function sendSmsBroadcast(req: Request, res: Response): void {
  const { recipientType, message } = req.body;
  if (!recipientType || !message) {
    res.status(400).json({ message: "Recipient type and message content are required." });
    return;
  }

  let recipientCount = 120;
  if (recipientType === "absent_today") recipientCount = 14;
  else if (recipientType === "fee_defaulters") recipientCount = store.getFeeDefaulters().length;

  res.status(200).json({
    status: "dispatched",
    provider: "Pakistan SMS Gateway (Masking: BRIGHT-STAR)",
    recipientType,
    recipientCount,
    message,
    sentAt: new Date().toISOString(),
  });
}
