import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import Input from "../../components/ui/Input";
import Badge from "../../components/ui/Badge";
import ReportCardModal, { ReportCardData } from "../../components/ReportCardModal";
import api, { apiFetch } from "../../lib/api";

interface Student {
  id: number;
  rollNo: string;
  fullName: string;
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
}

interface ClassSubject {
  id: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
}

interface MarkRow {
  studentId: number;
  studentName: string;
  rollNo: string;
  totalMarks: number;
  obtainedMarks: number;
  remarks: string;
  grade: string;
}

export const MarksPage: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("1");
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [subject, setSubject] = useState("Physics");
  const [examType, setExamType] = useState("Mid-Term");

  const [marksData, setMarksData] = useState<MarkRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [reportCardTarget, setReportCardTarget] = useState<ReportCardData | null>(null);

  // Load classes initially
  useEffect(() => {
    async function initClasses() {
      try {
        const cls = await api.get<SchoolClass[]>("/classes");
        setClasses(cls);
        if (cls.length > 0) {
          setSelectedClassId(cls[0].id.toString());
        }
      } catch (err) {
        console.error("Failed to load classes", err);
      }
    }
    initClasses();
  }, []);

  // Load subjects for selected class
  useEffect(() => {
    async function loadSubjectsForClass() {
      if (!selectedClassId) return;
      try {
        const subs = await apiFetch<ClassSubject[]>(`/classes/${selectedClassId}/subjects`);
        setClassSubjects(subs);
        if (subs.length > 0 && !subs.some((s) => s.subjectName === subject)) {
          setSubject(subs[0].subjectName);
        }
      } catch {
        setClassSubjects([]);
      }
    }
    loadSubjectsForClass();
  }, [selectedClassId]);

  const computeGrade = (obtained: number, total: number) => {
    if (!total || total <= 0) return "-";
    const pct = (obtained / total) * 100;
    if (pct >= 90) return "A+";
    if (pct >= 80) return "A";
    if (pct >= 70) return "B";
    if (pct >= 60) return "C";
    if (pct >= 50) return "D";
    return "F";
  };

  useEffect(() => {
    async function loadMarksRoster() {
      if (!selectedClassId) return;
      try {
        setLoading(true);
        setErrorMessage("");
        const [studentsData, existingMarks] = await Promise.all([
          api.get<Student[]>("/students", { params: { classId: selectedClassId } }),
          api.get<any[]>("/marks", {
            params: { classId: selectedClassId, subject },
          }),
        ]);

        const rows: MarkRow[] = studentsData.map((s) => {
          const match = existingMarks.find(
            (m) => m.studentId === s.id && m.examType === examType && m.subject === subject
          );
          const tMarks = match?.totalMarks || 100;
          const oMarks = match?.obtainedMarks ?? 85;
          return {
            studentId: s.id,
            studentName: s.fullName,
            rollNo: s.rollNo,
            totalMarks: tMarks,
            obtainedMarks: oMarks,
            remarks: match?.remarks || "Good performance",
            grade: match?.grade || computeGrade(oMarks, tMarks),
          };
        });

        setMarksData(rows);
      } catch (err) {
        console.error("Failed to load marks", err);
      } finally {
        setLoading(false);
      }
    }

    loadMarksRoster();
  }, [selectedClassId, examType, subject]);

  const handleScoreChange = (studentId: number, obtained: number) => {
    setMarksData((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          const grade = computeGrade(obtained, row.totalMarks);
          return { ...row, obtainedMarks: obtained, grade };
        }
        return row;
      })
    );
  };

  const handleTotalMarksChange = (studentId: number, total: number) => {
    setMarksData((prev) =>
      prev.map((row) => {
        if (row.studentId === studentId) {
          const grade = computeGrade(row.obtainedMarks, total);
          return { ...row, totalMarks: total, grade };
        }
        return row;
      })
    );
  };

  const handleRemarksChange = (studentId: number, remarks: string) => {
    setMarksData((prev) =>
      prev.map((row) => (row.studentId === studentId ? { ...row, remarks } : row))
    );
  };

  const handleSaveMarks = async () => {
    setSaving(true);
    setMessage("");
    setErrorMessage("");

    try {
      const records = marksData.map((row) => ({
        studentId: row.studentId,
        studentName: row.studentName,
        rollNo: row.rollNo,
        classId: parseInt(selectedClassId, 10),
        subject,
        examType,
        totalMarks: row.totalMarks,
        obtainedMarks: row.obtainedMarks,
        grade: row.grade,
        remarks: row.remarks,
      }));

      await api.post("/marks", { records });
      setMessage(`Marks successfully submitted and recorded for ${subject} (${examType}).`);
      setTimeout(() => setMessage(""), 5000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save marks.");
    } finally {
      setSaving(false);
    }
  };

  const handleOpenDmc = async (studentId: number) => {
    try {
      const data = await api.get<ReportCardData>(`/marks/report-card/${studentId}`, {
        params: { examType },
      });
      setReportCardTarget(data);
    } catch (err: any) {
      alert(err.message || "Failed to load report card");
    }
  };

  const classAvg =
    marksData.length > 0
      ? Math.round(
          marksData.reduce((acc, r) => acc + (r.obtainedMarks / (r.totalMarks || 100)) * 100, 0) /
            marksData.length
        )
      : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Examination Evaluation &amp; Marks Entry</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Term examinations, subject assessments, grade computation, and DMC report card issuance
          </p>
        </div>
        <Button variant="primary" size="sm" disabled={saving || marksData.length === 0} onClick={handleSaveMarks}>
          {saving ? "Saving..." : "Save Examination Marks"}
        </Button>
      </div>

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

      {/* Class, Subject, and Exam Selectors */}
      <div
        className="panel-card"
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr 1fr",
          gap: "var(--space-12)",
          marginBottom: "var(--space-16)",
          padding: "var(--space-12) var(--space-16)",
        }}
      >
        <Select
          label="Select Class &amp; Section"
          value={selectedClassId}
          onChange={(e) => setSelectedClassId(e.target.value)}
          options={classes.map((c) => ({
            value: c.id.toString(),
            label: `${c.name} (${c.section})`,
          }))}
        />

        <Select
          label="Select Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={
            classSubjects.length > 0
              ? classSubjects.map((cs) => ({ value: cs.subjectName, label: `${cs.subjectName} (${cs.subjectCode})` }))
              : [
                  { value: "Physics", label: "Physics (PHY-102)" },
                  { value: "Mathematics", label: "Mathematics (MTH-101)" },
                  { value: "Chemistry", label: "Chemistry (CHM-103)" },
                  { value: "English Literature", label: "English Literature (ENG-104)" },
                ]
          }
        />

        <Select
          label="Examination Session"
          value={examType}
          onChange={(e) => setExamType(e.target.value)}
          options={[
            { value: "Mid-Term", label: "Mid-Term Examination (2026)" },
            { value: "Final Term", label: "Annual Final Examination (2027)" },
            { value: "First Term", label: "First Assessment Quiz" },
          ]}
        />
      </div>

      {/* Class Statistics Summary */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-16)" }}>
        <div className="stat-card">
          <div className="stat-label">Evaluated Students</div>
          <div className="stat-value">{marksData.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Subject Class Average</div>
          <div className="stat-value">{classAvg}%</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Examination Term</div>
          <div className="stat-value" style={{ fontSize: "var(--font-size-lg)" }}>{examType}</div>
        </div>
      </div>

      {/* Marks Table */}
      <div className="panel-card" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ padding: "var(--space-16)", textAlign: "center", color: "var(--color-text-muted)" }}>
            Loading student mark sheet...
          </div>
        ) : marksData.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th style={{ width: "120px" }}>Roll No</th>
                <th>Student Full Name</th>
                <th style={{ width: "120px" }}>Total Marks</th>
                <th style={{ width: "130px" }}>Obtained Marks</th>
                <th style={{ width: "80px" }}>Grade</th>
                <th style={{ width: "220px" }}>Teacher Evaluation Remarks</th>
                <th style={{ textAlign: "right", width: "110px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {marksData.map((row) => (
                <tr key={row.studentId}>
                  <td>
                    <code>{row.rollNo}</code>
                  </td>
                  <td>
                    <strong>{row.studentName}</strong>
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={row.totalMarks.toString()}
                      onChange={(e) =>
                        handleTotalMarksChange(row.studentId, parseInt(e.target.value, 10) || 100)
                      }
                      style={{ width: "80px" }}
                    />
                  </td>
                  <td>
                    <Input
                      type="number"
                      value={row.obtainedMarks.toString()}
                      onChange={(e) =>
                        handleScoreChange(row.studentId, parseInt(e.target.value, 10) || 0)
                      }
                      style={{ width: "80px", fontWeight: 700 }}
                    />
                  </td>
                  <td>
                    <Badge variant={row.grade.startsWith("A") ? "active" : row.grade === "F" ? "inactive" : "neutral"}>
                      {row.grade}
                    </Badge>
                  </td>
                  <td>
                    <Input
                      placeholder="Remarks..."
                      value={row.remarks}
                      onChange={(e) => handleRemarksChange(row.studentId, e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <Button variant="secondary" size="sm" onClick={() => handleOpenDmc(row.studentId)}>
                      DMC
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "var(--space-16)", textAlign: "center", color: "var(--color-text-muted)" }}>
            No students found in this section.
          </div>
        )}
      </div>

      {/* Report Card / DMC Modal */}
      <ReportCardModal
        isOpen={Boolean(reportCardTarget)}
        onClose={() => setReportCardTarget(null)}
        report={reportCardTarget}
      />
    </div>
  );
};

export default MarksPage;
