import React, { useState, useEffect } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Badge from "../../components/ui/Badge";
import DataTable from "../../components/ui/DataTable";
import { apiFetch } from "../../lib/api";

interface AuditLog {
  id: number;
  actorId: number;
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId?: number;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [search, setSearch] = useState<string>("");

  const loadLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (entityFilter !== "all") params.append("entityType", entityFilter);
      if (actionFilter !== "all") params.append("action", actionFilter);

      const data = await apiFetch<AuditLog[]>(`/audit-logs?${params.toString()}`);
      setLogs(data);
    } catch (err: any) {
      console.error("Failed to load audit logs", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [entityFilter, actionFilter]);

  const filteredLogs = logs.filter(
    (l) =>
      l.actorName.toLowerCase().includes(search.toLowerCase()) ||
      (l.newValue && l.newValue.toLowerCase().includes(search.toLowerCase())) ||
      (l.oldValue && l.oldValue.toLowerCase().includes(search.toLowerCase())) ||
      l.entityType.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Security &amp; Audit Trail</h1>
          <p className="page-subtitle">
            Tamper-resistant audit log of all system mutations, role-based access overrides, and administrative actions
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadLogs}>
          Refresh Audit Trail
        </Button>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1.5fr",
          gap: "var(--space-12)",
          marginBottom: "var(--space-16)",
          alignItems: "flex-end",
        }}
      >
        <Select
          label="Filter by Entity"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          options={[
            { value: "all", label: "All Entities" },
            { value: "STUDENT", label: "Students" },
            { value: "TEACHER", label: "Teachers" },
            { value: "CLASS", label: "Classes & Mapping" },
            { value: "SUBJECT", label: "Subjects" },
            { value: "ATTENDANCE", label: "Student Attendance" },
            { value: "TEACHER_ATTENDANCE", label: "Teacher Attendance" },
            { value: "LEAVE_REQUEST", label: "Leaves & Substitutions" },
            { value: "HOMEWORK", label: "Homework Tasks" },
          ]}
        />

        <Select
          label="Filter by Action"
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          options={[
            { value: "all", label: "All Actions" },
            { value: "CREATE", label: "CREATE" },
            { value: "UPDATE", label: "UPDATE" },
            { value: "DELETE", label: "DELETE" },
            { value: "OVERRIDE", label: "OVERRIDE / VERIFY" },
            { value: "TRANSFER", label: "TRANSFER" },
            { value: "APPROVE_LEAVE", label: "APPROVE LEAVE" },
          ]}
        />

        <Input
          label="Search Details / Keywords"
          placeholder="Filter by actor, reason, student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="panel-card" style={{ padding: 0 }}>
        <DataTable
          columns={[
            {
              key: "timestamp",
              header: "Timestamp",
              render: (l: AuditLog) => (
                <div style={{ fontSize: "11px", fontFamily: "monospace" }}>
                  <div>{new Date(l.timestamp).toLocaleDateString()}</div>
                  <div style={{ color: "var(--color-text-muted)" }}>
                    {new Date(l.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ),
            },
            {
              key: "actor",
              header: "Actor (User)",
              render: (l: AuditLog) => (
                <div>
                  <div style={{ fontWeight: 600 }}>{l.actorName}</div>
                  <Badge variant={l.actorRole === "admin" ? "active" : "neutral"}>
                    {l.actorRole.toUpperCase()}
                  </Badge>
                </div>
              ),
            },
            {
              key: "action",
              header: "Action",
              render: (l: AuditLog) => {
                let variant: "active" | "inactive" | "neutral" = "neutral";
                if (l.action === "DELETE") variant = "inactive";
                else if (l.action === "CREATE") variant = "active";
                return <Badge variant={variant}>{l.action}</Badge>;
              },
            },
            {
              key: "entity",
              header: "Target Entity",
              render: (l: AuditLog) => (
                <div>
                  <span style={{ fontWeight: 600, fontSize: "12px" }}>{l.entityType}</span>
                  {l.entityId && (
                    <span style={{ fontSize: "11px", color: "var(--color-text-muted)", marginLeft: "4px" }}>
                      #{l.entityId}
                    </span>
                  )}
                </div>
              ),
            },
            {
              key: "details",
              header: "Audit Mutation Details",
              render: (l: AuditLog) => (
                <div style={{ fontSize: "12px", maxWidth: "420px" }}>
                  {l.newValue && <div style={{ color: "var(--color-text)" }}>{l.newValue}</div>}
                  {l.oldValue && (
                    <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: "2px" }}>
                      Previous: {l.oldValue}
                    </div>
                  )}
                </div>
              ),
            },
          ]}
          data={filteredLogs}
          keyExtractor={(l) => l.id}
          pageSize={12}
          emptyMessage={loading ? "Loading audit logs..." : "No audit trail records found."}
        />
      </div>
    </div>
  );
};

export default AuditLogsPage;
