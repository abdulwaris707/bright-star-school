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
  const [searchQuery, setSearchQuery] = useState<string>("");
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
  const [advanceTarget, setAdvanceTarget] = useState<TeacherSalaryData | null>(null);
  const [adjustTarget, setAdjustTarget] = useState<TeacherSalaryData | null>(null);

  // Disburse Form
  const [disburseMethod, setDisburseMethod] = useState<string>("HBL Direct Corporate Transfer");
  const [disburseRef, setDisburseRef] = useState<string>("");
  const [disburseDate, setDisburseDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [disburseRemarks, setDisburseRemarks] = useState<string>("");
  const [disburseAmount, setDisburseAmount] = useState<number>(0);

  // Advance Form
  const [advanceAmountInput, setAdvanceAmountInput] = useState<number>(20000);
  const [advanceDateInput, setAdvanceDateInput] = useState<string>(new Date().toISOString().split("T")[0]);
  const [advanceRemarksInput, setAdvanceRemarksInput] = useState<string>("");

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
        amount: disburseAmount > 0 ? disburseAmount : undefined,
      });

      showFeedback(`Disbursement completed for ${disburseTarget.teacherName}.`);
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

  // Record Advance Payment
  const handleRecordAdvance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!advanceTarget) return;

    try {
      setActionLoading(true);
      await api.post(`/salaries/${advanceTarget.id}/advance`, {
        advanceAmount: advanceAmountInput,
        advanceDate: advanceDateInput,
        remarks: advanceRemarksInput || `Advance salary of Rs. ${advanceAmountInput.toLocaleString()} issued on request`,
      });

      showFeedback(`Salary advance of Rs. ${advanceAmountInput.toLocaleString()} recorded for ${advanceTarget.teacherName}.`);
      setAdvanceTarget(null);
      setAdvanceRemarksInput("");
      loadData();
    } catch (err: any) {
      showFeedback(err.message || "Failed to record salary advance", "error");
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
      "Paid Amount (PKR)",
      "Remaining Balance (PKR)",
      "Advance Taken (PKR)",
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
      s.paidAmount ?? (s.status === "paid" ? s.netSalary : (s.advanceAmount || 0)),
      s.remainingSalary ?? (s.status === "paid" ? 0 : s.netSalary - (s.advanceAmount || 0)),
      s.advanceAmount || 0,
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

  // Compute precise metrics based on displayed list
  const totalPayroll = salaries.reduce((sum, s) => sum + s.netSalary, 0);
  const totalDisbursed = salaries.reduce((sum, s) => {
    if (s.paidAmount !== undefined) return sum + s.paidAmount;
    if (s.status === "paid") return sum + s.netSalary;
    return sum + (s.advanceAmount || 0);
  }, 0);
  const totalRemaining = salaries.reduce((sum, s) => {
    if (s.remainingSalary !== undefined) return sum + s.remainingSalary;
    if (s.status === "paid") return sum;
    return sum + (s.netSalary - (s.advanceAmount || 0));
  }, 0);
  const totalAdvance = salaries.reduce((sum, s) => sum + (s.advanceAmount || 0), 0);
  const advanceCount = salaries.filter((s) => (s.advanceAmount || 0) > 0).length;
  const paidCount = salaries.filter((s) => s.status === "paid").length;
  const unpaidCount = salaries.filter((s) => s.status === "pending" || s.status === "processing").length;

  // Filter salaries by status & search query
  const filteredSalaries = salaries.filter((s) => {
    if (statusFilter === "paid" && s.status !== "paid") return false;
    if (statusFilter === "advance" && s.status !== "advance" && (!s.advanceAmount || s.advanceAmount <= 0)) return false;
    if (statusFilter === "pending" && s.status !== "pending") return false;
    if (statusFilter === "processing" && s.status !== "processing") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.teacherName.toLowerCase().includes(q);
      const matchEmp = s.employeeId.toLowerCase().includes(q);
      const matchDesig = s.designation.toLowerCase().includes(q);
      const matchId = s.id.toString().includes(q);
      if (!matchName && !matchEmp && !matchDesig && !matchId) return false;
    }

    return true;
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Payroll &amp; Salary Management</h1>
          <p className="page-subtitle">
            Automated monthly payroll, advance salary tracking, corporate bank disbursements, remaining balance auditing, and official payslips
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

      {/* Summary KPI Cards */}
      <div className="stats-grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="stat-card">
          <div className="stat-label">Total Salary Disbursed (Paid)</div>
          <div className="stat-value" style={{ color: "#16a34a" }}>
            Rs. {totalDisbursed.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {paidCount} Cleared in Full &bull; {advanceCount} with Advance
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Remaining Balance</div>
          <div className="stat-value" style={{ color: totalRemaining > 0 ? "var(--color-danger)" : "#16a34a" }}>
            Rs. {totalRemaining.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {unpaidCount} Pending Clearance
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Advance Salaries Disbursed</div>
          <div className="stat-value" style={{ color: totalAdvance > 0 ? "#d97706" : "var(--color-text)" }}>
            Rs. {totalAdvance.toLocaleString()}
          </div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {advanceCount} Faculty Member{advanceCount === 1 ? "" : "s"} Took Advance
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Total Net Payroll Commitment</div>
          <div className="stat-value">Rs. {totalPayroll.toLocaleString()}</div>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            {salaries.length} Total Slips Listed ({selectedMonth})
          </div>
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
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", flex: 1 }}>
          {/* Search Field */}
          <div style={{ minWidth: "220px", flex: 1 }}>
            <Input
              placeholder="Search faculty name, employee ID, slip #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Month Selector */}
          <div style={{ width: "170px" }}>
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              options={[
                { value: "all", label: "All Months (Past History)" },
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
                { value: "2025", label: "2025" },
                { value: "2027", label: "2027" },
              ]}
            />
          </div>

          {/* Status Filter */}
          <div style={{ width: "160px" }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: "all", label: "All Statuses" },
                { value: "paid", label: "Paid in Full" },
                { value: "advance", label: "Advance Taken" },
                { value: "pending", label: "Unpaid Pending" },
                { value: "processing", label: "Processing" },
              ]}
            />
          </div>
        </div>

        {/* Teacher Selector for Complete Individual History */}
        <div style={{ width: "230px" }}>
          <Select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            options={[
              { value: "all", label: "All Faculty Members" },
              ...teachers.map((t) => ({
                value: t.id.toString(),
                label: `${t.fullName} (${t.employeeId})`,
              })),
            ]}
          />
        </div>
      </div>

      {/* Active Filter Scope Tag */}
      {(teacherFilter !== "all" || selectedMonth === "all") && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 16px",
            marginBottom: "16px",
            backgroundColor: "var(--color-bg-subtle)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
          }}
        >
          <div>
            <span style={{ color: "var(--color-text-muted)" }}>Active Salary View: </span>
            <strong style={{ color: "var(--color-primary)" }}>
              {teacherFilter !== "all"
                ? `${teachers.find((t) => t.id.toString() === teacherFilter)?.fullName || "Faculty"} Past History`
                : "All Months Lifelong History"}
            </strong>
            <span style={{ color: "var(--color-text-muted)", marginLeft: "8px" }}>
              ({filteredSalaries.length} record{filteredSalaries.length === 1 ? "" : "s"} found)
            </span>
          </div>
          <button
            onClick={() => {
              setTeacherFilter("all");
              setSelectedMonth("November");
            }}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              fontSize: "12px",
              textDecoration: "underline",
              padding: 0,
            }}
          >
            Reset to November 2026
          </button>
        </div>
      )}

      {/* Salary Table */}
      <div className="panel-card" style={{ padding: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--color-border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "14px", fontWeight: 700 }}>
            Faculty Monthly Disbursement Ledger &bull; {selectedMonth === "all" ? "All Months History" : selectedMonth} {selectedYear}
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
              key: "netSalary",
              header: "Net Payable (PKR)",
              render: (row: TeacherSalaryData) => (
                <strong style={{ fontSize: "13px" }}>
                  Rs. {row.netSalary.toLocaleString()}
                </strong>
              ),
            },
            {
              key: "disbursedAndRemaining",
              header: "Disbursed & Remaining",
              render: (row: TeacherSalaryData) => {
                const paid = row.paidAmount ?? (row.status === "paid" ? row.netSalary : (row.advanceAmount || 0));
                const remaining = row.remainingSalary ?? (row.status === "paid" ? 0 : row.netSalary - (row.advanceAmount || 0));
                return (
                  <div>
                    <div style={{ color: paid > 0 ? "#16a34a" : "var(--color-text-muted)", fontWeight: 600, fontSize: "12px" }}>
                      Paid: Rs. {paid.toLocaleString()}
                    </div>
                    <div style={{ fontSize: "11px", color: remaining > 0 ? "var(--color-danger)" : "#16a34a", fontWeight: 600 }}>
                      Remaining: Rs. {remaining.toLocaleString()}
                    </div>
                    {row.advanceAmount ? (
                      <div style={{ fontSize: "10px", color: "#d97706", fontWeight: 600, marginTop: "2px" }}>
                        Advance: Rs. {row.advanceAmount.toLocaleString()} ({row.advanceDate || "Recorded"})
                      </div>
                    ) : null}
                  </div>
                );
              },
            },
            {
              key: "status",
              header: "Status",
              render: (row: TeacherSalaryData) => {
                if (row.status === "paid") {
                  return <Badge variant="active">PAID IN FULL</Badge>;
                }
                if (row.status === "advance") {
                  return (
                    <Badge variant="neutral" style={{ borderColor: "#d97706", color: "#d97706" }}>
                      ADVANCE TAKEN
                    </Badge>
                  );
                }
                if (row.status === "processing") {
                  return <Badge variant="neutral" style={{ borderColor: "#2563eb", color: "#2563eb" }}>PROCESSING</Badge>;
                }
                return <Badge variant="inactive">UNPAID PENDING</Badge>;
              },
            },
            {
              key: "paymentInfo",
              header: "Payment Details",
              render: (row: TeacherSalaryData) => {
                if (row.status === "paid" || row.status === "advance") {
                  return (
                    <div style={{ fontSize: "11px" }}>
                      <div style={{ fontWeight: 600 }}>{row.paymentDate ? `Paid on ${row.paymentDate}` : "Disbursed"}</div>
                      <div style={{ color: "var(--color-text-muted)" }}>{row.paymentMethod || "Bank Transfer"}</div>
                      {row.transactionRef && (
                        <code style={{ fontSize: "10px" }}>{row.transactionRef}</code>
                      )}
                    </div>
                  );
                }
                return (
                  <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Awaiting Disbursement
                  </span>
                );
              },
            },
            {
              key: "actions",
              header: "Actions",
              render: (row: TeacherSalaryData) => {
                const remaining = row.remainingSalary ?? (row.status === "paid" ? 0 : row.netSalary - (row.advanceAmount || 0));
                return (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", whiteSpace: "nowrap" }}>
                    {/* View Payslip Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setPrintPayslipTarget(row)}
                      title="View and print official salary voucher slip"
                    >
                      Payslip
                    </Button>

                    {/* Pay / Disburse Balance */}
                    {remaining > 0 && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setDisburseTarget(row);
                          setDisburseAmount(remaining);
                          setDisburseRef(`SAL-${row.year}-${row.id}`);
                          setDisburseRemarks(row.advanceAmount ? "Disbursing remaining balance after advance" : "Full monthly salary disbursed");
                        }}
                        title={`Disburse remaining balance of Rs. ${remaining.toLocaleString()}`}
                      >
                        {row.advanceAmount ? "Pay Balance" : "Disburse"}
                      </Button>
                    )}

                    {/* Actions Dropdown Menu for secondary options */}
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <select
                        aria-label="More Actions"
                        style={{
                          background: "var(--color-bg-subtle)",
                          color: "var(--color-text)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "var(--radius)",
                          padding: "4px 8px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                        value=""
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "advance") {
                            setAdvanceTarget(row);
                            setAdvanceAmountInput(Math.min(25000, remaining || row.netSalary));
                            setAdvanceDateInput(new Date().toISOString().split("T")[0]);
                            setAdvanceRemarksInput("");
                          } else if (val === "adjust") {
                            setAdjustTarget(row);
                            setAdjustBonus(row.bonus);
                            setAdjustTax(row.taxDeduction);
                            setAdjustAbsence(row.absenceDeduction);
                            setAdjustRemarks(row.remarks || "");
                          }
                          e.target.value = "";
                        }}
                      >
                        <option value="" disabled>More ▾</option>
                        {remaining > 0 && <option value="advance">Record Advance</option>}
                        <option value="adjust">Adjust Deductions</option>
                      </select>
                    </div>
                  </div>
                );
              },
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

      {/* Disburse Salary Modal */}
      <Modal
        isOpen={Boolean(disburseTarget)}
        onClose={() => setDisburseTarget(null)}
        title={`Disburse Salary • ${disburseTarget?.teacherName}`}
        maxWidth="500px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setDisburseTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleDisburse} disabled={actionLoading}>
              {actionLoading ? "Processing..." : "Confirm & Disburse Payment"}
            </Button>
          </div>
        }
      >
        {disburseTarget && (
          <form onSubmit={handleDisburse} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>Faculty: <strong>{disburseTarget.teacherName}</strong> ({disburseTarget.employeeId})</div>
              <div>Net Monthly Salary: <strong>Rs. {disburseTarget.netSalary.toLocaleString()}</strong></div>
              {disburseTarget.advanceAmount ? (
                <div style={{ color: "#d97706" }}>
                  Advance Already Given: Rs. {disburseTarget.advanceAmount.toLocaleString()}
                </div>
              ) : null}
              <div style={{ color: "var(--color-primary)", fontWeight: 700, marginTop: "4px" }}>
                Payable Amount: Rs. {(disburseAmount || disburseTarget.remainingSalary || disburseTarget.netSalary).toLocaleString()}
              </div>
            </div>

            <Input
              label="Disbursement Amount (PKR)"
              type="number"
              value={disburseAmount.toString()}
              onChange={(e) => setDisburseAmount(parseInt(e.target.value, 10) || 0)}
              required
            />

            <Select
              label="Payment Channel"
              value={disburseMethod}
              onChange={(e) => setDisburseMethod(e.target.value)}
              options={[
                { value: "HBL Direct Corporate Transfer", label: "HBL Corporate Bank Transfer" },
                { value: "Meezan Bank Raast", label: "Meezan Bank Raast (Instant)" },
                { value: "EasyPaisa", label: "EasyPaisa Corporate" },
                { value: "JazzCash", label: "JazzCash Business" },
                { value: "Bank Cheque", label: "Bank Crossed Cheque" },
                { value: "Cash Disbursement", label: "Cash Voucher at Accounts Office" },
              ]}
            />

            <Input
              label="Transaction / Cheque Reference"
              placeholder="e.g. HBL-FT-991204 or CHQ-00918"
              value={disburseRef}
              onChange={(e) => setDisburseRef(e.target.value)}
            />

            <Input
              label="Payment Date"
              type="date"
              value={disburseDate}
              onChange={(e) => setDisburseDate(e.target.value)}
              required
            />

            <Input
              label="Remarks / Audit Note"
              placeholder="e.g. Cleared via monthly corporate batch"
              value={disburseRemarks}
              onChange={(e) => setDisburseRemarks(e.target.value)}
            />
          </form>
        )}
      </Modal>

      {/* Record Salary Advance Modal */}
      <Modal
        isOpen={Boolean(advanceTarget)}
        onClose={() => setAdvanceTarget(null)}
        title={`Record Salary Advance • ${advanceTarget?.teacherName}`}
        maxWidth="500px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setAdvanceTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRecordAdvance} disabled={actionLoading}>
              {actionLoading ? "Recording..." : "Record & Disburse Advance"}
            </Button>
          </div>
        }
      >
        {advanceTarget && (
          <form onSubmit={handleRecordAdvance} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div>Faculty: <strong>{advanceTarget.teacherName}</strong> ({advanceTarget.employeeId})</div>
              <div>Net Monthly Take-Home: <strong>Rs. {advanceTarget.netSalary.toLocaleString()}</strong></div>
              <div style={{ color: "var(--color-text-muted)", marginTop: "2px" }}>
                Current Remaining Balance: Rs. {(advanceTarget.remainingSalary ?? advanceTarget.netSalary).toLocaleString()}
              </div>
            </div>

            <Input
              label="Advance Amount Requested (PKR)"
              type="number"
              value={advanceAmountInput.toString()}
              onChange={(e) => setAdvanceAmountInput(parseInt(e.target.value, 10) || 0)}
              required
            />

            <Input
              label="Advance Disbursement Date"
              type="date"
              value={advanceDateInput}
              onChange={(e) => setAdvanceDateInput(e.target.value)}
              required
            />

            <Input
              label="Advance Reason / Notes"
              placeholder="e.g. Medical emergency advance requested by faculty"
              value={advanceRemarksInput}
              onChange={(e) => setAdvanceRemarksInput(e.target.value)}
            />
          </form>
        )}
      </Modal>

      {/* Adjust Salary Modal */}
      <Modal
        isOpen={Boolean(adjustTarget)}
        onClose={() => setAdjustTarget(null)}
        title={`Adjust Allowances & Penalties • ${adjustTarget?.teacherName}`}
        maxWidth="500px"
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setAdjustTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveAdjustment} disabled={actionLoading}>
              Save Adjustments
            </Button>
          </div>
        }
      >
        {adjustTarget && (
          <form onSubmit={handleSaveAdjustment} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <Input
              label="Special Bonus (PKR)"
              type="number"
              value={adjustBonus.toString()}
              onChange={(e) => setAdjustBonus(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Income Tax Deduction (PKR)"
              type="number"
              value={adjustTax.toString()}
              onChange={(e) => setAdjustTax(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Absence Penalty (PKR)"
              type="number"
              value={adjustAbsence.toString()}
              onChange={(e) => setAdjustAbsence(parseInt(e.target.value, 10) || 0)}
            />
            <Input
              label="Adjustment Remarks"
              placeholder="e.g. Adjusted penalty for approved medical cover"
              value={adjustRemarks}
              onChange={(e) => setAdjustRemarks(e.target.value)}
            />
          </form>
        )}
      </Modal>

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
        <form onSubmit={handleGeneratePayroll} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
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
        </form>
      </Modal>
    </div>
  );
};

export default SalariesPage;
