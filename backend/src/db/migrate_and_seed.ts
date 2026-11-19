import { Pool } from "pg";
import bcrypt from "bcryptjs";

const rawConnectionString =
  process.env.DATABASE_URL ||
  "postgres://postgres.hfhwdukfksmujweehxwh:laRyeCBxvrP6qkjM@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require&supa=base-pooler.x";

const connectionString = rawConnectionString.split("?")[0];

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

export async function runMigrationAndSeed() {
  console.log("Connecting to Supabase PostgreSQL...");
  const client = await pool.connect();

  try {
    console.log("Creating database tables if not exist...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        role VARCHAR(20) NOT NULL,
        full_name VARCHAR(128) NOT NULL,
        email VARCHAR(128),
        phone VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        employee_id VARCHAR(32) NOT NULL UNIQUE,
        full_name VARCHAR(128) NOT NULL,
        designation VARCHAR(64) DEFAULT 'Senior Teacher' NOT NULL,
        subject_specialization VARCHAR(64) NOT NULL,
        qualification VARCHAR(64) NOT NULL,
        phone VARCHAR(32) NOT NULL,
        email VARCHAR(128) NOT NULL,
        address TEXT DEFAULT 'Lahore',
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS classes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        section VARCHAR(16) NOT NULL,
        grade_level INTEGER DEFAULT 10 NOT NULL,
        room_number VARCHAR(32) NOT NULL,
        capacity INTEGER DEFAULT 40 NOT NULL,
        class_teacher_id INTEGER,
        is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(64) NOT NULL,
        code VARCHAR(32) NOT NULL UNIQUE,
        description TEXT,
        type VARCHAR(20) DEFAULT 'compulsory' NOT NULL,
        periods_per_week INTEGER DEFAULT 6 NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
        deleted_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        roll_no VARCHAR(32) NOT NULL UNIQUE,
        full_name VARCHAR(128) NOT NULL,
        class_id INTEGER NOT NULL,
        section VARCHAR(16) NOT NULL,
        parent_name VARCHAR(128) NOT NULL,
        father_cnic VARCHAR(32),
        b_form_no VARCHAR(32),
        dob VARCHAR(32),
        blood_group VARCHAR(8),
        phone VARCHAR(32) NOT NULL,
        address TEXT NOT NULL,
        concession_type VARCHAR(64) DEFAULT 'Regular',
        academic_notes TEXT,
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
        deleted_at TIMESTAMP,
        admission_date VARCHAR(32) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS class_subjects (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teacher_assignments (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        subject_id INTEGER NOT NULL,
        academic_session VARCHAR(32) DEFAULT '2026-2027' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS class_incharge_history (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL,
        teacher_id INTEGER NOT NULL,
        academic_session VARCHAR(32) DEFAULT '2026-2027' NOT NULL,
        assigned_by_admin_id INTEGER NOT NULL,
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        relieved_at TIMESTAMP,
        reason TEXT,
        status VARCHAR(20) DEFAULT 'active' NOT NULL
      );

      CREATE TABLE IF NOT EXISTS attendance (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        class_id INTEGER NOT NULL,
        date VARCHAR(16) NOT NULL,
        status VARCHAR(16) NOT NULL,
        marked_by_teacher_id INTEGER,
        marked_by_name VARCHAR(128),
        marked_by_role VARCHAR(32),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teacher_attendance (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL,
        date VARCHAR(16) NOT NULL,
        check_in_time VARCHAR(16),
        check_out_time VARCHAR(16),
        status VARCHAR(24) NOT NULL,
        verification_method VARCHAR(32) DEFAULT 'QR_SCAN',
        verified_by_admin_id INTEGER,
        verified_by_admin_name VARCHAR(128),
        verified_at TIMESTAMP,
        remarks TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teacher_leaves (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL,
        teacher_name VARCHAR(128) NOT NULL,
        leave_type VARCHAR(32) NOT NULL,
        start_date VARCHAR(16) NOT NULL,
        end_date VARCHAR(16) NOT NULL,
        reason TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending' NOT NULL,
        reviewed_by_admin_id INTEGER,
        reviewed_at TIMESTAMP,
        admin_remarks TEXT,
        substitute_teacher_id INTEGER,
        substitute_teacher_name VARCHAR(128),
        affected_classes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin_notifications (
        id SERIAL PRIMARY KEY,
        type VARCHAR(32) NOT NULL,
        title VARCHAR(256) NOT NULL,
        message TEXT NOT NULL,
        data TEXT,
        is_read BOOLEAN DEFAULT FALSE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS homework (
        id SERIAL PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        description TEXT NOT NULL,
        class_id INTEGER NOT NULL,
        class_name VARCHAR(64) NOT NULL,
        section VARCHAR(16) NOT NULL,
        subject_id INTEGER NOT NULL,
        subject_name VARCHAR(64) NOT NULL,
        assigned_by_teacher_id INTEGER NOT NULL,
        teacher_name VARCHAR(128) NOT NULL,
        assigned_date VARCHAR(16) NOT NULL,
        due_date VARCHAR(16) NOT NULL,
        max_marks INTEGER DEFAULT 100,
        attachment_url TEXT,
        status VARCHAR(20) DEFAULT 'active' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        actor_id INTEGER NOT NULL,
        actor_name VARCHAR(128) NOT NULL,
        actor_role VARCHAR(32) NOT NULL,
        action VARCHAR(32) NOT NULL,
        entity_type VARCHAR(32) NOT NULL,
        entity_id INTEGER,
        old_value TEXT,
        new_value TEXT,
        ip_address VARCHAR(64),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );

      CREATE TABLE IF NOT EXISTS marks (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        exam_type VARCHAR(32) NOT NULL,
        subject VARCHAR(64) NOT NULL,
        total_marks INTEGER NOT NULL,
        obtained_marks INTEGER NOT NULL,
        grade VARCHAR(8) NOT NULL,
        remarks VARCHAR(256),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS timetable (
        id SERIAL PRIMARY KEY,
        class_id INTEGER NOT NULL,
        day_of_week VARCHAR(16) NOT NULL,
        period_number INTEGER NOT NULL,
        start_time VARCHAR(16) NOT NULL,
        end_time VARCHAR(16) NOT NULL,
        subject VARCHAR(64) NOT NULL,
        teacher_name VARCHAR(128) NOT NULL,
        room_number VARCHAR(32)
      );

      CREATE TABLE IF NOT EXISTS fees (
        id SERIAL PRIMARY KEY,
        student_id INTEGER NOT NULL,
        student_name VARCHAR(128),
        roll_no VARCHAR(32),
        class_name VARCHAR(64),
        challan_no VARCHAR(32) NOT NULL UNIQUE,
        month VARCHAR(32) NOT NULL,
        year INTEGER NOT NULL,
        amount INTEGER NOT NULL,
        tuition_fee INTEGER,
        exam_fee INTEGER,
        lab_charges INTEGER,
        late_fee_surcharge INTEGER,
        due_date VARCHAR(32) NOT NULL,
        status VARCHAR(32) DEFAULT 'pending' NOT NULL,
        paid_date VARCHAR(32),
        payment_method VARCHAR(32),
        transaction_ref TEXT,
        proof_screenshot_url TEXT,
        proof_submitted_at TEXT,
        payment_remarks TEXT,
        verified_by_admin_name VARCHAR(128),
        verified_at TEXT,
        rejection_reason TEXT,
        concession_applied VARCHAR(64),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teacher_salaries (
        id SERIAL PRIMARY KEY,
        teacher_id INTEGER NOT NULL,
        teacher_name VARCHAR(128) NOT NULL,
        employee_id VARCHAR(32) NOT NULL,
        designation VARCHAR(64) NOT NULL,
        month VARCHAR(32) NOT NULL,
        year INTEGER NOT NULL,
        basic_salary INTEGER NOT NULL,
        medical_allowance INTEGER DEFAULT 0,
        house_rent_allowance INTEGER DEFAULT 0,
        transport_allowance INTEGER DEFAULT 0,
        tax_deductions INTEGER DEFAULT 0,
        absence_deductions INTEGER DEFAULT 0,
        provident_fund INTEGER DEFAULT 0,
        gross_salary INTEGER NOT NULL,
        net_salary INTEGER NOT NULL,
        status VARCHAR(24) DEFAULT 'generated' NOT NULL,
        disbursed_date VARCHAR(32),
        disbursed_method VARCHAR(32),
        disbursed_ref VARCHAR(64),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS notices (
        id SERIAL PRIMARY KEY,
        title VARCHAR(256) NOT NULL,
        content TEXT NOT NULL,
        target_audience VARCHAR(32) DEFAULT 'all' NOT NULL,
        posted_by VARCHAR(128) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS school_settings (
        id SERIAL PRIMARY KEY,
        school_name VARCHAR(256) NOT NULL,
        academic_session VARCHAR(32) NOT NULL,
        contact_email VARCHAR(128) NOT NULL,
        contact_phone VARCHAR(32) NOT NULL,
        address TEXT NOT NULL,
        late_fee_surcharge INTEGER DEFAULT 500
      );
    `);

    console.log("All tables created successfully.");

    // Seed default admin and initial users if empty
    const usersCountRes = await client.query("SELECT COUNT(*) FROM users");
    const userCount = parseInt(usersCountRes.rows[0].count, 10);

    if (userCount === 0) {
      console.log("Seeding default authentication users...");
      const salt = await bcrypt.genSalt(10);
      const adminHash = await bcrypt.hash("admin123", salt);
      const teacherHash = await bcrypt.hash("teacher123", salt);
      const studentHash = await bcrypt.hash("student123", salt);

      await client.query(`
        INSERT INTO users (username, password_hash, role, full_name, email, phone)
        VALUES 
          ('admin', '${adminHash}', 'admin', 'Prof. Tariq Mehmood (Principal)', 'principal@brightstar.edu.pk', '0300-1234567'),
          ('teacher', '${teacherHash}', 'teacher', 'Sir Tariq Aziz', 'tariq.aziz@brightstar.edu.pk', '0300-8765432'),
          ('teacher2', '${teacherHash}', 'teacher', 'Madam Farzana Kausar', 'farzana@brightstar.edu.pk', '0322-9988776'),
          ('student', '${studentHash}', 'student', 'Muhammad Hamza', 'hamza@student.brightstar.edu.pk', '0300-1234567')
        ON CONFLICT (username) DO NOTHING;
      `);
      console.log("Default users seeded.");
    }

    console.log("Database migration and verification completed successfully!");
  } finally {
    client.release();
  }
}

if (require.main === module) {
  runMigrationAndSeed()
    .then(() => {
      console.log("Done.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
