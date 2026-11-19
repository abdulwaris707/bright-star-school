import React, { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import api from "../../lib/api";

interface SettingsData {
  schoolName: string;
  academicSession: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  lateFeeSurcharge: number;
}

export const SettingsPage: React.FC = () => {
  const [formData, setFormData] = useState<SettingsData>({
    schoolName: "Bright Star School",
    academicSession: "2026-2027",
    contactEmail: "admin@brightstar.edu.pk",
    contactPhone: "+92 42 35889900",
    address: "Block G, Model Town, Lahore, Pakistan",
    lateFeeSurcharge: 500,
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        const data = await api.get<SettingsData>("/settings");
        setFormData(data);
      } catch (err) {
        console.error("Failed to load settings", err);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    try {
      await api.put("/settings", formData);
      setSuccessMsg("Settings updated successfully.");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      alert(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: "680px" }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">School System Settings</h1>
          <p style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)" }}>
            Institutional identity, academic year, and contact parameters
          </p>
        </div>
      </div>

      {successMsg && (
        <div
          style={{
            padding: "var(--space-8) var(--space-12)",
            marginBottom: "var(--space-16)",
            backgroundColor: "var(--color-status-active-bg)",
            border: "1px solid var(--color-status-active-border)",
            borderRadius: "var(--radius)",
            color: "var(--color-status-active-text)",
            fontSize: "var(--font-size-xs)",
            fontWeight: 500,
          }}
        >
          {successMsg}
        </div>
      )}

      <div className="panel-card">
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Official School Name"
              required
              value={formData.schoolName}
              onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
            />
            <Input
              label="Academic Session"
              required
              value={formData.academicSession}
              onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--space-12)" }}>
            <Input
              label="Administrative Email"
              type="email"
              required
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
            <Input
              label="Office Phone"
              required
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
          </div>

          <Input
            label="Campus Postal Address"
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />

          <Input
            label="Late Fee Surcharge (PKR)"
            type="number"
            required
            value={formData.lateFeeSurcharge}
            onChange={(e) => setFormData({ ...formData, lateFeeSurcharge: parseInt(e.target.value, 10) || 0 })}
          />

          <div style={{ marginTop: "var(--space-16)", display: "flex", justifyContent: "flex-end" }}>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Configuration"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;
