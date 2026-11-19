import { pool } from "../db";
import type {
  StudentRecord,
  TeacherRecord,
  ClassRecord,
  SubjectRecord,
  ClassSubjectRecord,
  TeacherAssignmentRecord,
  ClassInchargeHistoryRecord,
  AttendanceRecord,
  TeacherAttendanceRecord,
  TeacherLeaveRecord,
  AdminNotificationRecord,
  HomeworkRecord,
  FeeRecord,
  TeacherSalaryRecord,
  MarkRecord,
  TimetableRecord,
  AuditLogRecord,
  SchoolSettingsRecord,
} from "./store";

class DatabaseBridge {
  private lastSyncTime: number = 0;
  private isSyncing: boolean = false;
  private syncIntervalMs: number = 3000; // 3 seconds TTL for fresh reads

  async ensureSynced(store: any): Promise<void> {
    if (!pool) return;
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncIntervalMs || this.isSyncing) {
      return;
    }
    await this.syncFromDb(store);
  }

  invalidateCache(): void {
    this.lastSyncTime = 0;
  }

  async syncFromDb(store: any): Promise<void> {
    if (!pool || this.isSyncing) return;
    this.isSyncing = true;
    try {
      const [
        subRes,
        tchRes,
        clsRes,
        clsSubRes,
        tchAssRes,
        inchargeRes,
        stdRes,
        attRes,
        tchAttRes,
        leavesRes,
        feesRes,
        salRes,
        hwRes,
        notifRes,
        marksRes,
        ttRes,
        auditRes,
      ] = await Promise.all([
        pool.query("SELECT * FROM subjects WHERE is_deleted = false ORDER BY id ASC"),
        pool.query("SELECT * FROM teachers WHERE is_deleted = false ORDER BY id ASC"),
        pool.query("SELECT * FROM classes WHERE is_deleted = false ORDER BY id ASC"),
        pool.query("SELECT * FROM class_subjects ORDER BY id ASC"),
        pool.query("SELECT * FROM teacher_assignments ORDER BY id ASC"),
        pool.query("SELECT * FROM class_incharge_history ORDER BY id DESC"),
        pool.query("SELECT * FROM students WHERE is_deleted = false ORDER BY id ASC"),
        pool.query("SELECT * FROM attendance ORDER BY id DESC"),
        pool.query("SELECT * FROM teacher_attendance ORDER BY id DESC"),
        pool.query("SELECT * FROM teacher_leaves ORDER BY id DESC"),
        pool.query("SELECT * FROM fees ORDER BY id DESC"),
        pool.query("SELECT * FROM teacher_salaries ORDER BY id DESC"),
        pool.query("SELECT * FROM homework ORDER BY id DESC"),
        pool.query("SELECT * FROM admin_notifications ORDER BY id DESC"),
        pool.query("SELECT * FROM marks ORDER BY id DESC"),
        pool.query("SELECT * FROM timetable ORDER BY id ASC"),
        pool.query("SELECT * FROM audit_logs ORDER BY id DESC"),
      ]);

      if (subRes.rows.length > 0) {
        store.setRawSubjects(
          subRes.rows.map((r: any): SubjectRecord => ({
            id: r.id,
            name: r.name,
            code: r.code,
            description: r.description || "",
            type: r.type,
            periodsPerWeek: r.periods_per_week,
            isDeleted: r.is_deleted,
          }))
        );
      }

      if (tchRes.rows.length > 0) {
        store.setRawTeachers(
          tchRes.rows.map((r: any): TeacherRecord => ({
            id: r.id,
            employeeId: r.employee_id,
            fullName: r.full_name,
            designation: r.designation,
            subjectSpecialization: r.subject_specialization,
            qualification: r.qualification,
            phone: r.phone,
            email: r.email,
            address: r.address || "Lahore",
            status: r.status,
            isDeleted: r.is_deleted,
          }))
        );
      }

      if (clsRes.rows.length > 0) {
        store.setRawClasses(
          clsRes.rows.map((r: any): ClassRecord => ({
            id: r.id,
            name: r.name,
            section: r.section,
            gradeLevel: r.grade_level,
            roomNumber: r.room_number,
            capacity: r.capacity,
            classTeacherId: r.class_teacher_id,
            classTeacherName: "",
            studentCount: 0,
            isDeleted: r.is_deleted,
          }))
        );
      }

      if (stdRes.rows.length > 0) {
        store.setRawStudents(
          stdRes.rows.map((r: any): StudentRecord => ({
            id: r.id,
            rollNo: r.roll_no,
            fullName: r.full_name,
            classId: r.class_id,
            className: r.section ? `Class ${r.section}` : "Class",
            section: r.section,
            parentName: r.parent_name,
            fatherCnic: r.father_cnic,
            bFormNo: r.b_form_no,
            dob: r.dob,
            bloodGroup: r.blood_group,
            phone: r.phone,
            address: r.address,
            concessionType: r.concession_type,
            academicNotes: r.academic_notes,
            status: r.status,
            isDeleted: r.is_deleted,
            admissionDate: r.admission_date,
          }))
        );
      }

      if (feesRes.rows.length > 0) {
        store.setRawFees(
          feesRes.rows.map((r: any): FeeRecord => ({
            id: r.id,
            studentId: r.student_id,
            studentName: r.student_name || "Student",
            rollNo: r.roll_no || "-",
            className: r.class_name || "Class",
            challanNo: r.challan_no,
            month: r.month,
            year: r.year,
            amount: r.amount,
            tuitionFee: r.tuition_fee,
            examFee: r.exam_fee,
            labCharges: r.lab_charges,
            lateFeeSurcharge: r.late_fee_surcharge,
            dueDate: r.due_date,
            status: r.status,
            paidDate: r.paid_date,
            paymentMethod: r.payment_method,
            transactionRef: r.transaction_ref,
            proofScreenshotUrl: r.proof_screenshot_url,
            proofSubmittedAt: r.proof_submitted_at,
            paymentRemarks: r.payment_remarks,
            verifiedByAdminName: r.verified_by_admin_name,
            verifiedAt: r.verified_at,
            rejectionReason: r.rejection_reason,
            concessionApplied: r.concession_applied,
          }))
        );
      }

      if (salRes.rows.length > 0) {
        store.setRawSalaries(
          salRes.rows.map((r: any): TeacherSalaryRecord => ({
            id: r.id,
            teacherId: r.teacher_id,
            teacherName: r.teacher_name,
            employeeId: r.employee_id,
            designation: r.designation,
            month: r.month,
            year: r.year,
            basicSalary: r.basic_salary,
            medicalAllowance: r.medical_allowance,
            houseRentAllowance: r.house_rent_allowance,
            transportAllowance: r.transport_allowance,
            taxDeductions: r.tax_deductions,
            absenceDeductions: r.absence_deductions,
            providentFund: r.provident_fund,
            grossSalary: r.gross_salary,
            netSalary: r.net_salary,
            status: r.status,
            disbursedDate: r.disbursed_date,
            disbursedMethod: r.disbursed_method,
            disbursedRef: r.disbursed_ref,
            notes: r.notes,
          }))
        );
      }

      if (attRes.rows.length > 0) {
        store.setRawAttendance(
          attRes.rows.map((r: any): AttendanceRecord => ({
            id: r.id,
            studentId: r.student_id,
            studentName: "",
            rollNo: "",
            classId: r.class_id,
            date: r.date,
            status: r.status,
            markedByTeacherId: r.marked_by_teacher_id,
            markedByName: r.marked_by_name,
            markedByRole: r.marked_by_role,
          }))
        );
      }

      if (tchAttRes.rows.length > 0) {
        store.setRawTeacherAttendance(
          tchAttRes.rows.map((r: any): TeacherAttendanceRecord => ({
            id: r.id,
            teacherId: r.teacher_id,
            teacherName: "",
            employeeId: "",
            date: r.date,
            checkInTime: r.check_in_time,
            checkOutTime: r.check_out_time,
            status: r.status,
            verificationMethod: r.verification_method || "QR_SCAN",
            verifiedByAdminName: r.verified_by_admin_name,
            verifiedAt: r.verified_at,
            remarks: r.remarks,
          }))
        );
      }

      if (leavesRes.rows.length > 0) {
        store.setRawTeacherLeaves(
          leavesRes.rows.map((r: any): TeacherLeaveRecord => {
            let aff = [];
            try {
              aff = JSON.parse(r.affected_classes || "[]");
            } catch {
              aff = [];
            }
            return {
              id: r.id,
              teacherId: r.teacher_id,
              teacherName: r.teacher_name,
              leaveType: r.leave_type,
              startDate: r.start_date,
              endDate: r.end_date,
              reason: r.reason,
              status: r.status,
              reviewedByAdminName: "",
              reviewedAt: r.reviewed_at,
              adminRemarks: r.admin_remarks,
              substituteTeacherId: r.substitute_teacher_id,
              substituteTeacherName: r.substitute_teacher_name,
              affectedClasses: aff,
              createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            };
          })
        );
      }

      if (hwRes.rows.length > 0) {
        store.setRawHomework(
          hwRes.rows.map((r: any): HomeworkRecord => ({
            id: r.id,
            title: r.title,
            description: r.description,
            classId: r.class_id,
            className: r.class_name,
            section: r.section,
            subjectId: r.subject_id,
            subjectName: r.subject_name,
            assignedByTeacherId: r.assigned_by_teacher_id,
            teacherName: r.teacher_name,
            assignedDate: r.assigned_date,
            dueDate: r.due_date,
            maxMarks: r.max_marks,
            attachmentUrl: r.attachment_url,
            status: r.status,
          }))
        );
      }

      if (notifRes.rows.length > 0) {
        store.setRawNotifications(
          notifRes.rows.map((r: any): AdminNotificationRecord => ({
            id: r.id,
            type: r.type,
            title: r.title,
            message: r.message,
            isRead: r.is_read,
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
          }))
        );
      }

      this.lastSyncTime = Date.now();
    } catch (err) {
      console.error("Database sync error (non-fatal, falling back to local memory):", err);
    } finally {
      this.isSyncing = false;
    }
  }

  // --- Real-time Mutation Writers to Supabase ---
  async persistStudent(st: StudentRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO students (id, roll_no, full_name, class_id, section, parent_name, father_cnic, b_form_no, dob, blood_group, phone, address, concession_type, academic_notes, status, is_deleted, admission_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
         ON CONFLICT (id) DO UPDATE SET
           roll_no = EXCLUDED.roll_no,
           full_name = EXCLUDED.full_name,
           class_id = EXCLUDED.class_id,
           section = EXCLUDED.section,
           parent_name = EXCLUDED.parent_name,
           phone = EXCLUDED.phone,
           address = EXCLUDED.address,
           status = EXCLUDED.status,
           is_deleted = EXCLUDED.is_deleted`,
        [
          st.id,
          st.rollNo,
          st.fullName,
          st.classId,
          st.section,
          st.parentName,
          st.fatherCnic || null,
          st.bFormNo || null,
          st.dob || null,
          st.bloodGroup || null,
          st.phone,
          st.address,
          st.concessionType || "Regular",
          st.academicNotes || null,
          st.status,
          st.isDeleted,
          st.admissionDate,
        ]
      );
    } catch (err) {
      console.error("Failed to persist student to DB:", err);
    }
  }

  async persistFee(fee: FeeRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO fees (id, student_id, student_name, roll_no, class_name, challan_no, month, year, amount, tuition_fee, exam_fee, lab_charges, late_fee_surcharge, due_date, status, paid_date, payment_method, transaction_ref, proof_screenshot_url, proof_submitted_at, payment_remarks, verified_by_admin_name, verified_at, rejection_reason, concession_applied)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           paid_date = EXCLUDED.paid_date,
           payment_method = EXCLUDED.payment_method,
           transaction_ref = EXCLUDED.transaction_ref,
           proof_screenshot_url = EXCLUDED.proof_screenshot_url,
           proof_submitted_at = EXCLUDED.proof_submitted_at,
           payment_remarks = EXCLUDED.payment_remarks,
           verified_by_admin_name = EXCLUDED.verified_by_admin_name,
           verified_at = EXCLUDED.verified_at,
           rejection_reason = EXCLUDED.rejection_reason`,
        [
          fee.id,
          fee.studentId,
          fee.studentName,
          fee.rollNo,
          fee.className,
          fee.challanNo,
          fee.month,
          fee.year,
          fee.amount,
          fee.tuitionFee || null,
          fee.examFee || null,
          fee.labCharges || null,
          fee.lateFeeSurcharge || null,
          fee.dueDate,
          fee.status,
          fee.paidDate || null,
          fee.paymentMethod || null,
          fee.transactionRef || null,
          fee.proofScreenshotUrl || null,
          fee.proofSubmittedAt || null,
          fee.paymentRemarks || null,
          fee.verifiedByAdminName || null,
          fee.verifiedAt || null,
          fee.rejectionReason || null,
          fee.concessionApplied || null,
        ]
      );
    } catch (err) {
      console.error("Failed to persist fee to DB:", err);
    }
  }

  async persistSalary(sal: TeacherSalaryRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO teacher_salaries (id, teacher_id, teacher_name, employee_id, designation, month, year, basic_salary, medical_allowance, house_rent_allowance, transport_allowance, tax_deductions, absence_deductions, provident_fund, gross_salary, net_salary, status, disbursed_date, disbursed_method, disbursed_ref, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           disbursed_date = EXCLUDED.disbursed_date,
           disbursed_method = EXCLUDED.disbursed_method,
           disbursed_ref = EXCLUDED.disbursed_ref,
           notes = EXCLUDED.notes`,
        [
          sal.id,
          sal.teacherId,
          sal.teacherName,
          sal.employeeId,
          sal.designation,
          sal.month,
          sal.year,
          sal.basicSalary,
          sal.medicalAllowance,
          sal.houseRentAllowance,
          sal.transportAllowance,
          sal.taxDeductions,
          sal.absenceDeductions,
          sal.providentFund,
          sal.grossSalary,
          sal.netSalary,
          sal.status,
          sal.disbursedDate || null,
          sal.disbursedMethod || null,
          sal.disbursedRef || null,
          sal.notes || null,
        ]
      );
    } catch (err) {
      console.error("Failed to persist salary to DB:", err);
    }
  }

  async persistAttendance(att: AttendanceRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO attendance (id, student_id, class_id, date, status, marked_by_teacher_id, marked_by_name, marked_by_role)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status`,
        [
          att.id,
          att.studentId,
          att.classId,
          att.date,
          att.status,
          att.markedByTeacherId || null,
          att.markedByName || null,
          att.markedByRole || null,
        ]
      );
    } catch (err) {
      console.error("Failed to persist attendance to DB:", err);
    }
  }

  async persistTeacherAttendance(tAtt: TeacherAttendanceRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO teacher_attendance (id, teacher_id, date, check_in_time, check_out_time, status, verification_method, verified_by_admin_name, verified_at, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           check_in_time = EXCLUDED.check_in_time,
           verified_by_admin_name = EXCLUDED.verified_by_admin_name,
           verified_at = EXCLUDED.verified_at,
           remarks = EXCLUDED.remarks`,
        [
          tAtt.id,
          tAtt.teacherId,
          tAtt.date,
          tAtt.checkInTime || null,
          tAtt.checkOutTime || null,
          tAtt.status,
          tAtt.verificationMethod || "QR_SCAN",
          tAtt.verifiedByAdminName || null,
          tAtt.verifiedAt || null,
          tAtt.remarks || null,
        ]
      );
    } catch (err) {
      console.error("Failed to persist teacher attendance to DB:", err);
    }
  }

  async persistHomework(hw: HomeworkRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO homework (id, title, description, class_id, class_name, section, subject_id, subject_name, assigned_by_teacher_id, teacher_name, assigned_date, due_date, max_marks, attachment_url, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
         ON CONFLICT (id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           due_date = EXCLUDED.due_date,
           status = EXCLUDED.status`,
        [
          hw.id,
          hw.title,
          hw.description,
          hw.classId,
          hw.className,
          hw.section,
          hw.subjectId,
          hw.subjectName,
          hw.assignedByTeacherId,
          hw.teacherName,
          hw.assignedDate,
          hw.dueDate,
          hw.maxMarks || 100,
          hw.attachmentUrl || null,
          hw.status,
        ]
      );
    } catch (err) {
      console.error("Failed to persist homework to DB:", err);
    }
  }

  async persistLeave(leave: TeacherLeaveRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO teacher_leaves (id, teacher_id, teacher_name, leave_type, start_date, end_date, reason, status, admin_remarks, substitute_teacher_id, substitute_teacher_name, affected_classes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           admin_remarks = EXCLUDED.admin_remarks,
           substitute_teacher_id = EXCLUDED.substitute_teacher_id,
           substitute_teacher_name = EXCLUDED.substitute_teacher_name`,
        [
          leave.id,
          leave.teacherId,
          leave.teacherName,
          leave.leaveType,
          leave.startDate,
          leave.endDate,
          leave.reason,
          leave.status,
          leave.adminRemarks || null,
          leave.substituteTeacherId || null,
          leave.substituteTeacherName || null,
          JSON.stringify(leave.affectedClasses || []),
        ]
      );
    } catch (err) {
      console.error("Failed to persist teacher leave to DB:", err);
    }
  }

  async persistMarks(m: MarkRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO marks (id, student_id, exam_type, subject, total_marks, obtained_marks, grade, remarks)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE SET
           exam_type = EXCLUDED.exam_type,
           subject = EXCLUDED.subject,
           total_marks = EXCLUDED.total_marks,
           obtained_marks = EXCLUDED.obtained_marks,
           grade = EXCLUDED.grade,
           remarks = EXCLUDED.remarks`,
        [m.id, m.studentId, m.examType, m.subject, m.totalMarks, m.obtainedMarks, m.grade, m.remarks || null]
      );
    } catch (err) {
      console.error("Failed to persist marks to DB:", err);
    }
  }

  async deleteHomework(id: number): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query("DELETE FROM homework WHERE id = $1", [id]);
    } catch (err) {
      console.error("Failed to delete homework from DB:", err);
    }
  }

  async persistNotification(notif: AdminNotificationRecord): Promise<void> {
    if (!pool) return;
    this.invalidateCache();
    try {
      await pool.query(
        `INSERT INTO admin_notifications (id, type, title, message, is_read)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (id) DO UPDATE SET is_read = EXCLUDED.is_read`,
        [notif.id, notif.type, notif.title, notif.message, notif.isRead]
      );
    } catch (err) {
      console.error("Failed to persist notification to DB:", err);
    }
  }

  async persistAuditLog(audit: AuditLogRecord): Promise<void> {
    if (!pool) return;
    try {
      await pool.query(
        `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, action, entity_type, entity_id, old_value, new_value, ip_address)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO NOTHING`,
        [
          audit.id,
          audit.actorId,
          audit.actorName,
          audit.actorRole,
          audit.action,
          audit.entityType,
          audit.entityId || null,
          audit.oldValue || null,
          audit.newValue || null,
          audit.ipAddress || null,
        ]
      );
    } catch (err) {
      console.error("Failed to persist audit log to DB:", err);
    }
  }
}

export const dbBridge = new DatabaseBridge();
export default dbBridge;
