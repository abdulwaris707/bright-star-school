import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch, getSavedUser } from "../../lib/api";

interface Homework {
  id: number;
  title: string;
  description: string;
  classId: number;
  className: string;
  section: string;
  subjectId: number;
  subjectName: string;
  assignedByTeacherId: number;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  attachmentUrl?: string;
  status: "active" | "past_due";
  createdAt: string;
}

interface TeacherAssignment {
  id: number;
  teacherId: number;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
}

export const HomeworkPage: React.FC = () => {
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingHomework, setEditingHomework] = useState<Homework | null>(null);

  // Form states
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedAssignmentIndex, setSelectedAssignmentIndex] = useState<number>(0);
  const [dueDate, setDueDate] = useState<string>("");
  const [maxMarks, setMaxMarks] = useState<number>(20);
  const [formError, setFormError] = useState<string>("");

  const currentUser = getSavedUser();

  const loadData = async () => {
    try {
      setLoading(true);
      const isTeacher = currentUser?.role === "teacher";
      const teacherParam = isTeacher && currentUser?.id ? `?teacherId=${currentUser.id}` : "";

      const [hwRes, assignRes] = await Promise.all([
        apiFetch<Homework[]>(`/homework${teacherParam}`),
        apiFetch<TeacherAssignment[]>(
          `/academic-mapping/teacher-assignments${isTeacher && currentUser?.id ? `?teacherId=${currentUser.id}` : ""}`
        ),
      ]);
      setHomeworkList(hwRes);
      setAssignments(assignRes);
    } catch (err: any) {
      console.error("Failed to load homework", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingHomework(null);
    setTitle("");
    setDescription("");
    setSelectedAssignmentIndex(0);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 2);
    setDueDate(tomorrow.toISOString().split("T")[0]);
    setMaxMarks(20);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (hw: Homework) => {
    setEditingHomework(hw);
    setTitle(hw.title);
    setDescription(hw.description);
    setDueDate(hw.dueDate);
    setMaxMarks(hw.maxMarks);
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dueDate) {
      setFormError("Title, description, and submission deadline are required.");
      return;
    }

    try {
      if (editingHomework) {
        await apiFetch(`/homework/${editingHomework.id}`, {
          method: "PUT",
          body: { title, description, dueDate, maxMarks },
        });
      } else {
        const assign = assignments[selectedAssignmentIndex];
        if (!assign) {
          setFormError("No assigned class/subject selected.");
          return;
        }

        await apiFetch("/homework", {
          method: "POST",
          body: {
            title,
            description,
            classId: assign.classId,
            className: assign.className,
            subjectId: assign.subjectId,
            subjectName: assign.subjectName,
            dueDate,
            maxMarks,
          },
        });
      }
      setModalOpen(false);
      loadData();
    } catch (err: any) {
      setFormError(err.message || "Failed to save homework assignment.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this homework task?")) return;
    try {
      await apiFetch(`/homework/${id}`, { method: "DELETE" });
      loadData();
    } catch (err: any) {
      alert(err.message || "Failed to delete homework.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Homework &amp; Task Assignment</h1>
          <p className="page-subtitle">
            Curriculum task management strictly scoped to your assigned academic classes and subjects
          </p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          + Assign New Homework
        </Button>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "title",
              header: "Assignment Title",
              render: (h: Homework) => (
                <div>
                  <strong>{h.title}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px", maxWidth: "340px" }}>
                    {h.description}
                  </div>
                </div>
              ),
            },
            {
              key: "classSubject",
              header: "Class & Subject",
              render: (h: Homework) => (
                <div>
                  <div>{h.className}</div>
                  <Badge variant="neutral">{h.subjectName}</Badge>
                </div>
              ),
            },
            {
              key: "dueDate",
              header: "Submission Due Date",
              render: (h: Homework) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{h.dueDate}</div>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>
                    Assigned: {h.assignedDate}
                  </div>
                </div>
              ),
            },
            {
              key: "maxMarks",
              header: "Max Marks",
              render: (h: Homework) => `${h.maxMarks} Marks`,
            },
            {
              key: "status",
              header: "Status",
              render: (h: Homework) => (
                <Badge variant={h.status === "active" ? "active" : "inactive"}>
                  {h.status.toUpperCase().replace("_", " ")}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              render: (h: Homework) => (
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button variant="secondary" size="sm" onClick={() => openEditModal(h)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDelete(h.id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={homeworkList}
          keyExtractor={(h) => h.id}
          emptyMessage={loading ? "Loading homework assignments..." : "No homework assigned yet."}
        />
      </div>

      {/* Add / Edit Homework Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHomework ? "Edit Homework Assignment" : "Assign New Homework"}
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Homework
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="form-layout">
          {formError && <div className="form-error">{formError}</div>}

          {!editingHomework && (
            <Select
              label="Assigned Class &amp; Subject (From Your Teaching Mapping)"
              value={selectedAssignmentIndex.toString()}
              onChange={(e) => setSelectedAssignmentIndex(parseInt(e.target.value, 10))}
              options={
                assignments.length > 0
                  ? assignments.map((a, idx) => ({
                      value: idx.toString(),
                      label: `${a.className} &bull; ${a.subjectName}`,
                    }))
                  : [{ value: "0", label: "No assigned classes found" }]
              }
            />
          )}

          <Input
            label="Assignment Title / Chapter Topic"
            placeholder="e.g. Chapter 4: Quadratic Equations - Review Exercise"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <Input
            label="Instructions &amp; Problem Details"
            placeholder="Specify questions, page numbers, or submission guidelines..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Input
              label="Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <Input
              label="Maximum Marks / Weightage"
              type="number"
              value={maxMarks.toString()}
              onChange={(e) => setMaxMarks(parseInt(e.target.value, 10) || 10)}
              min="5"
              max="100"
              required
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default HomeworkPage;
