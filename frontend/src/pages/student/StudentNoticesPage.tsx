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

export const StudentNoticesPage: React.FC = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotices() {
      try {
        setLoading(true);
        const data = await api.get<Notice[]>("/notices", {
          params: { audience: "students" },
        });
        setNotices(data);
      } catch (err) {
        console.error("Failed to load notices", err);
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
          <h1 className="page-title">School Diary &amp; Student Circulars</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Academic updates, exam date sheets, and institutional announcements
          </p>
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
                    Issued by: {notice.postedBy} &bull; Date: {notice.createdAt}
                  </div>
                </div>

                <Badge variant="active">ANNOUNCEMENT</Badge>
              </div>

              <p style={{ fontSize: "var(--font-size-sm)", color: "var(--color-text)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                {notice.content}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="panel-card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No active circulars for students.
        </div>
      )}
    </div>
  );
};

export default StudentNoticesPage;
