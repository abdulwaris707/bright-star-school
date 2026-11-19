import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import Modal from "../../components/ui/Modal";
import api from "../../lib/api";

interface Notice {
  id: number;
  title: string;
  content: string;
  targetAudience: "all" | "teachers" | "students";
  postedBy: string;
  createdAt: string;
}

export const NoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [audienceFilter, setAudienceFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetAudience: "all",
    postedBy: "Office of the Principal",
  });

  const loadNotices = async () => {
    try {
      setLoading(true);
      const data = await api.get<Notice[]>("/notices", {
        params: { audience: audienceFilter !== "all" ? audienceFilter : undefined },
      });
      setNotices(data);
    } catch (err) {
      console.error("Failed to load notices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotices();
  }, [audienceFilter]);

  const handleCreateNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/notices", formData);
      setIsAddModalOpen(false);
      setFormData({
        title: "",
        content: "",
        targetAudience: "all",
        postedBy: "Office of the Principal",
      });
      loadNotices();
    } catch (err: any) {
      alert(err.message || "Failed to post notice");
    }
  };

  const handleDeleteNotice = async (id: number) => {
    if (!window.confirm("Delete this circular from the public board?")) return;
    try {
      await api.delete(`/notices/${id}`);
      loadNotices();
    } catch (err: any) {
      alert(err.message || "Failed to delete notice");
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">School Notice Board &amp; Circulars</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Broadcast communications, academic announcements, and circulars
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
          Broadcast Notice
        </Button>
      </div>

      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "var(--space-12) var(--space-16)",
          marginBottom: "var(--space-16)",
        }}
      >
        <span style={{ fontSize: "var(--font-size-xs)", fontWeight: 600, color: "var(--color-text-muted)" }}>
          Audience Filter:
        </span>
        <div style={{ width: "160px" }}>
          <Select
            value={audienceFilter}
            onChange={(e) => setAudienceFilter(e.target.value)}
            options={[
              { value: "all", label: "All Audiences" },
              { value: "teachers", label: "Faculty Only" },
              { value: "students", label: "Students & Parents" },
            ]}
          />
        </div>
      </div>

      {loading ? (
        <div className="panel-card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          Loading circulars...
        </div>
      ) : notices.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-12)" }}>
          {notices.map((notice) => (
            <div key={notice.id} className="panel-card" style={{ marginBottom: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "var(--space-8)",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "var(--font-size-md)", fontWeight: 600, color: "var(--color-text)" }}>
                    {notice.title}
                  </h2>
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
                    Posted by: {notice.postedBy} &bull; Published: {notice.createdAt}
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "var(--space-8)" }}>
                  <Badge variant={notice.targetAudience === "all" ? "neutral" : "active"}>
                    {notice.targetAudience.toUpperCase()}
                  </Badge>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteNotice(notice.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>

              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel-card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No notices found for this audience.
        </div>
      )}

      {/* Post Notice Modal */}
      <Modal
        isOpen={isAddModalOpen}
        title="Post New Circular / Notice"
        onClose={() => setIsAddModalOpen(false)}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateNotice}>
              Publish Notice
            </Button>
          </>
        }
      >
        <form onSubmit={handleCreateNotice}>
          <Input
            label="Notice Subject / Headline"
            required
            placeholder="e.g. Winter Holiday Schedule"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-8)" }}>
            <Select
              label="Target Audience"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              options={[
                { value: "all", label: "Entire School (All)" },
                { value: "teachers", label: "Teaching Faculty" },
                { value: "students", label: "Students & Parents" },
              ]}
            />
            <Input
              label="Author Authority"
              required
              placeholder="e.g. Office of the Principal"
              value={formData.postedBy}
              onChange={(e) => setFormData({ ...formData, postedBy: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Full Circular Content</label>
            <textarea
              required
              rows={4}
              className="form-input"
              placeholder="Write the official circular text here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NoticesPage;
