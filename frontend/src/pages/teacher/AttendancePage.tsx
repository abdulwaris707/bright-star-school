import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import SmsBroadcastModal from "../../components/SmsBroadcastModal";
import api, { getSavedUser } from "../../lib/api";

interface Student {
  id: number;
  rollNo: string;
  fullName: string;
  className: string;
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  classTeacherId?: number;
  classTeacherName: string;
}

type AttendanceStatus = "present" | "absent" | "leave" | "late";

export const AttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("1");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<number, AttendanceStatus>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  const currentUser = getSavedUser();

  // Load classes list
  useEffect(() => {
    async function loadClasses() {
      try {
        const cls = await api.get<SchoolClass[]>("/classes");
        setClasses(cls);
        if (cls.length > 0 && !cls.some((c) => c.id.toString() === selectedClassId)) {
          setSelectedClassId(cls[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    }
    loadClasses();
  }, []);

  const currentClass = classes.find((c) => c.id.toString() === selectedClassId);
  const isAdmin = currentUser?.role === "admin";
  const isIncharge =
    isAdmin || (currentClass && currentClass.classTeacherId === currentUser?.id);

  useEffect(() => {
    async function loadClassRoster() {
      try {
        setLoading(true);
        setErrorMessage("");
        const [studentsData, existingAttendance] = await Promise.all([
          api.get<Student[]>("/students", { params: { classId: selectedClassId } }),
          api.get<any[]>("/attendance", {
            params: { classId: selectedClassId, date: selectedDate },
          }),
        ]);

        setStudents(studentsData);

        const map: Record<number, AttendanceStatus> = {};
        studentsData.forEach((s) => {
          map[s.id] = "present"; // default
        });

        existingAttendance.forEach((item) => {
          if (item.status) {
            map[item.studentId] = item.status.toLowerCase() as AttendanceStatus;
          }
        });

        setAttendanceMap(map);
      } catch (err) {
        console.error("Failed to load roster", err);
      } finally {
        setLoading(false);
      }
    }

    if (selectedClassId) {
      loadClassRoster();
    }
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
    if (!isIncharge) return;
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    if (!isIncharge) return;
    const updated: Record<number, AttendanceStatus> = {};
    students.forEach((s) => {
      updated[s.id] = status;
    });
    setAttendanceMap(updated);
  };

  const handleSaveAttendance = async () => {
    if (!isIncharge) {
      setErrorMessage(
        `Action Forbidden: Only the designated Class Teacher In-Charge (${currentClass?.classTeacherName}) is authorized to submit attendance.`
      );
      return;
    }

    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const records = students.map((s) => ({
        studentId: s.id,
        classId: parseInt(selectedClassId, 10),
        date: selectedDate,
        status: attendanceMap[s.id] || "present",
      }));

      await api.post("/attendance", { records });
      setMessage("Attendance saved and verified successfully for " + selectedDate);
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save attendance.");
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(attendanceMap).filter((s) => s === "present").length;
  const absentCount = Object.values(attendanceMap).filter((s) => s === "absent").length;
  const leaveCount = Object.values(attendanceMap).filter((s) => s === "leave").length;
  const lateCount = Object.values(attendanceMap).filter((s) => s === "late").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance Register</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Class roll call and attendance submission &bull; Strict Class Teacher In-Charge Authorization
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          {absentCount > 0 && isIncharge && (
            <Button variant="secondary" size="sm" onClick={() => setIsSmsModalOpen(true)}>
              Alert Absent Parents ({absentCount})
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            disabled={saving || students.length === 0 || !isIncharge}
            onClick={handleSaveAttendance}
          >
            {saving ? "Saving..." : isIncharge ? "Save Attendance" : "Read-Only Mode"}
          </Button>
        </div>
      </div>

      {/* RBAC Warning Banner when non-incharge teacher is viewing */}
      {!isIncharge && currentClass && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "var(--space-16)",
            backgroundColor: "rgba(220, 38, 38, 0.08)",
            border: "1px solid rgba(220, 38, 38, 0.25)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
            lineHeight: 1.5,
          }}
        >
          <strong style={{ color: "#dc2626" }}>Read-Only Mode (RBAC Restriction):</strong> You are viewing attendance for <strong>{currentClass.name} ({currentClass.section})</strong>. Under School Academic Governance, <strong>ONLY</strong> the designated Class Teacher In-Charge (<strong>{currentClass.classTeacherName}</strong>) or Principal Office can submit or alter student attendance.
        </div>
      )}

      {isIncharge && (
        <div
          style={{
            padding: "8px 14px",
            marginBottom: "var(--space-16)",
            backgroundColor: "rgba(22, 163, 74, 0.08)",
            border: "1px solid rgba(22, 163, 74, 0.25)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
            color: "#16a34a",
            fontWeight: 500,
          }}
        >
          Authorized In-Charge: You have active attendance submission privileges for {currentClass?.name}.
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "var(--space-8) var(--space-12)",
            marginBottom: "var(--space-16)",
            backgroundColor: "var(--color-status-active-bg)",
            border: "1px solid var(--color-status-active-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-status-active-text)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
          }}
        >
          {message}
        </div>
      )}

      {errorMessage && (
        <div
          style={{
            padding: "var(--space-8) var(--space-12)",
            marginBottom: "var(--space-16)",
            backgroundColor: "var(--color-status-inactive-bg)",
            border: "1px solid var(--color-status-inactive-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-status-inactive-text)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Class and Date Controls */}
      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: "var(--space-12)",
          marginBottom: "var(--space-16)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-12)", flexWrap: "wrap" }}>
          <div style={{ width: "240px" }}>
            <Select
              label="Select Class &amp; Section"
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              options={classes.map((c) => ({
                value: c.id.toString(),
                label: `${c.name} (${c.section}) - Incharge: ${c.classTeacherName}`,
              }))}
            />
          </div>

          <div style={{ width: "170px" }}>
            <Input
              label="Attendance Date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>

        {isIncharge && (
          <div style={{ display: "flex", gap: "var(--space-8)" }}>
            <Button variant="secondary" size="sm" onClick={() => handleMarkAll("present")}>
              Mark All Present
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleMarkAll("absent")}>
              Mark All Absent
            </Button>
          </div>
        )}
      </div>

      {/* Summary Pills */}
      <div style={{ display: "flex", gap: "var(--space-8)", marginBottom: "var(--space-12)", fontSize: "var(--font-size-xs)" }}>
        <span style={{ padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius)", backgroundColor: "var(--color-bg-subtle)", border: "1px solid var(--color-border)" }}>
          Total: <strong>{students.length}</strong>
        </span>
        <span style={{ padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius)", backgroundColor: "var(--color-status-active-bg)", color: "var(--color-status-active-text)" }}>
          Present: <strong>{presentCount}</strong>
        </span>
        <span style={{ padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius)", backgroundColor: "var(--color-status-inactive-bg)", color: "var(--color-status-inactive-text)" }}>
          Absent: <strong>{absentCount}</strong>
        </span>
        <span style={{ padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius)", backgroundColor: "var(--color-status-neutral-bg)", color: "var(--color-status-neutral-text)" }}>
          Leave: <strong>{leaveCount}</strong>
        </span>
        <span style={{ padding: "var(--space-4) var(--space-8)", borderRadius: "var(--radius)", backgroundColor: "var(--color-bg-hover)", color: "var(--color-text)" }}>
          Late: <strong>{lateCount}</strong>
        </span>
      </div>

      {/* Attendance Sheet */}
      <div className="panel-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "var(--space-16)", textAlign: "center", color: "var(--color-text-muted)" }}>
            Loading roster...
          </div>
        ) : students.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Roll No</th>
                <th>Student Name</th>
                <th style={{ textAlign: "right", width: "280px" }}>
                  {isIncharge ? "Attendance Marking" : "Attendance Status"}
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const currentStatus = attendanceMap[student.id] || "present";
                return (
                  <tr key={student.id}>
                    <td>
                      <code>{student.rollNo}</code>
                    </td>
                    <td>
                      <strong>{student.fullName}</strong>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {isIncharge ? (
                        <div style={{ display: "inline-flex", gap: "var(--space-4)" }}>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: currentStatus === "present" ? "var(--color-status-active-border)" : "transparent",
                              color: currentStatus === "present" ? "var(--color-status-active-text)" : "var(--color-text-muted)",
                              border: "1px solid var(--color-border)",
                              fontWeight: currentStatus === "present" ? 600 : 400,
                            }}
                            onClick={() => handleStatusChange(student.id, "present")}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: currentStatus === "absent" ? "var(--color-status-inactive-border)" : "transparent",
                              color: currentStatus === "absent" ? "var(--color-status-inactive-text)" : "var(--color-text-muted)",
                              border: "1px solid var(--color-border)",
                              fontWeight: currentStatus === "absent" ? 600 : 400,
                            }}
                            onClick={() => handleStatusChange(student.id, "absent")}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: currentStatus === "leave" ? "var(--color-status-neutral-border)" : "transparent",
                              color: currentStatus === "leave" ? "var(--color-status-neutral-text)" : "var(--color-text-muted)",
                              border: "1px solid var(--color-border)",
                              fontWeight: currentStatus === "leave" ? 600 : 400,
                            }}
                            onClick={() => handleStatusChange(student.id, "leave")}
                          >
                            Leave
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm"
                            style={{
                              backgroundColor: currentStatus === "late" ? "var(--color-bg-hover)" : "transparent",
                              color: "var(--color-text)",
                              border: "1px solid var(--color-border)",
                              fontWeight: currentStatus === "late" ? 600 : 400,
                            }}
                            onClick={() => handleStatusChange(student.id, "late")}
                          >
                            Late
                          </button>
                        </div>
                      ) : (
                        <Badge
                          variant={
                            currentStatus === "present"
                              ? "active"
                              : currentStatus === "absent"
                              ? "inactive"
                              : "neutral"
                          }
                        >
                          {currentStatus.toUpperCase()}
                        </Badge>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "var(--space-16)", textAlign: "center", color: "var(--color-text-muted)" }}>
            No students found in this class section.
          </div>
        )}
      </div>

      {/* SMS Broadcast Modal */}
      <SmsBroadcastModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        defaultRecipientType="absent_today"
      />
    </div>
  );
};

export default AttendancePage;
