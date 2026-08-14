// src/components/common/Button.jsx
import React from "react";

export const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  style = {},
}) => {
  const getStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: "transparent",
          color: "var(--color-dark)",
          border: "1px solid var(--color-border)",
          boxShadow: "none",
        };
      case "danger":
        return {
          backgroundColor: "var(--color-error)",
          color: "#FFFFFF",
          boxShadow: "0 8px 20px -6px rgba(211, 47, 47, 0.2)",
        };
      case "primary":
      default:
        return {
          backgroundColor: "var(--color-primary)",
          color: "#FFFFFF",
          boxShadow: "0 8px 20px -6px rgba(233, 30, 99, 0.2)",
        };
    }
  };

  return (
    <button
      type={type}
      className="button-base"
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...getStyles(), ...style }}
    >
      {loading ? (
        <div
          style={{
            width: "18px",
            height: "18px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      ) : (
        children
      )}
    </button>
  );
};
export default Button;
