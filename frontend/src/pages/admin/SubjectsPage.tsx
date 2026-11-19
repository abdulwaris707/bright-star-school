import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch } from "../../lib/api";

interface Subject {
  id: number;
  name: string;
  code: string;
  description: string;
  type: "compulsory" | "elective";
  periodsPerWeek: number;
}

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>("");
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Form states
  const [name, setName] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [type, setType] = useState<"compulsory" | "elective">("compulsory");
  const [periodsPerWeek, setPeriodsPerWeek] = useState<number>(5);
  const [description, setDescription] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Subject[]>("/subjects");
      setSubjects(data);
    } catch (err: any) {
      setError(err.message || "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const openCreateModal = () => {
    setEditingSubject(null);
    setName("");
    setCode("");
    setType("compulsory");
    setPeriodsPerWeek(5);
    setDescription("");
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setName(sub.name);
    setCode(sub.code);
    setType(sub.type);
    setPeriodsPerWeek(sub.periodsPerWeek);
    setDescription(sub.description);
    setError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !code) {
      setError("Subject name and code are required.");
      return;
    }

    try {
      if (editingSubject) {
        await apiFetch(`/subjects/${editingSubject.id}`, {
          method: "PUT",
          body: { name, code, type, periodsPerWeek, description },
        });
      } else {
        await apiFetch("/subjects", {
          method: "POST",
          body: { name, code, type, periodsPerWeek, description },
        });
      }
      setModalOpen(false);
      loadSubjects();
    } catch (err: any) {
      setError(err.message || "Failed to save subject.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this subject? It will be soft-deleted safely.")) {
      return;
    }
    try {
      await apiFetch(`/subjects/${id}`, { method: "DELETE" });
      loadSubjects();
    } catch (err: any) {
      alert(err.message || "Failed to delete subject.");
    }
  };

  const filteredSubjects = subjects.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Academic Subjects</h1>
          <p className="page-subtitle">Curriculum, syllabus classification, and weekly period allocation</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>
          + Add New Subject
        </Button>
      </div>

      <div className="filter-bar">
        <Input
          placeholder="Search by subject name or code..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <DataTable
        columns={[
          {
            key: "code",
            header: "Subject Code",
            render: (s: Subject) => <span className="font-mono">{s.code}</span>,
          },
          {
            key: "name",
            header: "Subject Name",
            render: (s: Subject) => <strong>{s.name}</strong>,
          },
          {
            key: "type",
            header: "Curriculum Type",
            render: (s: Subject) => (
              <Badge variant={s.type === "compulsory" ? "active" : "neutral"}>
                {s.type.toUpperCase()}
              </Badge>
            ),
          },
          {
            key: "periods",
            header: "Periods / Week",
            render: (s: Subject) => `${s.periodsPerWeek} Periods`,
          },
          {
            key: "description",
            header: "Description",
            render: (s: Subject) => s.description || "-",
          },
          {
            key: "actions",
            header: "Actions",
            render: (s: Subject) => (
              <div className="action-buttons">
                <Button variant="secondary" size="sm" onClick={() => openEditModal(s)}>
                  Edit
                </Button>
                <Button variant="danger" size="sm" onClick={() => handleDelete(s.id)}>
                  Delete
                </Button>
              </div>
            ),
          },
        ]}
        data={filteredSubjects}
        keyExtractor={(s) => s.id}
        emptyMessage={loading ? "Loading academic subjects..." : "No subjects found."}
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? "Edit Subject" : "Add Academic Subject"}
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave}>
              Save Subject
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} className="form-layout">
          {error && <div className="form-error">{error}</div>}

          <Input
            label="Subject Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Mathematics, Physics, Islamic Studies"
            required
          />

          <Input
            label="Subject Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. MTH-101, PHY-102"
            required
          />

          <Select
            label="Curriculum Classification"
            value={type}
            onChange={(e) => setType(e.target.value as "compulsory" | "elective")}
            options={[
              { value: "compulsory", label: "Compulsory" },
              { value: "elective", label: "Elective" },
            ]}
          />

          <Input
            label="Periods Per Week"
            type="number"
            value={periodsPerWeek.toString()}
            onChange={(e) => setPeriodsPerWeek(parseInt(e.target.value, 10) || 1)}
            min="1"
            max="15"
            required
          />

          <Input
            label="Description / Syllabus Scope"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional syllabus summary or board reference"
          />
        </form>
      </Modal>
    </div>
  );
};

export default SubjectsPage;
