import React from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { SCHOOL_NAME } from "../config";

export interface FeeChallanData {
  id: number;
  challanNo: string;
  studentName: string;
  rollNo: string;
  className: string;
  month: string;
  year?: number;
  amount: number;
  tuitionFee?: number;
  examFee?: number;
  labCharges?: number;
  lateFeeSurcharge?: number;
  dueDate: string;
  status: string;
  paidDate?: string;
  paymentMethod?: string;
  transactionRef?: string;
  verifiedByAdminName?: string;
  concessionApplied?: string;
}

interface ChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  challan: FeeChallanData | null;
}

export const ChallanModal: React.FC<ChallanModalProps> = ({
  isOpen,
  onClose,
  challan,
}) => {
  if (!challan) return null;

  const tuition = challan.tuitionFee || Math.round(challan.amount * 0.85);
  const exam = challan.examFee || Math.round(challan.amount * 0.1);
  const lab = challan.labCharges || Math.round(challan.amount * 0.05);
  const lateFee = challan.lateFeeSurcharge || 300;

  const handlePrint = () => {
    window.print();
  };

  const renderCopy = (copyType: "BANK COPY" | "SCHOOL COPY" | "STUDENT COPY") => (
    <div className="challan-copy">
      <div>
        <div className="challan-copy-header">
          <div className="challan-copy-title">{SCHOOL_NAME}</div>
          <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
            Habib Bank Limited &bull; A/C: 0142-79014523-01
          </div>
          <div className="challan-copy-badge">{copyType}</div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
          <span><strong>Challan:</strong> {challan.challanNo}</span>
          <span><strong>Date:</strong> 2026-11-17</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <span><strong>Due Date:</strong> {challan.dueDate}</span>
          <span><strong>Month:</strong> {challan.month}</span>
        </div>

        <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "4px", marginBottom: "6px" }}>
          <div><strong>Student:</strong> {challan.studentName}</div>
          <div><strong>Roll No:</strong> {challan.rollNo}</div>
          <div><strong>Class:</strong> {challan.className}</div>
          {challan.concessionApplied && (
            <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: 600 }}>
              Discount: {challan.concessionApplied}
            </div>
          )}
        </div>

        {challan.status === "paid" && (
          <div
            style={{
              margin: "6px 0",
              padding: "4px 8px",
              border: "2px dashed #16a34a",
              borderRadius: "var(--radius-sm)",
              backgroundColor: "rgba(22, 163, 74, 0.08)",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#16a34a", letterSpacing: "1px" }}>
              PAID &bull; VERIFIED RECEIPT
            </div>
            <div style={{ fontSize: "9px", color: "var(--color-text-muted)" }}>
              Paid Date: {challan.paidDate || "Verified"} &bull; {challan.paymentMethod || "Bank"}
            </div>
            {challan.transactionRef && (
              <div style={{ fontSize: "9px", fontFamily: "monospace", fontWeight: 700 }}>
                TID: {challan.transactionRef}
              </div>
            )}
          </div>
        )}

        <table className="challan-table">
          <tbody>
            <tr>
              <td>Tuition Fee</td>
              <td>Rs. {tuition.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Examination Fund</td>
              <td>Rs. {exam.toLocaleString()}</td>
            </tr>
            <tr>
              <td>Science / Computer Lab</td>
              <td>Rs. {lab.toLocaleString()}</td>
            </tr>
            <tr style={{ borderTop: "1px solid var(--color-border)", fontWeight: 700 }}>
              <td>Payable by Due Date</td>
              <td>Rs. {challan.amount.toLocaleString()}</td>
            </tr>
            <tr style={{ color: "var(--color-danger)" }}>
              <td>Payable After Due Date (+Rs.{lateFee})</td>
              <td>Rs. {(challan.amount + lateFee).toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="challan-signatures">
        <div>Cashier / Bank Stamp</div>
        <div>Authorized Officer</div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Official Fee Challan Voucher • ${challan.challanNo}`}
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} className="no-print">
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="no-print">
            Print 3-Copy Challan
          </Button>
        </div>
      }
    >
      <div className="printable-area">
        <div
          style={{
            marginBottom: "var(--space-12)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
          className="no-print"
        >
          Standard Pakistani 3-copy bank voucher format. Click <strong>Print</strong> or press Ctrl+P.
        </div>

        <div className="challan-container">
          {renderCopy("BANK COPY")}
          {renderCopy("SCHOOL COPY")}
          {renderCopy("STUDENT COPY")}
        </div>
      </div>
    </Modal>
  );
};

export default ChallanModal;
