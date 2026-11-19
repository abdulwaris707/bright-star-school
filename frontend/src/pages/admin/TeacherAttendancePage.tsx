import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch } from "../../lib/api";

interface TeacherAttendance {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  date: string;
  checkInTime?: string;
  status: "present" | "absent" | "late" | "leave" | "pending_verification";
  verificationMethod: string;
  verifiedByAdminName?: string;
  verifiedAt?: string;
  remarks?: string;
}

interface Teacher {
  id: number;
  fullName: string;
  employeeId: string;
  designation?: string;
  qualification?: string;
  subjectSpecialization?: string;
  phone?: string;
  email?: string;
  status?: string;
}

interface DailyCodeResponse {
  code: string;
  date: string;
  expiresAt: string;
}

function getCurrentTime12H(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatTimeTo24H(time12?: string): string {
  if (!time12) return "";
  const match = time12.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return time12.substring(0, 5);
  let [_, hoursStr, minsStr, modifier] = match;
  let hours = parseInt(hoursStr, 10);
  if (modifier) {
    if (modifier.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier.toUpperCase() === "AM" && hours === 12) hours = 0;
  }
  return `${hours.toString().padStart(2, "0")}:${minsStr}`;
}

function formatTimeTo12H(time24: string): string {
  if (!time24) return "";
  const [hStr, mStr] = time24.split(":");
  let hours = parseInt(hStr, 10);
  if (isNaN(hours)) return time24;
  const modifier = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours.toString().padStart(2, "0")}:${mStr || "00"} ${modifier}`;
}

// Utility to generate and trigger RFC-4180 compliant CSV file download with UTF-8 BOM
function downloadCsv(filename: string, headers: string[], rows: (string | number | undefined | null)[][]) {
  const escapeCell = (val: string | number | undefined | null) => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent =
    "\uFEFF" +
    [
      headers.map(escapeCell).join(","),
      ...rows.map((row) => row.map(escapeCell).join(",")),
    ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const TeacherAttendancePage: React.FC = () => {
  const [records, setRecords] = useState<TeacherAttendance[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [dailyCode, setDailyCode] = useState<DailyCodeResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Editable arrival times per teacher in table
  const [customTimes, setCustomTimes] = useState<{ [teacherId: number]: string }>({});

  // Manual Override / Direct Mark Modal
  const [overrideModalOpen, setOverrideModalOpen] = useState<boolean>(false);
  const [targetTeacherId, setTargetTeacherId] = useState<number>(0);
  const [targetStatus, setTargetStatus] = useState<"present" | "absent" | "late" | "leave">("present");
  const [targetCheckInTime, setTargetCheckInTime] = useState<string>("");
  const [targetRemarks, setTargetRemarks] = useState<string>("");
  const [overrideError, setOverrideError] = useState<string>("");

  // Individual Teacher Attendance History Modal
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);
  const [selectedTeacherForHistory, setSelectedTeacherForHistory] = useState<Teacher | null>(null);
  const [teacherHistoryRecords, setTeacherHistoryRecords] = useState<TeacherAttendance[]>([]);
  const [historyLoading, setHistoryLoading] = useState<boolean>(false);
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("all");

  // Load daily sheet data
  const loadData = async () => {
    try {
      setLoading(true);
      const [attData, codeData, tchData] = await Promise.all([
        apiFetch<TeacherAttendance[]>(`/teacher-attendance?date=${selectedDate}`),
        apiFetch<DailyCodeResponse>("/teacher-attendance/daily-code"),
        apiFetch<Teacher[]>("/teachers"),
      ]);
      setRecords(attData);
      setDailyCode(codeData);
      setTeachers(tchData);
      if (tchData.length > 0 && targetTeacherId === 0) {
        setTargetTeacherId(tchData[0].id);
      }
    } catch (err: any) {
      console.error("Failed to load teacher attendance data", err);
      showFeedback(err.message || "Failed to load teacher attendance", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4000);
  };

  // Quick 1-click status marking for a teacher (Present, Late, Absent, Leave)
  const handleQuickMark = async (
    teacher: Teacher,
    status: "present" | "absent" | "late" | "leave",
    remarks?: string,
    customTime?: string
  ) => {
    try {
      setActionLoading(true);
      const rec = records.find((r) => r.teacherId === teacher.id);
      const defaultRemarks =
        status === "present"
          ? "Verified Present on arrival at school"
          : status === "late"
          ? "Late arrival verified by Administration"
          : status === "absent"
          ? "Marked Absent by Administration"
          : "Authorized Leave recorded by Administration";

      // Use customized time if entered or existing checkInTime, or current time for present/late
      const checkInTime =
        status === "present" || status === "late"
          ? customTime || customTimes[teacher.id] || rec?.checkInTime || getCurrentTime12H()
          : undefined;

      await apiFetch("/teacher-attendance/mark", {
        method: "POST",
        body: {
          teacherId: teacher.id,
          date: selectedDate,
          status,
          checkInTime,
          remarks: remarks || defaultRemarks,
        },
      });

      showFeedback(`${teacher.fullName} marked as ${status.toUpperCase()}${checkInTime ? ` (${checkInTime})` : ""} successfully.`);
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to mark attendance.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Update arrival time directly from table input for present/late teacher
  const handleUpdateTime = async (teacher: Teacher, time12: string) => {
    setCustomTimes((prev) => ({ ...prev, [teacher.id]: time12 }));
    const rec = records.find((r) => r.teacherId === teacher.id);

    if (rec && (rec.status === "present" || rec.status === "late")) {
      try {
        await apiFetch("/teacher-attendance/mark", {
          method: "POST",
          body: {
            teacherId: teacher.id,
            date: selectedDate,
            status: rec.status,
            checkInTime: time12,
            remarks: rec.remarks || `Arrival time updated to ${time12} by Administration`,
          },
        });
        showFeedback(`Arrival time for ${teacher.fullName} updated to ${time12}`);
        loadData();
      } catch (err: any) {
        showFeedback(err.message || "Failed to update arrival time.", "error");
      }
    }
  };

  // Verify / Approve an existing check-in
  const handleVerify = async (recordId: number, teacherName: string, status: "present" | "late" = "present") => {
    try {
      setActionLoading(true);
      await apiFetch(`/teacher-attendance/verify/${recordId}`, {
        method: "POST",
        body: {
          status,
          remarks: "Approved and verified by Administration Console",
        },
      });
      showFeedback(`Check-in verified for ${teacherName}.`);
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to verify attendance.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Mark all unrecorded teachers as Present in one click
  const handleMarkAllUnmarkedPresent = async () => {
    const unmarkedTeachers = teachers.filter(
      (t) => !records.some((r) => r.teacherId === t.id)
    );

    if (unmarkedTeachers.length === 0) {
      showFeedback("All teachers already have attendance marked for this date.", "error");
      return;
    }

    if (!window.confirm(`Mark remaining ${unmarkedTeachers.length} unrecorded teacher(s) as Present?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const currentTime = getCurrentTime12H();
      for (const t of unmarkedTeachers) {
        await apiFetch("/teacher-attendance/mark", {
          method: "POST",
          body: {
            teacherId: t.id,
            date: selectedDate,
            status: "present",
            checkInTime: customTimes[t.id] || currentTime,
            remarks: "Batch morning arrival verified by Administration",
          },
        });
      }
      showFeedback(`Marked ${unmarkedTeachers.length} teacher(s) as Present.`);
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to mark batch attendance.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manual Override / Custom Remarks Modal submission
  const handleManualOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRemarks) {
      setOverrideError("Mandatory audit remarks are required for administrative override.");
      return;
    }

    try {
      const finalCheckInTime =
        targetStatus === "present" || targetStatus === "late"
          ? targetCheckInTime || getCurrentTime12H()
          : undefined;

      await apiFetch("/teacher-attendance/mark", {
        method: "POST",
        body: {
          teacherId: targetTeacherId,
          date: selectedDate,
          status: targetStatus,
          checkInTime: finalCheckInTime,
          remarks: targetRemarks,
        },
      });
      setOverrideModalOpen(false);
      setTargetRemarks("");
      setOverrideError("");
      showFeedback("Attendance record updated and audit log created.");
      loadData();
    } catch (err: any) {
      setOverrideError(err.message || "Failed to mark attendance.");
    }
  };

  // Open Individual Teacher History Modal
  const openTeacherHistory = async (teacher: Teacher) => {
    setSelectedTeacherForHistory(teacher);
    setHistoryStatusFilter("all");
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const historyData = await apiFetch<TeacherAttendance[]>(
        `/teacher-attendance?teacherId=${teacher.id}`
      );
      setTeacherHistoryRecords(historyData);
    } catch (err: any) {
      showFeedback(err.message || "Failed to fetch teacher attendance history.", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  // CSV Export: All Teachers History across all dates
  const handleExportAllCsv = async () => {
    try {
      setActionLoading(true);
      const allRecords = await apiFetch<TeacherAttendance[]>("/teacher-attendance?all=true");
      
      const headers = [
        "Record ID",
        "Employee ID",
        "Teacher Name",
        "Date",
        "Status",
        "Check-In Time",
        "Verification Method",
        "Verified By",
        "Remarks",
      ];

      const rows = allRecords.map((r) => [
        r.id,
        r.employeeId,
        r.teacherName,
        r.date,
        r.status.toUpperCase(),
        r.checkInTime || "N/A",
        r.verificationMethod || "N/A",
        r.verifiedByAdminName || "N/A",
        r.remarks || "",
      ]);

      const now = new Date().toISOString().split("T")[0];
      downloadCsv(`BrightSchool_Teacher_Attendance_All_Records_${now}.csv`, headers, rows);
      showFeedback("Exported all teacher attendance records to CSV.");
    } catch (err: any) {
      showFeedback(err.message || "Failed to export CSV.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export: Today's / Selected Date's Sheet for all teachers
  const handleExportDailyCsv = () => {
    const headers = [
      "Employee ID",
      "Teacher Name",
      "Designation",
      "Date",
      "Status",
      "Check-In Time",
      "Verification Mode",
      "Verified By",
      "Remarks",
    ];

    const rows = teachers.map((t) => {
      const rec = records.find((r) => r.teacherId === t.id);
      return [
        t.employeeId,
        t.fullName,
        t.designation || "Faculty",
        selectedDate,
        rec ? rec.status.toUpperCase() : "NOT MARKED",
        rec?.checkInTime || "N/A",
        rec?.verificationMethod || "N/A",
        rec?.verifiedByAdminName || "N/A",
        rec?.remarks || "",
      ];
    });

    downloadCsv(`BrightSchool_Daily_Teacher_Attendance_${selectedDate}.csv`, headers, rows);
    showFeedback(`Exported attendance sheet for ${selectedDate} to CSV.`);
  };

  // CSV Export: Selected Single Teacher History
  const handleExportSingleTeacherCsv = () => {
    if (!selectedTeacherForHistory) return;
    const headers = [
      "Employee ID",
      "Teacher Name",
      "Date",
      "Status",
      "Check-In Time",
      "Verification Mode",
      "Verified By",
      "Remarks",
    ];

    const rows = teacherHistoryRecords.map((r) => [
      r.employeeId,
      r.teacherName,
      r.date,
      r.status.toUpperCase(),
      r.checkInTime || "N/A",
      r.verificationMethod || "N/A",
      r.verifiedByAdminName || "N/A",
      r.remarks || "",
    ]);

    const sanitizedName = selectedTeacherForHistory.fullName.replace(/\s+/g, "_");
    downloadCsv(
      `Teacher_Attendance_${selectedTeacherForHistory.employeeId}_${sanitizedName}.csv`,
      headers,
      rows
    );
  };

  // Daily statistics calculation
  const totalTeachers = teachers.length;
  const presentCount = records.filter((r) => r.status === "present").length;
  const lateCount = records.filter((r) => r.status === "late").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const leaveCount = records.filter((r) => r.status === "leave").length;
  const unmarkedCount = totalTeachers - records.length;

  // Selected teacher's historical stats
  const historyTotal = teacherHistoryRecords.length;
  const historyPresent = teacherHistoryRecords.filter((r) => r.status === "present").length;
  const historyLate = teacherHistoryRecords.filter((r) => r.status === "late").length;
  const historyAbsent = teacherHistoryRecords.filter((r) => r.status === "absent").length;
  const historyLeave = teacherHistoryRecords.filter((r) => r.status === "leave").length;
  const historyRate = historyTotal > 0
    ? Math.round(((historyPresent + historyLate) / historyTotal) * 100)
    : 0;

  const filteredHistoryRecords = teacherHistoryRecords.filter((r) => {
    if (historyStatusFilter === "all") return true;
    return r.status === historyStatusFilter;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Attendance &amp; Verification Console</h1>
          <p className="page-subtitle">
            Daily arrival verification, rotating PIN/QR codes, faculty attendance records, and comprehensive CSV export
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => loadData()} disabled={loading}>
            Refresh
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportDailyCsv}
            disabled={teachers.length === 0}
            title="Download CSV for the currently selected date"
          >
            Export Daily CSV
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportAllCsv}
            disabled={actionLoading}
            title="Download CSV of all historical teacher records across all dates"
          >
            Export All Records CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              if (teachers.length > 0 && targetTeacherId === 0) {
                setTargetTeacherId(teachers[0].id);
              }
              setTargetCheckInTime(getCurrentTime12H());
              setOverrideModalOpen(true);
            }}
          >
            + Override / Direct Mark
          </Button>
        </div>
      </div>

      {/* Status Feedback Toast/Banner */}
      {feedbackMsg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: "var(--radius-md)",
            marginBottom: "var(--space-16)",
            fontSize: "13px",
            fontWeight: 500,
            border: feedbackMsg.type === "success" ? "1px solid #16a34a" : "1px solid #dc2626",
            backgroundColor: feedbackMsg.type === "success" ? "rgba(22, 163, 74, 0.1)" : "rgba(220, 38, 38, 0.1)",
            color: feedbackMsg.type === "success" ? "#16a34a" : "#dc2626",
          }}
        >
          {feedbackMsg.text}
        </div>
      )}

      {/* Daily Rotating Code & Date Filter Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "var(--color-bg-card)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          padding: "var(--space-16)",
          marginBottom: "var(--space-20)",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <span style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)" }}>
            Today's Rotating Faculty Self-Check-In Security PIN
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "4px" }}>
            <span
              style={{
                fontFamily: "monospace",
                fontSize: "24px",
                fontWeight: 700,
                color: "var(--color-primary)",
                letterSpacing: "2px",
              }}
            >
              {dailyCode ? dailyCode.code : "BST-Loading"}
            </span>
            <Badge variant="active">Active &bull; Valid for {dailyCode?.date || "Today"}</Badge>
          </div>
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Teachers enter this PIN on arrival or scan the staff room kiosk QR code to record authentic timestamps.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Input
            label="Attendance Date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {unmarkedCount > 0 && selectedDate === new Date().toISOString().split("T")[0] && (
            <div style={{ paddingTop: "18px" }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleMarkAllUnmarkedPresent}
                disabled={actionLoading}
              >
                Mark Unrecorded ({unmarkedCount}) Present
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Daily Statistics Cards */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="stat-card">
          <span className="stat-label">Total Faculty</span>
          <span className="stat-value">{totalTeachers}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Verified Present</span>
          <span className="stat-value" style={{ color: "#16a34a" }}>{presentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Late Arrivals</span>
          <span className="stat-value" style={{ color: "#d97706" }}>{lateCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Absent Today</span>
          <span className="stat-value" style={{ color: "#dc2626" }}>{absentCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">On Approved Leave</span>
          <span className="stat-value" style={{ color: "var(--color-text-muted)" }}>{leaveCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Awaiting Marking</span>
          <span className="stat-value">{unmarkedCount > 0 ? unmarkedCount : 0}</span>
        </div>
      </div>

      {/* Complete Faculty Attendance Sheet */}
      <div className="panel-card" style={{ padding: 0 }}>
        <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
              Faculty Daily Attendance Sheet &bull; {selectedDate}
            </h3>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--color-text-muted)" }}>
              As teachers arrive at school, verify their presence or mark their status directly below.
            </p>
          </div>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Showing {teachers.length} Faculty Members
          </span>
        </div>

        <DataTable
          columns={[
            {
              key: "teacher",
              header: "Faculty Member",
              render: (t: Teacher) => (
                <div>
                  <strong style={{ fontSize: "13px" }}>{t.fullName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{t.employeeId}</span> &bull; {t.designation || "Teacher"}
                  </div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (t: Teacher) => {
                const rec = records.find((r) => r.teacherId === t.id);
                if (!rec) {
                  return (
                    <Badge variant="neutral">
                      NOT MARKED
                    </Badge>
                  );
                }

                let badgeVariant: "active" | "inactive" | "neutral" = "neutral";
                let label = rec.status.toUpperCase();
                let colorStyle = undefined;

                if (rec.status === "present") {
                  badgeVariant = "active";
                } else if (rec.status === "absent") {
                  badgeVariant = "inactive";
                } else if (rec.status === "late") {
                  badgeVariant = "neutral";
                  colorStyle = { borderColor: "#d97706", color: "#d97706" };
                }

                return (
                  <Badge variant={badgeVariant} className="" style={colorStyle as any}>
                    {label}
                  </Badge>
                );
              },
            },
            {
              key: "timeAndMode",
              header: "Check-In Time & Mode",
              render: (t: Teacher) => {
                const rec = records.find((r) => r.teacherId === t.id);
                const isAbsentOrLeave = rec?.status === "absent" || rec?.status === "leave";
                const displayTime = customTimes[t.id] || rec?.checkInTime || "";

                if (isAbsentOrLeave) {
                  return (
                    <div>
                      <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                        — (Not Applicable)
                      </span>
                      <div style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--color-text-muted)", marginTop: "2px" }}>
                        {rec?.verificationMethod}
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input
                        type="time"
                        className="form-input"
                        value={formatTimeTo24H(displayTime)}
                        onChange={(e) => {
                          const time12 = formatTimeTo12H(e.target.value);
                          handleUpdateTime(t, time12);
                        }}
                        style={{
                          height: "28px",
                          padding: "0 6px",
                          fontSize: "12px",
                          width: "95px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: "var(--color-bg-subtle)",
                          border: "1px solid var(--color-border)",
                          color: "var(--color-text)",
                        }}
                        title="Enter or adjust exact arrival time"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateTime(t, getCurrentTime12H())}
                        style={{
                          padding: "2px 6px",
                          fontSize: "10px",
                          fontWeight: 600,
                          borderRadius: "var(--radius-sm)",
                          border: "1px solid var(--color-border)",
                          backgroundColor: "transparent",
                          color: "var(--color-text-muted)",
                          cursor: "pointer",
                        }}
                        title="Set arrival time to current time"
                      >
                        Now
                      </button>
                    </div>
                    <div style={{ fontSize: "10px", fontFamily: "monospace", color: "var(--color-text-muted)" }}>
                      {displayTime ? `${displayTime} • ` : ""}
                      {rec?.verificationMethod || "Set arrival time"}
                    </div>
                  </div>
                );
              },
            },
            {
              key: "verifiedBy",
              header: "Verifier / Remarks",
              render: (t: Teacher) => {
                const rec = records.find((r) => r.teacherId === t.id);
                if (!rec) return <span style={{ color: "var(--color-text-muted)", fontSize: "12px" }}>-</span>;
                return (
                  <div style={{ maxWidth: "220px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 600 }}>
                      {rec.verifiedByAdminName || "Self-Reported"}
                    </div>
                    {rec.remarks && (
                      <div style={{ fontSize: "11px", color: "var(--color-text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={rec.remarks}>
                        {rec.remarks}
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              key: "quickMark",
              header: "Update Status",
              render: (t: Teacher) => {
                const rec = records.find((r) => r.teacherId === t.id);
                const isPendingReview = rec && !rec.verifiedByAdminName;

                return (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {/* If self-checked in with PIN/QR and pending admin review */}
                    {isPendingReview && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleVerify(rec.id, t.fullName, "present")}
                        disabled={actionLoading}
                        title="Approve and certify self-check-in arrival"
                      >
                        Approve
                      </Button>
                    )}

                    <select
                      className="form-select"
                      value={rec?.status || ""}
                      onChange={(e) => {
                        const val = e.target.value as "present" | "late" | "absent" | "leave";
                        if (val) handleQuickMark(t, val);
                      }}
                      disabled={actionLoading}
                      style={{
                        height: "32px",
                        padding: "0 10px",
                        fontSize: "12px",
                        fontWeight: 500,
                        width: "auto",
                        minWidth: "135px",
                        cursor: "pointer",
                      }}
                    >
                      {!rec && <option value="" disabled>-- Mark Status --</option>}
                      <option value="present">Present</option>
                      <option value="late">Late Arrival</option>
                      <option value="absent">Absent</option>
                      <option value="leave">On Leave</option>
                    </select>
                  </div>
                );
              },
            },
            {
              key: "actions",
              header: "Record & Details",
              render: (t: Teacher) => {
                const rec = records.find((r) => r.teacherId === t.id);
                return (
                  <div style={{ display: "flex", gap: "6px" }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => openTeacherHistory(t)}
                      title="View complete historical attendance records for this teacher"
                    >
                      History
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setTargetTeacherId(t.id);
                        if (rec) {
                          setTargetStatus(rec.status as any);
                          setTargetRemarks(rec.remarks || "");
                          setTargetCheckInTime(rec.checkInTime || customTimes[t.id] || getCurrentTime12H());
                        } else {
                          setTargetStatus("present");
                          setTargetRemarks("");
                          setTargetCheckInTime(customTimes[t.id] || getCurrentTime12H());
                        }
                        setOverrideModalOpen(true);
                      }}
                      title="Override status or add custom remarks"
                    >
                      Edit / Note
                    </Button>
                  </div>
                );
              },
            },
          ]}
          data={teachers}
          keyExtractor={(t) => t.id}
          emptyMessage={loading ? "Loading faculty roster..." : "No faculty members found."}
        />
      </div>

      {/* Teacher Individual Attendance History Modal */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Faculty Attendance Record: ${selectedTeacherForHistory?.fullName || ""}`}
        maxWidth="820px"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between", width: "100%" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExportSingleTeacherCsv}
              disabled={teacherHistoryRecords.length === 0}
            >
              Export This Teacher's History (CSV)
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setHistoryModalOpen(false)}>
              Close
            </Button>
          </div>
        }
      >
        {selectedTeacherForHistory && (
          <div>
            {/* Teacher Profile Banner */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: "16px",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              <div>
                <strong style={{ fontSize: "15px" }}>{selectedTeacherForHistory.fullName}</strong>
                <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                  <span style={{ fontFamily: "monospace", fontWeight: 700 }}>
                    {selectedTeacherForHistory.employeeId}
                  </span>{" "}
                  &bull; {selectedTeacherForHistory.designation || "Senior Faculty"}{" "}
                  {selectedTeacherForHistory.qualification ? `(${selectedTeacherForHistory.qualification})` : ""}
                </div>
              </div>
              <div style={{ textAlign: "right", fontSize: "12px" }}>
                <div>{selectedTeacherForHistory.phone || "No phone recorded"}</div>
                <div style={{ color: "var(--color-text-muted)" }}>{selectedTeacherForHistory.email || ""}</div>
              </div>
            </div>

            {/* Attendance Performance Metrics */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <div className="stat-card" style={{ padding: "10px 12px" }}>
                <span className="stat-label" style={{ fontSize: "11px" }}>Total Days</span>
                <span className="stat-value" style={{ fontSize: "18px" }}>{historyTotal}</span>
              </div>
              <div className="stat-card" style={{ padding: "10px 12px" }}>
                <span className="stat-label" style={{ fontSize: "11px" }}>Present</span>
                <span className="stat-value" style={{ fontSize: "18px", color: "#16a34a" }}>
                  {historyPresent}
                </span>
              </div>
              <div className="stat-card" style={{ padding: "10px 12px" }}>
                <span className="stat-label" style={{ fontSize: "11px" }}>Late</span>
                <span className="stat-value" style={{ fontSize: "18px", color: "#d97706" }}>
                  {historyLate}
                </span>
              </div>
              <div className="stat-card" style={{ padding: "10px 12px" }}>
                <span className="stat-label" style={{ fontSize: "11px" }}>Absent</span>
                <span className="stat-value" style={{ fontSize: "18px", color: "#dc2626" }}>
                  {historyAbsent}
                </span>
              </div>
              <div className="stat-card" style={{ padding: "10px 12px" }}>
                <span className="stat-label" style={{ fontSize: "11px" }}>Leaves</span>
                <span className="stat-value" style={{ fontSize: "18px", color: "var(--color-text-muted)" }}>
                  {historyLeave}
                </span>
              </div>
              <div className="stat-card" style={{ padding: "10px 12px" }}>
                <span className="stat-label" style={{ fontSize: "11px" }}>Net Rate</span>
                <span
                  className="stat-value"
                  style={{
                    fontSize: "18px",
                    color: historyRate >= 90 ? "#16a34a" : historyRate >= 75 ? "#d97706" : "#dc2626",
                  }}
                >
                  {historyRate}%
                </span>
              </div>
            </div>

            {/* Filter toolbar */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600 }}>
                Historical Attendance Logs ({filteredHistoryRecords.length} records)
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {["all", "present", "late", "absent", "leave"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setHistoryStatusFilter(st)}
                    style={{
                      padding: "2px 8px",
                      fontSize: "11px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--color-border)",
                      backgroundColor: historyStatusFilter === st ? "var(--color-primary)" : "transparent",
                      color: historyStatusFilter === st ? "#ffffff" : "var(--color-text)",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* History Table */}
            <div style={{ maxHeight: "320px", overflowY: "auto", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)" }}>
              <DataTable
                columns={[
                  {
                    key: "date",
                    header: "Date",
                    render: (r: TeacherAttendance) => (
                      <span style={{ fontFamily: "monospace", fontSize: "12px", fontWeight: 600 }}>
                        {r.date}
                      </span>
                    ),
                  },
                  {
                    key: "status",
                    header: "Status",
                    render: (r: TeacherAttendance) => {
                      let badgeVariant: "active" | "inactive" | "neutral" = "neutral";
                      let colorStyle = undefined;
                      if (r.status === "present") badgeVariant = "active";
                      else if (r.status === "absent") badgeVariant = "inactive";
                      else if (r.status === "late") {
                        colorStyle = { borderColor: "#d97706", color: "#d97706" };
                      }
                      return (
                        <Badge variant={badgeVariant} style={colorStyle as any}>
                          {r.status.toUpperCase()}
                        </Badge>
                      );
                    },
                  },
                  {
                    key: "checkInTime",
                    header: "Check-In Time",
                    render: (r: TeacherAttendance) => r.checkInTime || "-",
                  },
                  {
                    key: "verificationMethod",
                    header: "Verification Mode",
                    render: (r: TeacherAttendance) => (
                      <span style={{ fontSize: "11px", fontFamily: "monospace" }}>
                        {r.verificationMethod}
                      </span>
                    ),
                  },
                  {
                    key: "verifiedBy",
                    header: "Verified By / Remarks",
                    render: (r: TeacherAttendance) => (
                      <div>
                        <div style={{ fontSize: "11px", fontWeight: 500 }}>
                          {r.verifiedByAdminName || "Direct"}
                        </div>
                        {r.remarks && (
                          <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                            {r.remarks}
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
                data={filteredHistoryRecords}
                keyExtractor={(r) => r.id}
                emptyMessage={historyLoading ? "Loading attendance records..." : "No records found for this filter."}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Manual Override / Direct Mark Modal */}
      <Modal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title="Administrative Attendance Override / Direct Mark"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setOverrideModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleManualOverride}>
              Confirm &amp; Log Audit Record
            </Button>
          </div>
        }
      >
        <form onSubmit={handleManualOverride} className="form-layout">
          {overrideError && <div className="form-error">{overrideError}</div>}

          <Select
            label="Select Teacher"
            value={targetTeacherId.toString()}
            onChange={(e) => setTargetTeacherId(parseInt(e.target.value, 10))}
            options={teachers.map((t) => ({
              value: t.id.toString(),
              label: `${t.fullName} (${t.employeeId})`,
            }))}
          />

          <Select
            label="Attendance Status"
            value={targetStatus}
            onChange={(e) => setTargetStatus(e.target.value as any)}
            options={[
              { value: "present", label: "Present" },
              { value: "late", label: "Late Arrival" },
              { value: "absent", label: "Absent (Auto-Notifies Admin for Substitute)" },
              { value: "leave", label: "On Authorized Leave" },
            ]}
          />

          {(targetStatus === "present" || targetStatus === "late") && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <label className="form-label" style={{ margin: 0 }}>
                  Arrival / Check-In Time
                </label>
                <button
                  type="button"
                  onClick={() => setTargetCheckInTime(getCurrentTime12H())}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-primary)",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  Use Current Time
                </button>
              </div>
              <Input
                placeholder="e.g. 07:45 AM or 08:15 AM"
                value={targetCheckInTime}
                onChange={(e) => setTargetCheckInTime(e.target.value)}
              />
            </div>
          )}

          <Input
            label="Mandatory Audit Remarks (Required for Compliance)"
            placeholder="e.g. Authorized official duty at Board office / biometric sensor timeout"
            value={targetRemarks}
            onChange={(e) => setTargetRemarks(e.target.value)}
            required
          />

          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Note: Every manual status modification is permanently recorded in the system audit trail with your admin username and timestamp.
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherAttendancePage;
