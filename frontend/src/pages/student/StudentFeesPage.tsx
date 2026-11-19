import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Modal from "../../components/ui/Modal";
import ChallanModal, { FeeChallanData } from "../../components/ChallanModal";
import api, { getSavedUser } from "../../lib/api";

interface FeeItem {
  id: number;
  challanNo: string;
  studentName?: string;
  rollNo?: string;
  className?: string;
  month: string;
  year: number;
  amount: number;
  tuitionFee?: number;
  examFee?: number;
  labCharges?: number;
  lateFeeSurcharge?: number;
  dueDate: string;
  status: "paid" | "pending" | "overdue" | "verification_pending";
  paidDate?: string;
  paymentMethod?: string;
  transactionRef?: string;
  proofScreenshotUrl?: string;
  paymentRemarks?: string;
  rejectionReason?: string;
  concessionApplied?: string;
}

export const StudentFeesPage: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [proofTarget, setProofTarget] = useState<FeeItem | null>(null);
  const [printTarget, setPrintTarget] = useState<FeeChallanData | null>(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submittingProof, setSubmittingProof] = useState(false);

  // Payment Proof Form States
  const [paymentChannel, setPaymentChannel] = useState("JazzCash");
  const [transactionRef, setTransactionRef] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");
  const [proofScreenshot, setProofScreenshot] = useState<string>("");

  const currentUser = getSavedUser();
  const studentId = currentUser?.role === "student" && currentUser?.id ? currentUser.id : 1;

  const loadFees = async () => {
    try {
      setLoading(true);
      const data = await api.get<FeeItem[]>("/fees", {
        params: { studentId },
      });
      setFees(data);
    } catch (err) {
      console.error("Failed to load fees", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFees();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProofScreenshot(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleReceipt = () => {
    if (!proofTarget) return;
    const sampleTid = `${paymentChannel.substring(0, 2).toUpperCase()}-${Math.floor(10000000 + Math.random() * 90000000)}`;
    setTransactionRef(sampleTid);
    const sampleSvg = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='260' viewBox='0 0 400 260'><rect width='400' height='260' rx='12' fill='%231e293b'/><rect x='20' y='20' width='360' height='50' rx='8' fill='%23e11d48'/><text x='200' y='52' fill='white' font-family='sans-serif' font-size='18' font-weight='bold' text-anchor='middle'>${paymentChannel} Payment Receipt</text><text x='30' y='105' fill='%2394a3b8' font-family='sans-serif' font-size='13'>To: Bright Star Grammar School</text><text x='30' y='135' fill='%2394a3b8' font-family='sans-serif' font-size='13'>Challan: %23${proofTarget.challanNo}</text><text x='30' y='165' fill='%2394a3b8' font-family='sans-serif' font-size='13'>Amount: PKR ${proofTarget.amount.toLocaleString()}</text><text x='30' y='195' fill='%2394a3b8' font-family='sans-serif' font-size='13'>TID: ${sampleTid}</text><text x='200' y='235' fill='%2322c55e' font-family='sans-serif' font-size='14' font-weight='bold' text-anchor='middle'>TRANSACTION SUCCESSFUL</text></svg>`;
    setProofScreenshot(sampleSvg);
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proofTarget) return;

    if (!transactionRef.trim()) {
      setErrorMessage("Please enter the transaction reference / deposit slip number.");
      return;
    }

    try {
      setSubmittingProof(true);
      setErrorMessage("");

      const finalScreenshot =
        proofScreenshot ||
        `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' rx='12' fill='%230f172a'/><text x='200' y='50' fill='%2338bdf8' font-family='sans-serif' font-size='16' font-weight='bold' text-anchor='middle'>Electronic Deposit Voucher</text><text x='40' y='95' fill='%23cbd5e1' font-family='sans-serif' font-size='13'>Challan: ${proofTarget.challanNo}</text><text x='40' y='125' fill='%23cbd5e1' font-family='sans-serif' font-size='13'>Paid: PKR ${proofTarget.amount.toLocaleString()}</text><text x='40' y='155' fill='%23cbd5e1' font-family='sans-serif' font-size='13'>Ref: ${transactionRef}</text></svg>`;

      await api.post(`/fees/${proofTarget.id}/submit-proof`, {
        paymentMethod: paymentChannel,
        transactionRef: transactionRef.trim(),
        proofScreenshotUrl: finalScreenshot,
        paymentRemarks: paymentRemarks || `Submitted via ${paymentChannel} by student/parent`,
      });

      setSuccessMessage(
        `Payment proof for Challan #${proofTarget.challanNo} submitted successfully. School accounts office will verify and issue the official paid receipt.`
      );
      setProofTarget(null);
      setTransactionRef("");
      setPaymentRemarks("");
      setProofScreenshot("");
      loadFees();
      setTimeout(() => setSuccessMessage(""), 6000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to submit payment proof.");
    } finally {
      setSubmittingProof(false);
    }
  };

  const pendingDues = fees
    .filter((f) => f.status === "pending" || f.status === "overdue")
    .reduce((sum, f) => sum + f.amount, 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tuition Fee Ledger &amp; Bank Vouchers</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Monthly tuition fee status, 3-copy printable bank challans, online payment proof submission, and verified paid receipts
          </p>
        </div>
      </div>

      {successMessage && (
        <div
          style={{
            padding: "var(--space-12) var(--space-16)",
            marginBottom: "var(--space-16)",
            backgroundColor: "rgba(22, 163, 74, 0.1)",
            border: "1px solid #16a34a",
            color: "#16a34a",
            fontSize: "var(--font-size-sm)",
            borderRadius: "var(--radius)",
            fontWeight: 500,
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="stat-card">
          <div className="stat-label">Pending Dues Balance (PKR)</div>
          <div
            className="stat-value"
            style={{ color: pendingDues > 0 ? "var(--color-danger)" : "#16a34a" }}
          >
            Rs. {pendingDues.toLocaleString()}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            {pendingDues > 0 ? "Payable before next monthly examination" : "All term dues cleared"}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Designated Collection Bank</div>
          <div className="stat-value" style={{ fontSize: "var(--font-size-md)" }}>
            Habib Bank Limited (HBL)
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            A/C: 0142-79014523-01 &bull; Model Town Branch
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Mobile Payment Wallets</div>
          <div className="stat-value" style={{ fontSize: "var(--font-size-md)" }}>
            JazzCash / EasyPaisa
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Merchant / Till Code: 0300-8765432
          </div>
        </div>
      </div>

      {/* Challan History Table */}
      <div className="panel-card" style={{ padding: 0 }}>
        <div style={{ padding: "var(--space-16) var(--space-20)", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
            Fee Invoices &amp; Payment History ({fees.length} records)
          </h3>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Student Roll: BS-2024-101
          </span>
        </div>

        <DataTable
          columns={[
            {
              key: "challanNo",
              header: "Challan #",
              render: (row: FeeItem) => (
                <div>
                  <code style={{ fontSize: "12px", fontWeight: 600 }}>{row.challanNo}</code>
                  {row.concessionApplied && (
                    <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: 600 }}>
                      {row.concessionApplied}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "month",
              header: "Billing Period",
              render: (row: FeeItem) => (
                <strong>
                  {row.month} {row.year}
                </strong>
              ),
            },
            {
              key: "amount",
              header: "Payable Amount",
              render: (row: FeeItem) => (
                <span style={{ fontWeight: 700 }}>Rs. {row.amount.toLocaleString()}</span>
              ),
            },
            { key: "dueDate", header: "Due Date" },
            {
              key: "status",
              header: "Status",
              render: (row: FeeItem) => {
                if (row.status === "paid") {
                  return <Badge variant="active">PAID &bull; VERIFIED</Badge>;
                }
                if (row.status === "verification_pending") {
                  return (
                    <Badge variant="neutral" style={{ borderColor: "#d97706", color: "#d97706" }}>
                      VERIFICATION PENDING
                    </Badge>
                  );
                }
                if (row.status === "overdue") {
                  return <Badge variant="inactive">OVERDUE</Badge>;
                }
                return <Badge variant="neutral">PENDING</Badge>;
              },
            },
            {
              key: "actions",
              header: "Voucher & Verification",
              render: (row: FeeItem) => (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  {/* Print Challan / Receipt Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setPrintTarget({
                        id: row.id,
                        challanNo: row.challanNo,
                        studentName: row.studentName || "Muhammad Hamza",
                        rollNo: row.rollNo || "BS-2024-101",
                        className: row.className || "Class 10 - Blue",
                        month: row.month,
                        year: row.year,
                        amount: row.amount,
                        tuitionFee: row.tuitionFee,
                        examFee: row.examFee,
                        labCharges: row.labCharges,
                        lateFeeSurcharge: row.lateFeeSurcharge,
                        dueDate: row.dueDate,
                        status: row.status,
                        paidDate: row.paidDate,
                        paymentMethod: row.paymentMethod,
                        transactionRef: row.transactionRef,
                        concessionApplied: row.concessionApplied,
                      })
                    }
                  >
                    {row.status === "paid" ? "View Paid Receipt" : "Print 3-Copy Challan"}
                  </Button>

                  {/* Payment Actions */}
                  {row.status === "pending" || row.status === "overdue" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setProofTarget(row);
                        setPaymentRemarks("");
                        setTransactionRef("");
                        setProofScreenshot("");
                        setErrorMessage("");
                      }}
                    >
                      Submit Payment Proof
                    </Button>
                  ) : row.status === "verification_pending" ? (
                    <span style={{ fontSize: "11px", color: "#d97706", fontWeight: 600 }}>
                      Proof Under Review (TID: {row.transactionRef})
                    </span>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>
                      Paid on {row.paidDate} ({row.paymentMethod})
                    </span>
                  )}
                </div>
              ),
            },
          ]}
          data={fees}
          pageSize={8}
          emptyMessage={loading ? "Loading fee history..." : "No fee invoices on record."}
        />
      </div>

      {/* Official 3-Copy Challan & Paid Receipt Modal */}
      <ChallanModal
        isOpen={Boolean(printTarget)}
        onClose={() => setPrintTarget(null)}
        challan={printTarget}
      />

      {/* Submit Payment Proof Modal */}
      <Modal
        isOpen={Boolean(proofTarget)}
        title={`Submit Payment Proof • Challan #${proofTarget?.challanNo || ""}`}
        onClose={() => setProofTarget(null)}
        maxWidth="620px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setProofTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitProof}
              disabled={submittingProof}
            >
              {submittingProof ? "Submitting..." : "Submit Proof for Admin Verification"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitProof} className="form-layout">
          {errorMessage && (
            <div
              style={{
                padding: "8px 12px",
                backgroundColor: "rgba(220, 38, 38, 0.1)",
                border: "1px solid #dc2626",
                color: "#dc2626",
                fontSize: "12px",
                borderRadius: "var(--radius-sm)",
              }}
            >
              {errorMessage}
            </div>
          )}

          {/* Challan summary */}
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "8px",
            }}
          >
            <div>
              <span style={{ color: "var(--color-text-muted)" }}>Billing Month:</span>{" "}
              <strong>{proofTarget?.month} {proofTarget?.year}</strong>
            </div>
            <div>
              <span style={{ color: "var(--color-text-muted)" }}>Due Amount:</span>{" "}
              <strong style={{ color: "var(--color-primary)", fontSize: "14px" }}>
                Rs. {proofTarget?.amount.toLocaleString()}
              </strong>
            </div>
          </div>

          <Select
            label="Payment Channel / Gateway Used"
            value={paymentChannel}
            onChange={(e) => setPaymentChannel(e.target.value)}
            options={[
              { value: "JazzCash", label: "JazzCash Mobile Account / Till Payment" },
              { value: "EasyPaisa", label: "EasyPaisa Mobile Account" },
              { value: "HBL Bank Transfer", label: "Habib Bank (HBL) Online Transfer" },
              { value: "Bank Deposit Slip", label: "Physical Bank Counter Deposit" },
              { value: "Cash at School Office", label: "School Cash Counter" },
            ]}
          />

          <Input
            label="Transaction ID (TID) / Deposit Slip Number"
            placeholder="e.g. JC-99881122 or HBL-DEP-00812"
            value={transactionRef}
            onChange={(e) => setTransactionRef(e.target.value)}
            required
          />

          {/* Payment Proof Screenshot Upload / Generator */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <label className="form-label" style={{ margin: 0 }}>
                Upload Payment Screenshot / Deposit Slip Image
              </label>
              <button
                type="button"
                onClick={handleUseSampleReceipt}
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
                + Generate Sample Receipt
              </button>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                backgroundColor: "var(--color-bg-subtle)",
              }}
            />
            {proofScreenshot && (
              <div style={{ marginTop: "10px", textAlign: "center" }}>
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginBottom: "4px" }}>
                  Attached Screenshot Preview:
                </div>
                <img
                  src={proofScreenshot}
                  alt="Proof Screenshot Preview"
                  style={{
                    maxHeight: "160px",
                    maxWidth: "100%",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--color-border)",
                  }}
                />
              </div>
            )}
          </div>

          <Input
            label="Parent / Payer Note (Optional)"
            placeholder="e.g. Paid via father's JazzCash wallet 0321-7654321"
            value={paymentRemarks}
            onChange={(e) => setPaymentRemarks(e.target.value)}
          />

          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", margin: "4px 0 0 0" }}>
            Note: Once submitted, the administration will verify the transaction ID in the school bank statement and issue your official Paid Challan Receipt.
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default StudentFeesPage;
