import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import api, { getSavedUser } from "../../lib/api";

interface AttendanceItem {
  id: number;
  date: string;
  status: "present" | "absent" | "leave" | "late";
}

export const StudentAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getSavedUser();
  const studentId = currentUser?.role === "student" && currentUser?.id ? currentUser.id : 1;

  useEffect(() => {
    async function loadAttendance() {
      try {
        setLoading(true);
        const data = await api.get<AttendanceItem[]>("/attendance", {
          params: { studentId },
        });
        setRecords(data);
      } catch (err) {
        console.error("Failed to load attendance", err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, [studentId]);

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const leave = records.filter((r) => r.status === "leave" || r.status === "late").length;
  const rate = total > 0 ? Math.round((present / total) * 100) : 100;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Personal Attendance History</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Cumulative roll call log and percentage record
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Net Attendance</div>
          <div className="stat-value">{rate}%</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Academic year aggregate
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Days Present</div>
          <div className="stat-value">{present}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Working sessions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Unexcused Absences</div>
          <div className="stat-value" style={{ color: absent > 0 ? "var(--color-danger)" : "inherit" }}>
            {absent}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Without leave slip
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Leaves / Late</div>
          <div className="stat-value">{leave}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Excused applications
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            { key: "date", header: "Date" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge variant={row.status === "present" ? "active" : row.status === "absent" ? "inactive" : "neutral"}>
                  {row.status.toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "notes",
              header: "Class Incharge Remarks",
              render: (row) =>
                row.status === "present" ? "Class conducted" : row.status === "late" ? "Late entry recorded" : "Notice sent",
            },
          ]}
          data={records}
          pageSize={10}
          emptyMessage={loading ? "Loading attendance history..." : "No attendance logs found."}
        />
      </div>
    </div>
  );
};

export default StudentAttendancePage;
