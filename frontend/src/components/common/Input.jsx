// src/components/common/Input.jsx
import React from "react";

export const Input = ({
  label,
  error,
  hint,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  disabled = false,
  required = false,
  iconLeft,
  iconRight,
  containerStyle = {},
  style = {},
  ...props
}) => {
  return (
    <div style={{ marginBottom: "18px", width: "100%", ...containerStyle }}>
      {label && (
        <label
          htmlFor={id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "0.85rem",
            fontWeight: "600",
            marginBottom: "6px",
            color: "var(--color-dark)",
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: "var(--color-error)" }}>*</span>}
        </label>
      )}

      <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
        {iconLeft && (
          <span
            style={{
              position: "absolute",
              left: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-muted)",
              pointerEvents: "none",
              zIndex: 1,
            }}
          >
            {iconLeft}
          </span>
        )}

        <input
          className="input-base"
          id={id}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          style={{
            paddingLeft: iconLeft ? "42px" : "16px",
            paddingRight: iconRight ? "42px" : "16px",
            borderColor: error ? "var(--color-error)" : "var(--color-border)",
            backgroundColor: disabled ? "var(--color-card-subtle)" : "var(--color-card)",
            ...style,
          }}
          {...props}
        />

        {iconRight && (
          <span
            style={{
              position: "absolute",
              right: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-muted)",
              zIndex: 1,
            }}
          >
            {iconRight}
          </span>
        )}
      </div>

      {hint && !error && (
        <span
          style={{
            color: "var(--color-muted)",
            fontSize: "0.78rem",
            marginTop: "4px",
            display: "block",
          }}
        >
          {hint}
        </span>
      )}

      {error && (
        <span
          style={{
            color: "var(--color-error)",
            fontSize: "0.8rem",
            fontWeight: "500",
            marginTop: "4px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;

