import React, { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import api from "../../lib/api";

interface Notice {
  id: number;
  title: string;
  content: string;
  targetAudience: string;
  postedBy: string;
  createdAt: string;
}

export const TeacherNoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        setLoading(true);
        const data = await api.get<Notice[]>("/notices", {
          params: { audience: "teachers" },
        });
        setNotices(data);
      } catch (err) {
        console.error("Failed to load staff circulars", err);
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Faculty Staff Bulletins</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Administrative orders, faculty meetings, and departmental circulars
          </p>
        </div>
      </div>

      {loading ? (
        <div className="panel-card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          Loading staff bulletins...
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
                    Posted by: {notice.postedBy} &bull; Date: {notice.createdAt}
                  </div>
                </div>

                <Badge variant="neutral">FACULTY</Badge>
              </div>

              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel-card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No active bulletins for faculty.
        </div>
      )}
    </div>
  );
};

export default TeacherNoticesPage;
