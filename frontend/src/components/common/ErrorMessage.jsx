// src/components/common/ErrorMessage.jsx
import React from "react";

export const ErrorMessage = ({ message }) => {
  if (!message) return null;
  return (
    <div
      style={{
        backgroundColor: "var(--color-error-bg)",
        borderLeft: "4px solid var(--color-error)",
        padding: "14px 18px",
        borderRadius: "8px",
        color: "var(--color-error)",
        fontSize: "0.9rem",
        margin: "12px 0",
      }}
    >
      {message}
    </div>
  );
};
export default ErrorMessage;
