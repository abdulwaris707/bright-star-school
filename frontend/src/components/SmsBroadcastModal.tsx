import React, { useState } from "react";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Select from "./ui/Select";
import api from "../lib/api";

interface SmsBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRecipientType?: string;
}

export const SmsBroadcastModal: React.FC<SmsBroadcastModalProps> = ({
  isOpen,
  onClose,
  defaultRecipientType = "absent_today",
}) => {
  const [recipientType, setRecipientType] = useState(defaultRecipientType);
  const [message, setMessage] = useState(
    "Moaziz Walidain, Aapka bacha aaj school se ghair-hazir hai. Baraye meherbani school office rabta karein. Bright Star School."
  );
  const [loading, setLoading] = useState(false);
  const [statusResult, setStatusResult] = useState<{ status: string; recipientCount: number } | null>(null);

  const handleRecipientChange = (val: string) => {
    setRecipientType(val);
    setStatusResult(null);
    if (val === "absent_today") {
      setMessage("Moaziz Walidain, Aapka bacha aaj school se ghair-hazir hai. Baraye meherbani school office rabta karein. Bright Star School.");
    } else if (val === "fee_defaulters") {
      setMessage("Moaziz Walidain, Baraye meherbani apne bachay ki pending tuition fee challan jama karwayein taake exam roll number slip jari ho sake. Bright Star Accounts.");
    } else if (val === "emergency_alert") {
      setMessage("Itla baraye Walidain: Hukumat ki hidayat ke mutabiq kal school baraye Smog / Shadeed Sardi band rahega. Bright Star Administration.");
    } else {
      setMessage("Moaziz Walidain, Annual Parents Teacher Meeting (PTM) aagayee hai. Bright Star School.");
    }
  };

  const handleSend = async () => {
    setLoading(true);
    setStatusResult(null);
    try {
      const res = await api.post<{ status: string; recipientCount: number }>("/sms/broadcast", {
        recipientType,
        message,
      });
      setStatusResult(res);
      setTimeout(() => {
        onClose();
        setStatusResult(null);
      }, 3500);
    } catch (err: any) {
      alert(err.message || "Failed to dispatch SMS broadcast");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Official Parent SMS & WhatsApp Broadcast"
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "var(--space-8)", width: "100%" }}>
          <Button variant="secondary" size="sm" onClick={onClose} disabled={loading}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={handleSend} disabled={loading}>
            {loading ? "Transmitting via Gateway..." : "Dispatch Broadcast"}
          </Button>
        </div>
      }
    >
      <div>
        <div style={{ marginBottom: "var(--space-12)" }}>
          <Select
            label="Target Audience Group"
            value={recipientType}
            onChange={(e) => handleRecipientChange(e.target.value)}
            options={[
              { value: "absent_today", label: "Students Absent Today (Immediate Alert)" },
              { value: "fee_defaulters", label: "Fee Defaulters (Pending Challan Reminder)" },
              { value: "emergency_alert", label: "Emergency Notice (Smog / Rain / Weather Holiday)" },
              { value: "all_parents", label: "All Registered Parents (General Notice)" },
            ]}
          />
        </div>

        <div style={{ marginBottom: "var(--space-12)" }}>
          <label style={{ display: "block", fontSize: "var(--font-size-xs)", fontWeight: 600, marginBottom: "var(--space-4)" }}>
            SMS / WhatsApp Message Text (English / Roman Urdu)
          </label>
          <textarea
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              padding: "var(--space-8) var(--space-12)",
              fontSize: "var(--font-size-sm)",
              fontFamily: "var(--font-family)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-border)",
              backgroundColor: "var(--color-bg)",
              color: "var(--color-text)",
              resize: "vertical",
            }}
          />
        </div>

        <div
          style={{
            fontSize: "11px",
            color: "var(--color-text-muted)",
            padding: "var(--space-8)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--color-bg-subtle)",
          }}
        >
          Gateway Status: <strong>Connected</strong> &bull; Sender Masking: <strong>BRIGHT-STAR</strong> &bull; Character Count: {message.length}
        </div>

        {statusResult && (
          <div
            style={{
              marginTop: "var(--space-12)",
              padding: "var(--space-8) var(--space-12)",
              backgroundColor: "var(--color-status-active-bg)",
              border: "1px solid var(--color-status-active-border)",
              color: "var(--color-status-active-text)",
              fontSize: "var(--font-size-xs)",
              borderRadius: "var(--radius)",
            }}
          >
            Successfully delivered to {statusResult.recipientCount} parent phone numbers via Pakistan SMS Gateway.
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SmsBroadcastModal;
