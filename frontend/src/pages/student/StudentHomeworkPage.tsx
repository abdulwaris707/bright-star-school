import React, { useState, useEffect } from "react";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { apiFetch } from "../../lib/api";

interface Homework {
  id: number;
  title: string;
  description: string;
  className: string;
  subjectName: string;
  teacherName: string;
  assignedDate: string;
  dueDate: string;
  maxMarks: number;
  status: "active" | "past_due";
}

export const StudentHomeworkPage: React.FC = () => {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [completedMap, setCompletedMap] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem("student_homework_completed");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedTask, setSelectedTask] = useState<Homework | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadHomework = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<Homework[]>("/homework?classId=1");
      setHomework(data);
    } catch (err: any) {
      console.error("Failed to load homework", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHomework();
  }, []);

  const toggleTaskCompleted = (id: number) => {
    setCompletedMap((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem("student_homework_completed", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const activeCount = homework.filter((h) => h.status === "active" && !completedMap[h.id]).length;
  const doneCount = homework.filter((h) => completedMap[h.id]).length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Curriculum Homework &amp; Task Planner</h1>
          <p className="page-subtitle">
            Class assignments, chapter exercises, and submission deadlines &bull; Class 10 (Blue)
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadHomework}>
          Refresh
        </Button>
      </div>

      <div className="stats-grid" style={{ marginBottom: "var(--space-20)" }}>
        <div className="stat-card">
          <span className="stat-label">Pending Submissions</span>
          <span className="stat-value" style={{ color: activeCount > 0 ? "#d97706" : "#16a34a" }}>
            {activeCount}
          </span>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Tasks requiring submission
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Completed by You</span>
          <span className="stat-value" style={{ color: "#16a34a" }}>
            {doneCount}
          </span>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Marked as finished
          </div>
        </div>

        <div className="stat-card">
          <span className="stat-label">Total Assigned This Term</span>
          <span className="stat-value">{homework.length}</span>
          <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            All syllabus tasks
          </div>
        </div>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "done",
              header: "Checklist",
              render: (h: Homework) => (
                <input
                  type="checkbox"
                  checked={Boolean(completedMap[h.id])}
                  onChange={() => toggleTaskCompleted(h.id)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  title="Mark finished on notebook"
                />
              ),
            },
            {
              key: "subject",
              header: "Subject & Faculty",
              render: (h: Homework) => (
                <div>
                  <strong>{h.subjectName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    {h.teacherName}
                  </div>
                </div>
              ),
            },
            {
              key: "title",
              header: "Task Topic & Scope",
              render: (h: Homework) => (
                <div style={{ textDecoration: completedMap[h.id] ? "line-through" : "none" }}>
                  <div style={{ fontWeight: 600 }}>{h.title}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px", maxWidth: "340px" }}>
                    {h.description}
                  </div>
                </div>
              ),
            },
            {
              key: "due",
              header: "Deadline",
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
              key: "marks",
              header: "Marks",
              render: (h: Homework) => `${h.maxMarks} Marks`,
            },
            {
              key: "status",
              header: "Status",
              render: (h: Homework) => (
                <Badge variant={completedMap[h.id] ? "active" : h.status === "active" ? "neutral" : "inactive"}>
                  {completedMap[h.id] ? "COMPLETED" : h.status === "active" ? "DUE SOON" : "PAST DUE"}
                </Badge>
              ),
            },
            {
              key: "actions",
              header: "Details",
              render: (h: Homework) => (
                <Button variant="secondary" size="sm" onClick={() => setSelectedTask(h)}>
                  View Task
                </Button>
              ),
            },
          ]}
          data={homework}
          keyExtractor={(h) => h.id}
          emptyMessage={loading ? "Loading homework assignments..." : "No active homework assigned for your class."}
        />
      </div>

      {/* Task Details Modal */}
      {selectedTask && (
        <Modal
          isOpen={Boolean(selectedTask)}
          title={`Homework: ${selectedTask.subjectName}`}
          onClose={() => setSelectedTask(null)}
          footer={
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
              <Button
                variant={completedMap[selectedTask.id] ? "secondary" : "primary"}
                size="sm"
                onClick={() => {
                  toggleTaskCompleted(selectedTask.id);
                  setSelectedTask(null);
                }}
              >
                {completedMap[selectedTask.id] ? "Mark as Incomplete" : "Mark as Completed"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedTask(null)}>
                Close
              </Button>
            </div>
          }
        >
          <div>
            <div style={{ padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-sidebar)", marginBottom: "14px" }}>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "var(--color-text-muted)" }}>
                {selectedTask.className} &bull; Assigned by {selectedTask.teacherName}
              </div>
              <h3 style={{ fontSize: "var(--font-size-md)", margin: "4px 0" }}>{selectedTask.title}</h3>
              <div style={{ display: "flex", gap: "12px", marginTop: "8px", fontSize: "12px" }}>
                <span>Due Date: <strong>{selectedTask.dueDate}</strong></span>
                <span>Max Evaluation Marks: <strong>{selectedTask.maxMarks}</strong></span>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: "var(--font-size-sm)", marginBottom: "6px" }}>Detailed Assignment Instructions</h4>
              <p style={{ fontSize: "13px", lineHeight: 1.6, color: "var(--color-text)", whiteSpace: "pre-wrap" }}>
                {selectedTask.description}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default StudentHomeworkPage;
