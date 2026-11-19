import http from "http";
import app from "./app";

interface TestResult {
  name: string;
  passed: boolean;
  status: number;
  details?: string;
}

const PIPE_PATH = "\\\\.\\pipe\\bright-star-test-pipe-" + Date.now();

function request(options: {
  method: string;
  path: string;
  headers?: Record<string, string>;
  body?: any;
}): Promise<{ status: number; headers: http.IncomingHttpHeaders; data: any }> {
  return new Promise((resolve, reject) => {
    const payload = options.body ? JSON.stringify(options.body) : undefined;
    const reqHeaders: Record<string, string> = {
      ...(options.headers || {}),
    };
    if (payload) {
      reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(payload).toString();
    }

    const req = http.request(
      {
        socketPath: PIPE_PATH,
        path: options.path,
        method: options.method,
        headers: reqHeaders,
      },
      (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          let parsed = raw;
          try {
            parsed = JSON.parse(raw);
          } catch {}
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            data: parsed,
          });
        });
      }
    );

    req.on("error", reject);

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runFeatureTests() {
  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(PIPE_PATH, resolve));
  console.log("--------------------------------------------------");
  console.log("BRIGHT STAR SCHOOL SYSTEM - EXTENDED 8-MODULE TESTS");
  console.log("--------------------------------------------------\n");

  const results: TestResult[] = [];

  const check = (name: string, condition: boolean, status: number, details?: string) => {
    results.push({ name, passed: condition, status, details });
    if (condition) {
      console.log(`[PASS] [${status}] ${name}`);
    } else {
      console.error(`[FAIL] [${status}] ${name} -> ${details || "Failed"}`);
    }
  };

  try {
    // 1. Health check
    const health = await request({ method: "GET", path: "/api/health" });
    check("System Health Endpoint (/api/health)", health.status === 200 && health.data.status === "ok", health.status);

    // 2. Auth - Admin
    const adminLogin = await request({
      method: "POST",
      path: "/api/auth/login",
      body: { username: "admin", password: "admin123", role: "admin" },
    });
    check("Admin Authentication (/api/auth/login)", adminLogin.status === 200 && !!adminLogin.data.token, adminLogin.status);
    const adminToken = adminLogin.data.token;
    const adminHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. Auth - Teacher 1 (Tariq Aziz - In-Charge of Class 1)
    const teacher1Login = await request({
      method: "POST",
      path: "/api/auth/login",
      body: { username: "teacher", password: "teacher123", role: "teacher" },
    });
    check("Teacher 1 Auth - Tariq Aziz (/api/auth/login)", teacher1Login.status === 200 && teacher1Login.data.user.id === 1, teacher1Login.status);
    const teacher1Token = teacher1Login.data.token;
    const teacher1Headers = { Authorization: `Bearer ${teacher1Token}` };

    // 4. Auth - Teacher 2 (Farzana Kausar - In-Charge of Class 2)
    const teacher2Login = await request({
      method: "POST",
      path: "/api/auth/login",
      body: { username: "teacher2", password: "teacher123", role: "teacher" },
    });
    check("Teacher 2 Auth - Farzana Kausar (/api/auth/login)", teacher2Login.status === 200 && teacher2Login.data.user.id === 2, teacher2Login.status);
    const teacher2Token = teacher2Login.data.token;
    const teacher2Headers = { Authorization: `Bearer ${teacher2Token}` };

    // =================================================================
    // MODULE 1: SUBJECTS CRUD (ADMIN)
    // =================================================================
    const createSub = await request({
      method: "POST",
      path: "/api/subjects",
      headers: adminHeaders,
      body: {
        name: "Pak Studies",
        code: "PKS-10",
        description: "History and Geography of Pakistan",
        type: "compulsory",
        periodsPerWeek: 4,
      },
    });
    const newSubjectId = createSub.data.id;
    check("Module 1: Create Subject (/api/subjects)", createSub.status === 201 && !!newSubjectId, createSub.status);

    const updateSub = await request({
      method: "PUT",
      path: `/api/subjects/${newSubjectId}`,
      headers: adminHeaders,
      body: { periodsPerWeek: 5 },
    });
    check("Module 1: Update Subject (/api/subjects/:id)", updateSub.status === 200 && updateSub.data.periodsPerWeek === 5, updateSub.status);

    // =================================================================
    // MODULE 1: TEACHER & STUDENT EXTENDED CRUD
    // =================================================================
    const createTch = await request({
      method: "POST",
      path: "/api/teachers",
      headers: adminHeaders,
      body: {
        employeeId: "TCH-088",
        fullName: "Dr. Hamza Shah",
        designation: "Assistant Professor",
        subjectSpecialization: "Physics",
        qualification: "Ph.D Physics",
        phone: "0333-8899001",
      },
    });
    const newTeacherId = createTch.data.id;
    check("Module 1: Create Extended Teacher Profile (/api/teachers)", createTch.status === 201 && !!newTeacherId, createTch.status);

    const createStd = await request({
      method: "POST",
      path: "/api/students",
      headers: adminHeaders,
      body: {
        rollNo: "BS-2026-999",
        fullName: "Ali Raza Khan",
        classId: 1,
        className: "Class 10 - Blue",
        section: "Blue",
        parentName: "Raza Ali Khan",
        fatherCnic: "35202-1234567-1",
        bFormNo: "35202-7654321-1",
        phone: "0300-9876543",
      },
    });
    const newStudentId = createStd.data.id;
    check("Module 1: Create Student with B-Form & Father CNIC (/api/students)", createStd.status === 201 && !!newStudentId, createStd.status);

    // =================================================================
    // MODULE 2: ACADEMIC MAPPING & CLASS IN-CHARGE
    // =================================================================
    // Map Pak Studies to Class 1
    const mapSub = await request({
      method: "POST",
      path: "/api/classes/1/subjects",
      headers: adminHeaders,
      body: { subjectId: newSubjectId },
    });
    check("Module 2: Map Subject to Class (/api/classes/:classId/subjects)", mapSub.status === 201, mapSub.status);

    // Assign Dr. Hamza Shah to teach Physics in Class 1
    const assignTch = await request({
      method: "POST",
      path: "/api/academic-mapping/teacher-assignments",
      headers: adminHeaders,
      body: {
        teacherId: newTeacherId,
        classId: 1,
        subjectId: 2, // Physics
        academicSession: "2026-2027",
      },
    });
    check("Module 2: Map Teacher to Subject-Class (/api/academic-mapping/teacher-assignments)", assignTch.status === 201, assignTch.status);

    // In-Charge Designation check & history
    const inchargeHistory = await request({
      method: "GET",
      path: "/api/classes/1/incharge-history",
    });
    check("Module 2: Query Class In-Charge History (/api/classes/1/incharge-history)", inchargeHistory.status === 200 && Array.isArray(inchargeHistory.data), inchargeHistory.status);

    // =================================================================
    // MODULE 3: RESTRICTED STUDENT ATTENDANCE (RBAC ENFORCEMENT)
    // =================================================================
    // A. Teacher 1 is In-Charge of Class 1 -> Should SUCCEED (200)
    const teacher1Att = await request({
      method: "POST",
      path: "/api/attendance",
      headers: teacher1Headers,
      body: {
        records: [
          { studentId: 1, classId: 1, date: "2026-11-18", status: "Present" },
          { studentId: 2, classId: 1, date: "2026-11-18", status: "Present" },
        ],
      },
    });
    check("Module 3: In-Charge Teacher (Tariq Aziz) Marks Attendance for Class 1 (Expected: 200)", teacher1Att.status === 200, teacher1Att.status);

    // B. Teacher 2 (Farzana Kausar) is In-Charge of Class 2, NOT Class 1 -> MUST BE REJECTED (403 FORBIDDEN)
    const teacher2AttUnauthorized = await request({
      method: "POST",
      path: "/api/attendance",
      headers: teacher2Headers,
      body: {
        records: [
          { studentId: 1, classId: 1, date: "2026-11-18", status: "Absent" },
        ],
      },
    });
    check("Module 3 [NEGATIVE TEST]: Non-Incharge Teacher 2 Rejection for Class 1 (Expected: 403 Forbidden)", teacher2AttUnauthorized.status === 403, teacher2AttUnauthorized.status);

    // C. Admin can mark attendance for any class
    const adminAtt = await request({
      method: "POST",
      path: "/api/attendance",
      headers: adminHeaders,
      body: {
        records: [
          { studentId: 1, classId: 1, date: "2026-11-18", status: "Present" },
        ],
      },
    });
    check("Module 3: Admin Authority to Mark Attendance for Any Class (Expected: 200)", adminAtt.status === 200, adminAtt.status);

    // =================================================================
    // MODULE 4: TEACHER ATTENDANCE & VERIFICATION SYSTEM (ADMIN)
    // =================================================================
    // A. Get Daily Rotating Code (e.g. BST-XXXX)
    const dailyCodeRes = await request({ method: "GET", path: "/api/teacher-attendance/daily-code" });
    const currentCode = dailyCodeRes.data.code;
    check("Module 4: Get Daily Rotating TOTP/PIN (/api/teacher-attendance/daily-code)", dailyCodeRes.status === 200 && !!currentCode, dailyCodeRes.status, `Code: ${currentCode}`);

    // B. Teacher 1 Self Check-In with correct daily code
    const checkInRes = await request({
      method: "POST",
      path: "/api/teacher-attendance/check-in",
      headers: teacher1Headers,
      body: {
        code: currentCode,
        verificationMethod: "QR_SCAN_PIN",
        remarks: "Morning assembly duty",
      },
    });
    check("Module 4: Teacher Self Check-In with Rotating Code (/api/teacher-attendance/check-in)", checkInRes.status === 200, checkInRes.status);
    const checkInRecordId = checkInRes.data.checkIn?.id;

    // C. Admin Verifies Check-In
    if (checkInRecordId) {
      const verifyRes = await request({
        method: "POST",
        path: `/api/teacher-attendance/verify/${checkInRecordId}`,
        headers: adminHeaders,
        body: {
          status: "present",
          remarks: "Verified via biometric camera log",
        },
      });
      check("Module 4: Admin Verification of Teacher Check-In (/api/teacher-attendance/verify/:id)", verifyRes.status === 200, verifyRes.status);
    }

    // D. Admin Direct Mark / Override with Audit Trail
    const overrideRes = await request({
      method: "POST",
      path: "/api/teacher-attendance/mark",
      headers: adminHeaders,
      body: {
        teacherId: 2,
        date: "2026-11-18",
        status: "present",
        remarks: "Arrived at 07:45 AM for board exam invigilation",
      },
    });
    check("Module 4: Admin Direct Mark / Override Teacher Attendance (/api/teacher-attendance/mark)", overrideRes.status === 200, overrideRes.status);

    // E. Individual Teacher Attendance History Record Query
    const teacherHistoryRes = await request({
      method: "GET",
      path: "/api/teacher-attendance?teacherId=1",
      headers: adminHeaders,
    });
    check("Module 4: Query Individual Teacher Attendance History (/api/teacher-attendance?teacherId=1)", teacherHistoryRes.status === 200 && Array.isArray(teacherHistoryRes.data) && teacherHistoryRes.data.length > 0, teacherHistoryRes.status);

    // F. Full Attendance Records Export Query
    const allRecordsRes = await request({
      method: "GET",
      path: "/api/teacher-attendance?all=true",
      headers: adminHeaders,
    });
    check("Module 4: Query All Faculty Attendance Records for CSV Export (/api/teacher-attendance?all=true)", allRecordsRes.status === 200 && Array.isArray(allRecordsRes.data) && allRecordsRes.data.length >= 5, allRecordsRes.status);

    // =================================================================
    // MODULE 5: TEACHER LEAVES & REAL-TIME ADMIN NOTIFICATIONS
    // =================================================================
    // A. Teacher 1 submits leave request
    const leaveRes = await request({
      method: "POST",
      path: "/api/teacher-leaves",
      headers: teacher1Headers,
      body: {
        leaveType: "sick",
        startDate: "2026-11-20",
        endDate: "2026-11-21",
        reason: "Severe flu and fever, medical rest prescribed.",
      },
    });
    const newLeaveId = leaveRes.data.leave?.id;
    check("Module 5: Submit Teacher Leave Request (/api/teacher-leaves)", leaveRes.status === 201 && !!newLeaveId, leaveRes.status);

    // B. Admin receives in-app notifications
    const notificationsRes = await request({
      method: "GET",
      path: "/api/notifications",
      headers: adminHeaders,
    });
    check(
      "Module 5: Fetch Admin Real-Time Notifications (/api/notifications)",
      notificationsRes.status === 200 &&
        Array.isArray(notificationsRes.data.notifications) &&
        notificationsRes.data.notifications.length > 0,
      notificationsRes.status,
      `Unread count: ${notificationsRes.data.unreadCount}`
    );

    // C. Admin reviews leave and assigns substitute teacher
    const reviewRes = await request({
      method: "POST",
      path: `/api/teacher-leaves/${newLeaveId}/review`,
      headers: adminHeaders,
      body: {
        status: "approved",
        adminRemarks: "Approved. Madam Farzana designated as substitute.",
        substituteTeacherId: 2,
      },
    });
    check("Module 5: Admin Review Leave & Assign Substitute (/api/teacher-leaves/:id/review)", reviewRes.status === 200 && reviewRes.data.leave.status === "approved", reviewRes.status);

    // =================================================================
    // MODULE 6: HOMEWORK & TASK ASSIGNMENT
    // =================================================================
    // A. Negative test: Teacher 1 attempting to assign Urdu (subject 5 - unassigned to Teacher 1) in Class 1 -> 403 Forbidden
    const hwForbiddenRes = await request({
      method: "POST",
      path: "/api/homework",
      headers: teacher1Headers,
      body: {
        title: "Urdu Essay Writing",
        description: "Write 200 words on Allama Iqbal.",
        classId: 1,
        subjectId: 5, // Urdu (not assigned to Teacher 1)
        dueDate: "2026-11-20",
      },
    });
    check("Module 6 [NEGATIVE TEST]: Teacher Unassigned Subject Rejection (Expected: 403 Forbidden)", hwForbiddenRes.status === 403, hwForbiddenRes.status);

    // B. Teacher 1 assigns homework for assigned subject: Physics (subject 2) in Class 1 -> 201 Created
    const hwRes = await request({
      method: "POST",
      path: "/api/homework",
      headers: teacher1Headers,
      body: {
        title: "Newton's Laws Numerical Problems",
        description: "Complete problems 1 to 5 from chapter 3 in physics notebook.",
        classId: 1,
        subjectId: 2, // Physics (assigned to Teacher 1)
        dueDate: "2026-11-22",
        maxMarks: 20,
      },
    });
    const hwId = hwRes.data.id;
    check("Module 6: Teacher Creates Assigned Homework for Assigned Subject (/api/homework)", hwRes.status === 201 && !!hwId, hwRes.status);

    const getHw = await request({
      method: "GET",
      path: "/api/homework?classId=1",
    });
    check("Module 6: Query Class Homework List (/api/homework)", getHw.status === 200 && Array.isArray(getHw.data), getHw.status);

    // =================================================================
    // MODULE 7: SCOPED STUDENT TRANSFER
    // =================================================================
    const transferRes = await request({
      method: "POST",
      path: `/api/students/${newStudentId}/transfer`,
      headers: adminHeaders,
      body: {
        targetClassId: 2,
        reason: "Section balancing & student request",
      },
    });
    check("Module 7: Student Transfer Across Classes (/api/students/:id/transfer)", transferRes.status === 200 && transferRes.data.classId === 2, transferRes.status);

    // =================================================================
    // MODULE 8: UNIFIED AUDIT LOGGING
    // =================================================================
    const auditRes = await request({
      method: "GET",
      path: "/api/audit-logs",
      headers: adminHeaders,
    });
    check(
      "Module 8: Admin Query Audit Trail (/api/audit-logs)",
      auditRes.status === 200 && Array.isArray(auditRes.data) && auditRes.data.length >= 5,
      auditRes.status,
      `Captured ${auditRes.data?.length || 0} audit logs`
    );

    // =================================================================
    // ENHANCED MODULE 9: CLASS-WISE FEE CHALLAN GENERATION & PROOF VERIFICATION
    // =================================================================
    const bulkFeeRes = await request({
      method: "POST",
      path: "/api/fees/generate-bulk",
      headers: adminHeaders,
      body: {
        classId: 1,
        month: "December",
        year: 2026,
        dueDate: "2026-12-10",
        tuitionFee: 6000,
        examFee: 500,
        labCharges: 500,
      },
    });
    check("Module 9: Bulk Class Fee Challan Generation (/api/fees/generate-bulk)", bulkFeeRes.status === 201 && bulkFeeRes.data.generatedCount > 0, bulkFeeRes.status);

    const submitProofRes = await request({
      method: "POST",
      path: "/api/fees/3/submit-proof",
      headers: adminHeaders,
      body: {
        paymentMethod: "JazzCash",
        transactionRef: "JC-11223344",
        proofScreenshotUrl: "data:image/svg+xml;utf8,<svg></svg>",
        paymentRemarks: "Paid via JazzCash account",
      },
    });
    check("Module 9: Student Payment Proof Submission (/api/fees/:id/submit-proof)", submitProofRes.status === 200 && submitProofRes.data.fee?.status === "verification_pending", submitProofRes.status);

    const verifyProofRes = await request({
      method: "POST",
      path: "/api/fees/3/verify-proof",
      headers: adminHeaders,
      body: {
        action: "approve",
        reason: "Confirmed in bank statement",
      },
    });
    check("Module 9: Admin Verify Payment Proof & Issue Paid Challan (/api/fees/:id/verify-proof)", verifyProofRes.status === 200 && verifyProofRes.data.fee?.status === "paid", verifyProofRes.status);

    // =================================================================
    // ENHANCED MODULE 10: TEACHER SALARY & PAYROLL MANAGEMENT
    // =================================================================
    const payrollRes = await request({
      method: "POST",
      path: "/api/salaries/generate",
      headers: adminHeaders,
      body: {
        month: "December",
        year: 2026,
      },
    });
    check("Module 10: Generate Monthly Faculty Payroll (/api/salaries/generate)", payrollRes.status === 201 && payrollRes.data.generatedCount > 0, payrollRes.status);

    const disburseSalaryRes = await request({
      method: "POST",
      path: "/api/salaries/3/disburse",
      headers: adminHeaders,
      body: {
        paymentMethod: "Bank Transfer",
        transactionRef: "HBL-CORP-9901",
        paymentDate: "2026-12-01",
        remarks: "Approved and transferred",
      },
    });
    check("Module 10: Disburse Teacher Salary (/api/salaries/:id/disburse)", disburseSalaryRes.status === 200 && disburseSalaryRes.data.salary?.status === "paid", disburseSalaryRes.status);

    console.log("\n==================================================");
    const passed = results.filter((r) => r.passed).length;
    console.log(`TOTAL TESTS EXECUTED: ${results.length}`);
    console.log(`PASSED: ${passed} / ${results.length}`);
    console.log(`FAILED: ${results.length - passed}`);
    console.log("==================================================");

    if (passed === results.length) {
      console.log("\nSUCCESS: All 8 production-ready modules verified with 100% PASS RATE!\n");
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
  } finally {
    server.close();
  }
}

runFeatureTests();
