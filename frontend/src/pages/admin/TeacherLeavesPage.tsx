import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch } from "../../lib/api";

interface TeacherLeave {
  id: number;
  teacherId: number;
  teacherName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  affectedClasses: string[];
  substituteTeacherId?: number;
  substituteTeacherName?: string;
  reviewedByAdminName?: string;
  reviewedAt?: string;
  adminRemarks?: string;
  createdAt: string;
}

interface Teacher {
  id: number;
  fullName: string;
  employeeId: string;
}

export const TeacherLeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<TeacherLeave[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [selectedLeave, setSelectedLeave] = useState<TeacherLeave | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"approved" | "rejected">("approved");
  const [substituteTeacherId, setSubstituteTeacherId] = useState<number>(0);
  const [adminRemarks, setAdminRemarks] = useState<string>("");
  const [reviewError, setReviewError] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [leavesData, teachersData] = await Promise.all([
        apiFetch<TeacherLeave[]>("/teacher-leaves"),
        apiFetch<Teacher[]>("/teachers"),
      ]);
      setLeaves(leavesData);
      setTeachers(teachersData);
    } catch (err: any) {
      console.error("Failed to load leaves", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReviewModal = (leave: TeacherLeave) => {
    setSelectedLeave(leave);
    setReviewStatus("approved");
    setSubstituteTeacherId(teachers.find((t) => t.id !== leave.teacherId)?.id || 0);
    setAdminRemarks("");
    setReviewError("");
    setReviewModalOpen(true);
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    try {
      await apiFetch(`/teacher-leaves/${selectedLeave.id}/review`, {
        method: "POST",
        body: {
          status: reviewStatus,
          adminRemarks: adminRemarks || "Reviewed by Principal Office",
          substituteTeacherId: reviewStatus === "approved" && substituteTeacherId ? substituteTeacherId : undefined,
        },
      });
      setReviewModalOpen(false);
      loadData();
    } catch (err: any) {
      setReviewError(err.message || "Failed to process leave review.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Teacher Leaves &amp; Academic Coverage</h1>
          <p className="page-subtitle">
            Review faculty leave applications, assess affected classroom periods, and assign substitute teachers
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadData}>
          Refresh
        </Button>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "teacher",
              header: "Faculty Applicant",
              render: (l: TeacherLeave) => (
                <div>
                  <strong>{l.teacherName}</strong>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Applied {new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ),
            },
            {
              key: "type",
              header: "Leave Type",
              render: (l: TeacherLeave) => (
                <Badge variant="neutral">{l.leaveType.toUpperCase()}</Badge>
              ),
            },
            {
              key: "duration",
              header: "Duration",
              render: (l: TeacherLeave) => (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    {l.startDate} &rarr; {l.endDate}
                  </div>
                </div>
              ),
            },
            {
              key: "reason",
              header: "Reason & Notes",
              render: (l: TeacherLeave) => (
                <div style={{ maxWidth: "240px", fontSize: "12px", color: "var(--color-text)" }}>
                  {l.reason}
                </div>
              ),
            },
            {
              key: "affected",
              header: "Affected Classes",
              render: (l: TeacherLeave) => (
                <div style={{ fontSize: "11px" }}>
                  {l.affectedClasses && l.affectedClasses.length > 0 ? (
                    l.affectedClasses.map((c, i) => (
                      <span key={i} style={{ display: "inline-block", marginRight: "4px", marginBottom: "2px", backgroundColor: "var(--color-bg-hover)", padding: "2px 6px", borderRadius: "4px" }}>
                        {c}
                      </span>
                    ))
                  ) : (
                    <span>General duties</span>
                  )}
                </div>
              ),
            },
            {
              key: "status",
              header: "Status & Coverage",
              render: (l: TeacherLeave) => (
                <div>
                  <Badge variant={l.status === "approved" ? "active" : l.status === "rejected" ? "inactive" : "neutral"}>
                    {l.status.toUpperCase()}
                  </Badge>
                  {l.substituteTeacherName && (
                    <div style={{ fontSize: "11px", color: "var(--color-primary)", marginTop: "4px" }}>
                      Substitute: {l.substituteTeacherName}
                    </div>
                  )}
                </div>
              ),
            },
            {
              key: "actions",
              header: "Action",
              render: (l: TeacherLeave) => (
                <div>
                  {l.status === "pending" ? (
                    <Button variant="primary" size="sm" onClick={() => openReviewModal(l)}>
                      Review Application
                    </Button>
                  ) : (
                    <Button variant="secondary" size="sm" onClick={() => openReviewModal(l)}>
                      Edit Decision
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
          data={leaves}
          keyExtractor={(l) => l.id}
          emptyMessage={loading ? "Loading leave requests..." : "No leave applications on file."}
        />
      </div>

      {/* Review Modal */}
      {selectedLeave && (
        <Modal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          title={`Review Leave: ${selectedLeave.teacherName}`}
          footer={
            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
              <Button variant="secondary" size="sm" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleReview}>
                Save Decision
              </Button>
            </div>
          }
        >
          <form onSubmit={handleReview} className="form-layout">
            {reviewError && <div className="form-error">{reviewError}</div>}

            <div style={{ padding: "12px", border: "1px solid var(--color-border)", borderRadius: "var(--radius-md)", backgroundColor: "var(--color-bg-sidebar)", marginBottom: "12px" }}>
              <div style={{ fontSize: "12px", fontWeight: 600 }}>Leave Details</div>
              <div style={{ fontSize: "13px", marginTop: "4px" }}>
                <strong>{selectedLeave.leaveType.toUpperCase()}</strong> &bull; {selectedLeave.startDate} to {selectedLeave.endDate}
              </div>
              <div style={{ fontSize: "12px", color: "var(--color-text-muted)", marginTop: "4px" }}>
                "{selectedLeave.reason}"
              </div>
              <div style={{ fontSize: "12px", color: "#d97706", fontWeight: 600, marginTop: "6px" }}>
                Affected Classes: {selectedLeave.affectedClasses.join(", ")}
              </div>
            </div>

            <Select
              label="Administrative Decision"
              value={reviewStatus}
              onChange={(e) => setReviewStatus(e.target.value as any)}
              options={[
                { value: "approved", label: "Approve Leave" },
                { value: "rejected", label: "Reject Leave" },
              ]}
            />

            {reviewStatus === "approved" && (
              <Select
                label="Assign Substitute Teacher (Coverage for Affected Classes)"
                value={substituteTeacherId.toString()}
                onChange={(e) => setSubstituteTeacherId(parseInt(e.target.value, 10))}
                options={[
                  { value: "0", label: "-- Select Available Faculty --" },
                  ...teachers
                    .filter((t) => t.id !== selectedLeave.teacherId)
                    .map((t) => ({ value: t.id.toString(), label: `${t.fullName} (${t.employeeId})` })),
                ]}
              />
            )}

            <Input
              label="Admin Remarks / Directions for Cover Teacher"
              placeholder="e.g. Approved. Teacher Farzana will supervise Class 10 Physics."
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
            />
          </form>
        </Modal>
      )}
    </div>
  );
};

export default TeacherLeavesPage;
