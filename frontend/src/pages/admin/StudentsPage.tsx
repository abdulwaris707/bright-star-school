import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import StudentIdCardModal, { StudentIdCardData } from "../../components/StudentIdCardModal";
import ReportCardModal, { ReportCardData } from "../../components/ReportCardModal";
import api from "../../lib/api";

interface Student {
  id: number;
  rollNo: string;
  fullName: string;
  classId: number;
  className: string;
  section: string;
  parentName: string;
  phone: string;
  address: string;
  bFormNo?: string;
  fatherCnic?: string;
  bloodGroup?: string;
  concessionType?: string;
  status: "active" | "inactive";
  admissionDate: string;
}

export const StudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [transferTarget, setTransferTarget] = useState<Student | null>(null);
  const [allClasses, setAllClasses] = useState<{ id: number; name: string; section: string }[]>([]);
  const [targetClassId, setTargetClassId] = useState<number>(0);
  const [transferReason, setTransferReason] = useState<string>("");
  const [idCardTarget, setIdCardTarget] = useState<StudentIdCardData | null>(null);
  const [reportCardTarget, setReportCardTarget] = useState<ReportCardData | null>(null);
  const [historyTarget, setHistoryTarget] = useState<Student | null>(null);
  const [classSearchText, setClassSearchText] = useState<string>("");

  // New Student Form State
  const [formData, setFormData] = useState({
    rollNo: "",
    fullName: "",
    className: "Class 10 - Blue",
    section: "Blue",
    parentName: "",
    fatherCnic: "",
    bFormNo: "",
    bloodGroup: "O+",
    phone: "",
    address: "",
    concessionType: "Regular",
  });

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await api.get<Student[]>("/students", {
        params: {
          query: search || undefined,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
      });
      setStudents(data);
    } catch (err) {
      console.error("Error loading students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [search, statusFilter]);

  const openAddModal = () => {
    setEditingStudent(null);
    const initialClass = allClasses.length > 0 ? `${allClasses[0].name} (${allClasses[0].section})` : "Class 10 (Blue)";
    setClassSearchText(initialClass);
    setFormData({
      rollNo: `BS-2026-${Math.floor(100 + Math.random() * 900)}`,
      fullName: "",
      className: allClasses.length > 0 ? allClasses[0].name : "Class 10 - Blue",
      section: allClasses.length > 0 ? allClasses[0].section : "Blue",
      parentName: "",
      fatherCnic: "",
      bFormNo: "",
      bloodGroup: "O+",
      phone: "",
      address: "",
      concessionType: "Regular",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (student: Student) => {
    setEditingStudent(student);
    setClassSearchText(`${student.className} (${student.section})`);
    setFormData({
      rollNo: student.rollNo,
      fullName: student.fullName,
      className: student.className,
      section: student.section,
      parentName: student.parentName,
      fatherCnic: student.fatherCnic || "",
      bFormNo: student.bFormNo || "",
      bloodGroup: student.bloodGroup || "O+",
      phone: student.phone,
      address: student.address || "",
      concessionType: student.concessionType || "Regular",
    });
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent.id}`, formData);
      } else {
        await api.post("/students", {
          ...formData,
          status: "active",
          admissionDate: new Date().toISOString().split("T")[0],
        });
      }
      setIsAddModalOpen(false);
      setEditingStudent(null);
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to save student record");
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to delete student record");
    }
  };

  const loadClassesList = async () => {
    try {
      const cls = await api.get<{ id: number; name: string; section: string }[]>("/classes");
      setAllClasses(cls);
    } catch {}
  };

  useEffect(() => {
    loadClassesList();
  }, []);

  const openTransferModal = (student: Student) => {
    setTransferTarget(student);
    setTargetClassId(allClasses.find((c) => c.id !== student.classId)?.id || 0);
    setTransferReason("");
  };

  const handleToggleStatus = async (student: Student) => {
    const nextStatus = student.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/students/${student.id}`, { status: nextStatus });
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to update status");
    }
  };

  const handleTransferStudent = async () => {
    if (!transferTarget || !targetClassId) return;
    try {
      await api.post(`/students/${transferTarget.id}/transfer`, {
        targetClassId,
        reason: transferReason || "Administrative section transfer",
      });
      setTransferTarget(null);
      loadStudents();
    } catch (err: any) {
      alert(err.message || "Failed to transfer student.");
    }
  };

  const handleViewReportCard = async (student: Student) => {
    try {
      const data = await api.get<ReportCardData>(`/marks/report-card/${student.id}`);
      setReportCardTarget(data);
    } catch (err: any) {
      alert(err.message || "No examination marks found for this student.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Information System (SIS)</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Admissions, B-Form &amp; CNIC registry, ID cards, and report cards
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          Enroll New Student
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="panel-card"
        style={{
          display: "flex",
          gap: "var(--space-12)",
          alignItems: "flex-end",
          flexWrap: "wrap",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
        }}
      >
        <div style={{ flex: 1, minWidth: "220px" }}>
          <Input
            label="Search Student Record"
            placeholder="Search by name, roll no, father name, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ width: "160px" }}>
          <Select
            label="Enrollment Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active Admissions" },
              { value: "inactive", label: "Inactive / Struck-Off" },
            ]}
          />
        </div>
      </div>

      {/* Student Records Table */}
      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "rollNo",
              header: "Roll No",
              render: (row) => <code>{row.rollNo}</code>,
            },
            {
              key: "fullName",
              header: "Student Full Name",
              render: (row) => <strong>{row.fullName}</strong>,
            },
            { key: "className", header: "Class & Section" },
            { key: "parentName", header: "Father / Guardian" },
            { key: "phone", header: "Emergency Phone" },
            {
              key: "status",
              header: "Status",
              render: (row) => (
                <Badge variant={row.status === "active" ? "active" : "inactive"}>
                  {row.status === "active" ? "Active" : "Inactive"}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions & Documents",
              render: (row) => (
                <div style={{ display: "flex", gap: "6px", alignItems: "center", whiteSpace: "nowrap" }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleViewReportCard(row)}
                    title="View official examination report card"
                  >
                    DMC / Report
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setIdCardTarget({
                        id: row.id,
                        rollNo: row.rollNo,
                        fullName: row.fullName,
                        className: row.className,
                        section: row.section,
                        parentName: row.parentName,
                        phone: row.phone,
                        bloodGroup: row.bloodGroup,
                        bFormNo: row.bFormNo,
                      })
                    }
                    title="Generate printable student ID card"
                  >
                    ID Card
                  </Button>

                  {/* Actions Dropdown for secondary management */}
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <select
                      aria-label="Student Actions"
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
                        if (val === "history") setHistoryTarget(row);
                        else if (val === "edit") openEditModal(row);
                        else if (val === "transfer") openTransferModal(row);
                        else if (val === "toggle") handleToggleStatus(row);
                        else if (val === "delete") setDeleteTarget(row);
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>More ▾</option>
                      <option value="history">Lifelong History &amp; Dossier</option>
                      <option value="edit">Edit Student Profile</option>
                      <option value="transfer">Transfer Class Section</option>
                      <option value="toggle">
                        {row.status === "active" ? "Mark Inactive" : "Mark Active"}
                      </option>
                      <option value="delete">Delete Record</option>
                    </select>
                  </div>
                </div>
              ),
            },
          ]}
          data={students}
          pageSize={8}
          emptyMessage={loading ? "Loading student directory..." : "No student records found."}
        />
      </div>

      {/* ID Card Modal */}
      <StudentIdCardModal
        isOpen={Boolean(idCardTarget)}
        onClose={() => setIdCardTarget(null)}
        student={idCardTarget}
      />

      {/* Report Card Modal */}
      <ReportCardModal
        isOpen={Boolean(reportCardTarget)}
        onClose={() => setReportCardTarget(null)}
        report={reportCardTarget}
      />

      {/* Student Lifelong History & Dossier Modal */}
      <Modal
        isOpen={Boolean(historyTarget)}
        onClose={() => setHistoryTarget(null)}
        title={`Student Lifelong History Dossier • ${historyTarget?.fullName}`}
        maxWidth="680px"
        footer={
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
            <span style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
              All records are stored permanently in the institution database unless deleted.
            </span>
            <Button variant="secondary" size="sm" onClick={() => setHistoryTarget(null)}>
              Close Dossier
            </Button>
          </div>
        }
      >
        {historyTarget && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "14px 18px",
                backgroundColor: "var(--color-bg-subtle)",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--color-border)",
                fontSize: "12px",
              }}
            >
              <div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Full Name:</span> <strong>{historyTarget.fullName}</strong></div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Roll Number:</span> <code>{historyTarget.rollNo}</code>
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Admission Date:</span> {historyTarget.admissionDate || "2024-03-15"}
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Blood Group:</span> {historyTarget.bloodGroup || "O+"}
                </div>
              </div>
              <div>
                <div><span style={{ color: "var(--color-text-muted)" }}>Class &amp; Section:</span> <strong>{historyTarget.className}</strong> ({historyTarget.section})</div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Father Name:</span> {historyTarget.parentName}
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>Father CNIC:</span> {historyTarget.fatherCnic || "35202-*******-1"}
                </div>
                <div style={{ marginTop: "4px" }}>
                  <span style={{ color: "var(--color-text-muted)" }}>B-Form Number:</span> {historyTarget.bFormNo || "35202-*******-1"}
                </div>
              </div>
            </div>

            <div style={{ border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", padding: "14px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, marginBottom: "8px" }}>Academic Standing &amp; Conduct History</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", fontSize: "12px" }}>
                <div style={{ padding: "8px", background: "var(--color-bg-subtle)", borderRadius: "4px" }}>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Current Status</div>
                  <strong style={{ color: historyTarget.status === "active" ? "#16a34a" : "var(--color-danger)" }}>
                    {historyTarget.status.toUpperCase()}
                  </strong>
                </div>
                <div style={{ padding: "8px", background: "var(--color-bg-subtle)", borderRadius: "4px" }}>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Concession Category</div>
                  <strong>{historyTarget.concessionType || "Regular Fee"}</strong>
                </div>
                <div style={{ padding: "8px", background: "var(--color-bg-subtle)", borderRadius: "4px" }}>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Registered Phone</div>
                  <strong>{historyTarget.phone}</strong>
                </div>
                <div style={{ padding: "8px", background: "var(--color-bg-subtle)", borderRadius: "4px" }}>
                  <div style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Residential Address</div>
                  <strong style={{ fontSize: "11px" }}>{historyTarget.address || "Lahore, Pakistan"}</strong>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setHistoryTarget(null);
                  handleViewReportCard(historyTarget);
                }}
              >
                View Detailed Marks &amp; Report Card &rarr;
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title={editingStudent ? `Edit Student: ${editingStudent.fullName}` : "Student Admission & Enrollment Form"}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingStudent(null);
        }}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-8)", width: "100%" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setIsAddModalOpen(false);
                setEditingStudent(null);
              }}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveStudent}>
              {editingStudent ? "Save Changes" : "Enroll Student"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveStudent}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Student Full Name"
              placeholder="e.g. Bilal Ahmed"
              required
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
            <Input
              label="Roll Number (Assigned)"
              placeholder="e.g. BS-2024-106"
              value={formData.rollNo}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 0.6fr", gap: "var(--space-12)" }}>
            <div>
              <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 500, marginBottom: "var(--space-4)" }}>
                Class Selection (Type or Choose from List)
              </label>
              <div style={{ display: "flex", gap: "4px" }}>
                <input
                  list="classes-datalist"
                  placeholder="Type class name or select from list..."
                  value={classSearchText}
                  onChange={(e) => {
                    const val = e.target.value;
                    setClassSearchText(val);
                    const matched = allClasses.find(
                      (c) =>
                        `${c.name} (${c.section})`.toLowerCase() === val.toLowerCase() ||
                        c.name.toLowerCase() === val.toLowerCase()
                    );
                    if (matched) {
                      setFormData({
                        ...formData,
                        className: matched.name,
                        section: matched.section,
                      });
                    } else {
                      setFormData({ ...formData, className: val });
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: "var(--space-8) var(--space-12)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg)",
                    color: "var(--color-text)",
                    fontSize: "var(--font-size-sm)",
                  }}
                />
                <select
                  aria-label="Available classes dropdown"
                  style={{
                    padding: "var(--space-8)",
                    borderRadius: "var(--radius)",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-bg-subtle)",
                    color: "var(--color-text)",
                    cursor: "pointer",
                  }}
                  value=""
                  onChange={(e) => {
                    const selectedId = parseInt(e.target.value, 10);
                    const matched = allClasses.find((c) => c.id === selectedId);
                    if (matched) {
                      setClassSearchText(`${matched.name} (${matched.section})`);
                      setFormData({
                        ...formData,
                        className: matched.name,
                        section: matched.section,
                      });
                    }
                    e.target.value = "";
                  }}
                  title="Click to pick a class directly"
                >
                  <option value="" disabled>▾ All Classes</option>
                  {allClasses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.section})
                    </option>
                  ))}
                </select>
              </div>
              <datalist id="classes-datalist">
                {allClasses.map((c) => (
                  <option key={c.id} value={`${c.name} (${c.section})`} />
                ))}
              </datalist>
            </div>

            <Select
              label="Assigned Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              options={[
                { value: "Blue", label: "Blue Section" },
                { value: "Green", label: "Green Section" },
                { value: "Yellow", label: "Yellow Section" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Father / Guardian Name"
              required
              value={formData.parentName}
              onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
            />
            <Input
              label="Father CNIC (xxxxx-xxxxxxx-x)"
              placeholder="35202-1234567-1"
              value={formData.fatherCnic}
              onChange={(e) => setFormData({ ...formData, fatherCnic: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Student B-Form Number"
              placeholder="35202-9876543-1"
              value={formData.bFormNo}
              onChange={(e) => setFormData({ ...formData, bFormNo: e.target.value })}
            />
            <Select
              label="Blood Group"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
              options={[
                { value: "A+", label: "A+" },
                { value: "A-", label: "A-" },
                { value: "B+", label: "B+" },
                { value: "B-", label: "B-" },
                { value: "O+", label: "O+" },
                { value: "O-", label: "O-" },
                { value: "AB+", label: "AB+" },
                { value: "AB-", label: "AB-" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Contact Mobile / WhatsApp"
              required
              placeholder="0300-1234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Select
              label="Fee Concession / Category"
              value={formData.concessionType}
              onChange={(e) => setFormData({ ...formData, concessionType: e.target.value })}
              options={[
                { value: "Regular", label: "Standard / Regular Fee" },
                { value: "Sibling Discount", label: "Sibling Discount (25%)" },
                { value: "Staff Child", label: "Faculty / Staff Child (50%)" },
                { value: "Merit Scholarship", label: "Merit Scholarship (100%)" },
              ]}
            />
          </div>

          <Input
            label="Residential Address"
            placeholder="House #, Street, City"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
        </form>
      </Modal>

      {/* Transfer Class Modal */}
      <Modal
        isOpen={Boolean(transferTarget)}
        title="Transfer Student Across Classes"
        onClose={() => setTransferTarget(null)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-8)", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setTransferTarget(null)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleTransferStudent}>
              Confirm Transfer
            </Button>
          </div>
        }
      >
        {transferTarget && (
          <div>
            <p style={{ fontSize: "var(--font-size-sm)", marginBottom: "12px" }}>
              Transferring <strong>{transferTarget.fullName}</strong> ({transferTarget.rollNo}) from <strong>{transferTarget.className}</strong>.
            </p>

            <Select
              label="Select Target Class &amp; Section"
              value={targetClassId.toString()}
              onChange={(e) => setTargetClassId(parseInt(e.target.value, 10))}
              options={allClasses
                .filter((c) => c.id !== transferTarget.classId)
                .map((c) => ({ value: c.id.toString(), label: `${c.name} (${c.section})` }))}
            />

            <div style={{ marginTop: "12px" }}>
              <Input
                label="Reason / Notes for Transfer"
                placeholder="e.g. Parental request, section balancing"
                value={transferReason}
                onChange={(e) => setTransferReason(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        title="Confirm Student Discharge"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-8)", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteStudent}>
              Discharge Student
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: "var(--font-size-sm)" }}>
          Are you sure you want to remove <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.rollNo})? This will archive all associated attendance and marks.
        </p>
      </Modal>
    </div>
  );
};

export default StudentsPage;
