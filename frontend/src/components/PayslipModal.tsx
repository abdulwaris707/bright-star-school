import React from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { SCHOOL_NAME } from "../config";

export interface TeacherSalaryData {
  id: number;
  teacherId: number;
  teacherName: string;
  employeeId: string;
  designation: string;
  month: string;
  year: number;
  basicSalary: number;
  medicalAllowance: number;
  houseRentAllowance: number;
  transportAllowance: number;
  bonus: number;
  taxDeduction: number;
  absenceDeduction: number;
  providentFund: number;
  grossSalary: number;
  totalDeductions: number;
  netSalary: number;
  paidAmount?: number;
  remainingSalary?: number;
  advanceAmount?: number;
  advanceDate?: string;
  status: "paid" | "pending" | "processing" | "advance";
  paymentDate?: string;
  paymentMethod?: string;
  transactionRef?: string;
  remarks?: string;
  createdAt?: string;
}

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  salary: TeacherSalaryData | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ isOpen, onClose, salary }) => {
  if (!salary) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Faculty Payslip • ${salary.month} ${salary.year} • ${salary.teacherName}`}
      maxWidth="760px"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} className="no-print">
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="no-print">
            Print Official Salary Slip
          </Button>
        </div>
      }
    >
      <div className="printable-area" style={{ padding: "8px" }}>
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-lg)",
            padding: "24px",
            backgroundColor: "var(--color-bg-card)",
          }}
        >
          {/* Header */}
          <div style={{ textAlign: "center", borderBottom: "2px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px" }}>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 800, letterSpacing: "0.5px" }}>{SCHOOL_NAME}</h2>
            <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
              Main Boulevard, Model Town, Lahore &bull; Accounts &amp; Payroll Department
            </div>
            <div
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "3px 12px",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-full)",
                fontSize: "12px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Faculty Monthly Salary Slip &bull; {salary.month} {salary.year}
            </div>
          </div>

          {/* Teacher Info Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              padding: "12px 16px",
              backgroundColor: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              marginBottom: "20px",
              fontSize: "12px",
            }}
          >
            <div>
              <div><span style={{ color: "var(--color-text-muted)" }}>Faculty Name:</span> <strong>{salary.teacherName}</strong></div>
              <div style={{ marginTop: "4px" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Employee ID:</span>{" "}
                <strong style={{ fontFamily: "monospace" }}>{salary.employeeId}</strong>
              </div>
            </div>
            <div>
              <div><span style={{ color: "var(--color-text-muted)" }}>Designation:</span> <strong>{salary.designation}</strong></div>
              <div style={{ marginTop: "4px" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Disbursement Status:</span>{" "}
                <Badge variant={salary.status === "paid" ? "active" : salary.status === "processing" ? "neutral" : "inactive"}>
                  {salary.status.toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Tables */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            {/* Earnings */}
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", marginBottom: "8px" }}>
                Earnings &amp; Allowances (PKR)
              </div>
              <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 0" }}>Basic Pay</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>Rs. {salary.basicSalary.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>Medical Allowance</td>
                    <td style={{ textAlign: "right" }}>Rs. {salary.medicalAllowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>House Rent Allowance</td>
                    <td style={{ textAlign: "right" }}>Rs. {salary.houseRentAllowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>Conveyance / Transport</td>
                    <td style={{ textAlign: "right" }}>Rs. {salary.transportAllowance.toLocaleString()}</td>
                  </tr>
                  {salary.bonus > 0 && (
                    <tr style={{ color: "#16a34a" }}>
                      <td style={{ padding: "4px 0" }}>Special Duty Bonus</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>+Rs. {salary.bonus.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: "1px solid var(--color-border)", fontWeight: 700 }}>
                    <td style={{ padding: "8px 0" }}>Gross Salary</td>
                    <td style={{ textAlign: "right", padding: "8px 0" }}>Rs. {salary.grossSalary.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Deductions */}
            <div>
              <div style={{ fontSize: "13px", fontWeight: 700, borderBottom: "1px solid var(--color-border)", paddingBottom: "6px", marginBottom: "8px" }}>
                Deductions &amp; Withholdings (PKR)
              </div>
              <table style={{ width: "100%", fontSize: "12px", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={{ padding: "4px 0" }}>Income Tax Withholding</td>
                    <td style={{ textAlign: "right" }}>Rs. {salary.taxDeduction.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "4px 0" }}>Provident Fund Contribution</td>
                    <td style={{ textAlign: "right" }}>Rs. {salary.providentFund.toLocaleString()}</td>
                  </tr>
                  {salary.absenceDeduction > 0 ? (
                    <tr style={{ color: "var(--color-danger)" }}>
                      <td style={{ padding: "4px 0" }}>Absence Penalty Deduction</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>-Rs. {salary.absenceDeduction.toLocaleString()}</td>
                    </tr>
                  ) : (
                    <tr>
                      <td style={{ padding: "4px 0" }}>Absence Deduction</td>
                      <td style={{ textAlign: "right" }}>Rs. 0</td>
                    </tr>
                  )}
                  <tr style={{ borderTop: "1px solid var(--color-border)", fontWeight: 700, color: "var(--color-danger)" }}>
                    <td style={{ padding: "8px 0" }}>Total Deductions</td>
                    <td style={{ textAlign: "right", padding: "8px 0" }}>-Rs. {salary.totalDeductions.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div
            style={{
              padding: "16px 20px",
              backgroundColor: salary.status === "paid" ? "rgba(22, 163, 74, 0.08)" : "var(--color-bg-subtle)",
              border: `2px solid ${salary.status === "paid" ? "#16a34a" : "var(--color-border)"}`,
              borderRadius: "var(--radius-md)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)" }}>
                Net Take-Home Salary
              </div>
              <div style={{ fontSize: "24px", fontWeight: 800, color: salary.status === "paid" ? "#16a34a" : "var(--color-text)" }}>
                PKR {salary.netSalary.toLocaleString()}
              </div>
              {salary.advanceAmount ? (
                <div style={{ fontSize: "11px", color: "#d97706", marginTop: "4px" }}>
                  Advance Received: Rs. {salary.advanceAmount.toLocaleString()} ({salary.advanceDate || "Recorded"}) &bull; Remaining: Rs. {(salary.remainingSalary ?? (salary.netSalary - salary.advanceAmount)).toLocaleString()}
                </div>
              ) : null}
            </div>
            {salary.status === "paid" ? (
              <div style={{ textAlign: "right", fontSize: "11px" }}>
                <div style={{ fontWeight: 700, color: "#16a34a" }}>PAID IN FULL &bull; {salary.paymentMethod || "Bank Transfer"}</div>
                <div style={{ color: "var(--color-text-muted)" }}>Date: {salary.paymentDate || "Verified"}</div>
                {salary.transactionRef && (
                  <div style={{ fontFamily: "monospace", fontWeight: 600 }}>Ref: {salary.transactionRef}</div>
                )}
              </div>
            ) : salary.status === "advance" ? (
              <div style={{ textAlign: "right", fontSize: "11px" }}>
                <div style={{ fontWeight: 700, color: "#d97706" }}>ADVANCE DISBURSED</div>
                <div style={{ color: "var(--color-text-muted)" }}>Paid: Rs. {(salary.paidAmount || salary.advanceAmount || 0).toLocaleString()}</div>
                <div style={{ color: "var(--color-danger)", fontWeight: 600 }}>Pending: Rs. {(salary.remainingSalary ?? 0).toLocaleString()}</div>
              </div>
            ) : null}
          </div>

          {/* Signatures */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "20px",
              paddingTop: "24px",
              borderTop: "1px solid var(--color-border)",
              textAlign: "center",
              fontSize: "11px",
              color: "var(--color-text-muted)",
            }}
          >
            <div>
              <div style={{ height: "40px" }}></div>
              <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "4px" }}>
                Accountant / Cashier
              </div>
            </div>
            <div>
              <div style={{ height: "40px" }}></div>
              <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "4px" }}>
                Principal / Director
              </div>
            </div>
            <div>
              <div style={{ height: "40px" }}></div>
              <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "4px" }}>
                Employee Signature
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PayslipModal;
