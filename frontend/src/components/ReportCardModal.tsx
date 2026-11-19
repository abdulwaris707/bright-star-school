import React from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { SCHOOL_NAME } from "../config";

export interface ReportCardData {
  student: {
    fullName: string;
    rollNo: string;
    className: string;
    section: string;
    parentName: string;
    bFormNo?: string;
  };
  examType: string;
  academicSession: string;
  marks: Array<{
    subject: string;
    totalMarks: number;
    obtainedMarks: number;
    grade: string;
    remarks?: string;
  }>;
  totalMarks: number;
  obtainedMarks: number;
  percentage: number;
  grade: string;
  resultStatus: "PASS" | "FAIL";
  position: string;
  attendancePercentage: number;
  teacherRemarks: string;
  principalSignature: string;
}

interface ReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportCardData | null;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  if (!report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detailed Marks Certificate (Report Card)"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} className="no-print">
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="no-print">
            Print DMC / Report Card
          </Button>
        </div>
      }
    >
      <div className="printable-area">
        <div className="dmc-container">
          <div className="dmc-header">
            <div className="dmc-school-name">{SCHOOL_NAME}</div>
            <div className="dmc-title">Detailed Marks Certificate &bull; {report.examType}</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Academic Session: {report.academicSession} &bull; Reg. No: BSS-EDU-{report.student.rollNo}
            </div>
          </div>

          <div className="dmc-meta-grid">
            <div><strong>Student Name:</strong> {report.student.fullName}</div>
            <div><strong>Roll Number:</strong> {report.student.rollNo}</div>
            <div><strong>Father / Guardian:</strong> {report.student.parentName}</div>
            <div><strong>Class & Section:</strong> {report.student.className}</div>
            <div><strong>B-Form / CNIC:</strong> {report.student.bFormNo || "35202-8819201-1"}</div>
            <div><strong>Attendance Record:</strong> {report.attendancePercentage}%</div>
          </div>

          <table className="dmc-table">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Subject</th>
                <th>Total Marks</th>
                <th>Passing Marks</th>
                <th>Obtained Marks</th>
                <th>Grade</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {report.marks.map((m, idx) => {
                const pass = Math.round(m.totalMarks * 0.33);
                const isPassed = m.obtainedMarks >= pass;
                return (
                  <tr key={idx}>
                    <td style={{ textAlign: "left", fontWeight: 600 }}>{m.subject}</td>
                    <td>{m.totalMarks}</td>
                    <td>{pass}</td>
                    <td style={{ fontWeight: 700, color: isPassed ? "inherit" : "var(--color-danger)" }}>
                      {m.obtainedMarks}
                    </td>
                    <td>{m.grade}</td>
                    <td style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                      {m.remarks || (isPassed ? "Satisfactory" : "Needs Improvement")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="dmc-summary-box">
            <div className="dmc-summary-item">
              <span className="dmc-summary-label">Total Marks</span>
              <span className="dmc-summary-val">{report.obtainedMarks} / {report.totalMarks}</span>
            </div>
            <div className="dmc-summary-item">
              <span className="dmc-summary-label">Percentage</span>
              <span className="dmc-summary-val">{report.percentage}%</span>
            </div>
            <div className="dmc-summary-item">
              <span className="dmc-summary-label">Overall Grade</span>
              <span className="dmc-summary-val">{report.grade}</span>
            </div>
            <div className="dmc-summary-item">
              <span className="dmc-summary-label">Result Status</span>
              <span
                className="dmc-summary-val"
                style={{ color: report.resultStatus === "PASS" ? "var(--color-success)" : "var(--color-danger)" }}
              >
                {report.resultStatus}
              </span>
            </div>
          </div>

          <div
            style={{
              padding: "var(--space-8) var(--space-12)",
              backgroundColor: "var(--color-bg-subtle)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius)",
              fontSize: "var(--font-size-xs)",
              marginBottom: "var(--space-20)",
            }}
          >
            <strong>Class Teacher Remarks:</strong> {report.teacherRemarks}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              paddingTop: "var(--space-20)",
              borderTop: "1px solid var(--color-border)",
              fontSize: "11px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid var(--color-border)", width: "140px", marginBottom: "4px" }} />
              <div>Class Teacher</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid var(--color-border)", width: "140px", marginBottom: "4px" }} />
              <div>Controller of Examinations</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontWeight: 700, marginBottom: "4px" }}>{report.principalSignature}</div>
              <div style={{ borderBottom: "1px solid var(--color-border)", width: "140px", marginBottom: "4px" }} />
              <div>Principal (Bright Star)</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ReportCardModal;
