import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import ReportCardModal, { ReportCardData } from "../../components/ReportCardModal";
import api, { getSavedUser } from "../../lib/api";

interface MarkItem {
  id: number;
  examType: string;
  subject: string;
  totalMarks: number;
  obtainedMarks: number;
  grade: string;
  remarks: string;
}

export const StudentResultsPage: React.FC = () => {
  const [marks, setMarks] = useState<MarkItem[]>([]);
  const [examType, setExamType] = useState("Mid-Term");
  const [loading, setLoading] = useState(true);
  const [reportCardData, setReportCardData] = useState<ReportCardData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const currentUser = getSavedUser();
  const studentId = currentUser?.role === "student" && currentUser?.id ? currentUser.id : 1;

  useEffect(() => {
    async function loadMarks() {
      try {
        setLoading(true);
        const data = await api.get<MarkItem[]>("/marks", {
          params: { studentId },
        });
        setMarks(data);
      } catch (err) {
        console.error("Failed to load marks", err);
      } finally {
        setLoading(false);
      }
    }
    loadMarks();
  }, [studentId]);

  const handleOpenReportCard = async () => {
    try {
      const data = await api.get<ReportCardData>(`/marks/report-card/${studentId}`, {
        params: { examType },
      });
      setReportCardData(data);
      setIsReportModalOpen(true);
    } catch (err: any) {
      alert(err.message || "Failed to load report card");
    }
  };

  const filtered = marks.filter((m) => m.examType === examType);
  const totalMax = filtered.reduce((sum, m) => sum + m.totalMarks, 0);
  const totalObt = filtered.reduce((sum, m) => sum + m.obtainedMarks, 0);
  const aggregatePct = totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Results &amp; Transcript</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Term examinations, subject-wise evaluation, and official Detailed Marks Certificate (DMC)
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleOpenReportCard}>
          Print Official DMC / Report Card
        </Button>
      </div>

      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
        }}
      >
        <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)" }}>
          Select Examination Session:
        </span>
        <div style={{ width: "220px" }}>
          <Select
            value={examType}
            onChange={(e) => setExamType(e.target.value)}
            options={[
              { value: "Mid-Term", label: "Mid-Term Examination" },
              { value: "Final Term", label: "Final Annual Examination" },
              { value: "First Term", label: "First Assessment Quiz" },
            ]}
          />
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Marks Obtained</div>
          <div className="stat-value">
            {totalObt} / {totalMax}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Mid-Term Assessment
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Percentage Aggregate</div>
          <div className="stat-value">{aggregatePct}%</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Passing criteria: 33%
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Final Letter Grade</div>
          <div className="stat-value" style={{ color: "var(--color-primary)" }}>
            {aggregatePct >= 80 ? "A+" : aggregatePct >= 70 ? "A" : "B"}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Status: Passed
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "subject",
              header: "Subject Title",
              render: (row) => <strong>{row.subject}</strong>,
            },
            { key: "totalMarks", header: "Total Marks" },
            {
              key: "obtainedMarks",
              header: "Marks Obtained",
              render: (row) => (
                <span style={{ fontWeight: 600 }}>{row.obtainedMarks}</span>
              ),
            },
            {
              key: "grade",
              header: "Grade",
              render: (row) => <Badge variant="active">{row.grade}</Badge>,
            },
            { key: "remarks", header: "Teacher Evaluation Remarks" },
          ]}
          data={filtered}
          pageSize={10}
          emptyMessage={loading ? "Loading marks..." : "No marks entered for this exam."}
        />
      </div>

      {/* Official DMC Modal */}
      <ReportCardModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        report={reportCardData}
      />
    </div>
  );
};

export default StudentResultsPage;
