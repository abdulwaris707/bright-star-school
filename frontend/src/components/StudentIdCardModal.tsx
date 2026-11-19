import React from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import { SCHOOL_NAME } from "../config";

export interface StudentIdCardData {
  id: number;
  rollNo: string;
  fullName: string;
  className: string;
  section: string;
  parentName: string;
  phone: string;
  bFormNo?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

interface StudentIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentIdCardData | null;
}

export const StudentIdCardModal: React.FC<StudentIdCardModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  if (!student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Student Identity Card"
      footer={
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          <Button variant="secondary" onClick={onClose} className="no-print">
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} className="no-print">
            Print ID Card
          </Button>
        </div>
      }
    >
      <div className="printable-area">
        <div className="id-card-wrap">
          <div style={{ textAlign: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "var(--space-8)", marginBottom: "var(--space-12)" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
              <div
                style={{
                  width: "22px",
                  height: "22px",
                  backgroundColor: "var(--color-primary)",
                  color: "#fff",
                  fontSize: "11px",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "2px",
                }}
              >
                BS
              </div>
              <span style={{ fontWeight: 800, fontSize: "var(--font-size-sm)", color: "var(--color-text)" }}>
                {SCHOOL_NAME}
              </span>
            </div>
            <div style={{ fontSize: "10px", color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: "1px" }}>
              Student Identity Card &bull; 2026-27
            </div>
          </div>

          <div style={{ display: "flex", gap: "var(--space-12)", marginBottom: "var(--space-12)" }}>
            <div
              style={{
                width: "80px",
                height: "96px",
                border: "1px solid var(--color-border)",
                backgroundColor: "var(--color-bg-subtle)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                color: "var(--color-text-muted)",
                flexShrink: 0,
              }}
            >
              <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--color-text)" }}>
                {(student.fullName.substring(0, 2) || "ST").toUpperCase()}
              </div>
              PHOTO
            </div>

            <div style={{ fontSize: "11px", flex: 1, display: "flex", flexDirection: "column", gap: "3px" }}>
              <div><strong>Name:</strong> {student.fullName}</div>
              <div><strong>Roll No:</strong> {student.rollNo}</div>
              <div><strong>Class:</strong> {student.className}</div>
              <div><strong>Guardian:</strong> {student.parentName}</div>
              <div><strong>Blood Group:</strong> {student.bloodGroup || "O+"}</div>
              <div><strong>Contact:</strong> {student.phone}</div>
            </div>
          </div>

          <div
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "var(--space-8)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "10px",
              color: "var(--color-text-muted)",
            }}
          >
            <div>Barcode: *{student.rollNo}*</div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600 }}>Principal</div>
              <div>Bright Star School</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default StudentIdCardModal;
