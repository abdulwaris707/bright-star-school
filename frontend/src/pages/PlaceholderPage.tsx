import React from "react";

export interface PlaceholderPageProps {
  title: string;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({ title }) => {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
      </div>
      <div className="panel-card">
        <p style={{ color: "var(--color-text-muted)", fontSize: "var(--font-size-sm)" }}>
          This module is not built yet.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
