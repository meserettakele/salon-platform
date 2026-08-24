// src/components/common/ErrorMessage.jsx
import React from "react";
import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from "react-icons/fi";

export const ErrorMessage = ({
  message,
  variant = "error",
  onClose,
  style = {},
  className = "",
}) => {
  if (!message) return null;

  const getVariantConfig = () => {
    switch (variant) {
      case "success":
        return {
          bg: "var(--color-success-bg)",
          border: "var(--color-success-border)",
          color: "var(--color-success)",
          icon: <FiCheckCircle size={18} />,
        };
      case "warning":
        return {
          bg: "var(--color-warning-bg)",
          border: "var(--color-warning-border)",
          color: "var(--color-warning)",
          icon: <FiAlertTriangle size={18} />,
        };
      case "info":
        return {
          bg: "var(--color-info-bg)",
          border: "var(--color-info-border)",
          color: "var(--color-info)",
          icon: <FiInfo size={18} />,
        };
      case "error":
      default:
        return {
          bg: "var(--color-error-bg)",
          border: "var(--color-error-border)",
          color: "var(--color-error)",
          icon: <FiAlertCircle size={18} />,
        };
    }
  };

  const config = getVariantConfig();

  return (
    <div
      className={className}
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "var(--radius-sm)",
        padding: "12px 16px",
        color: config.color,
        fontSize: "0.88rem",
        fontWeight: "500",
        margin: "12px 0",
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        ...style,
      }}
    >
      <span style={{ display: "inline-flex", marginTop: "1px", flexShrink: 0 }}>
        {config.icon}
      </span>
      <div style={{ flex: 1, lineHeight: "1.45" }}>{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "currentColor",
            opacity: 0.7,
            cursor: "pointer",
            padding: "2px",
            display: "inline-flex",
          }}
          aria-label="Dismiss alert"
        >
          <FiX size={16} />
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;

