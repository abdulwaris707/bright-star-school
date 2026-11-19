import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import api, { apiFetch, getSavedUser } from "../../lib/api";

export const TeacherDashboard: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Daily Check-In state
  const [checkInCode, setCheckInCode] = useState<string>("");
  const [checkInStatus, setCheckInStatus] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState<boolean>(false);
  const [checkInMessage, setCheckInMessage] = useState<string>("");
  const [checkInError, setCheckInError] = useState<string>("");

  const currentUser = getSavedUser();

  const loadTeacherAttendanceStatus = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const records = await apiFetch<any[]>(`/teacher-attendance?date=${today}`);
      const myRecord = records.find((r) => r.teacherId === currentUser?.id);
      if (myRecord) {
        setCheckInStatus(myRecord);
      }
    } catch {}
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [classesData, timetableData] = await Promise.all([
          api.get<any[]>("/classes"),
          api.get<any[]>("/timetable", { params: { classId: 1 } }),
        ]);
        setClasses(classesData);
        setTimetable(timetableData);
        await loadTeacherAttendanceStatus();
      } catch (err) {
        console.error("Failed to load teacher dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelfCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCode) {
      setCheckInError("Please enter the daily security PIN / QR code displayed on the school terminal.");
      return;
    }

    setCheckingIn(true);
    setCheckInMessage("");
    setCheckInError("");

    try {
      const res = await apiFetch<any>("/teacher-attendance/check-in", {
        method: "POST",
        body: {
          code: checkInCode,
          verificationMethod: "PIN_VERIFIED",
          remarks: "Faculty morning self check-in",
        },
      });
      setCheckInMessage(res.message || "Check-in recorded successfully!");
      setCheckInStatus(res.checkIn);
      setCheckInCode("");
    } catch (err: any) {
      setCheckInError(err.message || "Failed to record check-in.");
    } finally {
      setCheckingIn(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Dashboard</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Senior Physics &amp; Mathematics Faculty &bull; Secondary Wing
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          <Link to="/teacher/attendance">
            <Button variant="primary" size="sm">
              Mark Attendance
            </Button>
          </Link>
          <Link to="/teacher/marks">
            <Button variant="secondary" size="sm">
              Enter Marks
            </Button>
          </Link>
        </div>
      </div>

      {/* Daily Rotating Security Check-In Widget */}
      <div
        style={{
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-16)",
          marginBottom: "var(--space-20)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-12)",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)" }}>
            Today's Attendance Status &bull; {new Date().toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            {checkInStatus ? (
              <>
                <Badge variant={checkInStatus.status === "present" ? "active" : "neutral"}>
                  {checkInStatus.status.toUpperCase()}
                </Badge>
                <span style={{ fontSize: "13px", fontWeight: 600 }}>
                  Checked in at {checkInStatus.checkInTime}
                </span>
                <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  ({checkInStatus.verificationMethod})
                </span>
              </>
            ) : (
              <>
                <Badge variant="inactive">NOT CHECKED IN</Badge>
                <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  Enter today's terminal PIN code or scan kiosk QR code to record authentic arrival.
                </span>
              </>
            )}
          </div>
          {checkInMessage && (
            <div style={{ fontSize: "12px", color: "#16a34a", marginTop: "4px", fontWeight: 500 }}>
              {checkInMessage}
            </div>
          )}
          {checkInError && (
            <div style={{ fontSize: "12px", color: "#dc2626", marginTop: "4px", fontWeight: 500 }}>
              {checkInError}
            </div>
          )}
        </div>

        {!checkInStatus && (
          <form onSubmit={handleSelfCheckIn} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Input
              placeholder="e.g. BST-XXXX"
              value={checkInCode}
              onChange={(e) => setCheckInCode(e.target.value)}
              style={{ width: "160px", fontFamily: "monospace" }}
            />
            <Button variant="primary" size="sm" disabled={checkingIn} type="submit">
              {checkingIn ? "Verifying..." : "Log Check-In"}
            </Button>
          </form>
        )}
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Assigned Sections</div>
          <div className="stat-value">{loading ? "-" : classes.length}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Grade 9 &amp; 10 sections
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Students Under Care</div>
          <div className="stat-value">
            {loading ? "-" : classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Enrolled pupils
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Scheduled Periods</div>
          <div className="stat-value">{loading ? "-" : timetable.length}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Weekly teaching slots
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Current Academic Term</div>
          <div className="stat-value">Mid-Term</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            2026-27 Matric Session
          </div>
        </div>
      </div>

      {/* Today's Schedule Table */}
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
          <h2 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Weekly Teaching Routine</h2>
          <Link to="/teacher/timetable" style={{ fontSize: "var(--font-size-xs)" }}>
            Full Timetable
          </Link>
        </div>
        <DataTable
          columns={[
            { key: "dayOfWeek", header: "Day" },
            {
              key: "periodNumber",
              header: "Period",
              render: (row) => `Period ${row.periodNumber}`,
            },
            {
              key: "time",
              header: "Timings",
              render: (row) => `${row.startTime} - ${row.endTime}`,
            },
            { key: "className", header: "Class" },
            {
              key: "subject",
              header: "Subject",
              render: (row) => <strong>{row.subject}</strong>,
            },
            { key: "roomNumber", header: "Room" },
          ]}
          data={timetable}
          pageSize={6}
          emptyMessage="No teaching slots registered."
        />
      </div>
    </div>
  );
};

export default TeacherDashboard;
