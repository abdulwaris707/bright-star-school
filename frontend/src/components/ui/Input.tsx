import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = "",
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input id={inputId} className={`form-input ${className}`} {...props} />
      {error && (
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-danger)", marginTop: "var(--space-4)" }}>
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
