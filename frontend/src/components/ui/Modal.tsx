import React, { useEffect } from "react";
import Button from "./Button";

export interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: string | number;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  actions,
  footer,
  maxWidth,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="modal-content"
        style={maxWidth ? { maxWidth } : undefined}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            Close
          </button>
        </div>
        <div className="modal-body">{children}</div>
        <div className="modal-footer">
          {footer || actions ? (
            footer || actions
          ) : (
            <Button variant="secondary" size="sm" onClick={onClose}>
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
