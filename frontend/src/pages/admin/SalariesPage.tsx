import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import PayslipModal, { TeacherSalaryData } from "../../components/PayslipModal";
import api from "../../lib/api";

interface TeacherItem {
  id: number;
  fullName: string;
  employeeId: string;
  designation: string;
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

export const SalariesPage: React.FC = () => {
  const [salaries, setSalaries] = useState<TeacherSalaryData[]>([]);
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>("November");
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Modals
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState<boolean>(false);
  const [printPayslipTarget, setPrintPayslipTarget] = useState<TeacherSalaryData | null>(null);
  const [disburseTarget, setDisburseTarget] = useState<TeacherSalaryData | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<TeacherSalaryData | null>(null);

  // Disburse Form
  const [disburseMethod, setDisburseMethod] = useState<string>("HBL Direct Corporate Transfer");
  const [disburseRef, setDisburseRef] = useState<string>("");
  const [disburseDate, setDisburseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [disburseRemarks, setDisburseRemarks] = useState<string>("");

  // Generate Form
  const [generateMonth, setGenerateMonth] = useState<string>("November");
  const [generateYear, setGenerateYear] = useState<number>(2026);

  // Adjust Form
  const [adjustBonus, setAdjustBonus] = useState<number>(0);
  const [adjustTax, setAdjustTax] = useState<number>(0);
  const [adjustAbsence, setAdjustAbsence] = useState<number>(0);
  const [adjustRemarks, setAdjustRemarks] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [salData, tchData] = await Promise.all([
        api.get<TeacherSalaryData[]>("/salaries", {
          params: {
            month: selectedMonth !== "all" ? selectedMonth : undefined,
            year: selectedYear,
            teacherId: teacherFilter !== "all" ? parseInt(teacherFilter, 10) : undefined,
          },
        }),
        api.get<TeacherItem[]>("/teachers"),
      ]);
      setSalaries(salData);
      setTeachers(tchData);
    } catch (err: any) {
      console.error("Failed to load salaries data", err);
      showFeedback(err.message || "Failed to load salaries data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedMonth, selectedYear, teacherFilter]);

  const showFeedback = (text: string, type: "success" | "error" = "success") => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  // Generate Monthly Payroll
  const handleGeneratePayroll = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await api.post<{ generatedCount: number; records: TeacherSalaryData[] }>("/salaries/generate", {
        month: generateMonth,
        year: generateYear,
      });

      setIsGenerateModalOpen(false);
      showFeedback(
        `Generated monthly payroll for ${res.generatedCount} faculty members for ${generateMonth} ${generateYear}.`
      );
      setSelectedMonth(generateMonth);
      setSelectedYear(generateYear);
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to generate monthly payroll", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Disburse / Pay Salary
  const handleDisburse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disburseTarget) return;

    try {
      setActionLoading(true);
      await api.post(`/salaries/${disburseTarget.id}/disburse`, {
        paymentMethod: disburseMethod,
        transactionRef: disburseRef || `SAL-${disburseTarget.year}-${disburseTarget.id}`,
        paymentDate: disburseDate,
        remarks: disburseRemarks || "Salary disbursed by Administration",
      });

      showFeedback(`Salary of Rs. ${disburseTarget.netSalary.toLocaleString()} disbursed to ${disburseTarget.teacherName}.`);
      setDisburseTarget(null);
      setDisburseRef("");
      setDisburseRemarks("");
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to disburse salary", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Save Salary Adjustment
  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    try {
      setActionLoading(true);
      await api.patch(`/salaries/${adjustTarget.id}`, {
        bonus: adjustBonus,
        taxDeduction: adjustTax,
        absenceDeduction: adjustAbsence,
        remarks: adjustRemarks || adjustTarget.remarks,
      });

      showFeedback(`Salary adjustments saved for ${adjustTarget.teacherName}.`);
      setAdjustTarget(null);
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to update salary adjustments", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Export Payroll to CSV
  const handleExportCsv = () => {
    const headers = [
      "Slip ID",
      "Employee ID",
      "Faculty Name",
      "Designation",
      "Month",
      "Year",
      "Basic Pay (PKR)",
      "Medical Allowance",
      "House Rent",
      "Transport",
      "Special Bonus",
      "Gross Salary (PKR)",
      "Income Tax",
      "Provident Fund",
      "Absence Penalty",
      "Total Deductions (PKR)",
      "Net Payable (PKR)",
      "Status",
      "Disbursement Date",
      "Payment Mode",
      "Transaction Ref",
      "Remarks",
    ];

    const rows = filteredSalaries.map((s) => [
      s.id,
      s.employeeId,
      s.teacherName,
      s.designation,
      s.month,
      s.year,
      s.basicSalary,
      s.medicalAllowance,
      s.houseRentAllowance,
      s.transportAllowance,
      s.bonus,
      s.grossSalary,
      s.taxDeduction,
      s.providentFund,
      s.absenceDeduction,
      s.totalDeductions,
      s.netSalary,
      s.status.toUpperCase(),
      s.paymentDate || "N/A",
      s.paymentMethod || "N/A",
      s.transactionRef || "N/A",
      s.remarks || "",
    ]);

    const dateStr = new Date().toISOString().split("T")[0];
    downloadCsv(`BrightSchool_Faculty_Payroll_${selectedMonth}_${selectedYear}_${dateStr}.csv`, headers, rows);
    showFeedback(`Exported ${rows.length} salary slip records to CSV.`);
  };

  // Metrics
  const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0);
  const disbursedTotal = salaries.filter((s) => s.status === "paid").reduce((sum, s) => sum + s.netSalary, 0);
  const pendingTotal = salaries.filter((s) => s.status === "pending" || s.status === "processing").reduce((sum, s) => sum + s.netSalary, 0);
  const paidCount = salaries.filter((s) => s.status === "paid").length;

  const filteredSalaries = salaries.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Payroll &amp; Salary Management</h1>
          <p className="page-subtitle">
            Automated monthly payroll generation, allowances &amp; deductions, attendance penalties, corporate bank disbursements, and official payslips
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <Button variant="secondary" size="sm" onClick={() => loadData()} disabled={loading}>
            Refresh
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExportCsv} disabled={salaries.length === 0}>
            Export Payroll CSV
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsGenerateModalOpen(true)}>
            + Generate Monthly Payroll
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
          <div className="stat-label">Total Monthly Payroll (PKR)</div>
          <div className="stat-value">Rs. {totalPayroll.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Disbursed Take-Home Salaries</div>
          <div className="stat-value" style={{ color: "#16a34a" }}>
            Rs. {disbursedTotal.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {paidCount} of {salaries.length} Faculty Members Disbursed
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending Salary Dues (PKR)</div>
          <div className="stat-value" style={{ color: pendingTotal > 0 ? "var(--color-danger)" : "#16a34a" }}>
            Rs. {pendingTotal.toLocaleString()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Faculty On Active Payroll</div>
          <div className="stat-value">{teachers.length} Faculty Members</div>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          padding: "12px 16px",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Month Selector */}
          <div style={{ width: "140px" }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={[
                { value: "all", label: "All Months" },
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
          </div>

          {/* Year Selector */}
          <div style={{ width: "100px" }}>
            <Select
              value={selectedYear.toString()}
              onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              options={[
                { value: "2026", label: "2026" },
                { value: "2027", label: "2027" },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: "140px" }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "paid", label: "Paid Only" },
                { value: "pending", label: "Pending Only" },
                { value: "processing", label: "Processing" },
              ]}
            />
          </div>
        </div>

        {/* Teacher Selector for Lifelong History */}
        <div style={{ width: "220px" }}>
          <Select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            options={[
              { value: "all", label: "All Faculty History" },
              ...teachers.map((t) => ({
                value: t.id.toString(),
                label: `${t.fullName} (${t.employeeId})`,
              })),
            ]}
          />
        </div>
      </div>

      {/* Salary Table */}
      <div className="panel-card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
            Faculty Monthly Disbursement Ledger &bull; {selectedMonth} {selectedYear}
          </h3>
          <span style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Showing {filteredSalaries.length} Salary Records
          </span>
        </div>

        <DataTable
          columns={[
            {
              key: "teacher",
              header: "Faculty Member",
              render: (row: TeacherSalaryData) => (
                <div>
                  <strong style={{ fontSize: "13px" }}>{row.teacherName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 600 }}>{row.employeeId}</span> &bull; {row.designation}
                  </div>
                </div>
              ),
            },
            {
              key: "period",
              header: "Payroll Month",
              render: (row: TeacherSalaryData) => (
                <span style={{ fontWeight: 600 }}>
                  {row.month} {row.year}
                </span>
              ),
            },
            {
              key: "gross",
              header: "Gross Earnings (PKR)",
              render: (row: TeacherSalaryData) => (
                <div>
                  <div style={{ fontWeight: 600 }}>Rs. {row.grossSalary.toLocaleString()}</div>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                    Basic: Rs. {row.basicSalary.toLocaleString()}
                    {row.bonus > 0 ? ` + Bonus: Rs. ${row.bonus.toLocaleString()}` : ""}
                  </div>
                </div>
              ),
            },
            {
              key: "deductions",
              header: "Total Deductions",
              render: (row: TeacherSalaryData) => (
                <div>
                  <div style={{ color: "var(--color-danger)", fontWeight: 600 }}>
                    -Rs. {row.totalDeductions.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                    Tax: {row.taxDeduction} &bull; PF: {row.providentFund}
                    {row.absenceDeduction > 0 ? ` &bull; Abs: ${row.absenceDeduction}` : ""}
                  </div>
                </div>
              ),
            },
            {
              key: "netSalary",
              header: "Net Take-Home",
              render: (row: TeacherSalaryData) => (
                <strong style={{ fontSize: "14px", color: row.status === "paid" ? "#16a34a" : "var(--color-text)" }}>
                  Rs. {row.netSalary.toLocaleString()}
                </strong>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row: TeacherSalaryData) => {
                if (row.status === "paid") {
                  return <Badge variant="active">PAID</Badge>;
                }
                if (row.status === "processing") {
                  return <Badge variant="neutral" style={{ borderColor: "#d97706", color: "#d97706" }}>PROCESSING</Badge>;
                }
                return <Badge variant="inactive">PENDING</Badge>;
              },
            },
            {
              key: "actions",
              header: "Disbursement & Payslip",
              render: (row: TeacherSalaryData) => (
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
                  {/* View Payslip */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPrintPayslipTarget(row)}
                    title="View and print official salary voucher slip"
                  >
                    Payslip
                  </Button>

                  {/* Disburse Salary Button */}
                  {row.status !== "paid" ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setDisburseTarget(row);
                        setDisburseRef(`SAL-${row.year}-${row.id}`);
                        setDisburseRemarks("Monthly salary approved & disbursed");
                      }}
                    >
                      Disburse
                    </Button>
                  ) : (
                    <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 600 }}>
                      Paid on {row.paymentDate || "Disbursed"}
                    </span>
                  )}

                  {/* Adjust Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      setAdjustTarget(row);
                      setAdjustBonus(row.bonus);
                      setAdjustTax(row.taxDeduction);
                      setAdjustAbsence(row.absenceDeduction);
                      setAdjustRemarks(row.remarks || "");
                    }}
                    title="Adjust bonus, absence deductions or tax"
                  >
                    Adjust
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredSalaries}
          pageSize={10}
          emptyMessage={loading ? "Loading faculty payroll ledger..." : "No salary slips recorded for this selection."}
        />
      </div>

      {/* Official Printable Payslip Modal */}
      <PayslipModal
        isOpen={Boolean(printPayslipTarget)}
        onClose={() => setPrintPayslipTarget(null)}
        salary={printPayslipTarget}
      />

      {/* Generate Monthly Payroll Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Monthly Faculty Payroll"
        maxWidth="540px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setIsGenerateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleGeneratePayroll}
              disabled={actionLoading}
            >
              {actionLoading ? "Processing..." : "Generate Payroll for All Faculty"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleGeneratePayroll} className="form-layout">
          <p style={{ fontSize: "12px", color: "var(--color-text-muted)", margin: 0 }}>
            Automatically calculates base pay, medical, house rent, and transport allowances for all active faculty members. Absence deductions are automatically computed based on monthly faculty attendance records.
          </p>

          <Select
            label="Payroll Month"
            value={generateMonth}
            onChange={(e) => setGenerateMonth(e.target.value)}
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
            label="Payroll Year"
            type="number"
            value={generateYear.toString()}
            onChange={(e) => setGenerateYear(parseInt(e.target.value, 10) || 2026)}
            required
          />

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
            }}
          >
            <div>Faculty on Payroll: <strong>{teachers.length} Active Teachers</strong></div>
            <div style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
              Existing salary slips for this month will be preserved without duplicate generation.
            </div>
          </div>
        </form>
      </Modal>

      {/* Disburse Salary Modal */}
      <Modal
        isOpen={Boolean(disburseTarget)}
        onClose={() => setDisburseTarget(null)}
        title={`Disburse Salary • ${disburseTarget?.teacherName || ""}`}
        maxWidth="540px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setDisburseTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDisburse}
              disabled={actionLoading}
            >
              Confirm Disbursement
            </Button>
          </div>
        }
      >
        <form onSubmit={handleDisburse} className="form-layout">
          <div
            style={{
              padding: "12px 16px",
              backgroundColor: "var(--color-bg-subtle)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--color-border)",
              fontSize: "12px",
            }}
          >
            <div>Faculty: <strong>{disburseTarget?.teacherName}</strong> ({disburseTarget?.employeeId})</div>
            <div style={{ marginTop: "4px" }}>
              Net Payable: <strong style={{ fontSize: "16px", color: "#16a34a" }}>Rs. {disburseTarget?.netSalary.toLocaleString()}</strong>
            </div>
          </div>

          <Select
            label="Payment Mode / Banking Channel"
            value={disburseMethod}
            onChange={(e) => setDisburseMethod(e.target.value)}
            options={[
              { value: "HBL Direct Corporate Transfer", label: "HBL Direct Corporate Payroll Transfer" },
              { value: "Allied Bank Transfer", label: "Allied Bank Corporate Transfer" },
              { value: "Bank Cheque", label: "Bank Cheque / Pay Order" },
              { value: "Cash Voucher", label: "Cash Office Voucher" },
            ]}
          />

          <Input
            label="Transaction / Cheque / Scroll Ref #"
            placeholder="e.g. HBL-CORP-98421 or CHQ-00918"
            value={disburseRef}
            onChange={(e) => setDisburseRef(e.target.value)}
          />

          <Input
            label="Disbursement Date"
            type="date"
            value={disburseDate}
            onChange={(e) => setDisburseDate(e.target.value)}
            required
          />

          <Input
            label="Remarks / Audit Note"
            placeholder="e.g. Monthly salary cleared via automated corporate payroll"
            value={disburseRemarks}
            onChange={(e) => setDisburseRemarks(e.target.value)}
          />
        </form>
      </Modal>

      {/* Adjust Salary Modal */}
      <Modal
        isOpen={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        title={`Adjust Salary Parameters • ${adjustTarget?.teacherName || ""}`}
        maxWidth="540px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setAdjustTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveAdjustment}
              disabled={actionLoading}
            >
              Save Adjustments
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveAdjustment} className="form-layout">
          <div style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
            Adjust bonus allowances, absence penalties, or tax withholdings for this billing period.
          </div>

          <Input
            label="Special Duty Bonus (PKR)"
            type="number"
            value={adjustBonus.toString()}
            onChange={(e) => setAdjustBonus(parseInt(e.target.value, 10) || 0)}
          />

          <Input
            label="Income Tax Withholding (PKR)"
            type="number"
            value={adjustTax.toString()}
            onChange={(e) => setAdjustTax(parseInt(e.target.value, 10) || 0)}
          />

          <Input
            label="Absence Penalty Deduction (PKR)"
            type="number"
            value={adjustAbsence.toString()}
            onChange={(e) => setAdjustAbsence(parseInt(e.target.value, 10) || 0)}
          />

          <Input
            label="Adjustment Remarks"
            value={adjustRemarks}
            onChange={(e) => setAdjustRemarks(e.target.value)}
            placeholder="e.g. Invigilation bonus / leave adjustments"
          />
        </form>
      </Modal>
    </div>
  );
};

export default SalariesPage;
