// src/components/common/Button.jsx
import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  iconLeft,
  iconRight,
  fullWidth = false,
  className = "",
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: "var(--color-card-subtle)",
          color: "var(--color-dark)",
          border: "1px solid var(--color-border)",
          boxShadow: "var(--shadow-xs)",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: "var(--color-dark)",
          border: "1.5px solid var(--color-border)",
          boxShadow: "none",
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          color: "var(--color-muted)",
          border: "1px solid transparent",
          boxShadow: "none",
        };
      case "gold":
        return {
          backgroundColor: "var(--color-secondary)",
          color: "#FFFFFF",
          border: "1px solid transparent",
          boxShadow: "0 6px 18px -4px rgba(197, 160, 89, 0.35)",
        };
      case "danger":
        return {
          backgroundColor: "var(--color-error)",
          color: "#FFFFFF",
          border: "1px solid transparent",
          boxShadow: "0 6px 18px -4px rgba(225, 29, 72, 0.25)",
        };
      case "primary":
      default:
        return {
          backgroundColor: "var(--color-primary)",
          color: "#FFFFFF",
          border: "1px solid transparent",
          boxShadow: "0 8px 20px -6px rgba(216, 69, 112, 0.3)",
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          padding: "8px 16px",
          fontSize: "0.85rem",
          borderRadius: "var(--radius-sm)",
          gap: "6px",
        };
      case "lg":
        return {
          padding: "15px 32px",
          fontSize: "1.05rem",
          borderRadius: "var(--radius-ui)",
          gap: "10px",
        };
      case "md":
      default:
        return {
          padding: "12px 24px",
          fontSize: "0.95rem",
          borderRadius: "var(--radius-ui)",
          gap: "8px",
        };
    }
  };

  return (
    <button
      type={type}
      className={`button-base ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      style={{
        ...getVariantStyles(),
        ...getSizeStyles(),
        width: fullWidth ? "100%" : undefined,
        ...style,
      }}
      {...props}
    >
      {loading ? (
        <div
          style={{
            width: size === "sm" ? "14px" : "18px",
            height: size === "sm" ? "14px" : "18px",
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
      ) : (
        <>
          {iconLeft && <span style={{ display: "inline-flex", alignItems: "center" }}>{iconLeft}</span>}
          <span>{children}</span>
          {iconRight && <span style={{ display: "inline-flex", alignItems: "center" }}>{iconRight}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

