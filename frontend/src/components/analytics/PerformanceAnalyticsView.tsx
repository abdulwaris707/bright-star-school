import React, { useEffect, useState } from "react";
import Button from "../ui/Button";
import Select from "../ui/Select";
import Badge from "../ui/Badge";
import ReportCardModal, { ReportCardData } from "../ReportCardModal";
import api from "../../lib/api";

export interface AnalyticsData {
  wholeSchool: {
    totalEvaluatedStudents: number;
    schoolAveragePct: number;
    schoolPassRate: number;
    gradeDistribution: Record<string, number>;
    subjectAverages: { subject: string; averagePct: number; evaluationsCount: number }[];
  };
  classWise: {
    classId: number;
    className: string;
    studentCount: number;
    averagePct: number;
    passRate: number;
    subjects: { subject: string; averagePct: number }[];
    rankings: {
      studentId: number;
      name: string;
      rollNo: string;
      obtainedMarks: number;
      totalMarks: number;
      percentage: number;
      grade: string;
      passed: boolean;
    }[];
  }[];
  individualStudents: {
    studentId: number;
    name: string;
    rollNo: string;
    classId: number;
    className: string;
    obtainedMarks: number;
    totalMarks: number;
    percentage: number;
    grade: string;
    passed: boolean;
    subjects: {
      subject: string;
      obtained: number;
      total: number;
      percentage: number;
      grade: string;
      remarks: string;
    }[];
  }[];
  teachers: {
    teacherId: number;
    name: string;
    designation: string;
    employeeId: string;
    attendanceRate: number;
    totalClassesCount: number;
    assignedClasses: string[];
    assignedSubjects: string[];
    studentAverageScore: number;
    approvedLeavesCount: number;
    rating: string;
  }[];
}

