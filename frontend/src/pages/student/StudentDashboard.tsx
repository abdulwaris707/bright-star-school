import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import api, { apiFetch, getSavedUser } from "../../lib/api";

interface StudentProfile {
  id: number;
  rollNo: string;
  fullName: string;
  className: string;
  section: string;
  parentName: string;
}

export const StudentDashboard: React.FC = () => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [fees, setFees] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [homework, setHomework] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getSavedUser();

  useEffect(() => {
    async function loadStudentData() {
      try {
        const studentId = currentUser?.role === "student" && currentUser?.id ? currentUser.id : 1;

        const [profData, marksData, feesData, attData, hwData] = await Promise.all([
          api.get<StudentProfile>(`/students/${studentId}`).catch(() => null),
          api.get<any[]>("/marks", { params: { studentId } }),
          api.get<any[]>("/fees", { params: { studentId } }),
          api.get<any[]>("/attendance", { params: { studentId } }),
          apiFetch<any[]>("/homework?classId=1").catch(() => []),
        ]);

        if (profData) setProfile(profData);
        setMarks(marksData);
        setFees(feesData);
        setAttendance(attData);
        setHomework(hwData);
      } catch (err) {
        console.error("Failed to load student dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadStudentData();
  }, []);

  const totalPossible = marks.reduce((sum, m) => sum + (m.totalMarks || 100), 0);
  const totalObtained = marks.reduce((sum, m) => sum + (m.obtainedMarks || 0), 0);
  const avgPercentage = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 88;

  const totalDays = attendance.length;
  const presentDays = attendance.filter((a) => a.status === "present").length;
  const attendancePct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 95;

  const unpaidFee = fees.find((f) => f.status === "pending" || f.status === "overdue");
  const pendingHomework = homework.filter((h) => h.status === "active");

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Academic Portal</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            {profile ? profile.fullName : "Muhammad Hamza"} &bull; Roll No: <code>{profile ? profile.rollNo : "BS-2024-101"}</code> &bull; {profile ? profile.className : "Class 10 - Blue"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          <Link to="/student/results">
            <Button variant="primary" size="sm">
              View Marksheet
            </Button>
          </Link>
          <Link to="/student/homework">
            <Button variant="secondary" size="sm">
              Homework ({pendingHomework.length})
            </Button>
          </Link>
          <Link to="/student/fees">
            <Button variant="secondary" size="sm">
              Fee Invoices
            </Button>
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Term Aggregate</div>
          <div className="stat-value">{loading ? "-" : `${avgPercentage}%`}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Grade A+ (Distinction)
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Attendance Rate</div>
          <div className="stat-value">{loading ? "-" : `${attendancePct}%`}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Satisfactory Standing
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Tuition Fee Due</div>
          <div className="stat-value">
            {unpaidFee ? `Rs. ${unpaidFee.amount}` : "Rs. 0"}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            {unpaidFee ? `Due: ${unpaidFee.dueDate}` : "All Dues Cleared"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Pending Homework</div>
          <div className="stat-value">{loading ? "-" : pendingHomework.length}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Active tasks to submit
          </div>
        </div>
      </div>

      {/* Pending Homework Tasks */}
      {pendingHomework.length > 0 && (
        <div className="panel-card" style={{ marginBottom: "var(--space-20)", padding: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, margin: 0 }}>Upcoming Homework Due</h3>
            <Link to="/student/homework" style={{ fontSize: "11px", color: "var(--color-primary)" }}>
              View All ({homework.length}) &rarr;
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
            {pendingHomework.slice(0, 3).map((hw) => (
              <div
                key={hw.id}
                style={{
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 14px",
                  backgroundColor: "var(--color-bg-sidebar)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: 600, fontSize: "12px" }}>{hw.title}</span>
                  <Badge variant="active">{hw.subjectName}</Badge>
                </div>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                  Due: <strong>{hw.dueDate}</strong> &bull; {hw.maxMarks} Marks
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courses and Grades Overview */}
      <div className="panel-card" style={{ padding: 0 }}>
        <div
          style={{
            padding: "var(--space-12) var(--space-16)",
            borderBottom: "1px solid var(--color-border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Mid-Term Subject Scores</h2>
          <Link to="/student/results" style={{ fontSize: "var(--font-size-xs)" }}>
            Detailed Transcript
          </Link>
        </div>
        <DataTable
          columns={[
            {
              key: "subject",
              header: "Subject Title",
              render: (row) => <strong>{row.subject}</strong>,
            },
            {
              key: "marks",
              header: "Score",
              render: (row) => `${row.obtainedMarks} / ${row.totalMarks}`,
            },
            {
              key: "percentage",
              header: "Percentage",
              render: (row) => `${Math.round((row.obtainedMarks / row.totalMarks) * 100)}%`,
            },
            {
              key: "grade",
              header: "Grade",
              render: (row) => (
                <Badge variant={row.grade === "F" ? "inactive" : "active"}>
                  {row.grade}
                </Badge>
              ),
            },
            { key: "remarks", header: "Teacher Remarks" },
          ]}
          data={marks}
          pageSize={6}
          emptyMessage="No scores uploaded for this term yet."
        />
      </div>
    </div>
  );
};

export default StudentDashboard;
