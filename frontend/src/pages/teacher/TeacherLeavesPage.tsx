import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import DataTable from "../../components/ui/DataTable";
import { apiFetch, getSavedUser } from "../../lib/api";

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
  substituteTeacherName?: string;
  adminRemarks?: string;
  createdAt: string;
}

export const TeacherLeavesPage: React.FC = () => {
  const [leaves, setLeaves] = useState<TeacherLeave[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // Form states
  const [leaveType, setLeaveType] = useState<string>("sick");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [formError, setFormError] = useState<string>("");

  const currentUser = getSavedUser();

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await apiFetch<TeacherLeave[]>(
        `/teacher-leaves${currentUser?.id ? `?teacherId=${currentUser.id}` : ""}`
      );
      setLeaves(data);
    } catch (err: any) {
      console.error("Failed to load leaves", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const openApplyModal = () => {
    setLeaveType("sick");
    const today = new Date().toISOString().split("T")[0];
    setStartDate(today);
    setEndDate(today);
    setReason("");
    setFormError("");
    setModalOpen(true);
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      setFormError("All fields including specific reason are required.");
      return;
    }

    try {
      await apiFetch("/teacher-leaves", {
        method: "POST",
        body: {
          leaveType,
          startDate,
          endDate,
          reason,
        },
      });
      setModalOpen(false);
      loadLeaves();
      alert("Leave application submitted successfully. Principal Office has been notified.");
    } catch (err: any) {
      setFormError(err.message || "Failed to submit leave application.");
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Leave Applications</h1>
          <p className="page-subtitle">
            Submit leave requests, monitor principal approvals, and check substitute class coverage
          </p>
        </div>
        <Button variant="primary" onClick={openApplyModal}>
          + Apply for Leave
        </Button>
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "type",
              header: "Leave Category",
              render: (l: TeacherLeave) => (
                <Badge variant="neutral">{l.leaveType.toUpperCase()}</Badge>
              ),
            },
            {
              key: "dates",
              header: "Leave Period",
              render: (l: TeacherLeave) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{l.startDate} &rarr; {l.endDate}</div>
                  <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                    Applied: {new Date(l.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ),
            },
            {
              key: "reason",
              header: "Reason Stated",
              render: (l: TeacherLeave) => (
                <div style={{ maxWidth: "280px", fontSize: "12px" }}>{l.reason}</div>
              ),
            },
            {
              key: "status",
              header: "Status",
              render: (l: TeacherLeave) => (
                <Badge variant={l.status === "approved" ? "active" : l.status === "rejected" ? "inactive" : "neutral"}>
                  {l.status.toUpperCase()}
                </Badge>
              ),
            },
            {
              key: "substitute",
              header: "Substitute Coverage",
              render: (l: TeacherLeave) => (
                <div>
                  {l.substituteTeacherName ? (
                    <div>
                      <strong style={{ color: "var(--color-primary)" }}>{l.substituteTeacherName}</strong>
                      <div style={{ fontSize: "10px", color: "var(--color-text-muted)" }}>Assigned Faculty Cover</div>
                    </div>
                  ) : (
                    <span style={{ color: "var(--color-text-muted)", fontSize: "11px" }}>Pending review</span>
                  )}
                </div>
              ),
            },
            {
              key: "remarks",
              header: "Admin Feedback",
              render: (l: TeacherLeave) => (
                <div style={{ fontSize: "11px", color: "var(--color-text-muted)" }}>
                  {l.adminRemarks || "-"}
                </div>
              ),
            },
          ]}
          data={leaves}
          keyExtractor={(l) => l.id}
          emptyMessage={loading ? "Loading leave records..." : "No leave applications submitted."}
        />
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Faculty Leave Application Form"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleApply}>
              Submit Application
            </Button>
          </div>
        }
      >
        <form onSubmit={handleApply} className="form-layout">
          {formError && <div className="form-error">{formError}</div>}

          <Select
            label="Leave Classification"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value)}
            options={[
              { value: "casual", label: "Casual Leave" },
              { value: "sick", label: "Medical / Sick Leave" },
              { value: "emergency", label: "Urgent Family Emergency" },
              { value: "maternity", label: "Maternity / Paternity Leave" },
            ]}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <Input
            label="Specific Reason / Handover Notes"
            placeholder="Please detail the reason for absence and academic status of ongoing chapters..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <p style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
            Submitting this request will automatically alert the Principal Office and evaluate substitute teacher coverage for your scheduled timetable periods.
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default TeacherLeavesPage;
