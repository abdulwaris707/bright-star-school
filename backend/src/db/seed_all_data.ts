import { Pool } from "pg";

const rawConnectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres.hfhwdukfksmujweehxwh:laRyeCBxvrP6qkjM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x";

const connectionString = rawConnectionString.split("?")[0];

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function seedAllData() {
  console.log("Connecting to Supabase to seed real data...");
  const client = await pool.connect();

  try {
    // 1. Subjects
    console.log("Seeding subjects...");
    await client.query(`
      INSERT INTO subjects (id, name, code, description, type, periods_per_week, is_deleted)
      VALUES 
        (1, 'Mathematics', 'MTH-101', 'Algebra, Geometry & Trigonometry', 'compulsory', 6, false),
        (2, 'Physics', 'PHY-102', 'Mechanics, Thermodynamics & Electromagnetism', 'compulsory', 5, false),
        (3, 'Chemistry', 'CHM-103', 'Organic, Inorganic & Physical Chemistry', 'compulsory', 5, false),
        (4, 'English Literature', 'ENG-104', 'Grammar, Composition & Literary Analysis', 'compulsory', 5, false),
        (5, 'Urdu', 'URD-105', 'Urdu Adab, Qawaid & Insha', 'compulsory', 4, false),
        (6, 'Computer Science', 'CS-106', 'Programming, Web Tech & Data Structures', 'elective', 5, false),
        (7, 'Biology', 'BIO-107', 'Cellular Biology, Genetics & Physiology', 'elective', 5, false),
        (8, 'Pakistan Studies', 'PST-108', 'History, Geography & Civics of Pakistan', 'compulsory', 3, false),
        (9, 'Islamiat', 'ISL-109', 'Islamic Studies & Ethics', 'compulsory', 3, false)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;
      SELECT setval('subjects_id_seq', (SELECT MAX(id) FROM subjects));
    `);

    // 2. Teachers
    console.log("Seeding teachers...");
    await client.query(`
      INSERT INTO teachers (id, employee_id, full_name, designation, subject_specialization, qualification, phone, email, address, status, is_deleted)
      VALUES
        (1, 'TCH-001', 'Sir Tariq Aziz', 'Head of Sciences & Senior Lecturer', 'Physics & Mathematics', 'M.Sc. Physics (Punjab University)', '0300-8765432', 'tariq.aziz@brightstar.edu.pk', 'Allama Iqbal Town, Lahore', 'active', false),
        (2, 'TCH-002', 'Madam Farzana Kausar', 'Senior Mathematics Specialist', 'Mathematics', 'M.Phil. Mathematics', '0322-9988776', 'farzana@brightstar.edu.pk', 'Gulberg III, Lahore', 'active', false),
        (3, 'TCH-003', 'Sir Usman Ali', 'Subject Specialist', 'English Literature', 'M.A. English', '0344-5566778', 'usman.ali@brightstar.edu.pk', 'Model Town, Lahore', 'active', false),
        (4, 'TCH-004', 'Sir Rashid Minhas', 'Senior Teacher', 'Pakistan Studies & Urdu', 'M.A. History', '0331-1122334', 'rashid.minhas@brightstar.edu.pk', 'Johar Town, Lahore', 'active', false),
        (5, 'TCH-005', 'Engr. Zeeshan Haider', 'Computer Lab In-Charge', 'Computer Science', 'BS Software Engineering', '0313-4455667', 'zeeshan@brightstar.edu.pk', 'Faisal Town, Lahore', 'active', false)
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, employee_id = EXCLUDED.employee_id;
      SELECT setval('teachers_id_seq', (SELECT MAX(id) FROM teachers));
    `);

    // 3. Classes
    console.log("Seeding classes...");
    await client.query(`
      INSERT INTO classes (id, name, section, grade_level, room_number, capacity, class_teacher_id, is_deleted)
      VALUES
        (1, 'Class 10 - Blue', 'Blue', 10, 'Room 14', 40, 1, false),
        (2, 'Class 10 - Green', 'Green', 10, 'Room 15', 40, 2, false),
        (3, 'Class 9 - Blue', 'Blue', 9, 'Room 11', 45, 3, false),
        (4, 'Class 9 - Green', 'Green', 9, 'Room 12', 40, 4, false)
      ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, section = EXCLUDED.section;
      SELECT setval('classes_id_seq', (SELECT MAX(id) FROM classes));
    `);

    // 4. Class Subjects
    console.log("Seeding class_subjects...");
    await client.query(`
      INSERT INTO class_subjects (id, class_id, subject_id)
      VALUES
        (1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4), (5, 1, 5), (6, 1, 6),
        (7, 2, 1), (8, 2, 2), (9, 3, 4)
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('class_subjects_id_seq', (SELECT MAX(id) FROM class_subjects));
    `);

    // 5. Teacher Assignments
    console.log("Seeding teacher_assignments...");
    await client.query(`
      INSERT INTO teacher_assignments (id, teacher_id, class_id, subject_id, academic_session)
      VALUES
        (1, 1, 1, 2, '2026-2027'),
        (2, 2, 1, 1, '2026-2027'),
        (3, 3, 1, 4, '2026-2027'),
        (4, 2, 2, 1, '2026-2027'),
        (5, 1, 2, 2, '2026-2027'),
        (6, 5, 1, 6, '2026-2027')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('teacher_assignments_id_seq', (SELECT MAX(id) FROM teacher_assignments));
    `);

    // 6. Class Incharge History
    console.log("Seeding class_incharge_history...");
    await client.query(`
      INSERT INTO class_incharge_history (id, class_id, teacher_id, academic_session, assigned_by_admin_id, reason, status)
      VALUES
        (1, 1, 1, '2026-2027', 1, 'Annual Session 2026-27 In-Charge Allocation', 'active'),
        (2, 2, 2, '2026-2027', 1, 'Annual Session 2026-27 In-Charge Allocation', 'active')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('class_incharge_history_id_seq', (SELECT MAX(id) FROM class_incharge_history));
    `);

    // 7. Students
    console.log("Seeding students...");
    await client.query(`
      INSERT INTO students (id, roll_no, full_name, class_id, section, parent_name, father_cnic, b_form_no, dob, blood_group, phone, address, concession_type, academic_notes, status, is_deleted, admission_date)
      VALUES
        (1, 'BS-2024-101', 'Muhammad Hamza', 1, 'Blue', 'Tariq Mehmood', '35202-1234567-1', '35202-9876543-1', '2009-08-14', 'B+', '0300-1234567', 'Model Town, Lahore', 'Regular', 'Consistently excels in theoretical physics and mathematics.', 'active', false, '2024-03-15'),
        (2, 'BS-2024-102', 'Ayesha Fatima', 1, 'Blue', 'Sohail Ahmed', '35202-2345678-2', '35202-8765432-2', '2009-11-20', 'O+', '0321-7654321', 'Gulberg III, Lahore', 'Sibling Discount (25%)', 'Strong analytical capability; active in science projects.', 'active', false, '2024-03-16'),
        (3, 'BS-2024-103', 'Bilal Ahmed Khan', 2, 'Green', 'Ahmed Khan', '35202-3456789-3', '35202-7654321-3', '2009-05-10', 'A+', '0333-9876543', 'Johar Town, Lahore', 'Regular', 'Active sportsman and team leader.', 'active', false, '2024-03-18'),
        (4, 'BS-2024-104', 'Zainab Noor', 3, 'Blue', 'Noor ul Hassan', '35202-4567890-4', '35202-6543210-4', '2010-02-18', 'O+', '0345-4567890', 'DHA Phase 5, Lahore', 'Staff Child (50%)', 'Creative arts and biology enthusiast.', 'active', false, '2024-03-20'),
        (5, 'BS-2024-105', 'Usman Raza', 4, 'Green', 'Muhammad Raza', '35202-5678901-5', '35202-5432109-5', '2010-07-22', 'AB+', '0312-3456789', 'Faisal Town, Lahore', 'Regular', 'Diligent student, improving in mathematics.', 'active', false, '2024-03-22')
      ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, roll_no = EXCLUDED.roll_no;
      SELECT setval('students_id_seq', (SELECT MAX(id) FROM students));
    `);

    // 8. Attendance
    console.log("Seeding student attendance...");
    await client.query(`
      INSERT INTO attendance (id, student_id, class_id, date, status, marked_by_teacher_id, marked_by_name, marked_by_role)
      VALUES
        (1, 1, 1, '2026-11-19', 'present', 1, 'Sir Tariq Aziz', 'class_incharge'),
        (2, 2, 1, '2026-11-19', 'present', 1, 'Sir Tariq Aziz', 'class_incharge'),
        (3, 3, 2, '2026-11-19', 'present', 2, 'Madam Farzana Kausar', 'class_incharge')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('attendance_id_seq', (SELECT MAX(id) FROM attendance));
    `);

    // 9. Teacher Attendance
    console.log("Seeding teacher attendance...");
    await client.query(`
      INSERT INTO teacher_attendance (id, teacher_id, date, check_in_time, status, verification_method, verified_by_admin_name, remarks)
      VALUES
        (1, 1, '2026-11-19', '07:48 AM', 'present', 'QR_SCAN', 'Prof. Tariq Mehmood', 'On-time biometric QR scan at staff entrance'),
        (2, 2, '2026-11-19', '07:52 AM', 'present', 'QR_SCAN', 'Prof. Tariq Mehmood', 'Verified check-in'),
        (3, 3, '2026-11-19', '08:15 AM', 'late', 'ADMIN_MANUAL', 'Prof. Tariq Mehmood', 'Late arrival due to road blockage; excused'),
        (4, 4, '2026-11-19', NULL, 'leave', 'ADMIN_MANUAL', 'Prof. Tariq Mehmood', 'Approved Medical Leave'),
        (5, 5, '2026-11-19', '07:40 AM', 'present', 'PIN_VERIFIED', 'Prof. Tariq Mehmood', 'Daily TOTP PIN verified')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('teacher_attendance_id_seq', (SELECT MAX(id) FROM teacher_attendance));
    `);

    // 10. Teacher Leaves
    console.log("Seeding teacher leaves...");
    await client.query(`
      INSERT INTO teacher_leaves (id, teacher_id, teacher_name, leave_type, start_date, end_date, reason, status, affected_classes)
      VALUES
        (1, 4, 'Sir Rashid Minhas', 'Medical', '2026-11-18', '2026-11-19', 'High fever and medical consultation required', 'approved', '["Class 9 - Green (PST)", "Class 10 - Green (Urdu)"]')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('teacher_leaves_id_seq', (SELECT MAX(id) FROM teacher_leaves));
    `);

    // 11. Fees
    console.log("Seeding fees...");
    await client.query(`
      INSERT INTO fees (id, student_id, student_name, roll_no, class_name, challan_no, month, year, amount, tuition_fee, exam_fee, lab_charges, late_fee_surcharge, due_date, status, paid_date, payment_method, transaction_ref, verified_by_admin_name, verified_at, concession_applied)
      VALUES
        (1, 1, 'Muhammad Hamza', 'BS-2024-101', 'Class 10 - Blue', 'CH-2026-1001', 'November', 2026, 6500, 5500, 500, 500, 500, '2026-11-20', 'paid', '2026-11-15', 'EasyPaisa', 'EP-88492019', 'Prof. Tariq Mehmood', '2026-11-15T11:20:00Z', 'Regular'),
        (2, 2, 'Ayesha Fatima', 'BS-2024-102', 'Class 10 - Blue', 'CH-2026-1002', 'November', 2026, 5125, 4125, 500, 500, 500, '2026-11-20', 'verification_pending', NULL, 'Meezan Bank Transfer', 'PK90MEZN0002130982', NULL, NULL, 'Sibling Discount (25%)'),
        (3, 3, 'Bilal Ahmed Khan', 'BS-2024-103', 'Class 10 - Green', 'CH-2026-1003', 'November', 2026, 6500, 5500, 500, 500, 500, '2026-11-20', 'pending', NULL, NULL, NULL, NULL, NULL, 'Regular'),
        (4, 4, 'Zainab Noor', 'BS-2024-104', 'Class 9 - Blue', 'CH-2026-1004', 'November', 2026, 3750, 2750, 500, 500, 500, '2026-11-10', 'overdue', NULL, NULL, NULL, NULL, NULL, 'Staff Child (50%)')
      ON CONFLICT (id) DO UPDATE SET challan_no = EXCLUDED.challan_no, status = EXCLUDED.status;
      SELECT setval('fees_id_seq', (SELECT MAX(id) FROM fees));
    `);

    // 12. Teacher Salaries
    console.log("Seeding teacher salaries...");
    await client.query(`
      INSERT INTO teacher_salaries (id, teacher_id, teacher_name, employee_id, designation, month, year, basic_salary, medical_allowance, house_rent_allowance, transport_allowance, tax_deductions, absence_deductions, provident_fund, gross_salary, net_salary, status, disbursed_date, disbursed_method, disbursed_ref)
      VALUES
        (1, 1, 'Sir Tariq Aziz', 'TCH-001', 'Head of Sciences & Senior Lecturer', 'November', 2026, 85000, 8500, 15000, 6500, 4200, 0, 4250, 115000, 106550, 'disbursed', '2026-11-01', 'Direct Bank Transfer', 'HBL-FT-9948201'),
        (2, 2, 'Madam Farzana Kausar', 'TCH-002', 'Senior Mathematics Specialist', 'November', 2026, 75000, 7500, 12000, 5500, 3100, 0, 3750, 100000, 93150, 'disbursed', '2026-11-01', 'Direct Bank Transfer', 'UBL-FT-4410293'),
        (3, 3, 'Sir Usman Ali', 'TCH-003', 'Subject Specialist', 'November', 2026, 65000, 6500, 10000, 5000, 2200, 0, 3250, 86500, 81050, 'generated', NULL, NULL, NULL),
        (4, 4, 'Sir Rashid Minhas', 'TCH-004', 'Senior Teacher', 'November', 2026, 60000, 6000, 9000, 4500, 1800, 2000, 3000, 79500, 72700, 'generated', NULL, NULL, NULL),
        (5, 5, 'Engr. Zeeshan Haider', 'TCH-005', 'Computer Lab In-Charge', 'November', 2026, 55000, 5500, 8000, 4000, 1400, 0, 2750, 72500, 68350, 'generated', NULL, NULL, NULL)
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('teacher_salaries_id_seq', (SELECT MAX(id) FROM teacher_salaries));
    `);

    // 13. Homework
    console.log("Seeding homework...");
    await client.query(`
      INSERT INTO homework (id, title, description, class_id, class_name, section, subject_id, subject_name, assigned_by_teacher_id, teacher_name, assigned_date, due_date, max_marks, status)
      VALUES
        (1, 'Newton Laws Numerical Problems', 'Solve problems 1 to 15 from Chapter 3 on fair notebook.', 1, 'Class 10 - Blue', 'Blue', 2, 'Physics', 1, 'Sir Tariq Aziz', '2026-11-18', '2026-11-22', 20, 'active'),
        (2, 'Quadratic Equations Exercise 1.2', 'Complete questions 1 through 10 with step-by-step discriminant working.', 1, 'Class 10 - Blue', 'Blue', 1, 'Mathematics', 2, 'Madam Farzana Kausar', '2026-11-17', '2026-11-21', 25, 'active')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('homework_id_seq', (SELECT MAX(id) FROM homework));
    `);

    // 14. Admin Notifications
    console.log("Seeding admin notifications...");
    await client.query(`
      INSERT INTO admin_notifications (id, type, title, message, is_read)
      VALUES
        (1, 'TEACHER_LEAVE_REQUEST', 'Leave Request: Sir Rashid Minhas', 'Sir Rashid Minhas has applied for Medical Leave (2026-11-18 to 2026-11-19). Reason: High fever.', false),
        (2, 'STUDENT_ALERT', 'Fee Voucher Verification Pending', 'Ayesha Fatima (Roll # BS-2024-102) submitted payment proof for Challan # CH-2026-1002.', false)
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('admin_notifications_id_seq', (SELECT MAX(id) FROM admin_notifications));
    `);

    // 15. Marks
    console.log("Seeding marks...");
    await client.query(`
      INSERT INTO marks (id, student_id, exam_type, subject, total_marks, obtained_marks, grade, remarks)
      VALUES
        (1, 1, 'Mid-Term', 'Physics', 100, 94, 'A+', 'Outstanding conceptual mastery'),
        (2, 1, 'Mid-Term', 'Mathematics', 100, 98, 'A+', 'Perfect problem solving'),
        (3, 1, 'Mid-Term', 'Chemistry', 100, 88, 'A', 'Great lab and theory work')
      ON CONFLICT (id) DO NOTHING;
      SELECT setval('marks_id_seq', (SELECT MAX(id) FROM marks));
    `);

    // 16. School Settings
    console.log("Seeding school settings...");
    await client.query(`
      INSERT INTO school_settings (id, school_name, academic_session, contact_email, contact_phone, address, late_fee_surcharge)
      VALUES
        (1, 'Bright Star Model High School', '2026-2027', 'info@brightstar.edu.pk', '+92 42 35889900', 'Plot 45-B, Sector D, Lahore, Pakistan', 500)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("All real data successfully seeded to Supabase PostgreSQL!");
  } finally {
    client.release();
  }
}

if (require.main === module) {
  seedAllData()
    .then(() => {
      console.log("Complete.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}
