import React, { useEffect, useState } from "react";
import DataTable from "../../components/ui/DataTable";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import api, { apiFetch } from "../../lib/api";

interface SchoolClass {
  id: number;
  name: string;
  section: string;
  gradeLevel?: number;
  roomNumber: string;
  capacity?: number;
  classTeacherId?: number;
  classTeacherName: string;
  studentCount: number;
}

interface Teacher {
  id: number;
  fullName: string;
  employeeId: string;
  subjectSpecialization?: string;
}

interface Subject {
  id: number;
  name: string;
  code: string;
}

interface ClassSubject {
  id: number;
  classId: number;
  subjectId: number;
  subjectName: string;
  subjectCode: string;
}

interface TeacherAssignment {
  id: number;
  teacherId: number;
  teacherName: string;
  classId: number;
  className: string;
  subjectId: number;
  subjectName: string;
  academicSession: string;
}

interface InchargeHistory {
  id: number;
  teacherName: string;
  academicSession: string;
  assignedByAdminName: string;
  assignedAt: string;
  status: "active" | "previous";
  reason?: string;
}

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Class Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    section: "",
    gradeLevel: 10,
    roomNumber: "",
    capacity: 40,
    classTeacherId: 1,
    studentCount: 35,
  });

  // Mapping & In-Charge Modal
  const [mappingClass, setMappingClass] = useState<SchoolClass | null>(null);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [classAssignments, setClassAssignments] = useState<TeacherAssignment[]>([]);
  const [inchargeHistory, setInchargeHistory] = useState<InchargeHistory[]>([]);

  // Sub-modal states for adding mapping
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(0);
  const [assignTeacherId, setAssignTeacherId] = useState<number>(0);
  const [assignSubjectId, setAssignSubjectId] = useState<number>(0);
  const [newInchargeTeacherId, setNewInchargeTeacherId] = useState<number>(0);
  const [inchargeReason, setInchargeReason] = useState<string>("");
  const [mappingTab, setMappingTab] = useState<"incharge" | "subjects" | "teachers">("incharge");

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [clsData, tchData, subData] = await Promise.all([
        api.get<SchoolClass[]>("/classes"),
        api.get<Teacher[]>("/teachers"),
        api.get<Subject[]>("/subjects"),
      ]);
      setClasses(clsData);
      setTeachers(tchData);
      setAllSubjects(subData);
    } catch (err) {
      console.error("Failed to load classes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const openMappingModal = async (c: SchoolClass) => {
    setMappingClass(c);
    setNewInchargeTeacherId(c.classTeacherId || (teachers[0]?.id || 1));
    setInchargeReason("");
    setMappingTab("incharge");
    await refreshMappingDetails(c.id);
  };

  const refreshMappingDetails = async (classId: number) => {
    try {
      const [subjectsRes, assignmentsRes, historyRes] = await Promise.all([
        apiFetch<ClassSubject[]>(`/classes/${classId}/subjects`),
        apiFetch<TeacherAssignment[]>(`/academic-mapping/teacher-assignments?classId=${classId}`),
        apiFetch<InchargeHistory[]>(`/classes/${classId}/incharge-history`),
      ]);
      setClassSubjects(subjectsRes);
      setClassAssignments(assignmentsRes);
      setInchargeHistory(historyRes);
    } catch (err) {
      console.error("Failed to refresh mapping details", err);
    }
  };

  const handleAddClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedTch = teachers.find((t) => t.id === formData.classTeacherId);
      await api.post("/classes", {
        ...formData,
        classTeacherName: selectedTch?.fullName || "Staff Faculty",
      });
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        section: "",
        gradeLevel: 10,
        roomNumber: "",
        capacity: 40,
        classTeacherId: teachers[0]?.id || 1,
        studentCount: 35,
      });
      loadInitialData();
    } catch (err: any) {
      alert(err.message || "Failed to add class");
    }
  };

  const handleDeleteClass = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this class section? It will be soft-deleted safely.")) return;
    try {
      await api.delete(`/classes/${id}`);
      loadInitialData();
    } catch (err: any) {
      alert(err.message || "Failed to delete class.");
    }
  };

  const handleAssignIncharge = async () => {
    if (!mappingClass || !newInchargeTeacherId) return;
    try {
      await api.post(`/classes/${mappingClass.id}/incharge`, {
        teacherId: newInchargeTeacherId,
        reason: inchargeReason || "Academic In-Charge Reassignment",
        academicSession: "2026-2027",
      });
      alert("Class Teacher In-Charge updated successfully!");
      refreshMappingDetails(mappingClass.id);
      loadInitialData();
    } catch (err: any) {
      alert(err.message || "Failed to update Class In-Charge.");
    }
  };

  const handleAddSubjectToClass = async () => {
    if (!mappingClass || !selectedSubjectId) return;
    try {
      await api.post(`/classes/${mappingClass.id}/subjects`, { subjectId: selectedSubjectId });
      refreshMappingDetails(mappingClass.id);
    } catch (err: any) {
      alert(err.message || "Failed to map subject.");
    }
  };

  const handleRemoveSubjectFromClass = async (subjectId: number) => {
    if (!mappingClass) return;
    try {
      await api.delete(`/classes/${mappingClass.id}/subjects/${subjectId}`);
      refreshMappingDetails(mappingClass.id);
    } catch (err: any) {
      alert(err.message || "Failed to remove subject.");
    }
  };

  const handleAssignTeacherToSubject = async () => {
    if (!mappingClass || !assignTeacherId || !assignSubjectId) return;
    try {
      await api.post("/academic-mapping/teacher-assignments", {
        teacherId: assignTeacherId,
        classId: mappingClass.id,
        subjectId: assignSubjectId,
        academicSession: "2026-2027",
      });
      refreshMappingDetails(mappingClass.id);
    } catch (err: any) {
      alert(err.message || "Failed to assign teacher.");
    }
  };

  const handleRemoveTeacherAssignment = async (assignmentId: number) => {
    if (!mappingClass) return;
    try {
      await api.delete(`/academic-mapping/teacher-assignments/${assignmentId}`);
      refreshMappingDetails(mappingClass.id);
    } catch (err: any) {
      alert(err.message || "Failed to remove teacher assignment.");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Classes &amp; Academic Mapping</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Academic rooms, grade sections, Class In-Charge designation, and subject-teacher mapping
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          + Create Class Section
        </Button>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "name",
              header: "Grade / Section",
              render: (row: SchoolClass) => (
                <div>
                  <strong>{row.name}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Section {row.section} &bull; Grade {row.gradeLevel || 10}
                  </div>
                </div>
              ),
            },
            { key: "roomNumber", header: "Assigned Room" },
            {
              key: "capacity",
              header: "Capacity",
              render: (row: SchoolClass) => `${row.studentCount} / ${row.capacity || 40} Students`,
            },
            {
              key: "classTeacherName",
              header: "Class Teacher In-Charge",
              render: (row: SchoolClass) => (
                <div>
                  <Badge variant="active">{row.classTeacherName}</Badge>
                  <div style={{ fontSize: "10px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    Attendance Authority
                  </div>
                </div>
              ),
            },
            {
              key: "actions",
              header: "Actions & Mapping",
              render: (row: SchoolClass) => (
                <div style={{ display: "flex", gap: "6px" }}>
                  <Button variant="primary" size="sm" onClick={() => openMappingModal(row)}>
                    Manage Mapping
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => handleDeleteClass(row.id)}>
                    Delete
                  </Button>
                </div>
              ),
            },
          ]}
          data={classes}
          pageSize={10}
          emptyMessage={loading ? "Loading classes..." : "No classes registered."}
        />
      </div>

      {/* Add Class Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Create Class Section"
        onClose={() => setIsAddModalOpen(false)}
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddClass}>
              Save Class
            </Button>
          </div>
        }
      >
        <form onSubmit={handleAddClass}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
            <Input
              label="Grade / Level Name"
              required
              placeholder="e.g. Class 10"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Section"
              required
              placeholder="e.g. Blue, Green, A"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
            <Input
              label="Room Number"
              required
              placeholder="e.g. Room 10"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
            />
            <Input
              label="Max Student Capacity"
              type="number"
              value={formData.capacity.toString()}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value, 10) || 40 })}
            />
          </div>

          <Select
            label="Class Teacher In-Charge (Daily Attendance Authority)"
            value={formData.classTeacherId.toString()}
            onChange={(e) => setFormData({ ...formData, classTeacherId: parseInt(e.target.value, 10) })}
            options={teachers.map((t) => ({
              value: t.id.toString(),
              label: `${t.fullName} (${t.employeeId})`,
            }))}
          />
        </form>
      </Modal>

      {/* Academic Mapping & Class In-Charge Modal */}
      {mappingClass && (
        <Modal
          isOpen={!!mappingClass}
          title={`Academic Mapping — ${mappingClass.name} (Section ${mappingClass.section})`}
          onClose={() => setMappingClass(null)}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setMappingClass(null)}>
              Close
            </Button>
          }
        >
          <div>
            {/* Tabs */}
            <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px", marginBottom: "16px" }}>
              <Button
                variant={mappingTab === "incharge" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setMappingTab("incharge")}
              >
                1. Class In-Charge
              </Button>
              <Button
                variant={mappingTab === "subjects" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setMappingTab("subjects")}
              >
                2. Class Subjects ({classSubjects.length})
              </Button>
              <Button
                variant={mappingTab === "teachers" ? "primary" : "secondary"}
                size="sm"
                onClick={() => setMappingTab("teachers")}
              >
                3. Subject Teachers ({classAssignments.length})
              </Button>
            </div>

            {/* TAB 1: Class Teacher In-Charge */}
            {mappingTab === "incharge" && (
              <div>
                <div style={{ padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-sidebar)", marginBottom: "16px" }}>
                  <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)" }}>Current In-Charge</div>
                  <div style={{ fontSize: "var(--font-size-md)", fontWeight: 700, marginTop: "4px" }}>
                    {mappingClass.classTeacherName}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                    Authorised with exclusive student attendance marking privileges under School RBAC.
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "var(--font-size-sm)", marginBottom: "8px" }}>Designate / Transfer In-Charge</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                    <Select
                      label="Select Faculty Member"
                      value={newInchargeTeacherId.toString()}
                      onChange={(e) => setNewInchargeTeacherId(parseInt(e.target.value, 10))}
                      options={teachers.map((t) => ({
                        value: t.id.toString(),
                        label: `${t.fullName} (${t.subjectSpecialization || "Faculty"})`,
                      }))}
                    />
                    <Input
                      label="Reason / Session Note"
                      placeholder="e.g. Annual allocation, medical handover"
                      value={inchargeReason}
                      onChange={(e) => setInchargeReason(e.target.value)}
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAssignIncharge}>
                    Confirm In-Charge Designation
                  </Button>
                </div>

                <div>
                  <h4 style={{ fontSize: "var(--font-size-sm)", marginBottom: "8px" }}>Reassignment History</h4>
                  <DataTable
                    columns={[
                      { key: "teacherName", header: "Teacher" },
                      { key: "academicSession", header: "Session" },
                      {
                        key: "status",
                        header: "Status",
                        render: (h: InchargeHistory) => (
                          <Badge variant={h.status === "active" ? "active" : "neutral"}>
                            {h.status.toUpperCase()}
                          </Badge>
                        ),
                      },
                      { key: "reason", header: "Reason", render: (h: InchargeHistory) => h.reason || "-" },
                      { key: "assignedByAdminName", header: "Assigned By" },
                    ]}
                    data={inchargeHistory}
                    emptyMessage="No history recorded."
                  />
                </div>
              </div>
            )}

            {/* TAB 2: Class Subjects Mapping */}
            {mappingTab === "subjects" && (
              <div>
                <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", marginBottom: "16px" }}>
                  <div style={{ flex: 1 }}>
                    <Select
                      label="Assign Subject to Class"
                      value={selectedSubjectId.toString()}
                      onChange={(e) => setSelectedSubjectId(parseInt(e.target.value, 10))}
                      options={[
                        { value: "0", label: "-- Select Subject to Add --" },
                        ...allSubjects
                          .filter((s) => !classSubjects.some((cs) => cs.subjectId === s.id))
                          .map((s) => ({ value: s.id.toString(), label: `${s.name} (${s.code})` })),
                      ]}
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAddSubjectToClass} disabled={!selectedSubjectId}>
                    + Map Subject
                  </Button>
                </div>

                <DataTable
                  columns={[
                    { key: "subjectCode", header: "Code" },
                    { key: "subjectName", header: "Subject Name", render: (cs: ClassSubject) => <strong>{cs.subjectName}</strong> },
                    {
                      key: "action",
                      header: "Action",
                      render: (cs: ClassSubject) => (
                        <Button variant="danger" size="sm" onClick={() => handleRemoveSubjectFromClass(cs.subjectId)}>
                          Remove
                        </Button>
                      ),
                    },
                  ]}
                  data={classSubjects}
                  emptyMessage="No subjects mapped to this class yet."
                />
              </div>
            )}

            {/* TAB 3: Teacher to Subject/Class Mapping */}
            {mappingTab === "teachers" && (
              <div>
                <div style={{ padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", marginBottom: "16px" }}>
                  <h4 style={{ fontSize: "var(--font-size-sm)", marginBottom: "8px" }}>Assign Subject Teacher</h4>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                    <Select
                      label="Select Subject"
                      value={assignSubjectId.toString()}
                      onChange={(e) => setAssignSubjectId(parseInt(e.target.value, 10))}
                      options={[
                        { value: "0", label: "-- Select Class Subject --" },
                        ...classSubjects.map((cs) => ({ value: cs.subjectId.toString(), label: `${cs.subjectName} (${cs.subjectCode})` })),
                      ]}
                    />
                    <Select
                      label="Select Teacher"
                      value={assignTeacherId.toString()}
                      onChange={(e) => setAssignTeacherId(parseInt(e.target.value, 10))}
                      options={[
                        { value: "0", label: "-- Select Teacher --" },
                        ...teachers.map((t) => ({ value: t.id.toString(), label: `${t.fullName} (${t.subjectSpecialization || "Faculty"})` })),
                      ]}
                    />
                  </div>
                  <Button variant="primary" size="sm" onClick={handleAssignTeacherToSubject} disabled={!assignSubjectId || !assignTeacherId}>
                    Assign Teacher
                  </Button>
                </div>

                <DataTable
                  columns={[
                    { key: "subjectName", header: "Subject", render: (ta: TeacherAssignment) => <strong>{ta.subjectName}</strong> },
                    { key: "teacherName", header: "Assigned Teacher" },
                    { key: "academicSession", header: "Session" },
                    {
                      key: "action",
                      header: "Action",
                      render: (ta: TeacherAssignment) => (
                        <Button variant="danger" size="sm" onClick={() => handleRemoveTeacherAssignment(ta.id)}>
                          Remove
                        </Button>
                      ),
                    },
                  ]}
                  data={classAssignments}
                  emptyMessage="No teacher assignments made for this class."
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClassesPage;
