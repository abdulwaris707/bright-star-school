import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch, getSavedUser } from "../../lib/api";

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
  academicNotes?: string;
  status: "active" | "inactive";
  admissionDate: string;
}

interface SchoolClass {
  id: number;
  name: string;
  section: string;
}

export const TeacherStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  // Edit / Notes Modal
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [academicNotes, setAcademicNotes] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [parentName, setParentName] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const currentUser = getSavedUser();

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsData, classesData] = await Promise.all([
        apiFetch<Student[]>("/students"),
        apiFetch<SchoolClass[]>("/classes"),
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err: any) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openEditNotesModal = (student: Student) => {
    setEditingStudent(student);
    setAcademicNotes(student.academicNotes || "");
    setPhone(student.phone);
    setParentName(student.parentName);
    setModalOpen(true);
  };

  const handleSaveNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;

    try {
      await apiFetch(`/students/${editingStudent.id}`, {
        method: "PUT",
        body: {
          academicNotes,
          phone,
          parentName,
        },
      });
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to update student academic record.");
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClassId === "all" || s.classId.toString() === selectedClassId;
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase());
    return matchesClass && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Classroom Student Directory</h1>
          <p className="page-subtitle">
            Academic profile inspection, student conduct remarks, and guardian communications
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          gap: "var(--space-12)",
          marginBottom: "var(--space-16)",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div style={{ width: "240px" }}>
          <Select
            label="Filter by Class Section"
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            options={[
              { value: "all", label: "All Assigned Classes" },
              ...classes.map((c) => ({ value: c.id.toString(), label: `${c.name} (${c.section})` })),
            ]}
          />
        </div>

        <div style={{ flex: 1, minWidth: "220px" }}>
          <Input
            label="Search Student"
            placeholder="Search by student name, roll number, or guardian..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "rollNo",
              header: "Roll No",
              render: (s: Student) => <code>{s.rollNo}</code>,
            },
            {
              key: "fullName",
              header: "Student Name",
              render: (s: Student) => <strong>{s.fullName}</strong>,
            },
            {
              key: "class",
              header: "Class & Section",
              render: (s: Student) => `${s.className} (${s.section})`,
            },
            {
              key: "parent",
              header: "Parent / Phone",
              render: (s: Student) => (
                <div>
                  <div>{s.parentName}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>{s.phone}</div>
                </div>
              ),
            },
            {
              key: "notes",
              header: "Academic & Conduct Remarks",
              render: (s: Student) => (
                <div style={{ fontSize: "12px", maxWidth: "280px", color: "var(--color-text)" }}>
                  {s.academicNotes || <span style={{ color: "var(--color-text-muted)" }}>No remarks recorded</span>}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (s: Student) => (
                <Badge variant={s.status === "active" ? "active" : "inactive"}>
                  {s.status.toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (s: Student) => (
                <Button variant="secondary" size="sm" onClick={() => openEditNotesModal(s)}>
                  Update Remarks
                </Button>
              ),
            },
          ]}
          data={filteredStudents}
          keyExtractor={(s) => s.id}
          pageSize={10}
          emptyMessage={loading ? "Loading student records..." : "No students found."}
        />
      </div>

      {/* Edit Remarks Modal */}
      {editingStudent && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={`Academic Profile: ${editingStudent.fullName} (${editingStudent.rollNo})`}
          footer={
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveNotes}>
                Save Profile Updates
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveNotes} className="form-layout">
            <div style={{ padding: "10px", backgroundColor: "var(--color-bg-sidebar)", borderRadius: "var(--radius-md)", marginBottom: "12px", fontSize: "12px" }}>
              <div><strong>Class:</strong> {editingStudent.className}</div>
              <div><strong>Admission Date:</strong> {editingStudent.admissionDate}</div>
            </div>

            <Input
              label="Father / Guardian Name"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
              required
            />

            <Input
              label="Guardian Contact Phone / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="Teacher Academic &amp; Conduct Remarks"
              placeholder="e.g. Excellent participation in laboratory experiments; needs improvement in algebraic trigonometry."
              value={academicNotes}
              onChange={(e) => setAcademicNotes(e.target.value)}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherStudentsPage;
