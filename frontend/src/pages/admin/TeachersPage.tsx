import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import api from "../../lib/api";

interface Teacher {
  id: number;
  employeeId: string;
  fullName: string;
  designation?: string;
  subjectSpecialization: string;
  qualification: string;
  phone: string;
  email: string;
  status: "active" | "inactive";
}

export const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState({
    employeeId: "",
    fullName: "",
    designation: "Senior Subject Teacher",
    subjectSpecialization: "",
    qualification: "",
    phone: "",
    email: "",
    status: "active" as "active" | "inactive",
  });

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await api.get<Teacher[]>("/teachers", {
        params: { query: search || undefined },
      });
      setTeachers(data);
    } catch (err) {
      console.error("Error loading teachers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, [search]);

  const openAddModal = () => {
    setEditingTeacher(null);
    setFormData({
      employeeId: `TCH-${Math.floor(100 + Math.random() * 900)}`,
      fullName: "",
      designation: "Senior Subject Teacher",
      subjectSpecialization: "",
      qualification: "M.Sc. / M.Phil",
      phone: "",
      email: "",
      status: "active",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (t: Teacher) => {
    setEditingTeacher(t);
    setFormData({
      employeeId: t.employeeId,
      fullName: t.fullName,
      designation: t.designation || "Senior Teacher",
      subjectSpecialization: t.subjectSpecialization,
      qualification: t.qualification,
      phone: t.phone,
      email: t.email,
      status: t.status,
    });
    setIsAddModalOpen(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await api.put(`/teachers/${editingTeacher.id}`, formData);
      } else {
        await api.post("/teachers", formData);
      }
      setIsAddModalOpen(false);
      loadTeachers();
    } catch (err: any) {
      alert(err.message || "Failed to save teacher record.");
    }
  };

  const handleToggleStatus = async (t: Teacher) => {
    const nextStatus = t.status === "active" ? "inactive" : "active";
    try {
      await api.put(`/teachers/${t.id}`, { status: nextStatus });
      loadTeachers();
    } catch (err: any) {
      alert(err.message || "Failed to update status.");
    }
  };

  const handleDeleteTeacher = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/teachers/${deleteTarget.id}`);
      setDeleteTarget(null);
      loadTeachers();
    } catch (err: any) {
      alert(err.message || "Failed to delete teacher");
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    return (
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      t.subjectSpecialization.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty &amp; Staff Directory</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Academic faculty profiles, designations, teaching assignments, and contact registry
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={openAddModal}>
          + Register New Faculty Member
        </Button>
      </div>

      <div
        className="panel-card"
        style={{
          display: "flex",
          gap: "var(--space-12)",
          alignItems: "flex-end",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "220px" }}>
          <Input
            label="Search Faculty Member"
            placeholder="Search by name, employee ID, or subject specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ width: "160px" }}>
          <Select
            label="Faculty Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: "all", label: "All Faculty" },
              { value: "active", label: "Active Faculty" },
              { value: "inactive", label: "Inactive / On Leave" },
            ]}
          />
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "employeeId",
              header: "Emp ID",
              render: (row: Teacher) => <code style={{ fontWeight: 600 }}>{row.employeeId}</code>,
            },
            {
              key: "fullName",
              header: "Faculty Name & Designation",
              render: (row: Teacher) => (
                <div>
                  <strong>{row.fullName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {row.designation || "Senior Faculty"}
                  </div>
                </div>
              ),
            },
            {
              key: "subjectSpecialization",
              header: "Subject Discipline",
              render: (row: Teacher) => (
                <Badge variant="neutral">{row.subjectSpecialization}</Badge>
              ),
            },
            { key: "qualification", header: "Qualification" },
            {
              key: "contact",
              header: "Contact Info",
              render: (row: Teacher) => (
                <div>
                  <div>{row.phone}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{row.email}</div>
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (row: Teacher) => (
                <Badge variant={row.status === "active" ? "active" : "inactive"}>
                  {row.status.toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (row: Teacher) => (
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(row)}>
                    Edit
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => handleToggleStatus(row)}>
                    {row.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => setDeleteTarget(row)}>
                    Remove
                  </Button>
                </div>
              ),
            },
          ]}
          data={filteredTeachers}
          pageSize={8}
          emptyMessage={loading ? "Loading faculty records..." : "No faculty members found."}
        />
      </div>

      {/* Add / Edit Teacher Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title={editingTeacher ? `Edit Faculty: ${editingTeacher.fullName}` : "Register New Faculty Member"}
        onClose={() => setIsAddModalOpen(false)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-8)", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveTeacher}>
              {editingTeacher ? "Save Changes" : "Register Teacher"}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveTeacher}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Employee ID"
              required
              placeholder="e.g. TCH-005"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
            />
            <Input
              label="Full Name"
              required
              placeholder="e.g. Prof. Tariq Aziz"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Designation / Academic Rank"
              required
              placeholder="e.g. Senior Subject Specialist, Assistant Professor"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
            <Input
              label="Subject Specialization"
              required
              placeholder="e.g. Physics, Mathematics, Biology"
              value={formData.subjectSpecialization}
              onChange={(e) => setFormData({ ...formData, subjectSpecialization: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Academic Qualification"
              required
              placeholder="e.g. M.Sc. Physics (Punjab University)"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            />
            <Select
              label="Employment Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
              options={[
                { value: "active", label: "Active Duty" },
                { value: "inactive", label: "Inactive / Long Leave" },
              ]}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Official Contact Phone"
              required
              placeholder="0300-1234567"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <Input
              label="Institutional Email"
              type="email"
              required
              placeholder="teacher@brightstar.edu.pk"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        title="Confirm Faculty Removal"
        onClose={() => setDeleteTarget(null)}
        footer={
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-8)", width: "100%" }}>
            <Button variant="secondary" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteTeacher}>
              Confirm Removal
            </Button>
          </div>
        }
      >
        <p style={{ fontSize: "var(--font-size-sm)" }}>
          Are you sure you want to remove <strong>{deleteTarget?.fullName}</strong> ({deleteTarget?.employeeId})? This will soft-delete their profile while preserving historical timetable and attendance logs.
        </p>
      </Modal>
    </div>
  );
};

export default TeachersPage;
