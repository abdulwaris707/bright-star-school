import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataTable from "../../components/ui/DataTable";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import SmsBroadcastModal from "../../components/SmsBroadcastModal";
import PerformanceAnalyticsView from "../../components/analytics/PerformanceAnalyticsView";
import api, { apiFetch } from "../../lib/api";

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  totalClasses: number;
  totalCollectedPKR: number;
  pendingFeesPKR: number;
  attendanceRate: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalCollectedPKR: 0,
    pendingFeesPKR: 0,
    attendanceRate: 0,
  });
  const [recentFees, setRecentFees] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [dailyCode, setDailyCode] = useState<string>("");
  const [pendingLeavesCount, setPendingLeavesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<"overview" | "analytics">("overview");

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, feesData, noticesData, codeData, leavesData] = await Promise.all([
          api.get<DashboardStats>("/stats"),
          api.get<any[]>("/fees"),
          api.get<any[]>("/notices"),
          apiFetch<{ code: string }>("/teacher-attendance/daily-code").catch(() => ({ code: "" })),
          apiFetch<any[]>("/teacher-leaves").catch(() => []),
        ]);
        setStats(statsData);
        setRecentFees(feesData.slice(0, 5));
        setNotices(noticesData.slice(0, 3));
        if (codeData?.code) setDailyCode(codeData.code);
        setPendingLeavesCount(leavesData.filter((l) => l.status === "pending").length);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive School Operations Hub</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            School operations summary, institutional governance, fee reconciliation, and academic coordination
          </p>
        </div>
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          <Button variant="secondary" size="sm" onClick={() => setIsSmsModalOpen(true)}>
            Broadcast SMS / Alerts
          </Button>
          <Link to="/admin/students">
            <Button variant="primary" size="sm">
              + Enroll Student
            </Button>
          </Link>
          <Link to="/admin/fees">
            <Button variant="secondary" size="sm">
              Fee Challans
            </Button>
          </Link>
        </div>
      </div>

      {/* View Switcher: Operations Overview vs Performance Analytics & Graphs */}
      <div
        className="panel-card"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "var(--space-12)",
          padding: "var(--space-10) var(--space-16)",
          marginBottom: "var(--space-20)",
        }}
      >
        <div style={{ display: "flex", gap: "var(--space-8)" }}>
          <Button
            variant={dashboardTab === "overview" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setDashboardTab("overview")}
          >
            Operations Overview
          </Button>
          <Button
            variant={dashboardTab === "analytics" ? "primary" : "secondary"}
            size="sm"
            onClick={() => setDashboardTab("analytics")}
          >
            Academic &amp; Faculty Performance Graphs
          </Button>
        </div>
        <Link to="/admin/analytics" style={{ fontSize: "var(--font-size-xs)" }}>
          Full Analytics Screen &rarr;
        </Link>
      </div>

      {dashboardTab === "overview" ? (
        <>
          {/* Quick Governance Links & Live Security Code Banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginBottom: "var(--space-20)",
            }}
          >
        <Link to="/admin/teacher-attendance" style={{ textDecoration: "none" }}>
          <div className="stat-card" style={{ cursor: "pointer", transition: "var(--transition-fast)" }}>
            <div className="stat-label">Faculty Check-In PIN</div>
            <div className="stat-value" style={{ fontFamily: "monospace", color: "var(--color-primary)", fontSize: "20px" }}>
              {dailyCode || "BST-Loading"}
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Today's Live Security Code &rarr;
            </div>
          </div>
        </Link>

        <Link to="/admin/leaves" style={{ textDecoration: "none" }}>
          <div className="stat-card" style={{ cursor: "pointer", transition: "var(--transition-fast)" }}>
            <div className="stat-label">Faculty Leaves</div>
            <div className="stat-value" style={{ color: pendingLeavesCount > 0 ? "#d97706" : "inherit" }}>
              {pendingLeavesCount} Pending
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Review &amp; assign substitute cover &rarr;
            </div>
          </div>
        </Link>

        <Link to="/admin/classes" style={{ textDecoration: "none" }}>
          <div className="stat-card" style={{ cursor: "pointer", transition: "var(--transition-fast)" }}>
            <div className="stat-label">Class Sections</div>
            <div className="stat-value">{stats.totalClasses} Sections</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Manage In-Charge &amp; subjects &rarr;
            </div>
          </div>
        </Link>

        <Link to="/admin/audit-logs" style={{ textDecoration: "none" }}>
          <div className="stat-card" style={{ cursor: "pointer", transition: "var(--transition-fast)" }}>
            <div className="stat-label">Audit Trail</div>
            <div className="stat-value" style={{ fontSize: "18px" }}>Active</div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "4px" }}>
              Inspect mutation security logs &rarr;
            </div>
          </div>
        </Link>
      </div>

      {/* Main KPI Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Student Body</div>
          <div className="stat-value">{loading ? "-" : stats.totalStudents}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            {stats.activeStudents} active admissions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Faculty Staff</div>
          <div className="stat-value">{loading ? "-" : stats.totalTeachers}</div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Teaching staff members
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Daily Attendance Rate</div>
          <div className="stat-value" style={{ color: "var(--color-status-active-text)" }}>
            {loading ? "-" : `${stats.attendanceRate}%`}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", marginTop: "var(--space-4)" }}>
            Morning roll call record
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Fees Realized (PKR)</div>
          <div className="stat-value">
            {loading ? "-" : `Rs. ${stats.totalCollectedPKR.toLocaleString()}`}
          </div>
          <div style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)", marginTop: "var(--space-4)" }}>
            Pending: Rs. {stats.pendingFeesPKR.toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "var(--space-16)" }}>
        {/* Recent Fee Challans */}
        <div className="panel-card" style={{ padding: 0 }}>
          <div
            style={{
              padding: "var(--space-12) var(--space-16)",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Recent Fee Vouchers</h2>
            <Link to="/admin/fees" style={{ fontSize: "var(--font-size-xs)" }}>
              View all vouchers &rarr;
            </Link>
          </div>
          <DataTable
            columns={[
              { key: "challanNo", header: "Challan #" },
              { key: "studentName", header: "Student" },
              { key: "month", header: "Month" },
              {
                key: "amount",
                header: "Amount",
                render: (row) => `Rs. ${row.amount.toLocaleString()}`,
              },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <Badge variant={row.status === "paid" ? "active" : "inactive"}>
                    {row.status.toUpperCase()}
                  </Badge>
                ),
              },
            ]}
            data={recentFees}
            pageSize={5}
            emptyMessage="No fee records available."
          />
        </div>

        {/* School Circulars / Notices */}
        <div className="panel-card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "var(--space-12)",
              paddingBottom: "var(--space-8)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <h2 style={{ fontSize: "var(--font-size-md)", fontWeight: 600 }}>Active Circulars &amp; Directives</h2>
            <Link to="/admin/notices" style={{ fontSize: "var(--font-size-xs)" }}>
              Manage &rarr;
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-8)" }}>
            {notices.length > 0 ? (
              notices.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "var(--space-8) var(--space-12)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "var(--radius)",
                    backgroundColor: "var(--color-bg-subtle)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--space-4)" }}>
                    <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)" }}>{n.title}</span>
                    <Badge variant="neutral">{n.targetAudience.toUpperCase()}</Badge>
                  </div>
                  <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>{n.content}</p>
                </div>
              ))
            ) : (
              <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>No circulars published.</p>
            )}
          </div>
        </div>
      </div>
        </>
      ) : (
        <PerformanceAnalyticsView />
      )}

      {/* SMS Broadcast Modal */}
      <SmsBroadcastModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
      />
    </div>
  );
};

export default AdminDashboard;