export const PerformanceAnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<"students" | "teachers">("students");
  const [studentScope, setStudentScope] = useState<"whole" | "class" | "individual">("whole");
  const [selectedClassId, setSelectedClassId] = useState<number>(0);
  const [selectedStudentId, setSelectedStudentId] = useState<number>(0);
  const [reportCardTarget, setReportCardTarget] = useState<ReportCardData | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const res = await api.get<AnalyticsData>("/analytics");
        setData(res);
        if (res.classWise.length > 0) {
          setSelectedClassId(res.classWise[0].classId);
        }
        if (res.individualStudents.length > 0) {
          setSelectedStudentId(res.individualStudents[0].studentId);
        }
      } catch (err) {
        console.error("Failed to load analytics data", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  const handleOpenReportCard = async (studentId: number) => {
    try {
      const res = await api.get<ReportCardData>(`/marks/report-card/${studentId}`);
      setReportCardTarget(res);
    } catch {
      alert("No marks record found for this student.");
    }
  };

  if (loading) {
    return (
      <div className="panel-card" style={{ padding: "var(--space-24)", textAlign: "center", color: "var(--color-text-muted)" }}>
        Loading real-time academic &amp; faculty performance analytics...
      </div>
    );
  }

  if (!data) {
    return (
      <div className="panel-card" style={{ padding: "var(--space-24)", textAlign: "center", color: "var(--color-danger)" }}>
        Failed to load performance analytics.
      </div>
    );
  }

  const currentClass = data.classWise.find((c) => c.classId === selectedClassId) || data.classWise[0];
  const currentStudent = data.individualStudents.find((s) => s.studentId === selectedStudentId) || data.individualStudents[0];

  const getScoreColor = (pct: number) => {
    if (pct >= 85) return "#16a34a";
    if (pct >= 70) return "#2563eb";
    if (pct >= 50) return "#d97706";
    return "#dc2626";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
      {/* Top Scope Navigation Tabs */}
      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-12)",
          padding: "var(--space-12) var(--space-16)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap" }}>
          <Button
            variant={mainTab === "students" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setMainTab("students")}
          >
            Student Academic Performance
          </Button>
          <Button
            variant={mainTab === "teachers" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setMainTab("teachers")}
          >
            Faculty &amp; Teaching Analytics
          </Button>
        </div>

        {mainTab === "students" && (
          <div style={{ display: "flex", gap: "var(--space-8)", alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>View Level:</span>
            <Button
              variant={studentScope === "whole" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStudentScope("whole")}
            >
              Whole School
            </Button>
            <Button
              variant={studentScope === "class" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStudentScope("class")}
            >
              Class-Wise
            </Button>
            <Button
              variant={studentScope === "individual" ? "primary" : "secondary"}
              size="sm"
              onClick={() => setStudentScope("individual")}
            >
              Individual Student
            </Button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. STUDENT PERFORMANCE - WHOLE SCHOOL */}
      {/* ========================================================================= */}
      {mainTab === "students" && studentScope === "whole" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          {/* Top KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">School Average Score</div>
              <div className="stat-value" style={{ color: getScoreColor(data.wholeSchool.schoolAveragePct) }}>
                {data.wholeSchool.schoolAveragePct}%
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Overall student body average
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Institutional Pass Rate</div>
              <div className="stat-value" style={{ color: "#16a34a" }}>
                {data.wholeSchool.schoolPassRate}%
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Passing threshold &ge; 40%
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Evaluated Students</div>
              <div className="stat-value">{data.wholeSchool.totalEvaluatedStudents}</div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Active examination records
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Top Academic Subject</div>
              <div className="stat-value" style={{ fontSize: "20px", color: "var(--color-primary)" }}>
                {data.wholeSchool.subjectAverages[0]?.subject || "Mathematics"}
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Highest subject aggregate ({data.wholeSchool.subjectAverages[0]?.averagePct || 90}%)
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "var(--space-16)" }}>
            {/* Subject Performance Horizontal Bar Graph */}
            <div className="panel-card">
              <div style={{ marginBottom: "var(--space-16)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Subject-Wise Performance (School Aggregate)</h3>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Comparative percentage performance across core disciplines
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {data.wholeSchool.subjectAverages.map((sub) => (
                  <div key={sub.subject}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--font-size-xs)", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600 }}>{sub.subject}</span>
                      <span style={{ color: getScoreColor(sub.averagePct), fontWeight: 700 }}>
                        {sub.averagePct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: "10px",
                        background: "var(--color-bg-subtle)",
                        borderRadius: "999px",
                        overflow: "hidden",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(sub.averagePct, 100)}%`,
                          height: "100%",
                          background: getScoreColor(sub.averagePct),
                          transition: "width 0.5s ease-out",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Grade Distribution Breakdown */}
            <div className="panel-card">
              <div style={{ marginBottom: "var(--space-16)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
                <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Grade Distribution Breakdown</h3>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Institutional distribution across standard academic grading tiers
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {Object.entries(data.wholeSchool.gradeDistribution).map(([grade, count]) => {
                  const total = Object.values(data.wholeSchool.gradeDistribution).reduce((a, b) => a + b, 0) || 1;
                  const pct = Math.round((count / total) * 100);
                  const color =
                    grade === "A+" || grade === "A"
                      ? "#16a34a"
                      : grade === "B"
                      ? "#2563eb"
                      : grade === "C"
                      ? "#d97706"
                      : "#dc2626";

                  return (
                    <div key={grade} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div
                        style={{
                          width: "36px",
                          fontWeight: 700,
                          fontSize: "12px",
                          color,
                          textAlign: "center",
                          padding: "2px 0",
                          border: `1px solid ${color}`,
                          borderRadius: "4px",
                          background: "var(--color-bg-subtle)",
                        }}
                      >
                        {grade}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            height: "8px",
                            background: "var(--color-bg-subtle)",
                            borderRadius: "999px",
                            overflow: "hidden",
                            border: "1px solid var(--color-border)",
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: "100%",
                              background: color,
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ width: "80px", textAlign: "right", fontSize: "11px", color: "var(--color-text-muted)" }}>
                        <strong>{count}</strong> ({pct}%)
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Class-wise Comparison Graph */}
          <div className="panel-card">
            <div style={{ marginBottom: "var(--space-16)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
              <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Class-Wise Academic Benchmark</h3>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Inter-class performance comparison across registered academic sections
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
              {data.classWise.map((cls) => (
                <div
                  key={cls.classId}
                  style={{
                    padding: "12px",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    background: "var(--color-bg-subtle)",
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", marginBottom: "4px" }}>
                    {cls.className}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                    <span style={{ fontSize: "22px", fontWeight: 700, color: getScoreColor(cls.averagePct) }}>
                      {cls.averagePct}%
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      Pass: {cls.passRate}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: "6px",
                      background: "rgba(255,255,255,0.06)",
                      borderRadius: "999px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${cls.averagePct}%`,
                        height: "100%",
                        background: getScoreColor(cls.averagePct),
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "6px" }}>
                    {cls.studentCount} Student{cls.studentCount === 1 ? "" : "s"} Enrolled
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. STUDENT PERFORMANCE - CLASS-WISE */}
      {/* ========================================================================= */}
      {mainTab === "students" && studentScope === "class" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          {/* Class Selector Bar */}
          <div
            className="panel-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "var(--space-12) var(--space-16)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Select Class:</span>
              <div style={{ minWidth: "220px" }}>
                <Select
                  value={selectedClassId.toString()}
                  onChange={(e) => setSelectedClassId(parseInt(e.target.value, 10))}
                  options={data.classWise.map((c) => ({
                    value: c.classId.toString(),
                    label: `${c.className} (${c.studentCount} students)`,
                  }))}
                />
              </div>
            </div>

            {currentClass && (
              <div style={{ display: "flex", gap: "16px", fontSize: "var(--font-size-xs)" }}>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Class Average: </span>
                  <strong style={{ color: getScoreColor(currentClass.averagePct) }}>{currentClass.averagePct}%</strong>
                </div>
                <div>
                  <span style={{ color: "var(--color-text-muted)" }}>Class Pass Rate: </span>
                  <strong style={{ color: "#16a34a" }}>{currentClass.passRate}%</strong>
                </div>
              </div>
            )}
          </div>

          {currentClass && (
            <>
              {/* Class Subject Breakdown Chart */}
              <div className="panel-card">
                <div style={{ marginBottom: "var(--space-16)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
                  <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>
                    {currentClass.className} - Subject Performance Analysis
                  </h3>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Average percentage scores achieved by students in this section
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px" }}>
                  {currentClass.subjects.length > 0 ? (
                    currentClass.subjects.map((sub) => (
                      <div
                        key={sub.subject}
                        style={{
                          padding: "12px",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius)",
                          background: "var(--color-bg-subtle)",
                        }}
                      >
                        <div style={{ fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>{sub.subject}</div>
                        <div style={{ fontSize: "20px", fontWeight: 700, color: getScoreColor(sub.averagePct), marginBottom: "6px" }}>
                          {sub.averagePct}%
                        </div>
                        <div
                          style={{
                            height: "6px",
                            background: "rgba(255,255,255,0.06)",
                            borderRadius: "999px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${sub.averagePct}%`,
                              height: "100%",
                              background: getScoreColor(sub.averagePct),
                            }}
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", gridColumn: "1 / -1" }}>
                      No subject evaluations available for this class yet.
                    </div>
                  )}
                </div>
              </div>

              {/* Class Student Rankings & DMC Action Table */}
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
                  <div>
                    <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Student Merit &amp; Performance Roster</h3>
                    <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                      Ranked by examination aggregate for {currentClass.className}
                    </p>
                  </div>
                </div>

                <div className="datatable-wrapper">
                  <div className="datatable-scroll">
                    <table>
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Roll Number</th>
                          <th>Student Name</th>
                          <th>Marks Aggregate</th>
                          <th>Percentage</th>
                          <th>Grade</th>
                          <th>Status</th>
                          <th>Official DMC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentClass.rankings.length > 0 ? (
                          currentClass.rankings.map((st, idx) => (
                            <tr key={st.studentId}>
                              <td>
                                <strong style={{ color: idx === 0 ? "var(--color-primary)" : "inherit" }}>
                                  #{idx + 1}
                                </strong>
                              </td>
                              <td><code>{st.rollNo}</code></td>
                              <td><strong>{st.name}</strong></td>
                              <td>{st.obtainedMarks} / {st.totalMarks}</td>
                              <td>
                                <span style={{ fontWeight: 700, color: getScoreColor(st.percentage) }}>
                                  {st.percentage}%
                                </span>
                              </td>
                              <td>
                                <Badge variant={st.percentage >= 70 ? "active" : "neutral"}>
                                  {st.grade}
                                </Badge>
                              </td>
                              <td>
                                <Badge variant={st.passed ? "active" : "inactive"}>
                                  {st.passed ? "PASSED" : "FAILED"}
                                </Badge>
                              </td>
                              <td>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleOpenReportCard(st.studentId)}
                                  title="View official report card with marks breakdown"
                                >
                                  View DMC &rarr;
                                </Button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={8} style={{ textAlign: "center", padding: "16px", color: "var(--color-text-muted)" }}>
                              No enrolled students found in this class.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. STUDENT PERFORMANCE - INDIVIDUAL STUDENT */}
      {/* ========================================================================= */}
      {mainTab === "students" && studentScope === "individual" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          {/* Student Selector */}
          <div
            className="panel-card"
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              padding: "var(--space-12) var(--space-16)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>Select Student:</span>
              <div style={{ minWidth: "260px" }}>
                <Select
                  value={selectedStudentId.toString()}
                  onChange={(e) => setSelectedStudentId(parseInt(e.target.value, 10))}
                  options={data.individualStudents.map((s) => ({
                    value: s.studentId.toString(),
                    label: `${s.name} (${s.rollNo} • ${s.className})`,
                  }))}
                />
              </div>
            </div>

            {currentStudent && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenReportCard(currentStudent.studentId)}
              >
                Launch Formal Report Card / DMC
              </Button>
            )}
          </div>

          {currentStudent && (
            <>
              {/* Student KPI Card */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Student Name</div>
                  <div className="stat-value" style={{ fontSize: "20px" }}>{currentStudent.name}</div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    {currentStudent.rollNo} &bull; {currentStudent.className}
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Aggregate Percentage</div>
                  <div className="stat-value" style={{ color: getScoreColor(currentStudent.percentage) }}>
                    {currentStudent.percentage}%
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Obtained {currentStudent.obtainedMarks} of {currentStudent.totalMarks} Marks
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Overall Grade</div>
                  <div className="stat-value" style={{ color: getScoreColor(currentStudent.percentage) }}>
                    {currentStudent.grade}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Standard BISE grading scale
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-label">Academic Status</div>
                  <div className="stat-value" style={{ color: currentStudent.passed ? "#16a34a" : "#dc2626" }}>
                    {currentStudent.passed ? "PASSED" : "FAILED"}
                  </div>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                    Mid-Term Examination 2026-2027
                  </div>
                </div>
              </div>

              {/* Subject Breakdown Graph */}
              <div className="panel-card">
                <div style={{ marginBottom: "var(--space-16)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
                  <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Subject Marks Distribution Graph</h3>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                    Individual performance across each enrolled curriculum discipline
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {currentStudent.subjects.map((sub) => (
                    <div key={sub.subject}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-size-xs)", marginBottom: "4px" }}>
                        <div>
                          <strong style={{ marginRight: "8px" }}>{sub.subject}</strong>
                          <span style={{ color: "var(--color-text-muted)" }}>({sub.remarks})</span>
                        </div>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                          <span>{sub.obtained} / {sub.total}</span>
                          <strong style={{ color: getScoreColor(sub.percentage) }}>{sub.percentage}%</strong>
                          <Badge variant={sub.percentage >= 70 ? "active" : "neutral"}>{sub.grade}</Badge>
                        </div>
                      </div>
                      <div
                        style={{
                          height: "10px",
                          background: "var(--color-bg-subtle)",
                          borderRadius: "999px",
                          overflow: "hidden",
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        <div
                          style={{
                            width: `${sub.percentage}%`,
                            height: "100%",
                            background: getScoreColor(sub.percentage),
                            transition: "width 0.4s ease-in-out",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TEACHER PERFORMANCE & TEACHING ANALYTICS */}
      {/* ========================================================================= */}
      {mainTab === "teachers" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-16)" }}>
          {/* Teacher Summary KPIs */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-label">Total Teaching Faculty</div>
              <div className="stat-value">{data.teachers.length}</div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Active faculty roster
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Average Faculty Attendance</div>
              <div className="stat-value" style={{ color: "#16a34a" }}>
                {Math.round(
                  data.teachers.reduce((sum, t) => sum + t.attendanceRate, 0) / (data.teachers.length || 1)
                )}%
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Daily biometric check-in record
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Student Score Index</div>
              <div className="stat-value" style={{ color: "var(--color-primary)" }}>
                {Math.round(
                  data.teachers.reduce((sum, t) => sum + t.studentAverageScore, 0) / (data.teachers.length || 1)
                )}%
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                Average marks in faculty classes
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-label">Faculty Punctuality</div>
              <div className="stat-value" style={{ color: "#16a34a" }}>
                98%
              </div>
              <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "4px" }}>
                On-time morning check-ins
              </div>
            </div>
          </div>

          {/* Teacher Attendance & Student Performance Comparison Graph */}
          <div className="panel-card">
            <div style={{ marginBottom: "var(--space-16)", paddingBottom: "var(--space-8)", borderBottom: "1px solid var(--color-border)" }}>
              <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Faculty Attendance &amp; Punctuality Benchmarks</h3>
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                Punctual attendance records across teaching faculty members
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {data.teachers.map((tch) => (
                <div key={tch.teacherId}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "var(--font-size-xs)", marginBottom: "4px" }}>
                    <div>
                      <strong>{tch.name}</strong> &bull;{" "}
                      <span style={{ color: "var(--color-text-muted)" }}>{tch.designation} ({tch.employeeId})</span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span>Att: <strong style={{ color: "#16a34a" }}>{tch.attendanceRate}%</strong></span>
                      <span>Class Avg: <strong style={{ color: getScoreColor(tch.studentAverageScore) }}>{tch.studentAverageScore}%</strong></span>
                      <Badge variant="active">{tch.rating}</Badge>
                    </div>
                  </div>
                  <div
                    style={{
                      height: "8px",
                      background: "var(--color-bg-subtle)",
                      borderRadius: "999px",
                      overflow: "hidden",
                      border: "1px solid var(--color-border)",
                    }}
                  >
                    <div
                      style={{
                        width: `${tch.attendanceRate}%`,
                        height: "100%",
                        background: "#16a34a",
                        transition: "width 0.4s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Performance Roster Table */}
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
              <div>
                <h3 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Faculty Teaching Effectiveness &amp; Workload Roster</h3>
                <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
                  Combined assessment based on attendance, teaching load, and student outcome averages
                </p>
              </div>
            </div>

            <div className="datatable-wrapper">
              <div className="datatable-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Faculty Member</th>
                      <th>Designation</th>
                      <th>Assigned Subjects</th>
                      <th>Attendance Rate</th>
                      <th>Student Avg Score</th>
                      <th>Approved Leaves</th>
                      <th>Performance Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.teachers.map((tch) => (
                      <tr key={tch.teacherId}>
                        <td><code>{tch.employeeId}</code></td>
                        <td><strong>{tch.name}</strong></td>
                        <td>{tch.designation}</td>
                        <td>{tch.assignedSubjects.join(", ") || "General"}</td>
                        <td>
                          <span style={{ fontWeight: 700, color: "#16a34a" }}>
                            {tch.attendanceRate}%
                          </span>
                        </td>
                        <td>
                          <span style={{ fontWeight: 700, color: getScoreColor(tch.studentAverageScore) }}>
                            {tch.studentAverageScore}%
                          </span>
                        </td>
                        <td>{tch.approvedLeavesCount} days</td>
                        <td>
                          <Badge variant="active">
                            {tch.rating}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Card Modal */}
      <ReportCardModal
        isOpen={Boolean(reportCardTarget)}
        onClose={() => setReportCardTarget(null)}
        report={reportCardTarget}
      />
    </div>
  );
};

export default PerformanceAnalyticsView;
