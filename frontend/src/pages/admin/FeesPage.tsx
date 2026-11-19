import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import ChallanModal, { FeeChallanData } from "../../components/ChallanModal";
import SmsBroadcastModal from "../../components/SmsBroadcastModal";
import api from "../../lib/api";

interface FeeItem {
  id: number;
  studentId: number;
  studentName: string;
  rollNo: string;
  className: string;
  challanNo: string;
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
  proofSubmittedAt?: string;
  paymentRemarks?: string;
  verifiedByAdminName?: string;
  rejectionReason?: string;
  concessionApplied?: string;
}

interface ClassItem {
  id: number;
  name: string;
  section: string;
}

// Utility to generate RFC-4180 compliant CSV file download with UTF-8 BOM
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

export const FeesPage: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [classesList, setClassesList] = useState<ClassItem[]>([]);
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [studentFilter, setStudentFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"all" | "proofs" | "defaulters">("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [printChallanTarget, setPrintChallanTarget] = useState<FeeChallanData | null>(null);
  const [reviewProofTarget, setReviewProofTarget] = useState<FeeItem | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [payTarget, setPayTarget] = useState<FeeItem | null>(null);
  const [manualPayMethod, setManualPayMethod] = useState("Cash Counter");
  const [manualTrxRef, setManualTrxRef] = useState("");

  // Bulk Class Challan Form
  const [bulkData, setBulkData] = useState({
    classId: "1",
    month: "December",
    year: 2026,
    dueDate: "2026-12-10",
    tuitionFee: 5500,
    examFee: 500,
    labCharges: 500,
    lateFeeSurcharge: 500,
  });

  // Single Challan Form
  const [singleData, setSingleData] = useState({
    studentId: 1,
    studentName: "",
    rollNo: "",
    className: "Class 10 - Blue",
    month: "November",
    year: 2026,
    tuitionFee: 5500,
    examFee: 500,
    labCharges: 500,
    amount: 6500,
    dueDate: "2026-11-20",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [stdData, clsData, feesData] = await Promise.all([
        api.get<any[]>("/students"),
        api.get<ClassItem[]>("/classes"),
        api.get<FeeItem[]>("/fees"),
      ]);
      setStudentsList(stdData);
      setClassesList(clsData);
      setFees(feesData);
    } catch (err: any) {
      console.error("Error loading fees", err);
      showFeedback(err.message || "Failed to load fee records", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Bulk Generation for selected Class
  const handleGenerateBulkClassChallans = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post<{ generatedCount: number; fees: FeeItem[] }>("/fees/generate-bulk", {
        classId: bulkData.classId === "all" ? "all" : parseInt(bulkData.classId, 10),
        month: bulkData.month,
        year: bulkData.year,
        dueDate: bulkData.dueDate,
        tuitionFee: bulkData.tuitionFee,
        examFee: bulkData.examFee,
        labCharges: bulkData.labCharges,
        lateFeeSurcharge: bulkData.lateFeeSurcharge,
      });

      setIsBulkModalOpen(false);
      showFeedback(
        `Successfully generated and dispatched ${res.generatedCount} fee challans for ${bulkData.month} ${bulkData.year} to dedicated students.`
      );
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to generate class fee challans.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Single Challan Generation
  const handleGenerateSingleChallan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const selStudent = studentsList.find((s) => s.id === singleData.studentId);
      const totalAmount = singleData.tuitionFee + singleData.examFee + singleData.labCharges;

      await api.post("/fees", {
        studentId: singleData.studentId,
        studentName: selStudent ? selStudent.fullName : singleData.studentName,
        rollNo: selStudent ? selStudent.rollNo : singleData.rollNo,
        className: selStudent ? selStudent.className : singleData.className,
        month: singleData.month,
        year: singleData.year,
        amount: totalAmount,
        tuitionFee: singleData.tuitionFee,
        examFee: singleData.examFee,
        labCharges: singleData.labCharges,
        dueDate: singleData.dueDate,
      });

      setIsSingleModalOpen(false);
      showFeedback("Individual fee challan voucher created successfully.");
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to generate fee challan", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Proof and Issue Official Paid Challan Receipt
  const handleVerifyProof = async (action: "approve" | "reject") => {
    if (!reviewProofTarget) return;

    if (action === "reject" && !rejectionReason.trim()) {
      alert("Please enter a reason for rejecting the payment proof.");
      return;
    }

    try {
      setActionLoading(true);
      await api.post(`/fees/${reviewProofTarget.id}/verify-proof`, {
        action,
        reason: rejectionReason,
      });

      showFeedback(
        action === "approve"
          ? `Payment verified for Challan #${reviewProofTarget.challanNo}. Official paid receipt has been issued to student/parents.`
          : `Payment proof for Challan #${reviewProofTarget.challanNo} was rejected.`
      );

      setReviewProofTarget(null);
      setRejectionReason("");
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to verify fee payment proof.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Manual Cash / Direct Pay Confirmation
  const handleConfirmManualPay = async () => {
    if (!payTarget) return;
    try {
      setActionLoading(true);
      await api.patch(`/fees/${payTarget.id}/pay`, {
        paymentMethod: manualPayMethod,
        transactionRef: manualTrxRef || undefined,
      });
      showFeedback(`Challan #${payTarget.challanNo} marked as Paid via ${manualPayMethod}.`);
      setPayTarget(null);
      setManualTrxRef("");
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to record payment", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Resolved selected class item and label
  const selectedClass = classesList.find((c) => c.id.toString() === classFilter);
  const selectedClassLabel = classFilter === "all" ? "Whole School" : selectedClass ? `${selectedClass.name} (${selectedClass.section})` : "Selected Class";

  // Filter fees based on class scope (Whole School vs Specific Class)
  const scopeFees = fees.filter((f) => {
    if (classFilter === "all") return true;
    const targetClass = classesList.find((c) => c.id.toString() === classFilter);
    const student = studentsList.find((s) => s.id === f.studentId);
    return (
      (student && student.classId.toString() === classFilter) ||
      (targetClass && f.className.toLowerCase().includes(targetClass.name.toLowerCase()))
    );
  });

  // Export Fee Records to CSV
  const handleExportCsv = () => {
    const headers = [
      "Challan No",
      "Student Name",
      "Roll No",
      "Class",
      "Billing Month",
      "Year",
      "Payable Amount (PKR)",
      "Status",
      "Due Date",
      "Paid Date",
      "Payment Channel",
      "Transaction Ref",
      "Verified By",
      "Concession",
      "Remarks",
    ];

    const targetList = filteredFees;
    const rows = targetList.map((f) => [
      f.challanNo,
      f.studentName,
      f.rollNo,
      f.className,
      f.month,
      f.year,
      f.amount,
      f.status.toUpperCase(),
      f.dueDate,
      f.paidDate || "N/A",
      f.paymentMethod || "N/A",
      f.transactionRef || "N/A",
      f.verifiedByAdminName || "N/A",
      f.concessionApplied || "None",
      f.paymentRemarks || "",
    ]);

    const dateStr = new Date().toISOString().split("T")[0];
    const safeScopeName = classFilter === "all" ? "WholeSchool" : (selectedClass?.name || "Class").replace(/[^a-zA-Z0-9]/g, "_");
    downloadCsv(`BrightSchool_Fee_Challans_${safeScopeName}_${dateStr}.csv`, headers, rows);
    showFeedback(`Exported ${rows.length} fee challan records for ${selectedClassLabel} to CSV.`);
  };

  // Metrics calculation based on selected class scope
  const totalCollected = scopeFees
    .filter((f) => f.status === "paid")
    .reduce((sum, f) => sum + f.amount, 0);

  const totalPending = scopeFees
    .filter((f) => f.status === "pending" || f.status === "overdue" || f.status === "verification_pending")
    .reduce((sum, f) => sum + f.amount, 0);

  const pendingProofsCount = scopeFees.filter((f) => f.status === "verification_pending").length;
  const defaultersCount = scopeFees.filter((f) => f.status === "overdue").length;

  // Filter based on active tab, status dropdown, and student filter within the selected class scope
  const filteredFees = scopeFees.filter((f) => {
    if (activeTab === "proofs") return f.status === "verification_pending";
    if (activeTab === "defaulters") return f.status === "overdue";
    if (activeTab === "all" && statusFilter !== "all" && f.status !== statusFilter) return false;
    if (studentFilter !== "all" && f.studentId !== parseInt(studentFilter, 10)) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Fee Voucher &amp; Accounts Management</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Pakistani 3-copy bank challans, online payment proof verification, class-wise bulk issuance, and accounts ledger
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={fees.length === 0}>
            Export CSV
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsSmsModalOpen(true)}>
            Fee Reminder SMS
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setIsSingleModalOpen(true)}>
            + Single Challan
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsBulkModalOpen(true)}>
            + Generate Class Challans
          </Button>
        </div>
      </div>

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

      {/* Summary Cards */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Realized ({selectedClassLabel})</div>
          <div className="stat-value" style={{ color: "#16a34a" }}>
            Rs. {totalCollected.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Outstanding Balance ({selectedClassLabel})</div>
          <div className="stat-value" style={{ color: "var(--color-danger)" }}>
            Rs. {totalPending.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Proofs Awaiting Review ({selectedClassLabel})</div>
          <div className="stat-value" style={{ color: pendingProofsCount > 0 ? "#d97706" : "var(--color-text)" }}>
            {pendingProofsCount} {pendingProofsCount > 0 ? "Pending" : "Clear"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Vouchers Listed ({selectedClassLabel})</div>
          <div className="stat-value">{filteredFees.length}</div>
        </div>
      </div>

      {/* Tab bar & Filter Controls */}
      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-12)",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-8)", flexWrap: "wrap", alignItems: "center" }}>
          <Button
            variant={activeTab === "all" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("all")}
          >
            All Fee Vouchers
          </Button>

          <Button
            variant={activeTab === "proofs" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("proofs")}
            style={pendingProofsCount > 0 ? { borderColor: "#d97706", color: activeTab === "proofs" ? "#ffffff" : "#d97706" } : undefined}
          >
            Pending Payment Proofs ({pendingProofsCount})
          </Button>

          <Button
            variant={activeTab === "defaulters" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("defaulters")}
          >
            Fee Defaulters ({defaultersCount})
          </Button>
        </div>

        {/* Class Scope, Student & Status Filters */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Class / Whole School Scope Selector */}
          <div style={{ minWidth: "220px" }}>
            <Select
              value={classFilter}
              onChange={(e) => {
                const val = e.target.value;
                setClassFilter(val);
                if (val !== "all") {
                  const currentStudent = studentsList.find((s) => s.id.toString() === studentFilter);
                  if (currentStudent && currentStudent.classId.toString() !== val) {
                    setStudentFilter("all");
                  }
                }
              }}
              options={[
                { value: "all", label: "Whole School (All Classes)" },
                ...classesList.map((c) => ({
                  value: c.id.toString(),
                  label: `${c.name} (${c.section})`,
                })),
              ]}
            />
          </div>

          {activeTab === "all" && (
            <div style={{ width: "150px" }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: "all", label: "All Statuses" },
                  { value: "paid", label: "Paid Only" },
                  { value: "verification_pending", label: "Proof Pending" },
                  { value: "pending", label: "Unpaid Pending" },
                  { value: "overdue", label: "Overdue Only" },
                ]}
              />
            </div>
          )}

          {/* Student Filter for Lifelong History */}
          <div style={{ minWidth: "220px" }}>
            <Select
              value={studentFilter}
              onChange={(e) => setStudentFilter(e.target.value)}
              options={[
                { value: "all", label: classFilter === "all" ? "All Students History" : "All Students in Class" },
                ...studentsList
                  .filter((s) => classFilter === "all" || s.classId.toString() === classFilter)
                  .map((s) => ({
                    value: s.id.toString(),
                    label: `${s.fullName} (${s.rollNo})`,
                  })),
              ]}
            />
          </div>

          {classFilter !== "all" && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setClassFilter("all");
                setStudentFilter("all");
              }}
              title="Reset view to whole school"
            >
              Show Whole School
            </Button>
          )}
        </div>
      </div>

      {/* Active Class Scope Banner */}
      {classFilter !== "all" && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 16px",
            marginBottom: "var(--space-16)",
            background: "var(--color-bg-secondary)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          <div>
            <span style={{ color: "var(--color-text-muted)" }}>Active Class Filter: </span>
            <strong style={{ color: "var(--color-primary)", fontWeight: 700 }}>{selectedClassLabel}</strong>
            <span style={{ color: "var(--color-text-muted)", marginLeft: "8px" }}>
              ({filteredFees.length} voucher{filteredFees.length === 1 ? "" : "s"} found)
            </span>
          </div>
          <button
            onClick={() => {
              setClassFilter("all");
              setStudentFilter("all");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              fontSize: "var(--font-size-xs)",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Clear Class Filter
          </button>
        </div>
      )}

      {/* Main Fee Ledger Table */}
      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "challanNo",
              header: "Challan #",
              render: (row: FeeItem) => (
                <div>
                  <code style={{ fontSize: "12px", fontWeight: 700 }}>{row.challanNo}</code>
                  {row.concessionApplied && (
                    <div style={{ fontSize: "10px", color: "#16a34a", fontWeight: 600 }}>
                      {row.concessionApplied}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "studentName",
              header: "Student & Class",
              render: (row: FeeItem) => (
                <div>
                  <strong>{row.studentName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {row.rollNo} &bull; {row.className}
                  </div>
                </div>
              ),
            },
            {
              key: "month",
              header: "Billing Period",
              render: (row: FeeItem) => `${row.month} ${row.year}`,
            },
            {
              key: "amount",
              header: "Payable (PKR)",
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
                  return <Badge variant="active">PAID</Badge>;
                }
                if (row.status === "verification_pending") {
                  return (
                    <Badge variant="neutral" style={{ borderColor: "#d97706", color: "#d97706" }}>
                      PROOF SUBMITTED
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
              header: "Actions & Verification",
              render: (row: FeeItem) => (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                  {/* Review Proof Button (Appears if student submitted proof) */}
                  {row.status === "verification_pending" && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setReviewProofTarget(row)}
                      title="Review submitted payment screenshot and transaction reference"
                    >
                      Review Proof
                    </Button>
                  )}

                  {/* View 3-Copy Challan or Paid Receipt */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setPrintChallanTarget({
                        id: row.id,
                        challanNo: row.challanNo,
                        studentName: row.studentName,
                        rollNo: row.rollNo,
                        className: row.className,
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
                    {row.status === "paid" ? "View Paid Receipt" : "View 3-Copy Voucher"}
                  </Button>

                  {/* Manual Cash Mark Paid */}
                  {row.status !== "paid" && row.status !== "verification_pending" && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPayTarget(row)}
                      title="Mark as paid at school cash counter"
                    >
                      Cash Collect
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredFees}
          pageSize={10}
          emptyMessage={loading ? "Loading fee records..." : "No fee vouchers found for this selection."}
        />
      </div>

      {/* Official 3-Copy Challan & Paid Receipt Modal */}
      <ChallanModal
        isOpen={Boolean(printChallanTarget)}
        onClose={() => setPrintChallanTarget(null)}
        challan={printChallanTarget}
      />

      {/* Review Payment Proof Modal */}
      <Modal
        isOpen={Boolean(reviewProofTarget)}
        onClose={() => setReviewProofTarget(null)}
        title={`Review Payment Proof • Challan #${reviewProofTarget?.challanNo || ""}`}
        maxWidth="680px"
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleVerifyProof("reject")}
              disabled={actionLoading}
            >
              Reject Proof
            </Button>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button variant="secondary" size="sm" onClick={() => setReviewProofTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleVerifyProof("approve")}
                disabled={actionLoading}
              >
                Approve &amp; Issue Paid Challan Receipt
              </Button>
            </div>
          </div>
        }
      >
        {reviewProofTarget && (
          <div>
            {/* Student & Challan Overview */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "12px 16px",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                marginBottom: "16px",
                fontSize: "12px",
              }}
            >
              <div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Student:</span> <strong>{reviewProofTarget.studentName}</strong></div>
                <div style={{ marginTop: "2px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Roll No / Class:</span>{" "}
                  <strong>{reviewProofTarget.rollNo} &bull; {reviewProofTarget.className}</strong>
                </div>
              </div>
              <div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Billing Month:</span> <strong>{reviewProofTarget.month} {reviewProofTarget.year}</strong></div>
                <div style={{ marginTop: "2px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Payable Dues:</span>{" "}
                  <strong style={{ color: "var(--color-primary)", fontSize: "14px" }}>
                    Rs. {reviewProofTarget.amount.toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {/* Transaction Verification Details */}
            <div
              style={{
                padding: "12px 16px",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
                fontSize: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span><strong>Payment Channel:</strong> {reviewProofTarget.paymentMethod}</span>
                <span>
                  <strong>Transaction ID / Ref:</strong>{" "}
                  <code style={{ fontSize: "12px", color: "var(--color-primary)", fontWeight: 700 }}>
                    {reviewProofTarget.transactionRef || "N/A"}
                  </code>
                </span>
              </div>
              <div style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>
                Submitted At: {reviewProofTarget.proofSubmittedAt ? new Date(reviewProofTarget.proofSubmittedAt).toLocaleString() : "Recently"}
              </div>
              {reviewProofTarget.paymentRemarks && (
                <div style={{ marginTop: "6px", fontStyle: "italic", color: "var(--color-text)" }}>
                  &ldquo;{reviewProofTarget.paymentRemarks}&rdquo;
                </div>
              )}
            </div>

            {/* Proof Screenshot Image Preview */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
                Attached Payment Proof / Deposit Screenshot:
              </div>
              {reviewProofTarget.proofScreenshotUrl ? (
                <div style={{ textAlign: "center", backgroundColor: "var(--color-bg-subtle)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border)" }}>
                  <img
                    src={reviewProofTarget.proofScreenshotUrl}
                    alt="Payment Proof Screenshot"
                    style={{
                      maxHeight: "220px",
                      maxWidth: "100%",
                      borderRadius: "var(--radius-sm)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                    }}
                  />
                </div>
              ) : (
                <div style={{ padding: "16px", textAlign: "center", color: "var(--color-text-muted)", fontSize: "12px" }}>
                  No visual screenshot attached (Bank transaction reference provided).
                </div>
              )}
            </div>

            {/* Rejection Reason (If rejecting) */}
            <Input
              label="Rejection Reason (Only if rejecting proof)"
              placeholder="e.g. Transaction ID not found in HBL bank statement / partial payment"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
        )}
      </Modal>

      {/* Bulk Class Challan Generation Modal */}
      <Modal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Generate Bulk Class Fee Challans"
        maxWidth="620px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGenerateBulkClassChallans}
              disabled={actionLoading}
            >
              {actionLoading ? "Generating..." : "Generate & Dispatch Challans"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGenerateBulkClassChallans} className="form-layout">
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
            Select target class and fee parameters. Individualized 3-copy vouchers will be generated for every active enrolled student and immediately made available in their portal.
          </p>

          <Select
            label="Target Class"
            value={bulkData.classId}
            onChange={(e) => setBulkData({ ...bulkData, classId: e.target.value })}
            options={[
              { value: "all", label: "All School Classes" },
              ...classesList.map((c) => ({
                value: c.id.toString(),
                label: `${c.name} (${c.section})`,
              })),
            ]}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Select
              label="Billing Month"
              value={bulkData.month}
              onChange={(e) => setBulkData({ ...bulkData, month: e.target.value })}
              options={[
                { value: "January", label: "January" },
                { value: "February", label: "February" },
                { value: "March", label: "March" },
                { value: "April", label: "April" },
                { value: "May", label: "May" },
                { value: "June", label: "June" },
                { value: "July", label: "July" },
                { value: "August", label: "August" },
                { value: "September", label: "September" },
                { value: "October", label: "October" },
                { value: "November", label: "November" },
                { value: "December", label: "December" },
              ]}
            />

            <Input
              label="Billing Year"
              type="number"
              value={bulkData.year.toString()}
              onChange={(e) => setBulkData({ ...bulkData, year: parseInt(e.target.value, 10) || 2026 })}
              required
            />
          </div>

          <Input
            label="Due Date for Payment"
            type="date"
            value={bulkData.dueDate}
            onChange={(e) => setBulkData({ ...bulkData, dueDate: e.target.value })}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Tuition Fee (PKR)"
              type="number"
              value={bulkData.tuitionFee.toString()}
              onChange={(e) => setBulkData({ ...bulkData, tuitionFee: parseInt(e.target.value, 10) || 0 })}
              required
            />
            <Input
              label="Examination Fee (PKR)"
              type="number"
              value={bulkData.examFee.toString()}
              onChange={(e) => setBulkData({ ...bulkData, examFee: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Science / IT Lab Charges (PKR)"
              type="number"
              value={bulkData.labCharges.toString()}
              onChange={(e) => setBulkData({ ...bulkData, labCharges: parseInt(e.target.value, 10) || 0 })}
            />
            <Input
              label="Late Fee Surcharge (PKR)"
              type="number"
              value={bulkData.lateFeeSurcharge.toString()}
              onChange={(e) => setBulkData({ ...bulkData, lateFeeSurcharge: parseInt(e.target.value, 10) || 0 })}
            />
          </div>

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Total Base Challan Amount:</span>
            <strong style={{ fontSize: "16px", color: "var(--color-primary)" }}>
              PKR {(bulkData.tuitionFee + bulkData.examFee + bulkData.labCharges).toLocaleString()}
            </strong>
          </div>
        </form>
      </Modal>

      {/* Single Challan Generation Modal */}
      <Modal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        title="Issue Individual Fee Challan Voucher"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setIsSingleModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleGenerateSingleChallan}>
              Create Challan
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGenerateSingleChallan} className="form-layout">
          <Select
            label="Select Student"
            value={singleData.studentId.toString()}
            onChange={(e) => setSingleData({ ...singleData, studentId: parseInt(e.target.value, 10) })}
            options={studentsList.map((s) => ({
              value: s.id.toString(),
              label: `${s.fullName} (${s.rollNo} • ${s.className})`,
            }))}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Month"
              value={singleData.month}
              onChange={(e) => setSingleData({ ...singleData, month: e.target.value })}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={singleData.dueDate}
              onChange={(e) => setSingleData({ ...singleData, dueDate: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Input
              label="Tuition Fee (PKR)"
              type="number"
              value={singleData.tuitionFee.toString()}
              onChange={(e) => setSingleData({ ...singleData, tuitionFee: parseInt(e.target.value, 10) || 0 })}
            />
            <Input
              label="Exam / Lab (PKR)"
              type="number"
              value={singleData.examFee.toString()}
              onChange={(e) => setSingleData({ ...singleData, examFee: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </form>
      </Modal>

      {/* Manual Cash Payment Modal */}
      <Modal
        isOpen={Boolean(payTarget)}
        title={`Record Manual Cash Payment • ${payTarget?.challanNo || ""}`}
        onClose={() => setPayTarget(null)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setPayTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmManualPay}>
              Confirm Payment &amp; Issue Receipt
            </Button>
          </div>
        }
      >
        <div className="form-layout">
          <div style={{ fontSize: "13px" }}>
            Student: <strong>{payTarget?.studentName}</strong> ({payTarget?.rollNo})
          </div>
          <div style={{ fontSize: "13px" }}>
            Payable Amount: <strong>Rs. {payTarget?.amount.toLocaleString()}</strong>
          </div>

          <Select
            label="Payment Mode"
            value={manualPayMethod}
            onChange={(e) => setManualPayMethod(e.target.value)}
            options={[
              { value: "Cash Counter", label: "School Cash Counter" },
              { value: "Bank Deposit Slip", label: "Bank Deposit Slip" },
              { value: "Bank Cheque", label: "Bank Cheque / Pay Order" },
              { value: "Online Transfer", label: "Direct Online Transfer" },
            ]}
          />

          <Input
            label="Receipt / Cheque / Bank Scroll #"
            placeholder="e.g. REC-99812 or CHQ-00192"
            value={manualTrxRef}
            onChange={(e) => setManualTrxRef(e.target.value)}
          />
        </div>
      </Modal>

      {/* SMS Reminder Broadcast Modal */}
      <SmsBroadcastModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        defaultRecipientType="fee_defaulters"
      />
    </div>
  );
};

export default FeesPage;
