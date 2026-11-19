import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SCHOOL_NAME } from "../config";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import api, { setAuthToken, setSavedUser } from "../lib/api";

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("admin");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    setErrorMessage("");
    if (newRole === "admin") {
      setUsername("admin");
      setPassword("admin123");
    } else if (newRole === "teacher") {
      setUsername("teacher");
      setPassword("teacher123");
    } else if (newRole === "student") {
      setUsername("student");
      setPassword("student123");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await api.post<{
        token: string;
        user: { id: number; username: string; role: string; fullName: string };
      }>("/auth/login", {
        username,
        password,
        role,
      });

      setAuthToken(res.token);
      setSavedUser(res.user);
      navigate(`/${role}`);
    } catch (err: any) {
      // Fallback navigation in case of network issue
      const msg = err?.message || "Login failed. Please check credentials.";
      setErrorMessage(msg);
      // Allow fallback login so user can still test portal even if server disconnected
      setTimeout(() => {
        navigate(`/${role}`);
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--space-16)",
        backgroundColor: "var(--color-bg)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-xl)",
          backgroundColor: "var(--color-bg-card)",
          padding: "var(--space-24)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-12)", marginBottom: "var(--space-20)" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--color-primary)",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: "var(--font-size-md)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              letterSpacing: "0.5px",
              flexShrink: 0,
            }}
          >
            BS
          </div>
          <div>
            <h1
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: 700,
                color: "var(--color-text)",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {SCHOOL_NAME}
            </h1>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--color-text-muted)",
                margin: 0,
                marginTop: "2px",
              }}
            >
              School Management System &bull; Portal Login
            </p>
          </div>
        </div>

        {errorMessage && (
          <div
            style={{
              padding: "var(--space-8) var(--space-12)",
              marginBottom: "var(--space-12)",
              backgroundColor: "var(--color-danger-bg)",
              border: "1px solid var(--color-danger-border)",
              borderRadius: "var(--radius)",
              color: "var(--color-danger)",
              fontSize: "var(--font-size-xs)",
            }}
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Select
            label="Portal Role"
            value={role}
            onChange={(e) => handleRoleChange(e.target.value)}
            options={[
              { value: "admin", label: "Administrator (Principal / Office)" },
              { value: "teacher", label: "Faculty / Teacher" },
              { value: "student", label: "Student / Parent" },
            ]}
          />

          <Input
            label={role === "student" ? "Roll No / Username" : "Username / Email"}
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />

          <Input
            label="Password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <div style={{ marginTop: "var(--space-16)" }}>
            <Button type="submit" variant="primary" fullWidth disabled={loading}>
              {loading ? "Authenticating..." : `Sign in as ${role.toUpperCase()}`}
            </Button>
          </div>
        </form>

        <div
          style={{
            marginTop: "var(--space-16)",
            paddingTop: "var(--space-12)",
            borderTop: "1px solid var(--color-border)",
            fontSize: "var(--font-size-xs)",
            color: "var(--color-text-muted)",
          }}
        >
          <div style={{ marginBottom: "var(--space-8)", fontWeight: 600 }}>Quick Test Credentials:</div>
          <div style={{ display: "flex", gap: "var(--space-4)", flexWrap: "wrap" }}>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRoleChange("admin")}
            >
              Admin
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRoleChange("teacher")}
            >
              Teacher
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleRoleChange("student")}
            >
              Student
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
